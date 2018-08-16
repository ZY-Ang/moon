/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './SettingsTab.css';
import {connect} from "react-redux";
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {REQUEST_GLOBAL_SIGN_OUT, REQUEST_SIGN_OUT} from "../../../constants/events/app";
import AppRuntime from "../../browser/AppRuntime";
import FaIcon from "../misc/fontawesome/FaIcon";

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
            <div>
                {
                    !!this.props.authUser &&
                    <div className="moon-settings-menu-header text-center">
                        {
                            !!this.props.authUser.picture &&
                            <img src={this.props.authUser.picture} className="avatar"/>
                        }
                        {
                            !!this.props.authUser.name &&
                            <div>
                                <p>Hello {this.props.authUser.name}!</p>
                            </div>
                        }
                    </div>
                }
                <div className="moon-tab moon-settings-menu">
                    <div>
                        <FaIcon icon="question"/> How Moon works
                    </div>
                    <div>
                        <span><FaIcon icon="user"/> User</span>
                        <span>Update Email</span>
                        <span>Change Password</span>
                    </div>
                    <div>
                        <span><FaIcon icon="wallet" /> Wallets</span>
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
                        <span><FaIcon icon="info" /> Info</span>
                        <span>About</span>
                        <span>Support</span>
                        <span>Terms & Conditions</span>
                        <span>Privacy Policy</span>
                    </div>
                    <div>
                        <button onClick={this.onSignOutClick}><FaIcon icon="sign-out-alt"/> Sign Out</button>
                    </div>
                    <div>
                        <button onClick={this.onGlobalSignOutClick}><FaIcon icon="sign-out-alt"/> Global Sign Out</button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser
});

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
