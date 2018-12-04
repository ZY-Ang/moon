/*
 * Copyright (c) 2018 moon
 */

import React, {Component} from "react";
import Decimal from "decimal.js";
import {connect} from "react-redux";
import FaIcon from "../misc/fontawesome/FaIcon";
import AppRuntime from "../../browser/AppRuntime";
import {REQUEST_GET_EXCHANGE_RATE} from "../../../constants/events/appEvents";
import {getRequiredAmountInQuote, getWalletBalanceInBase} from "../../utils/exchangerates";

class WalletSelector extends Component {
    constructor() {
        super();
        this.state = {
            show: false
        };
    }

    render() {
        return this.props.show ? (
            <div
                ref={c => (this.node = c)}
                id="wallet-selector"
                className="btn-group-vertical"
            >
                {
                    this.props.wallets.map(wallet =>
                        <button
                            key={wallet.id}
                            className="btn btn-primary-outline btn-dropdown"
                            onClick={() => {
                                this.props.changeWallet(wallet);
                                this.props.setShowWalletSelector(false);
                            }}
                        >
                            {wallet.name} ({wallet.balance})
                        </button>
                    )
                }
            </div>
        ) : null;
    }
}

class CheckoutCalculator extends Component {
    render() {
        const {
            cartAmount,
            cartCurrency,
            selectedWallet,
            exchangeRate,
            walletBalanceInBase,
            requiredAmountInQuote,
            isZero,
            isSufficient,
            topUpAmountInQuote
        } = this.props;
        return selectedWallet ? (
            <div className="checkout-calculator">
                <div className="checkout-calculator-section border-bottom">
                    <div className="text-left float-left">{selectedWallet.currency}/{cartCurrency}</div>
                    <div className="text-right"><b>{cartCurrency} {exchangeRate}</b></div>
                </div>
                <div className="checkout-calculator-section border-bottom">
                    <div className="text-left float-left">{selectedWallet.name} Balance</div>
                    <div className="text-right"><b>{selectedWallet.currency} {selectedWallet.balance}</b></div>
                    <div className="text-right"><b>{cartCurrency} {walletBalanceInBase}</b></div>
                </div>
                <div className="checkout-calculator-section">
                    <div className="text-left float-left">Purchase Amount</div>
                    <div className="text-right"><b>{selectedWallet.currency} {requiredAmountInQuote}</b></div>
                    <div className="text-right"><b>{cartCurrency} {cartAmount}</b></div>
                </div>
                {
                    !isSufficient &&
                    !isZero &&
                    <div className="checkout-calculator-section">
                        <div
                            className="text-center text-error"
                        >
                            Insufficient funds! You need <b>{selectedWallet.currency} {topUpAmountInQuote}</b> more to complete this purchase!
                        </div>
                    </div>
                }
            </div>
        ) : null;
    }
}

class CheckoutBody extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exchangeRate: "0",
            walletBalanceInBase: "0",
            requiredAmountInQuote: "0",
            isSufficient: true,
            topUpAmountInQuote: "0"
        };
        this.updateExchangeRate(props);
    }

    componentWillReceiveProps(nextProps) {
        this.updateExchangeRate(nextProps);
    }

    updateExchangeRate = ({cartAmount, cartCurrency, selectedWallet}) => {
        if (cartCurrency && selectedWallet) {
            AppRuntime.sendMessage(REQUEST_GET_EXCHANGE_RATE, {
                quote: selectedWallet.currency,
                base: cartCurrency
            })
                .then(exchangeRate => {
                    const requiredAmountInQuote = getRequiredAmountInQuote(cartAmount, exchangeRate.bid);
                    this.setState(() => ({
                        exchangeRate: exchangeRate.bid,
                        walletBalanceInBase: getWalletBalanceInBase(selectedWallet.balance, exchangeRate.bid),
                        requiredAmountInQuote,
                        isSufficient: (Decimal(selectedWallet.balance).gt(requiredAmountInQuote)),
                        topUpAmountInQuote: Decimal(requiredAmountInQuote).sub(selectedWallet.balance).toString()
                    }));
                })
                .catch(err => console.error("Failed to get exchange rate", err));
        }
    };

    render() {
        const {
            cartAmount,
            cartCurrency,
            authUser,
            changeWallet,
            setShowWalletSelector,
            pay,
            selectedWallet,
            showWalletSelector
        } = this.props;
        const isZero = !cartAmount || Number(cartAmount) === 0;
        return (
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
                        cartAmount &&
                        cartCurrency &&
                        selectedWallet &&
                        <CheckoutCalculator
                            cartAmount={cartAmount}
                            cartCurrency={cartCurrency}
                            selectedWallet={selectedWallet}
                            exchangeRate={this.state.exchangeRate}
                            walletBalanceInBase={this.state.walletBalanceInBase}
                            requiredAmountInQuote={this.state.requiredAmountInQuote}
                            isZero={isZero}
                            isSufficient={this.state.isSufficient}
                            topUpAmountInQuote={this.state.topUpAmountInQuote}
                        />
                    }
                </div>
                {
                    authUser &&
                    <WalletSelector
                        changeWallet={changeWallet}
                        setShowWalletSelector={setShowWalletSelector}
                        show={showWalletSelector}
                        wallets={authUser.wallets}
                    />
                }
                {
                    selectedWallet &&
                    <div className="btn-group btn-group-pay">
                        {
                            this.state.isSufficient &&
                            !isZero &&
                            <button
                                className="btn btn-pay btn-primary"
                                onClick={pay}
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
                            className={`btn btn-icon btn-primary-outline btn-wallet-selector${showWalletSelector ? ' inverse' : ''}`}
                            onClick={() => setShowWalletSelector(!showWalletSelector)}
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
                            className={`btn btn-icon btn-primary-outline btn-wallet-selector${showWalletSelector ? ' inverse' : ''}`}
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
                            onClick={() => {}}
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
    authUser: state.sessionState.authUser
});

export default connect(mapStateToProps)(CheckoutBody);
