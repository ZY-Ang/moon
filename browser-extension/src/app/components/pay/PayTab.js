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
import {ACTION_SET_SITE_INFORMATION} from "../../redux/reducers/constants";

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

const ProductBody = ({pathnameCheckout}) => (
    <div>
        <div>
            <span
                className="site-logo unsupported"
                role="img"
                aria-label="Checkout"
                style={{fontSize: 100}}
            >
                🛒
            </span>
            <p>TODO: Product icon</p>
            <p>TODO: Value Calculator</p>
        </div>
        <div className="btn-group btn-group-pay">
            <button className="btn btn-pay btn-primary" onClick={() => window.location.replace(pathnameCheckout)}>Checkout</button>
        </div>
    </div>
);

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
            cartAmount: "0",
            cartCurrency: ""
        };
    }

    componentWillMount() {
        AppRuntime.sendMessage(REQUEST_GET_SITE_INFORMATION, {host: window.location.host})
            .then(siteInformation => {
                this.props.onSetSiteInformation(siteInformation);
                this.parsePage();
            })
            .catch(err => {
                console.error("SITE_INFORMATION FAILED: ", err);
                handleErrors(err);
            });
    }

    parsePage = () => {
        const {siteInformation} = this.props;
        if (siteInformation) {
            ({
                "www.amazon.com": (pathname) =>
                    this.setState(() => {
                        const isCheckoutPage = (pathname.startsWith(siteInformation.pathnameCheckout));
                        return isCheckoutPage ? {
                            cartAmount: document.getElementsByName("purchaseTotal")[0].value,
                            cartCurrency: document.getElementsByName("purchaseTotalCurrency")[0].value
                        } : {};
                    })
            })[window.location.host](window.location.pathname);
        }
    };

    pay = () => {
        // TODO: this.onUIBlockingModal()
        this.getPaymentPayload() // TODO: Background script has to execute injection of code. Can't be done here. Best we can do is wait for new content script to send a success message
        // TODO: .then(this.offUIBlockingModal)
            .catch(handleErrors);
    };

    getPaymentPayload = () => {
        return AppRuntime.sendMessage(REQUEST_GET_PAYMENT_PAYLOAD, {
            cartCurrency: this.state.cartCurrency,
            cartAmount: (process.env.NODE_ENV === 'production') ? this.state.cartAmount : "0.01",

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
                    window.location.pathname.startsWith(siteInformation.pathnameProduct) &&
                    <ProductBody
                        pathnameCheckout={siteInformation.pathnameCheckout}
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
    onSetSiteInformation: (siteInformation) => dispatch({type: ACTION_SET_SITE_INFORMATION, siteInformation}),
});

export default connect(mapStateToProps, mapDispatchToProps)(PayTab);
