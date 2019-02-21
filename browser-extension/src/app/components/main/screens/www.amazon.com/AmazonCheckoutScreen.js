import React from "react";
import "./AmazonCheckoutScreen.css";
import moment from "moment";
import {connect} from "react-redux";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import {QUERY_SELECTOR_CART_AMOUNT, QUERY_SELECTOR_CART_CURRENCY} from "./constants/querySelectors";
import Decimal from "decimal.js";
import {
    REQUEST_GET_EXCHANGE_RATE,
    REQUEST_GET_PAYMENT_PAYLOAD,
    REQUEST_OPEN_POPUP
} from "../../../../../constants/events/appEvents";
import {URL_MOON_TAWK_SUPPORT} from "../../../../../constants/url";
import {
    ACTION_PUSH_SCREEN,
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_SELECTED_WALLET,
    ACTION_SET_UI_BLOCKER_STATE,
    SCREEN_ADD_WALLETS
} from "../../../../redux/reducers/constants";
import CurrencyIcon from "../../../misc/currencyicon/CurrencyIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {getRequiredAmountInQuote, getWalletBalanceInBase} from "../../../../utils/exchangerates";
import FaIcon from "../../../misc/fontawesome/FaIcon";
import ConfirmSlider from "../../../misc/confirmslider/ConfirmSlider";
import {AMAZON_DEFAULT_CURRENCY} from "./AmazonProductScreen";
import appLogger from "../../../../utils/AppLogger";
import AppMixpanel from "../../../../services/AppMixpanel";
import {isCartContainsRestrictedItems} from "./utils/restrictedItems";
import {QUICKVIEW_CURRENCIES} from "../../../../constants/currencies";

const INITIAL_STATE = {
    isShowingWallets: false,
    selectedQuickViewCurrency: QUICKVIEW_CURRENCIES[0],
    containsRestrictedItems: false,
    cartAmount: null,
    paymentAmount: null,
    cartCurrency: null,
    exchangeRate: null,
    exchangeRateLastUpdated: null,
    walletBalanceInBase: "0"
};

class AmazonCheckoutScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...INITIAL_STATE
        };
    }

    componentWillMount() {
        this.parse()
            .then(this.updateExchangeRate);
    }

    componentDidMount() {
        AppMixpanel.track('view_screen_amazon_checkout');
        if (!!this.txtBaseValue) {
            this.txtBaseValue.focus();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            this.props.selectedWallet &&
            prevProps.selectedWallet &&
            this.props.selectedWallet.name !== prevProps.selectedWallet.name
        ) {
            this.parse()
                .then(this.updateExchangeRate)
                .then(() => this.setPaymentAmount(this.state.cartAmount));
        }
    }

    getCartAmountFromElements = (cartAmountElements) => {
        if (!cartAmountElements || !cartAmountElements.length) {
            return "0.00";
        } else {
            const parsedAmounts = Array.from(cartAmountElements)
                // Filter out bad values
                .filter(({value, innerText}) =>
                    (!!value && !!Number(value.replace(/[^0-9.-]+/g, ''))) ||
                    (!!innerText && !!Number(innerText.replace(/[^0-9.-]+/g, '')))
                )
                // Convert the remaining to {@type Number} so we can do a Max operation
                .map(({value, innerText}) =>
                    (!!value && Number(value.replace(/[^0-9.-]+/g, ''))) ||
                    (!!innerText && Number(innerText.replace(/[^0-9.-]+/g, '')))
                );
            const maximumParsedAmount = Math.max(...parsedAmounts);
            if (maximumParsedAmount <= 0) {
                return "0.00";
            }
            return maximumParsedAmount.toFixed(2);
        }
    };

    parse = (triesRemaining = 5) => {
        const cartAmountElements = document.querySelectorAll(QUERY_SELECTOR_CART_AMOUNT);
        const cartCurrencyElements = document.querySelectorAll(QUERY_SELECTOR_CART_CURRENCY);
        const containsRestrictedItems = isCartContainsRestrictedItems();

        if (!cartAmountElements || !cartAmountElements.length) {
            this.props.onSetAppModalLoadingState({isActive: true, text: "Loading..."});
            return new Promise((resolve, reject) => {
                if (triesRemaining > 0) {
                    setTimeout(() => resolve(this.parse(triesRemaining - 1)), 200);
                } else {
                    this.setState(() => ({
                        cartAmount: "0.00",
                        paymentAmount: "0.00",
                        cartCurrency: (cartCurrencyElements && cartCurrencyElements.length && cartCurrencyElements[0].value) || AMAZON_DEFAULT_CURRENCY
                    }));
                    reject(new Error("Unable to read cart information! Please refresh to try again."))
                }
            })
                .catch(err => this.props.onSetAppModalErrorState({isActive: true, text: err.message}))
                .finally(() => this.props.onSetAppModalLoadingState({isActive: false}));
        }
        const cartAmount = this.getCartAmountFromElements(cartAmountElements);
        const paymentAmount = cartAmount ? cartAmount : "0.00";
        return new Promise((resolve) => this.setState(state => ({
            containsRestrictedItems,
            cartAmount,
            paymentAmount: state.paymentAmount || paymentAmount,
            cartCurrency: (cartCurrencyElements && cartCurrencyElements.length && cartCurrencyElements[0].value) || AMAZON_DEFAULT_CURRENCY
        }), resolve));
    };

    updateExchangeRate = () => {
        const {cartCurrency, selectedQuickViewCurrency, paymentAmount} = this.state;
        const {selectedWallet} = this.props;
        if (paymentAmount) {
            return AppRuntime.sendMessage(REQUEST_GET_EXCHANGE_RATE, {
                quote: (selectedWallet && selectedWallet.currency) || selectedQuickViewCurrency,
                base: cartCurrency
            })
                .then(({bid, lastUpdated}) => {
                    const walletBalanceInBase = (selectedWallet && getWalletBalanceInBase(selectedWallet.balance, bid)) || "0";
                    this.setState(() => ({
                        exchangeRate: Decimal(bid).toFixed(2, Decimal.ROUND_DOWN),
                        exchangeRateLastUpdated: moment(lastUpdated).fromNow(),
                        walletBalanceInBase,
                        paymentAmount: (!!selectedWallet && Decimal(walletBalanceInBase).lt(paymentAmount)) ? walletBalanceInBase : paymentAmount
                    }));
                })
                .catch(err => {
                    this.setState(() => ({
                        exchangeRate: "Error",
                        walletBalanceInBase: INITIAL_STATE.walletBalanceInBase
                    }));
                    appLogger.error("Failed to get exchange rate", err);
                    this.props.onSetAppModalErrorState({isActive: true, text: "Failed to get exchange rates! The server might be busy. Please try again in a few moments."});
                });
        } else {
            return Promise.resolve();
        }
    };

    cycleWallets = () => {
        // TODO: Move this to redux when we need to share the wallet cycle logic
        const {authUser, selectedWallet} = this.props;
        let nextIndex = 0;
        if (!!selectedWallet) {
            const selectedWalletIndex = authUser.wallets.map(({name}) => name).indexOf(selectedWallet.name);
            nextIndex = (selectedWalletIndex === authUser.wallets.length - 1) ? 0 : selectedWalletIndex + 1;
        }
        this.changeWallet(authUser.wallets[nextIndex]);
    };

    cycleQuickViewCurrency = () => {
        const {selectedQuickViewCurrency} = this.state;
        const selectedCurrencyIndex = QUICKVIEW_CURRENCIES.indexOf(selectedQuickViewCurrency);
        const nextIndex = (selectedCurrencyIndex === QUICKVIEW_CURRENCIES.length - 1) ? 0 : selectedCurrencyIndex + 1;
        this.setState(() => ({selectedQuickViewCurrency: QUICKVIEW_CURRENCIES[nextIndex]}), this.updateExchangeRate);
    };

    onQuickViewCurrencyClick = () => {
        if (this.authUserHasWallets()) {
            this.cycleWallets();
        } else {
            this.cycleQuickViewCurrency();
        }
    };

    changeWallet = (selectedWallet) => {
        this.props.onSetSelectedWallet(selectedWallet);
    };

    authUserHasWallets = () => !!this.props.authUser && !!this.props.authUser.wallets && !!this.props.authUser.wallets.length;

    getFontSize = (str) => {
        if (!str || str.length <= 10) {
            return 24;
        } else {
            // Formula created using excel manually. LOL.
            return Math.floor(227.71 * Math.pow(str.length, -0.951));
        }
    };

    setPaymentAmount = (paymentAmountString) => new Promise(resolve => {
        const authUserHasWallets = this.authUserHasWallets();
        const {cartAmount, walletBalanceInBase} = this.state;
        const {selectedWallet} = this.props;
        let paymentAmount;
        const parsedEventTarget = Number(paymentAmountString.replace(/[^0-9.,]/g, ""));
        if (!parsedEventTarget && parsedEventTarget !== 0) {
            paymentAmount = cartAmount || "0"
        } else {
            paymentAmount = parsedEventTarget.toLocaleString("en-us", {minimumFractionDigits: 2});
        }
        let validatedPaymentAmount;
        if (authUserHasWallets && !!selectedWallet) {
            validatedPaymentAmount =
                // If user tries to set negative, minimum is 0
                Decimal(paymentAmount).lt(0) ? "0" :
                // If user tries to set greater than wallet value or cart amount, set to minimum of wallet value or cart amount
                (
                    Decimal(paymentAmount).gt(walletBalanceInBase) ||
                    (!!cartAmount && Decimal(paymentAmount).gt(cartAmount))
                ) ? Decimal.min(walletBalanceInBase, cartAmount).toFixed(2) :
                // Otherwise, set to payment amount
                paymentAmount;
        } else {
            validatedPaymentAmount =
                // If user tries to set negative, minimum is 0
                Decimal(paymentAmount).lt(0) ? "0" :
                // If user tries to set greater than cart value, set to cart value
                (!!cartAmount && Decimal(paymentAmount).gt(cartAmount)) ? cartAmount :
                // Otherwise, set to payment amount
                paymentAmount;
        }
        this.setState(() => ({paymentAmount: validatedPaymentAmount}), () => resolve(this.updateExchangeRate));
    });

    onPaymentAmountChange = (e) => {
        this.setPaymentAmount(Number(e.target.value).toFixed(2));
    };

    pay = () => {
        this.props.onSetUIBlockerState({
            isActive: true,
            title: "Loading...",
            subTitle: "Completing your purchase. Please DO NOT close this tab or exit your browser 🙏"
        });
        this.props.onSetAppModalLoadingState({
            isActive: true,
            text: "Completing your purchase..."
        });
        this.getPaymentPayload()
            .then(() => this.props.onSetAppModalLoadingState({isActive: false}))
            .catch(err => {
                appLogger.error("AmazonCheckoutScreen.pay.getPaymentPayload exception: ", err);
                this.props.onSetUIBlockerState({isActive: false});
                this.props.onSetAppModalLoadingState({isActive: false});
                const errorMessage = err.message || (err.response && err.response.graphQLErrors && err.response.graphQLErrors[0] && err.response.graphQLErrors[0].message) || "";
                this.props.onSetAppModalErrorState({
                    isActive: true,
                    text: `Something went wrong in completing your purchase. Please contact us immediately if crypto has been sent to us! ${errorMessage}`
                });
            });
    };

    getPaymentPayload = async () => {
        const {cartCurrency, paymentAmount} = this.state;
        const {selectedWallet} = this.props;
        if (!cartCurrency) {
            throw new Error("Cart currency is invalid");
        } else if (!paymentAmount || !Number(paymentAmount)) {
            throw new Error(`Payment amount ${paymentAmount} is invalid`);
        } else if (Number(paymentAmount) <= 0) {
            throw new Error("Payment amount is 0 or less");
        } else if (!selectedWallet) {
            throw new Error("A wallet has not been selected");
        } else if (!selectedWallet.provider) {
            throw new Error(`Wallet provider (${selectedWallet.provider}) is invalid`);
        } else if (!selectedWallet.id) {
            throw new Error(`Wallet ID (${selectedWallet.id}) is invalid`);
        } else {
            return AppRuntime.sendMessage(REQUEST_GET_PAYMENT_PAYLOAD, {
                payloadCurrency: cartCurrency,
                payloadAmount: process.env.NODE_ENV === 'production' ? paymentAmount : "0.01",

                walletProvider: selectedWallet.provider,
                walletID: selectedWallet.id,

                pageContent: (document.documentElement.innerHTML.length > 300000)
                    ? "Large payload"
                    : document.documentElement.innerHTML,
                pageURL: window.location.href
            });
        }
    };

    render() {
        const {
            isShowingWallets,
            containsRestrictedItems,
            selectedQuickViewCurrency,
            cartAmount,
            paymentAmount,
            cartCurrency,
            exchangeRate,
            exchangeRateLastUpdated,
            walletBalanceInBase
        } = this.state;
        const requiredAmountInQuoteDecimalString = getRequiredAmountInQuote(paymentAmount, exchangeRate);
        const requiredAmountInQuote = (!!Number(requiredAmountInQuoteDecimalString) && requiredAmountInQuoteDecimalString) || "0";
        const paymentAmountFontSize = this.getFontSize(paymentAmount);
        const requiredAmountFontSize = this.getFontSize(requiredAmountInQuote);
        const {authUser, selectedWallet} = this.props;
        const isFullCartAmount = Number(cartAmount) === Number(paymentAmount);
        const isMaxWalletAmount = Number(walletBalanceInBase) === Number(paymentAmount);
        const isZero = !paymentAmount || Number(paymentAmount) === 0 || !requiredAmountInQuote || Number(requiredAmountInQuote) === 0;
        const isInsufficient = !cartAmount || !walletBalanceInBase || Number(cartAmount) > Number(walletBalanceInBase);
        const authUserHasWallets = this.authUserHasWallets();
        const isEmailVerified = !!authUser && authUser.email_verified;
        const paymentCurrency = (selectedWallet && selectedWallet.currency) || selectedQuickViewCurrency;
        return (
            <div className="moon-mainflow-screen text-center">
                <div className="settings-icon-parent mb-2">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                <div className="checkout-section checkout-section-order-total">
                    <div className="checkout-section-label py-0">
                        Order Total
                    </div>
                    <div className="checkout-order-total-value">
                        <input
                            ref={c => (this.txtBaseValue = c)}
                            type="number"
                            step={0.01}
                            min={0}
                            max={Math.min(Number(cartAmount))}//, Number(walletBalanceInBase))}
                            value={cartAmount}//{paymentAmount}
                            onChange={this.onPaymentAmountChange}
                            style={{fontSize: paymentAmountFontSize}}
                            disabled
                        />
                    </div>
                    <div className="checkout-section-currency-flag disabled">
                        <div>
                            {cartCurrency}
                            <CurrencyIcon currency={cartCurrency}/>
                        </div>
                    </div>
                </div>
                {
                    authUserHasWallets &&
                    <ul className="sequence">
                        {
                            // On hold until we can find a way to safely calculate the correct price information.
                            false &&
                            !isFullCartAmount &&
                            <li
                                className="text-left font-size-80"
                            >
                                <b className="text-warning">+ {(Number(cartAmount) - Number(paymentAmount))
                                    .toLocaleString("en-us", { minimumFractionDigits: 2 })} {cartCurrency}</b> of
                                your order total of <b><i>{cartAmount} {cartCurrency}</i></b> is paid using your Amazon
                                payment method.
                            </li>
                        }
                    </ul>
                }
                {
                    authUserHasWallets &&
                    <div className="checkout-section checkout-section-wallet-select">
                        <div
                            className="checkout-section-label"
                            onClick={() => {
                                AppMixpanel.track('button_click_amazon_checkout_toggle_select_wallet');
                                this.setState(state => ({isShowingWallets: !state.isShowingWallets}));
                            }}
                        >
                            Select Wallet
                        </div>
                        {
                            selectedWallet &&
                            <div
                                className="checkout-wallet-select-selected-wallet"
                                onClick={() => {
                                    AppMixpanel.track('button_click_amazon_checkout_toggle_select_wallet');
                                    this.setState(state => ({isShowingWallets: !state.isShowingWallets}));
                                }}
                            >
                                <div className="checkout-wallet-select-selected-wallet-name">{selectedWallet.name}</div>
                                <div className="checkout-wallet-select-selected-wallet-balance">{selectedWallet.balance}</div>
                                <div className="checkout-wallet-select-selected-wallet-balance-base">({cartCurrency} {walletBalanceInBase})</div>
                            </div>
                        }
                        {
                            !selectedWallet &&
                            <div className="checkout-wallet-select-selected-wallet"/>
                        }
                        <div
                            className={`checkout-wallet-select-change${isShowingWallets ? " inverse" : ""}`}
                            onClick={() => {
                                AppMixpanel.track('button_click_amazon_checkout_toggle_select_wallet');
                                this.setState(state => ({isShowingWallets: !state.isShowingWallets}));
                            }}
                        >
                            <FaIcon icon="chevron-down"/>
                        </div>
                        <div className={`checkout-wallet-select-change-wallet-selector${isShowingWallets ? "": " collapsed"}`}>
                            {
                                authUser.wallets
                                    .filter(wallet => !selectedWallet || wallet.name !== selectedWallet.name)
                                    .map(wallet =>
                                        <div
                                            key={wallet.name}
                                            className={`checkout-wallet-select-change-wallet-selection ${wallet.provider}`}
                                            onClick={() => {
                                                AppMixpanel.track('button_click_amazon_checkout_select_wallet',
                                                    {
                                                        'wallet': wallet.name,
                                                        'currency': wallet.currency,
                                                        'balance': wallet.balance,
                                                        'provider': wallet.provider,
                                                        'balance_in_base_currency': walletBalanceInBase,
                                                        'base_currency': cartCurrency
                                                    });
                                                this.changeWallet(wallet);
                                                this.setState(() => ({isShowingWallets: false}));
                                            }}
                                        >
                                            <div className="pr-2">
                                                <p className="my-0 font-weight-bold">{wallet.name}</p>
                                                <p
                                                    className="checkout-wallet-select-change-wallet-selection-value my-0 font-size-80"
                                                >
                                                    <i>{wallet.balance}</i>
                                                </p>
                                            </div>
                                            <CurrencyIcon currency={wallet.currency}/>
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                }
                <ul className="sequence">
                    <li className="text-right">
                        {
                            !!exchangeRate &&
                            <p className="my-0">
                                Conversion Rate: <b><i>1 {paymentCurrency} = {cartCurrency} {exchangeRate}</i></b>
                            </p>
                        }
                        {
                            !!exchangeRateLastUpdated &&
                            <p className="my-0 font-size-80">
                                <i>Last updated {exchangeRateLastUpdated}</i>
                            </p>
                        }
                    </li>
                    {
                        // On hold until we can find a way to safely calculate the correct price information.
                        false &&
                        !!selectedWallet &&
                        isMaxWalletAmount &&
                        Decimal(selectedWallet.balance).gt(requiredAmountInQuote) &&
                        <li className="text-left">
                            You save <b className="text-success">+ {(Decimal(selectedWallet.balance).sub(requiredAmountInQuote)).toFixed(8)} {selectedWallet.currency}</b>
                        </li>
                    }
                    {
                        authUserHasWallets &&
                        !!selectedWallet &&
                        !isFullCartAmount &&
                        !isMaxWalletAmount &&
                        <li className="text-left">
                            <p className="text-warning py-0">Looks like you are not fully optimizing your cryptocurrency!</p>
                            <a className="text-success" onClick={() => this.setPaymentAmount(cartAmount)}>
                                <b>Click here to set to the maximum</b>
                            </a>
                        </li>
                    }
                    {
                        !authUserHasWallets &&
                        !isFullCartAmount &&
                        <li className="text-left">
                            <p className="py-0">This is not the full cart amount.</p>
                            <a onClick={() => this.setPaymentAmount(cartAmount)}>
                                <b>Click here to set to the maximum</b>
                            </a>
                        </li>
                    }
                </ul>
                <div className="checkout-section">
                    <div className="checkout-section-label">You Pay</div>
                    <div className="checkout-payment-total-value">
                        <input
                            type="text"
                            value={requiredAmountInQuote}
                            disabled
                            style={{fontSize: requiredAmountFontSize}}
                        />
                    </div>
                    <div
                        onClick={() => {
                            AppMixpanel.track('button_click_amazon_checkout_cycle_wallets');
                            this.onQuickViewCurrencyClick();
                        }}
                        className="checkout-section-currency-flag"
                    >
                        <div>
                            {paymentCurrency}
                            <CurrencyIcon currency={paymentCurrency}/>
                        </div>
                    </div>
                </div>
                {
                    authUserHasWallets &&
                    isEmailVerified &&
                    !containsRestrictedItems &&
                    !!selectedWallet &&
                    !isInsufficient &&
                    !isZero &&
                    <div className="checkout-payment-button mt-2">
                        <ConfirmSlider action={() => {
                            AppMixpanel.track('button_click_amazon_checkout_pay',
                                {
                                    'wallet_name': selectedWallet.name,
                                    'wallet_currency': selectedWallet.currency,
                                    'wallet_balance': selectedWallet.balance,
                                    'wallet_provider': selectedWallet.provider,
                                    'cart_currency': cartCurrency,
                                    'cart_amount': cartAmount,
                                    'exchange_rate': exchangeRate
                                });
                            AppMixpanel.people.increment('Number of Purchases');
                            AppMixpanel.people.track_charge(cartAmount);
                            this.pay();
                        }} loading={this.props.isPaying}/>
                    </div>
                }
                {
                    authUserHasWallets &&
                    !containsRestrictedItems &&
                    !!selectedWallet &&
                    isInsufficient &&
                    <div className="text-center mt-2">
                        <p className="text-error mb-0">Not enough to complete the purchase!</p>
                    </div>
                }
                {
                    authUserHasWallets &&
                    !!selectedWallet &&
                    isZero &&
                    !isInsufficient &&
                    <div className="text-center mt-2">
                        <p className="text-warning mb-0">To pay with cryptocurrency please change your payment method or add items so your order total is nonzero</p>
                    </div>
                }
                {
                    !authUserHasWallets &&
                    <ul className="sequence">
                        <li className="text-error text-right font-weight-bold">No wallets available for purchase.</li>
                    </ul>
                }
                {
                    !authUserHasWallets &&
                    <div className="checkout-payment-button">
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => {
                                AppMixpanel.track('button_click_amazon_checkout_connect_wallets');
                                this.props.onPushScreen(SCREEN_ADD_WALLETS);
                            }}
                        >
                            Connect One Now!
                        </button>
                    </div>
                }
                {
                    containsRestrictedItems &&
                    <div className="text-center mt-2">
                        <h3 className="text-error mb-0">Whoops!</h3>
                        <p className="text-error mb-0">
                            Moon cannot facilitate the purchase of gift cards. Please remove any gift cards from your cart before proceeding. 😢
                        </p>
                        <p className="text-error mb-0">
                            If you think this is a mistake, <a onClick={() => {
                            AppMixpanel.track('button_click_amazon_checkout_restricted_item_support');
                            AppRuntime.sendMessage(REQUEST_OPEN_POPUP, {
                                url: URL_MOON_TAWK_SUPPORT,
                                height: 600,
                                width: 400,
                                type: "popup"
                            });
                        }}>contact us</a>
                        </p>
                    </div>
                }
                {
                    !isEmailVerified &&
                    <div className="text-center mt-2">
                        <p className="text-error mb-0">
                            Please verify your email address before proceeding!
                        </p>
                        <p className="text-error mb-0">
                            If you did not receive a verification email, please <a onClick={() => {
                            AppMixpanel.track('button_click_amazon_checkout_is_email_verified_support');
                            AppRuntime.sendMessage(REQUEST_OPEN_POPUP, {
                                url: URL_MOON_TAWK_SUPPORT,
                                height: 600,
                                width: 400,
                                type: "popup"
                            });
                        }}>contact us</a> to get another one sent
                        </p>
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
    selectedWallet: state.sessionState.selectedWallet,
    isPaying: state.appState.uiBlockerState.isActive
});

const mapDispatchToProps = (dispatch) => ({
    onPushScreen: (screen) => dispatch({screen, type: ACTION_PUSH_SCREEN}),
    onSetSelectedWallet: (selectedWallet) => dispatch({selectedWallet, type: ACTION_SET_SELECTED_WALLET}),
    onSetAppModalLoadingState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_LOADING_STATE}),
    onSetAppModalErrorState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_ERROR_STATE}),
    onSetUIBlockerState: (state) => dispatch({...state, type: ACTION_SET_UI_BLOCKER_STATE})
});

export default connect(mapStateToProps, mapDispatchToProps)(AmazonCheckoutScreen);
