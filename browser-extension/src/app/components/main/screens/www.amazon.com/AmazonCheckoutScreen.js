import React from "react";
import "./AmazonCheckoutScreen.css";
import {connect} from "react-redux";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import {querySelectorCartAmount, querySelectorCartCurrency} from "./constants/querySelectors";
import Decimal from "decimal.js";
import {
    ACTION_PUSH_SCREEN, ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_SELECTED_WALLET, SCREEN_ADD_WALLETS
} from "../../../../redux/reducers/constants";
import CurrencyIcon from "../../../misc/currencyicon/CurrencyIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_GET_EXCHANGE_RATE} from "../../../../../constants/events/appEvents";
import {getRequiredAmountInQuote, getWalletBalanceInBase} from "../../../../utils/exchangerates";
import FaIcon from "../../../misc/fontawesome/FaIcon";
import {byPropKey} from "../../../utils";

const QUICKVIEW_CURRENCIES = ["BTC", "ETH", "LTC"];
const INITIAL_STATE = {
    selectedQuickViewCurrency: QUICKVIEW_CURRENCIES[0],
    cartAmount: null,
    paymentAmount: null,
    cartCurrency: null,
    exchangeRate: "0",
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
        this.parse();
    }

    parse = () => {
        const cartAmountElements = document.querySelectorAll(querySelectorCartAmount);
        const cartCurrencyElements = document.querySelectorAll(querySelectorCartCurrency);
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
        this.setState(state => ({
            cartAmount,
            paymentAmount: state.paymentAmount || cartAmount,
            cartCurrency: (cartCurrencyElements && cartCurrencyElements.length && cartCurrencyElements[0].value) || "USD"
        }), this.updateExchangeRate);
    };

    updateExchangeRate = () => {
        const {cartCurrency, selectedQuickViewCurrency, paymentAmount} = this.state;
        const {selectedWallet} = this.props;
        if (paymentAmount) {
            AppRuntime.sendMessage(REQUEST_GET_EXCHANGE_RATE, {
                quote: (selectedWallet && selectedWallet.currency) || selectedQuickViewCurrency,
                base: cartCurrency
            })
                .then(({bid}) => this.setState(() => ({
                    exchangeRate: bid,
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

    changeWallet = (selectedWallet) => this.props.onSetSelectedWallet(selectedWallet);

    render() {
        const {selectedQuickViewCurrency, cartAmount, paymentAmount, cartCurrency, exchangeRate, walletBalanceInBase, requiredAmountInQuote} = this.state;
        const {authUser, selectedWallet} = this.props;
        const isZero = !cartAmount || Number(cartAmount) === 0;
        const authUserHasWallets = !!authUser && !!authUser.wallets && !!authUser.wallets.length;
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
                            value={paymentAmount}
                            disabled
                            onChange={e => this.setState(byPropKey("paymentAmount", e.target.value.replace(/[^0-9.,]/g, "")))}
                            size="10"
                        />
                    </div>
                    <div className="checkout-section-currency-flag">
                        {cartCurrency}
                        <CurrencyIcon currency={cartCurrency}/>
                    </div>
                </div>
                {
                    authUserHasWallets &&
                    <ul className="sequence">
                        <li>Note: If your wallet balance is insufficient, Amazon will fallback to your selected default payment method for the purchase.</li>
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
                        <div className="checkout-wallet-select-change">
                            <button>
                                <FaIcon icon="caret-down"/>
                            </button>
                        </div>
                    </div>
                }
                <ul className="sequence">
                    <li>Conversion Rate: 1 {paymentCurrency} = {cartCurrency} {exchangeRate}</li>
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
                    <div className="checkout-section-currency-flag">
                        {paymentCurrency}
                        <CurrencyIcon currency={paymentCurrency}/>
                    </div>
                </div>
                {
                    authUserHasWallets &&
                    <div className="checkout-payment-button">
                        <button className="btn btn-primary btn-pay">
                            Pay with Moon
                        </button>
                    </div>
                }
                {
                    !authUserHasWallets &&
                    <div className="checkout-payment-button mt-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => this.props.onPushScreen(SCREEN_ADD_WALLETS)}
                        >
                            No wallets available for purchase. Add one now!
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
    onSetAppModalErrorState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_ERROR_STATE}),
});

export default connect(mapStateToProps, mapDispatchToProps)(AmazonCheckoutScreen);
