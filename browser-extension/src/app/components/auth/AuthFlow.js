/*
 * Copyright (c) 2018 moon
 */

import React, {Component} from 'react';
import './AuthFlow.css';
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {connect} from "react-redux";
import {
    REQUEST_LAUNCH_SIGN_IN_FLOW, TYPE_AMAZON,
    TYPE_COGNITO_SIGN_IN,
    TYPE_COGNITO_SIGN_UP,
    TYPE_FACEBOOK, TYPE_GOOGLE
} from "../../../constants/events/app.js";

class AuthFlow extends Component {
    signIn = (event) => {
        chrome.runtime.sendMessage(null, {
            message: REQUEST_LAUNCH_SIGN_IN_FLOW,
            type: TYPE_COGNITO_SIGN_IN
        });
        if (event) {
            event.preventDefault();
        }
    };

    signUp = (event) => {
        chrome.runtime.sendMessage({
            message: REQUEST_LAUNCH_SIGN_IN_FLOW,
            type: TYPE_COGNITO_SIGN_UP
        });
        if (event) {
            event.preventDefault();
        }
    };

    signInWithFacebook = (event) => {
        chrome.runtime.sendMessage({
            message: REQUEST_LAUNCH_SIGN_IN_FLOW,
            type: TYPE_FACEBOOK
        });
        if (event) {
            event.preventDefault();
        }
    };

    signInWithGoogle = (event) => {
        chrome.runtime.sendMessage({
            message: REQUEST_LAUNCH_SIGN_IN_FLOW,
            type: TYPE_GOOGLE
        });
        if (event) {
            event.preventDefault();
        }
    };

    signInWithAmazon = (event) => {
        chrome.runtime.sendMessage({
            message: REQUEST_LAUNCH_SIGN_IN_FLOW,
            type: TYPE_AMAZON
        });
        if (event) {
            event.preventDefault();
        }
    };

    render() {
        return (
            <div className="moon-tab" style={{paddingTop: '35%'}}>
                <button onClick={this.signIn}>Sign In</button>
                <button onClick={this.signUp}>Sign Up</button>
                <button onClick={this.signInWithFacebook}>Facebook</button>
                <button onClick={this.signInWithGoogle}>Google</button>
                <button onClick={this.signInWithAmazon}>Amazon</button>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(null, mapDispatchToProps)(AuthFlow);
