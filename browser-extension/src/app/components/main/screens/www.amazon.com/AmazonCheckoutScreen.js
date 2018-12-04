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
    ACTION_SET_SELECTED_WALLET, SCREEN_ADD_WALLETS
} from "../../../../redux/reducers/constants";
import CurrencyIcon from "../../../misc/currencyicon/CurrencyIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_GET_EXCHANGE_RATE} from "../../../../../constants/events/appEvents";
import {getRequiredAmountInQuote, getWalletBalanceInBase} from "../../../../utils/exchangerates";
import FaIcon from "../../../misc/fontawesome/FaIcon";
import {byPropKey} from "../../../utils";

const QUICKVIEW_CURRENCIES = ["BTC", "ETH", "LTC", "BCH", "ETC"];
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
        const cartAmount = (
            !!actualCartAmount &&
            (Number(actualCartAmount) > 0) &&
            process.env.NODE_ENV !== 'production'
        )
            ? "0.01"
            : actualCartAmount ? actualCartAmount : "0.00";
        return new Promise((resolve) => this.setState(state => ({
            cartAmount,
            paymentAmount: state.paymentAmount || cartAmount,
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
                .then(({bid, lastUpdated}) => this.setState(() => ({
                    exchangeRate: Decimal(bid).toFixed(2, Decimal.ROUND_DOWN),
                    exchangeRateLastUpdated: moment(lastUpdated).fromNow(),
                    walletBalanceInBase: selectedWallet && getWalletBalanceInBase(selectedWallet.balance, bid),
                    requiredAmountInQuote: getRequiredAmountInQuote(paymentAmount, bid)
                })))
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
        const isZero = !cartAmount || Number(cartAmount) === 0;
        const authUserHasWallets = this.authUserHasWallets();
        const paymentCurrency = (selectedWallet && selectedWallet.currency) || selectedQuickViewCurrency;
        return (
            <div className="moon-tab text-center">
                <div className="settings-icon-parent mb-2">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                <div className="checkout-section">
                    <div className="checkout-section-label">Order Total</div>
                    <div className="checkout-order-total-value">
                        <input
                            type="text"
                            value={paymentAmount || "Calculating..."}
                            disabled
                            onChange={e => this.setState(byPropKey("paymentAmount", e.target.value.replace(/[^0-9.,]/g, "")))}
                            size="10"
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
                        <li className="text-left" style={{fontSize: '80%'}}>Note: If your wallet balance is insufficient, Amazon will fallback to your selected default payment method for the purchase.</li>
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
                                                        className="checkout-wallet-select-change-wallet-selection-value my-0"
                                                        style={{fontSize: "80%"}}
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
                            <p className="my-0" style={{fontSize: "80%"}}>
                                <i>Last updated {exchangeRateLastUpdated}</i>
                            </p>
                        }
                    </li>
                </ul>
                <div className="checkout-section">
                    <div className="checkout-section-label">You Pay</div>
                    <div className="checkout-payment-total-value">
                        <input
                            type="text"
                            value={requiredAmountInQuote}
                            disabled
                            size="10"
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
                        <button className="btn btn-primary btn-pay w-77">
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
    selectedWallet: state.sessionState.selectedWallet
});

const mapDispatchToProps = (dispatch) => ({
    onPushScreen: (screen) => dispatch({screen, type: ACTION_PUSH_SCREEN}),
    onSetSelectedWallet: (selectedWallet) => dispatch({selectedWallet, type: ACTION_SET_SELECTED_WALLET}),
    onSetAppModalLoadingState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_LOADING_STATE}),
    onSetAppModalErrorState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_ERROR_STATE}),
});

export default connect(mapStateToProps, mapDispatchToProps)(AmazonCheckoutScreen);
