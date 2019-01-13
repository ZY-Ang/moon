import React from "react";
import "./AmazonProductScreen.css";
import {connect} from "react-redux";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import {
    QUERY_SELECTOR_PRODUCT_IMAGE,
    QUERY_SELECTOR_PRODUCT_OBSERVER,
    QUERY_SELECTOR_PRODUCT_PRICE,
    QUERY_SELECTOR_PRODUCT_TITLE
} from "./constants/querySelectors";
import CurrencyIcon from "../../../misc/currencyicon/CurrencyIcon";
import {getRequiredAmountInQuote, getWalletBalanceInBase} from "../../../../utils/exchangerates";
import {QUICKVIEW_CURRENCIES} from "./AmazonCheckoutScreen";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_GET_EXCHANGE_RATES} from "../../../../../constants/events/appEvents";
import moment from "moment";
import {ACTION_PUSH_SCREEN, SCREEN_ADD_WALLETS} from "../../../../redux/reducers/constants";
import {observeDOM} from "../../../../utils/dom";
import AppMixpanel from "../../../../services/AppMixpanel";

export const AMAZON_DEFAULT_CURRENCY = "USD";

/**
 * Note: Amazon has no obvious product page schema so this should be a catchall page, which will in turn, render AmazonNotAtCheckoutPage.
 */
class AmazonProductScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initialized: false,
            title: null,
            imageURL: null,
            imageAlt: null,
            price: null,
            exchangeRates: {},
            isExchangeRatesSelectorOpen: false,
            selectedExchangeRate: null
        };
        this.observers = [];
    }

    componentDidMount() {
        this.parseAndUpdate()
            .then(() => this.setState(state => ({selectedExchangeRate: state.exchangeRates[`${QUICKVIEW_CURRENCIES[0]}_${AMAZON_DEFAULT_CURRENCY}`]})));
        const elementTreesToObserve = document.querySelectorAll(QUERY_SELECTOR_PRODUCT_OBSERVER);
        for (let i = 0; i < elementTreesToObserve.length ; i++) {
            const element = elementTreesToObserve[i];
            this.observers[i] = observeDOM(element, this.parseAndUpdate);
        }
    }

    componentWillUnmount() {
        this.observers.forEach(obs => obs.disconnect());
    }

    parseAndUpdate = () => {
        return this.parse()
            .then(this.updateExchangeRates);
    };

    authUserHasWallets = () => !!this.props.authUser && !!this.props.authUser.wallets && !!this.props.authUser.wallets.length;

    updateExchangeRates = () => {
        const pairs = QUICKVIEW_CURRENCIES.map(quote => ({quote, base: AMAZON_DEFAULT_CURRENCY}));
        return AppRuntime.sendMessage(REQUEST_GET_EXCHANGE_RATES, {pairs})
            .then(exchangeRates => this.setState(() => ({exchangeRates})));
    };

    parse = () => new Promise(resolve => {
        const productTitleElements = document.querySelectorAll(QUERY_SELECTOR_PRODUCT_TITLE);
        const productImageElements = document.querySelectorAll(QUERY_SELECTOR_PRODUCT_IMAGE);
        const productPriceElements = document.querySelectorAll(QUERY_SELECTOR_PRODUCT_PRICE);
        this.setState(() => ({
            title: productTitleElements && productTitleElements[0] && productTitleElements[0].innerText,
            imageURL: productImageElements && productImageElements[0] && productImageElements[0].src,
            imageAlt: productImageElements && productImageElements[0] && productImageElements[0].alt,
            price: productPriceElements && productPriceElements[0] &&
                Number(productPriceElements[0].innerText.replace(/[^0-9.-]+/g, ""))
        }), resolve);
        AppMixpanel.track('view_screen_amazon_product', {
            'product': this.state.title,
            'price': this.state.price
        });
    });

    getFontSize = (str) => {
        if (!str || str.length <= 10) {
            return 24;
        } else {
            // Formula created using excel manually. LOL.
            return Math.floor(227.71 * Math.pow(str.length, -0.951));
        }
    };

    onCurrencyClick = () => {
        this.setState(state => ({isExchangeRatesSelectorOpen: !state.isExchangeRatesSelectorOpen}));
    };

    render() {
        const {
            title,
            imageURL,
            imageAlt,
            price,
            exchangeRates,
            isExchangeRatesSelectorOpen,
            selectedExchangeRate
        } = this.state;
        const requiredAmountInQuote = (!!price && !!selectedExchangeRate) ? getRequiredAmountInQuote(price, selectedExchangeRate.bid) : "0";
        const {authUser} = this.props;
        const authUserHasWallets = this.authUserHasWallets();
        const selectedExchangeRateWallets = (authUserHasWallets && selectedExchangeRate && authUser.wallets.filter(({currency}) => (currency === selectedExchangeRate.quote))) || [];
        return (
            <div className="moon-mainflow-screen text-center">
                <div className="settings-icon-parent mb-2">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                {
                    (!!title || !!imageURL || !!imageAlt || !!price) &&
                    <div className="product-section production-section-product-header">
                        {(!!title || !!imageAlt) && <h4 className="product-title font-weight-bold pb-2">{title || imageAlt}</h4>}
                        {
                            !!price &&
                            <div className="product-price pl-2 mr-auto">
                                <h1 className="font-weight-bold my-0">{price.toLocaleString("en-us", {style: "currency", currency: AMAZON_DEFAULT_CURRENCY})}</h1>
                                <div className="product-price-currency-flag ml-auto">
                                    <i>{AMAZON_DEFAULT_CURRENCY}</i> <CurrencyIcon className="pl-2" style={{height: 18}} currency={AMAZON_DEFAULT_CURRENCY}/>
                                </div>
                            </div>
                        }
                        {!!imageURL && <img className="product-image ml-auto" src={imageURL} alt={imageURL || imageAlt}/>}
                    </div>
                }
                {!price && <ul className="sequence"/>}
                {
                    !price &&
                    <div className="product-section">
                        <p>For items with many sizes and/or colors, you'll need to first choose a specific version
                            of this item so we can show you the right price info.</p>
                    </div>
                }
                {
                    selectedExchangeRate &&
                    <ul className="sequence">
                        <li className="text-right">
                            <p className="my-0">
                                Conversion
                                Rate: <b><i>1 {selectedExchangeRate.quote} = {selectedExchangeRate.base} {selectedExchangeRate.bid}</i></b>
                            </p>
                            <p className="my-0 font-size-80">
                                <i>Last updated {moment(selectedExchangeRate.lastUpdated).fromNow()}</i>
                            </p>
                        </li>
                    </ul>
                }
                {
                    exchangeRates &&
                    selectedExchangeRate &&
                    <div className="product-section">
                        <div className="product-section-label">
                            You Pay
                        </div>
                        <div className="product-section-currency-value">
                            <input
                                type="text"
                                value={requiredAmountInQuote}
                                disabled
                                style={{fontSize: this.getFontSize(requiredAmountInQuote)}}
                            />
                        </div>
                        <div
                            className="product-section-currency-flag"
                            onClick={() => {
                                AppMixpanel.track('button_click_amazon_product_toggle_change_currency');
                                this.onCurrencyClick();
                            }}
                        >
                            <div>
                                {selectedExchangeRate.quote}
                                <CurrencyIcon currency={selectedExchangeRate.quote}/>
                            </div>
                        </div>
                        <div className={`product-section-currency-selector${isExchangeRatesSelectorOpen ? "" : " collapsed"}`}>
                            {
                                Object.values(exchangeRates)
                                    .filter(({quote, base}) => !selectedExchangeRate || selectedExchangeRate.quote !== quote || selectedExchangeRate.base !== base)
                                    .map(({quote, base}) =>
                                        <div
                                            key={`${quote}${base}`}
                                            className="product-section-currency-selector-currency"
                                            onClick={() => {
                                                AppMixpanel.track('button_click_amazon_product_change_currency',
                                                    {'change_to_currency': quote});
                                                this.setState(() => ({
                                                    selectedExchangeRate: exchangeRates[`${quote}_${base}`],
                                                    isExchangeRatesSelectorOpen: false
                                                }))
                                            }}
                                        >
                                            <CurrencyIcon className="mx-auto mb-1" currency={quote}/>
                                            <b className="text-white font-weight-bold">{quote}</b>
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                }
                {
                    selectedExchangeRate &&
                    !!selectedExchangeRateWallets.length &&
                    <ul className="sequence"/>
                }
                {
                    selectedExchangeRate &&
                    !!selectedExchangeRateWallets.length &&
                    <div className="product-section product-section-user-wallet">
                        <div className="product-section-label">
                            Your {selectedExchangeRate.quote} <CurrencyIcon style={{height: 16}} currency={selectedExchangeRate.quote}/> Wallets
                        </div>
                        <div className="product-section-user-wallets">
                            {
                                selectedExchangeRateWallets.map(({name, balance}) => {
                                    const walletBalanceInBase = getWalletBalanceInBase(balance, selectedExchangeRate.bid);
                                    return (
                                        <div key={name} className="product-section-user-wallets-wallet mx-auto pb-1">
                                            <div className="product-section-user-wallets-wallet-name pr-2">{name}</div>
                                            <div className={`product-section-user-wallets-wallet-balance pr-2${Number(balance) < Number(price) ? " text-error" : ""}`}>{balance}</div>
                                            <div className="product-section-user-wallets-wallet-balance-base">({selectedExchangeRate.base} {walletBalanceInBase})</div>
                                        </div>
                                    );
                                })
                            }
                        </div>
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
                    <div>
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => {
                                AppMixpanel.track('button_click_amazon_product_connect_wallets');
                                this.props.onPushScreen(SCREEN_ADD_WALLETS);
                            }}
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
    mainFlowIndex: state.appState.mainFlowIndex
});

const mapDispatchToProps = (dispatch) => ({
    onPushScreen: (screen) => dispatch({screen, type: ACTION_PUSH_SCREEN})
});

export default connect(mapStateToProps, mapDispatchToProps)(AmazonProductScreen);
