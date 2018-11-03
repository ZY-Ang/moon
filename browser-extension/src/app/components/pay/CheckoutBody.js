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
                            Insufficient funds! You  need <b>{selectedWallet.currency}{topUpAmountInQuote}</b> more to complete this purchase!
                        </div>
                    </div>
                }
            </div>
        ) : null;
    }
}

class CheckoutBody extends Component {
    constructor() {
        super();
        this.state = {
            exchangeRate: "0",
            walletBalanceInBase: "0",
            requiredAmountInQuote: "0",
            isZero: false,
            isSufficient: true,
            topUpAmountInQuote: "0"
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
                    const requiredAmountInQuote = getRequiredAmountInQuote(cartAmount, exchangeRate.bid);
                    this.setState(() => ({
                        exchangeRate: exchangeRate.bid,
                        walletBalanceInBase: getWalletAmountInBase(selectedWallet.balance, exchangeRate.bid),
                        requiredAmountInQuote,
                        isZero: (Decimal(requiredAmountInQuote).eq("0")),
                        isSufficient: (Decimal(selectedWallet.balance).gt(requiredAmountInQuote)),
                        topUpAmountInQuote: Decimal(requiredAmountInQuote).sub(selectedWallet.balance).toString()
                    }));
                })
                .catch(err => console.error("Failed to get exchange rate", err));
        }
    }

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
                        selectedWallet &&
                        <CheckoutCalculator
                            cartAmount={cartAmount}
                            cartCurrency={cartCurrency}
                            selectedWallet={selectedWallet}
                            exchangeRate={this.state.exchangeRate}
                            walletBalanceInBase={this.state.walletBalanceInBase}
                            requiredAmountInQuote={this.state.requiredAmountInQuote}
                            isZero={this.state.isZero}
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
                            !this.state.isZero &&
                            <button
                                className="btn btn-pay btn-primary"
                                onClick={pay}
                            >
                                Pay with <b>{selectedWallet.name}</b>
                            </button>
                        }
                        {
                            !this.state.isSufficient &&
                            !this.state.isZero &&
                            <button
                                className="btn btn-pay btn-primary"
                                disabled
                            >
                                Insufficient Funds
                            </button>
                        }
                        {
                            this.state.isZero &&
                            <button
                                className="btn btn-pay btn-primary"
                                disabled
                            >
                                Such free stuff, wow
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
