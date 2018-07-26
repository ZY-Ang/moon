/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './SettingsTab.css';
import {connect} from "react-redux";
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

class SettingsTab extends Component {
    onSignOutClick = (event) => {
        const {onSetAuthUser} = this.props;
        onSetAuthUser(null);
        if (event) {
            event.preventDefault();
        }
    };

    render() {
        return (
            <div className="moon-tab">
                <div>
                    <FontAwesomeIcon icon="question"/> How it works
                </div>
                <div>
                    <h1><FontAwesomeIcon icon="user"/> User</h1>
                    <span>Update Email</span>
                    <span>Change Password</span>
                </div>
                <div>
                    <h1><FontAwesomeIcon icon="wallet" /> Wallets</h1>
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
                    <h1><FontAwesomeIcon icon="info" /> Info</h1>
                    <span>About</span>
                    <span>Support</span>
                    <span>Terms & Conditions</span>
                    <span>Privacy Policy</span>
                </div>
                <div onClick={this.onSignOutClick}>
                    <h1><FontAwesomeIcon icon="sign-out-alt"/> Sign Out</h1>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(null, mapDispatchToProps)(SettingsTab);
