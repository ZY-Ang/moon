/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import {connect} from "react-redux";
import axios from "axios";
import "./PayTab.css";
import FaIcon from "../misc/fontawesome/FaIcon";
import {TAB_SETTINGS, TAB_GROUP_AUTH} from "../nav/constants";
import AppRuntime from "../../browser/AppRuntime";
import {
    REQUEST_GET_PAYMENT_PAYLOAD,
    REQUEST_GET_SITE_INFORMATION,
    REQUEST_MOON_SITE_SUPPORT
} from "../../../constants/events/appEvents";
import {handleErrors} from "../../../utils/errors";

const SettingsIcon = ({changeTab}) => (
    <div
        className="settings-icon btn-nav"
        onClick={() => changeTab(TAB_GROUP_AUTH[TAB_SETTINGS].index)}
    >
        <FaIcon icon="cog"/>
    </div>
);

const PayBanner = ({site, changeTab}) => (site && site.isSupported)
    ? (
        <div>
            <div>
                <img className="site-logo" src={site.logoURL} alt={site.title}/>
                <SettingsIcon changeTab={changeTab}/>
            </div>
            <h2>{site.name}</h2>
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

const PayBody = ({changeWallet, pay, selectedWallet}) => (
    <div>
        <div>
            <p>TODO: Cart icon or product icon</p>
            <p>TODO: Total value</p>
            <p>TODO: Wallet selection Dropdown menu (Use chrome.storage.local for readonly store of user data to bypass need for Redux)</p>
        </div>
        {
            selectedWallet
                ? (
                    <div className="btn-group btn-group-pay">
                        <button className="btn btn-pay btn-primary" onClick={pay}>Pay with <b>{selectedWallet.name}</b></button>
                        <button className="btn btn-icon btn-primary-outline" onClick={changeWallet}><FaIcon icon="caret-down"/></button>
                    </div>
                ) : (
                    <div className="btn-group btn-group-pay">
                        <button className="btn btn-pay btn-primary" onClick={pay}>Pay with <b>Coinbase (BTC)</b></button>
                        <button className="btn btn-icon btn-primary-outline" onClick={changeWallet}><FaIcon icon="caret-down"/></button>
                    </div>
                )
        }
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
            site: null,
            isRequested: false,
            selectedWallet: props.authUser ? props.authUser.wallets[0] : null
        };
    }

    componentWillMount() {
        AppRuntime.sendMessage(REQUEST_GET_SITE_INFORMATION, {host: window.location.host})
            .then(({siteInformation}) => {
                this.setState(() => ({site: siteInformation}))
            })
            .catch(handleErrors);
    }

    pay = () => {
        this.getPaymentPayload()
            .then(this.inject)
            .catch(handleErrors)
    };

    getPaymentPayload = async () => {
        return await AppRuntime.sendMessage(REQUEST_GET_PAYMENT_PAYLOAD, {
            cartCurrency: "USD", // TODO: Insert currency here. Should be USD
            cartAmount: "0.01", // TODO: Fix this

            walletProvider: this.selectedWallet.provider, // TODO: Insert wallet provider here. Currently, only 'COINBASE' should work
            walletID: this.selectedWallet.id,

            pageContent: document.getElementsByTagName("body")[0].innerHTML,
            pageURL: window.location.href,
        });
    };

    inject = (paymentPayload) => {
        // TODO: Incomplete
        axios.post(this.state.site.endpointPaymentPayloadApply, {
            purchaseTotal: 55.82,
            claimcode: "PW4UUGSF",
            disablegc: false,
            returnjson: 1,
            returnFullHTML: 1,
            hasWorkingJavascript: 1,
            fromAnywhere: 0,
            cachebuster: 1538592601427
        })
            .then(response => {
                console.log("inject: ", response);
            })
            .catch(handleErrors);
    };

    requestSite = () =>
        AppRuntime.sendMessage(REQUEST_MOON_SITE_SUPPORT, {host: window.location.host})
            .then(() => this.setState(() => ({isRequested: true})))
            .catch(handleErrors);

    render() {
        return (
            <div className="moon-tab text-center">
                <PayBanner site={this.state.site} changeTab={this.props.changeTab}/>
                {
                    this.state.site && this.state.site.isSupported
                        ? <PayBody pay={this.pay} selectedWallet={this.state.selectedWallet} />
                        : <UnSupportedSiteBody isRequested={this.state.isRequested} requestSite={this.requestSite}/>
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser
});

export default connect(mapStateToProps)(PayTab);
