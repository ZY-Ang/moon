/*
 * Copyright (c) 2018 moon
 */

import React, {Component} from "react";
import Decimal from "decimal.js";
import {connect} from "react-redux";
import FaIcon from "../misc/fontawesome/FaIcon";
import AppRuntime from "../../browser/AppRuntime";
import {REQUEST_GET_EXCHANGE_RATE} from "../../../constants/events/appEvents";

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

const getRequiredAmountInQuote = (baseAmount, exchangeRate) => {
    baseAmount = new Decimal(baseAmount);
    exchangeRate = new Decimal(exchangeRate);
    const riskFactor = (baseAmount.lt(10) || baseAmount.gt(2000)) ? new Decimal(1.01) : new Decimal(1.0);
    return baseAmount.dividedBy(exchangeRate).times(riskFactor).toFixed(8, Decimal.ROUND_UP);
};
const getWalletAmountInBase = (quoteAmount, exchangeRate) => {
    quoteAmount = new Decimal(quoteAmount);
    exchangeRate = new Decimal(exchangeRate);
    return quoteAmount.times(exchangeRate).toFixed(2, Decimal.ROUND_DOWN);
};

class CheckoutCalculator extends Component {
    constructor() {
        super();
        this.state = {
            exchangeRate: "0",
            walletBalanceInBase: "0",
            requiredAmountInQuote: "0"
        };
    }

    componentWillReceiveProps(nextProps) {
        const {cartAmount, cartCurrency, selectedWallet} = nextProps;
        if (cartCurrency && selectedWallet) {
            AppRuntime.sendMessage(REQUEST_GET_EXCHANGE_RATE, {
                quote: selectedWallet.currency,
                base: cartCurrency
            })
                .then(exchangeRate => {
                    this.setState(() => ({
                        exchangeRate: exchangeRate.bid,
                        walletBalanceInBase: getWalletAmountInBase(selectedWallet.balance, exchangeRate.bid).toString(),
                        requiredAmountInQuote: getRequiredAmountInQuote(cartAmount, exchangeRate.bid).toString()
                    }));
                })
                .catch(err => console.error("Failed to get exchange rate", err));
        }
    }

    render() {
        const {cartAmount, cartCurrency, selectedWallet} = this.props;
        return selectedWallet ? (
            <div className="checkout-calculator">
                <div className="checkout-calculator-section border-bottom">
                    <div className="text-left float-left">{selectedWallet.currency}/{cartCurrency}</div>
                    <div className="text-right"><b>{this.state.exchangeRate}</b></div>
                </div>
                <div className="checkout-calculator-section border-bottom">
                    <div className="text-left float-left">{selectedWallet.name} Balance</div>
                    <div className="text-right"><b>{selectedWallet.currency} {selectedWallet.balance}</b></div>
                    <div className="text-right"><b>{cartCurrency} {this.state.walletBalanceInBase}</b></div>
                </div>
                <div className="checkout-calculator-section">
                    <div className="text-left float-left">Purchase Amount</div>
                    <div className="text-right"><b>{selectedWallet.currency} {this.state.requiredAmountInQuote}</b></div>
                    <div className="text-right"><b>{cartCurrency} {cartAmount}</b></div>
                </div>
            </div>
        ) : null;
    }
}

class CheckoutBody extends Component {
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
        return (
            <div>
                <div>
                    <span
                        id="checkout-cart-icon"
                        role="img"
                        aria-label="Checkout"
                        style={{fontSize: 100}}
                    >
                        🛒
                    </span>
                    {
                        selectedWallet &&
                        <CheckoutCalculator cartAmount={cartAmount} cartCurrency={cartCurrency} selectedWallet={selectedWallet}/>
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
                    selectedWallet
                        ? (
                            <div className="btn-group btn-group-pay">
                                <button
                                    className="btn btn-pay btn-primary"
                                    onClick={pay}
                                >
                                    Pay with <b>{selectedWallet.name}</b>
                                </button>
                                <button
                                    className={`btn btn-icon btn-primary-outline btn-wallet-selector${showWalletSelector ? ' inverse' : ''}`}
                                    onClick={() => setShowWalletSelector(!showWalletSelector)}
                                >
                                    <FaIcon icon="caret-up"/>
                                </button>
                            </div>
                        ) : (
                            <div className="btn-group btn-group-pay">
                                <button
                                    className="btn btn-pay btn-primary"
                                    onClick={() => setShowWalletSelector(!showWalletSelector)}
                                >
                                    Select a wallet
                                </button>
                            </div>
                        )
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser
});

export default connect(mapStateToProps)(CheckoutBody);
