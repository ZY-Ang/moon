/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import {connect} from "react-redux";
import "./PayTab.css";
import CheckoutBody from "./CheckoutBody";
import FaIcon from "../misc/fontawesome/FaIcon";
import {TAB_GROUP_AUTH, TAB_SETTINGS} from "../nav/constants";
import AppRuntime from "../../browser/AppRuntime";
import {
    REQUEST_GET_PAYMENT_PAYLOAD,
    REQUEST_GET_SITE_INFORMATION,
    REQUEST_MOON_SITE_SUPPORT
} from "../../../constants/events/appEvents";
import {handleErrors} from "../../../utils/errors";
import {
    ACTION_SET_APP_MODAL_STATE,
    ACTION_SET_SITE_INFORMATION, ACTION_SET_UI_BLOCKER_STATE
} from "../../redux/reducers/constants";
import {observeDOM} from "../../utils/dom";
import ProductBody from "./ProductBody";

const SettingsIcon = ({changeTab}) => (
    <div
        className="settings-icon btn-nav"
        onClick={() => changeTab(TAB_GROUP_AUTH[TAB_SETTINGS].index)}
    >
        <FaIcon icon="cog"/>
    </div>
);

const PayBanner = ({siteInformation, changeTab}) => (siteInformation && siteInformation.isSupported)
    ? (
        <div>
            <img className="site-logo" src={siteInformation.logoURL} alt={siteInformation.name}/>
            <SettingsIcon changeTab={changeTab}/>
        </div>
    ) : (
        <div>
            <div>
                <span
                    className="site-logo unsupported"
                    role="img"
                    aria-label="Unsupported Site"
                    style={{fontSize: 100}}
                >
                    🌚
                </span>
                <SettingsIcon changeTab={changeTab}/>
            </div>
            <h2>Unsupported Site</h2>
        </div>
    );

// TODO: (Important) https://www.amazon.com/gp/dmusic/purchase/purchaseReview/ref=dm_ws_ec_pc_fl

const UnSupportedSiteBody = ({isRequested, requestSite}) => (
    <div>
        <p>We are working hard to make Moon available on your favourite shopping sites!</p>
        <p>If you really want us to support this shopping site, click the button below and we'll work as fast as we can!</p>
        {
            isRequested
                ? <button className="btn btn-primary" disabled>We're working on {window.location.host}!</button>
                : <button className="btn btn-primary" onClick={requestSite}>I want to shop here with Moon!</button>
        }
    </div>
);

class PayTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRequested: false,
            showWalletSelector: false,
            selectedWallet: props.authUser ? props.authUser.wallets[0] : null,
            product: {
                title: null,
                imageAlt: null,
                imageURL: null,
                amount: null,
            },
            cartAmount: "0",
            cartCurrency: ""
        };
    }

    componentWillMount() {
        this.props.onSetAppModalState({state: "loading", loadingText: "Loading..."});
        AppRuntime.sendMessage(REQUEST_GET_SITE_INFORMATION, {host: window.location.host})
            .then(siteInformation => {
                this.props.onSetSiteInformation(siteInformation);
                this.parsePage();
            })
            .catch(err => {
                console.error("SITE_INFORMATION FAILED: ", err);
                handleErrors(err);
            })
            .finally(() => this.props.onSetAppModalState({isActive: false}));
    }

    componentWillReceiveProps(nextProps) {
        this.setState(() => ({selectedWallet: nextProps.authUser ? nextProps.authUser.wallets[0] : null}));
    }

    parsePage = () => {
        const parserHostMap = {
            "www.amazon.com": () => {
                const cartAmountElements = document.getElementsByName("purchaseTotal");
                const cartCurrencyElements = document.getElementsByName("purchaseTotalCurrency");
                const productTitleElement = document.getElementById("productTitle");
                const productImage = document.getElementById("landingImage");
                const productPrice = document.getElementById("priceblock_ourprice");
                this.setState(state => ({
                    cartAmount: (
                        process.env.NODE_ENV === 'production' &&
                        cartAmountElements &&
                        cartAmountElements.length
                    )
                        ? cartAmountElements[0].value
                        : "0.01",
                    cartCurrency: cartCurrencyElements && cartCurrencyElements.length && cartCurrencyElements[0].value,
                    product: {
                        ...state.product,
                        title: productTitleElement && productTitleElement.innerText,
                        imageURL: productImage && productImage.src,
                        imageAlt: productImage && productImage.alt
                    }
                }));
                if (productPrice) {
                    const updatePrice = () => this.setState(({product}) => ({
                        product: {
                            ...product,
                            amount: productPrice.innerText &&
                                Number(productPrice.innerText.replace(/[^0-9.-]+/g,""))
                        }
                    }));
                    updatePrice();
                    observeDOM(productPrice, updatePrice);
                }
            }
        };
        if (parserHostMap[window.location.host]) {
            parserHostMap[window.location.host]();
        }
    };

    pay = () => {
        this.props.onSetUIBlockerState({
            isActive: true,
            title: "Loading...",
            subTitle: "Completing your purchase. Please DO NOT close this tab or exit your browser 🙏"
        });
        this.getPaymentPayload() // TODO: Background script has to execute injection of code. Can't be done here. Best we can do is wait for new content script to send a success message
            .catch(handleErrors)
            .finally(() => this.props.onSetUIBlockerState({}));
    };

    getPaymentPayload = () => {
        return AppRuntime.sendMessage(REQUEST_GET_PAYMENT_PAYLOAD, {
            cartCurrency: this.state.cartCurrency,
            cartAmount: this.state.cartAmount,

            walletProvider: this.state.selectedWallet.provider,
            walletID: this.state.selectedWallet.id,

            pageContent: document.documentElement.innerHTML,
            pageURL: window.location.href,
        });
    };

    requestSite = () =>
        AppRuntime.sendMessage(REQUEST_MOON_SITE_SUPPORT, {host: window.location.host})
            .then(() => this.setState(() => ({isRequested: true})))
            .catch(handleErrors);

    changeWallet = (selectedWallet) => this.setState(() => ({selectedWallet}));

    setShowWalletSelector = (showWalletSelector) => this.setState(() => ({showWalletSelector}));

    render() {
        const {siteInformation} = this.props;
        return (
            <div className="moon-tab text-center">
                <PayBanner
                    siteInformation={siteInformation}
                    changeTab={this.props.changeTab}
                />
                {
                    siteInformation &&
                    siteInformation.isSupported &&
                    window.location.pathname.startsWith(siteInformation.pathnameCheckout) &&
                    <CheckoutBody
                        cartCurrency={this.state.cartCurrency}
                        cartAmount={this.state.cartAmount}
                        changeWallet={this.changeWallet}
                        pay={this.pay}
                        selectedWallet={this.state.selectedWallet}
                        setShowWalletSelector={this.setShowWalletSelector}
                        showWalletSelector={this.state.showWalletSelector}
                    />
                }
                {
                    siteInformation &&
                    siteInformation.isSupported &&
                    !window.location.pathname.startsWith(siteInformation.pathnameCheckout) &&
                    <ProductBody
                        pathnameCheckout={siteInformation.pathnameCheckout}
                        product={this.state.product}
                    />
                }
                {
                    (!siteInformation || !siteInformation.isSupported) &&
                    <UnSupportedSiteBody
                        isRequested={this.state.isRequested}
                        requestSite={this.requestSite}
                    />
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
    siteInformation: state.sessionState.siteInformation
});

const mapDispatchToProps = (dispatch) => ({
    onSetAppModalState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_STATE}),
    onSetSiteInformation: (siteInformation) => dispatch({type: ACTION_SET_SITE_INFORMATION, siteInformation}),
    onSetUIBlockerState: (state) => dispatch({...state, type: ACTION_SET_UI_BLOCKER_STATE})
});

export default connect(mapStateToProps, mapDispatchToProps)(PayTab);
