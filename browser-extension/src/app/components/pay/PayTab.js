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
    REQUEST_MOON_SITE_SUPPORT
} from "../../../constants/events/appEvents";
import {handleErrors} from "../../../utils/errors";
import {
    ACTION_SET_UI_BLOCKER_STATE
} from "../../redux/reducers/constants";
import ProductBody from "./ProductBody";

const SettingsIcon = ({changeTab}) => (
    <div
        className="settings-icon btn-nav"
        onClick={() => changeTab(TAB_GROUP_AUTH[TAB_SETTINGS].index)}
    >
        <FaIcon icon="cog"/>
    </div>
);

const PayBanner = ({pageInformation, changeTab}) => (pageInformation && pageInformation.isSupported)
    ? (
        <div>
            <img className="site-logo" src={pageInformation.logoURL} alt={pageInformation.name}/>
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
            selectedWallet: props.authUser ? props.authUser.wallets[0] : null
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(() => ({selectedWallet: nextProps.authUser ? nextProps.authUser.wallets[0] : null}));
    }

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
        const {pageInformation} = this.props;
        if (!!pageInformation) {
            return AppRuntime.sendMessage(REQUEST_GET_PAYMENT_PAYLOAD, {
                cartCurrency: this.props.pageInformation.cartCurrency,
                cartAmount: this.props.pageInformation.cartAmount,

                walletProvider: this.state.selectedWallet.provider,
                walletID: this.state.selectedWallet.id,

                pageContent: document.documentElement.innerHTML,
                pageURL: window.location.href,
            });
        } else {
            this.setState(() => ({error: "Page not loaded yet!"}));
        }
    };

    requestSite = () =>
        AppRuntime.sendMessage(REQUEST_MOON_SITE_SUPPORT, {host: window.location.host})
            .then(() => this.setState(() => ({isRequested: true})))
            .catch(handleErrors);

    changeWallet = (selectedWallet) => this.setState(() => ({selectedWallet}));

    setShowWalletSelector = (showWalletSelector) => this.setState(() => ({showWalletSelector}));

    render() {
        const {pageInformation} = this.props;
        return (
            <div className="moon-tab text-center">
                <PayBanner
                    pageInformation={pageInformation}
                    changeTab={this.props.changeTab}
                />
                {
                    pageInformation &&
                    pageInformation.isSupported &&
                    pageInformation.isCheckoutPage &&
                    <CheckoutBody
                        cartCurrency={pageInformation.cartCurrency}
                        cartAmount={pageInformation.cartAmount}
                        changeWallet={this.changeWallet}
                        pay={this.pay}
                        selectedWallet={this.state.selectedWallet}
                        setShowWalletSelector={this.setShowWalletSelector}
                        showWalletSelector={this.state.showWalletSelector}
                    />
                }
                {
                    pageInformation &&
                    pageInformation.isSupported &&
                    !pageInformation.isCheckoutPage &&
                    <ProductBody
                        pageInformation={pageInformation}
                    />
                }
                {
                    (!pageInformation || !pageInformation.isSupported) &&
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
    pageInformation: state.sessionState.pageInformation
});

const mapDispatchToProps = (dispatch) => ({
    onSetUIBlockerState: (state) => dispatch({...state, type: ACTION_SET_UI_BLOCKER_STATE})
});

export default connect(mapStateToProps, mapDispatchToProps)(PayTab);
