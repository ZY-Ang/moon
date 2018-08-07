/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './SettingsTab.css';
import {connect} from "react-redux";
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {REQUEST_GLOBAL_SIGN_OUT, REQUEST_SIGN_OUT} from "../../../constants/events/app";
import AppRuntime from "../../browser/AppRuntime";

class SettingsTab extends Component {
    signOut = () => {
        this.props.onSetAuthUser(null);
    };

    onSignOutClick = (event) => {
        AppRuntime.sendMessage(REQUEST_SIGN_OUT);
        this.signOut();
        if (event) {
            event.preventDefault();
        }
    };

    onGlobalSignOutClick = (event) => {
        AppRuntime.sendMessage(REQUEST_GLOBAL_SIGN_OUT);
        this.signOut();
        if (event) {
            event.preventDefault();
        }
    };

    render() {
        return (
            <div className="moon-tab moon-settings-menu">
                <div>
                    <FontAwesomeIcon icon="question"/> How it works
                </div>
                <div>
                    <span><FontAwesomeIcon icon="user"/> User</span>
                    <span>Update Email</span>
                    <span>Change Password</span>
                </div>
                <div>
                    <span><FontAwesomeIcon icon="wallet" /> Wallets</span>
                    <span>Coinbase</span>
                    <span>Kraken</span>
                    <div>
                        <h2>Manual</h2>
                        <span>Bitcoin</span>
                        <span>Ethereum</span>
                        <span>Litecoin</span>
                    </div>
                </div>
                <div>
                    <span><FontAwesomeIcon icon="info" /> Info</span>
                    <span>About</span>
                    <span>Support</span>
                    <span>Terms & Conditions</span>
                    <span>Privacy Policy</span>
                </div>
                <div>
                    <button onClick={this.onSignOutClick}><FontAwesomeIcon icon="sign-out-alt"/> Sign Out</button>
                </div>
                <div>
                    <button onClick={this.onGlobalSignOutClick}><FontAwesomeIcon icon="sign-out-alt"/> Global Sign Out</button>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(null, mapDispatchToProps)(SettingsTab);
