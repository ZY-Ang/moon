import React from "react";
import {connect} from "react-redux";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import FaIcon from "../../../misc/fontawesome/FaIcon";
import {querySelectorCartAmount, querySelectorCartCurrency} from "./constants/querySelectors";
import Decimal from "decimal.js";
import {
    ACTION_PUSH_SCREEN,
    ACTION_SET_SELECTED_WALLET,
    SCREEN_ADD_WALLETS
} from "../../../../redux/reducers/constants";

class AmazonCheckoutScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cartAmount: null,
            cartCurrency: null
        };
    }

    componentWillMount() {

    }

    parse = () => {
        const cartAmountElements = document.querySelectorAll(querySelectorCartAmount);
        const cartCurrencyElements = document.querySelectorAll(querySelectorCartCurrency);
        const cartAmount = !!cartAmountElements && !!cartAmountElements.length && (
            (
                !!cartAmountElements[0].value &&
                Decimal(cartAmountElements[0].value.replace(/[^0-9.-]+/g, '')).toFixed(2)
            ) || (
                !!cartAmountElements[0].innerText &&
                Decimal(cartAmountElements[0].innerText.replace(/[^0-9.-]+/g, '')).toFixed(2)
            )
        );
        this.setState(() => ({
            cartAmount: (
                !!cartAmount &&
                (Number(cartAmount) > 0) &&
                process.env.NODE_ENV !== 'production'
            )
                ? "0.01"
                : cartAmount ? cartAmount : "0.00",
            cartCurrency: (cartCurrencyElements && cartCurrencyElements.length && cartCurrencyElements[0].value) || "USD"
        }));
    };

    changeWallet = (selectedWallet) => this.props.onSetSelectedWallet(selectedWallet);

    render() {
        const {cartAmount, cartCurrency} = this.state;
        const {authUser, selectedWallet} = this.props;
        const isZero = !cartAmount || Number(cartAmount) === 0;
        return (
            <div className="moon-tab text-center">
                <div className="settings-icon-parent">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                <div>
                    <div>
                        {
                            !!authUser &&
                            !!authUser.wallets &&
                            !!authUser.wallets.length &&
                            <span
                                id="checkout-cart-icon"
                                role="img"
                                aria-label="Checkout"
                                style={{fontSize: 80}}
                            >
                                🛒
                            </span>
                        }
                        {
                            // cartAmount &&
                            // cartCurrency &&
                            // selectedWallet &&
                            // <CheckoutCalculator
                            //     cartAmount={cartAmount}
                            //     cartCurrency={cartCurrency}
                            //     selectedWallet={selectedWallet}
                            //     exchangeRate={this.state.exchangeRate}
                            //     walletBalanceInBase={this.state.walletBalanceInBase}
                            //     requiredAmountInQuote={this.state.requiredAmountInQuote}
                            //     isZero={isZero}
                            //     isSufficient={this.state.isSufficient}
                            //     topUpAmountInQuote={this.state.topUpAmountInQuote}
                            // />
                        }
                    </div>
                    {
                        // authUser &&
                        // <WalletSelector
                        //     // changeWallet={changeWallet}
                        //     // setShowWalletSelector={setShowWalletSelector}
                        //     // show={showWalletSelector}
                        //     wallets={authUser.wallets}
                        // />
                    }
                    {
                        selectedWallet &&
                        <div className="btn-group btn-group-pay">
                            {
                                this.state.isSufficient &&
                                !isZero &&
                                <button
                                    className="btn btn-pay btn-primary"
                                    // onClick={pay}
                                >
                                    Pay with <b>{selectedWallet.name}</b>
                                </button>
                            }
                            {
                                !this.state.isSufficient &&
                                !isZero &&
                                <button
                                    className="btn btn-pay btn-primary"
                                    disabled
                                >
                                    Insufficient Funds
                                </button>
                            }
                            {
                                isZero &&
                                <button
                                    className="btn btn-pay btn-primary"
                                    disabled
                                >
                                    $0.00 Total
                                </button>
                            }
                            <button
                                // className={`btn btn-icon btn-primary-outline btn-wallet-selector${showWalletSelector ? ' inverse' : ''}`}
                                // onClick={() => setShowWalletSelector(!showWalletSelector)}
                            >
                                <FaIcon icon="caret-up"/>
                            </button>
                        </div>
                    }
                    {
                        !!authUser &&
                        !!authUser.wallets &&
                        !!authUser.wallets.length &&
                        !selectedWallet &&
                        <div className="btn-group btn-group-pay">
                            <button
                                className="btn btn-pay btn-primary"
                                disabled
                            >
                                Insufficient Funds
                            </button>
                            <button
                                // className={`btn btn-icon btn-primary-outline btn-wallet-selector${showWalletSelector ? ' inverse' : ''}`}
                                disabled
                            >
                                <FaIcon icon="caret-up"/>
                            </button>
                        </div>
                    }
                    {
                        !!authUser &&
                        (!authUser.wallets || !authUser.wallets.length) &&
                        <div className="btn-group btn-group-pay">
                            <button
                                className="btn btn-primary"
                                onClick={() => this.props.onPushScreen(SCREEN_ADD_WALLETS)}
                            >
                                No wallets available for purchase. Add one now!
                            </button>
                        </div>
                    }
                </div>
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
    onSetSelectedWallet: (selectedWallet) => dispatch({selectedWallet, type: ACTION_SET_SELECTED_WALLET})
});

export default connect(mapStateToProps, mapDispatchToProps)(AmazonCheckoutScreen);
