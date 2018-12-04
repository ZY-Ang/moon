import React from "react";
import "./AmazonCheckoutScreen.css";
import moment from "moment";
import {connect} from "react-redux";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import {
    querySelectorCartAmount,
    querySelectorCartCurrency
} from "./constants/querySelectors";
import Decimal from "decimal.js";
import {
    ACTION_PUSH_SCREEN, ACTION_SET_APP_MODAL_ERROR_STATE, ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_SELECTED_WALLET, ACTION_SET_UI_BLOCKER_STATE, SCREEN_ADD_WALLETS
} from "../../../../redux/reducers/constants";
import CurrencyIcon from "../../../misc/currencyicon/CurrencyIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_GET_EXCHANGE_RATE, REQUEST_GET_PAYMENT_PAYLOAD} from "../../../../../constants/events/appEvents";
import {getRequiredAmountInQuote, getWalletBalanceInBase} from "../../../../utils/exchangerates";
import FaIcon from "../../../misc/fontawesome/FaIcon";
import {handleErrors} from "../../../../../utils/errors";

export const QUICKVIEW_CURRENCIES = ["BTC", "ETH", "LTC", "BCH", "ETC"];
const INITIAL_STATE = {
    isShowingWallets: false,
    selectedQuickViewCurrency: QUICKVIEW_CURRENCIES[0],
    cartAmount: null,
    paymentAmount: null,
    cartCurrency: null,
    exchangeRate: null,
    exchangeRateLastUpdated: null,
    walletBalanceInBase: "0",
    requiredAmountInQuote: "0"
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
        if (!!this.txtBaseValue) {
            this.txtBaseValue.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.parse()
            .then(this.updateExchangeRate);
    }

    parse = (triesRemaining = 5) => {
        const cartAmountElements = document.querySelectorAll(querySelectorCartAmount);
        const cartCurrencyElements = document.querySelectorAll(querySelectorCartCurrency);

        if (!cartAmountElements || !cartCurrencyElements || !cartAmountElements.length || !cartCurrencyElements.length) {
            this.props.onSetAppModalLoadingState({isActive: true, text: "Loading..."});
            return new Promise((resolve, reject) => {
                if (triesRemaining > 0) {
                    setTimeout(() => resolve(this.parse(triesRemaining - 1)), 200);
                } else {
                    reject(new Error("Unable to parse cart information! Please refresh to try again."))
                }
            })
                .catch(err => this.props.onSetAppModalErrorState({isActive: true, text: err.message}))
                .finally(() => this.props.onSetAppModalLoadingState({isActive: false}));
        }
        const actualCartAmount = !!cartAmountElements && !!cartAmountElements.length && (
            (
                !!cartAmountElements[0].value &&
                Decimal(cartAmountElements[0].value.replace(/[^0-9.-]+/g, '')).toFixed(2)
            ) || (
                !!cartAmountElements[0].innerText &&
                Decimal(cartAmountElements[0].innerText.replace(/[^0-9.-]+/g, '')).toFixed(2)
            )
        );
        const cartAmount = actualCartAmount ? actualCartAmount : "0.00";
        const paymentAmount = (
            !!actualCartAmount &&
            (Number(actualCartAmount) > 0) &&
            process.env.NODE_ENV !== 'production'
        )
            ? "0.01"
            : actualCartAmount ? actualCartAmount : "0.00";
        return new Promise((resolve) => this.setState(state => ({
            cartAmount,
            paymentAmount: state.paymentAmount || paymentAmount,
            cartCurrency: (cartCurrencyElements && cartCurrencyElements.length && cartCurrencyElements[0].value) || "USD"
        }), resolve));
    };

    updateExchangeRate = () => {
        const {cartCurrency, selectedQuickViewCurrency, paymentAmount} = this.state;
        const {selectedWallet} = this.props;
        if (paymentAmount) {
            AppRuntime.sendMessage(REQUEST_GET_EXCHANGE_RATE, {
                quote: (selectedWallet && selectedWallet.currency) || selectedQuickViewCurrency,
                base: cartCurrency
            })
                .then(({bid, lastUpdated}) => {
                    const walletBalanceInBase = (selectedWallet && getWalletBalanceInBase(selectedWallet.balance, bid)) || "0";
                    this.setState(() => ({
                        exchangeRate: Decimal(bid).toFixed(2, Decimal.ROUND_DOWN),
                        exchangeRateLastUpdated: moment(lastUpdated).fromNow(),
                        walletBalanceInBase,
                        paymentAmount: (!!selectedWallet && Decimal(walletBalanceInBase).lt(paymentAmount)) ? walletBalanceInBase : paymentAmount,
                        requiredAmountInQuote: getRequiredAmountInQuote(paymentAmount, bid)
                    }));
                })
                .catch(err => {
                    this.setState(() => ({
                        exchangeRate: "Error",
                        walletBalanceInBase: INITIAL_STATE.walletBalanceInBase,
                        requiredAmountInQuote: INITIAL_STATE.requiredAmountInQuote
                    }));
                    console.error("Failed to get exchange rate", err);
                    this.props.onSetAppModalErrorState({isActive: true, text: "Failed to get exchange rates! The server might be busy. Please try again in a few moments."});
                });
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

    changeWallet = (selectedWallet) => this.props.onSetSelectedWallet(selectedWallet);

    authUserHasWallets = () => !!this.props.authUser && !!this.props.authUser.wallets && !!this.props.authUser.wallets.length

    getFontSize = (str) => {
        if (!str || str.length <= 10) {
            return 24;
        } else {
            return Math.round(240 / str.length);
        }
    };

    getPaymentInputSize = (str) => {
        if (!str || str.length <= 10) {
            return 10;
        } else {
            return Math.round(str.length * 1.1);
        }
    };

    setPaymentAmount = (paymentAmountString) => {
        const authUserHasWallets = this.authUserHasWallets();
        const {cartAmount, walletBalanceInBase} = this.state;
        const {selectedWallet} = this.props;
        let paymentAmount;
        const parsedEventTarget = Number(paymentAmountString.replace(/[^0-9.,]/g, ""));
        if (!parsedEventTarget) {
            paymentAmount = cartAmount || "0"
        } else {
            paymentAmount = parsedEventTarget.toFixed(2);
        }
        if (authUserHasWallets && !!selectedWallet) {
            const validatedPaymentAmount =
                // If user tries to set negative, minimum is 0
                Decimal(paymentAmount).lt(0) ? "0" :
                    // If user tries to set greater than wallet value, set to wallet value
                    Decimal(paymentAmount).gt(walletBalanceInBase) ? walletBalanceInBase :
                        // If user tries to set greater than cart value, set to cart value
                        (!!cartAmount && Decimal(paymentAmount).gt(cartAmount)) ? cartAmount :
                            // Otherwise, set to payment amount
                            paymentAmount;
            this.setState(() => ({paymentAmount: validatedPaymentAmount}), this.updateExchangeRate);
        } else {
            const validatedPaymentAmount =
                // If user tries to set negative, minimum is 0
                Decimal(paymentAmount).lt(0) ? "0" :
                    // If user tries to set greater than cart value, set to cart value
                    (!!cartAmount && Decimal(paymentAmount).gt(cartAmount)) ? cartAmount :
                        // Otherwise, set to payment amount
                        paymentAmount;
            this.setState(() => ({paymentAmount: validatedPaymentAmount}), this.updateExchangeRate);
        }
    };

    onPaymentAmountChange = (e) => {
        this.setPaymentAmount(e.target.value);
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
                handleErrors(err);
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
                payloadAmount: paymentAmount,

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
            selectedQuickViewCurrency,
            cartAmount,
            paymentAmount,
            cartCurrency,
            exchangeRate,
            exchangeRateLastUpdated,
            walletBalanceInBase,
            requiredAmountInQuote
        } = this.state;
        const {authUser, selectedWallet} = this.props;
        const isFullCartAmount = Number(cartAmount) === Number(paymentAmount);
        const isMaxWalletAmount = Number(walletBalanceInBase) === Number(paymentAmount);
        const isZero = !paymentAmount || Number(paymentAmount) === 0;
        const authUserHasWallets = this.authUserHasWallets();
        const paymentCurrency = (selectedWallet && selectedWallet.currency) || selectedQuickViewCurrency;
        return (
            <div className="moon-tab text-center">
                <div className="settings-icon-parent mb-2">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                <div className="checkout-section">
                    <div className="checkout-section-label">
                        {isFullCartAmount ? "Order Total" : "Convert"}
                    </div>
                    <div className="checkout-order-total-value">
                        <input
                            ref={c => (this.txtBaseValue = c)}
                            type="text"
                            value={paymentAmount || "Hang On..."}
                            onChange={this.onPaymentAmountChange}
                            style={{fontSize: this.getFontSize(paymentAmount)}}
                            size={this.getPaymentInputSize(paymentAmount)}
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
                            !isFullCartAmount &&
                            <li
                                className="text-left font-size-80"
                            >
                                <b>+ {(Number(cartAmount) - Number(paymentAmount)).toFixed(2)}</b> <b>{cartCurrency}</b> of your order total of <b><i>{cartAmount} {cartCurrency}</i></b> is paid using your Amazon payment method.
                            </li>
                        }
                    </ul>
                }
                {
                    authUserHasWallets &&
                    <div className="checkout-section">
                        <div className="checkout-section-label">Select Wallet</div>
                        {
                            selectedWallet &&
                            <div className="checkout-wallet-select-selected-wallet">
                                <div className="checkout-wallet-select-selected-wallet-name">{selectedWallet.name}</div>
                                <div className="checkout-wallet-select-selected-wallet-balance">{selectedWallet.balance}</div>
                                <div className="checkout-wallet-select-selected-wallet-balance-base">({cartCurrency} {walletBalanceInBase})</div>
                            </div>
                        }
                        <div
                            className={`checkout-wallet-select-change${isShowingWallets ? " inverse" : ""}`}
                            onClick={() => this.setState(state => ({isShowingWallets: !state.isShowingWallets}))}
                        >
                            <FaIcon icon="chevron-down"/>
                        </div>
                        {
                            isShowingWallets &&
                            <div className="checkout-wallet-select-change-wallet-selector">
                                {
                                    authUser.wallets
                                        .filter(wallet => !selectedWallet || wallet.name !== selectedWallet.name)
                                        .map(wallet =>
                                            <div
                                                key={wallet.name}
                                                className={`checkout-wallet-select-change-wallet-selection ${wallet.provider}`}
                                                onClick={() => {
                                                    this.changeWallet(wallet);
                                                    this.setState(() => ({isShowingWallets: false}));
                                                }}
                                            >
                                                <div>
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
                        }
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
                        !!selectedWallet &&
                        isMaxWalletAmount &&
                        <li className="text-left">
                            You save <b>+ {(Decimal(selectedWallet.balance).sub(requiredAmountInQuote)).toFixed(8)} {selectedWallet.currency}</b>
                        </li>
                    }
                    {
                        authUserHasWallets &&
                        !!selectedWallet &&
                        !isFullCartAmount &&
                        !isMaxWalletAmount &&
                        <li className="text-left">
                            <p className="py-0">Looks like you are not fully optimizing your cryptocurrency!</p>
                            <a onClick={() => this.setPaymentAmount(cartAmount)}>
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
                            style={{fontSize: this.getFontSize(requiredAmountInQuote)}}
                            size={this.getPaymentInputSize(requiredAmountInQuote)}
                        />
                    </div>
                    <div
                        onClick={this.onQuickViewCurrencyClick}
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
                    !!selectedWallet &&
                    <div className="checkout-payment-button my-2">
                        <button
                            className="btn btn-primary btn-pay w-77"
                            onClick={this.pay}
                            disabled={this.props.isPaying}
                        >
                            Pay with Moon
                        </button>
                    </div>
                }
                {
                    !authUserHasWallets &&
                    <div className="checkout-payment-button my-2">
                        <p className="text-error">No wallets available for purchase.</p>
                        <button
                            className="btn btn-primary w-77"
                            onClick={() => this.props.onPushScreen(SCREEN_ADD_WALLETS)}
                        >
                            Connect One Now!
                        </button>
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
