/*
 * Copyright (c) 2018 moon
 */

import React, {Component} from 'react';
import './AuthFlow.css';
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {connect} from "react-redux";
import {
    REQUEST_LAUNCH_WEB_AUTH_FLOW, TYPE_AMAZON,
    TYPE_COGNITO_SIGN_IN,
    TYPE_COGNITO_SIGN_UP,
    TYPE_FACEBOOK, TYPE_GOOGLE
} from "../../../constants/events/app";
import Runtime from "../../browser/Runtime";

const doLaunchWebAuthFlow = (type) => Runtime.sendMessage({
        message: REQUEST_LAUNCH_WEB_AUTH_FLOW,
        type
    });

const MESSAGE_ERROR_SIGN_IN = 'Oh no! We were unable to sign you in. Please wait a few moments and try again';

class AuthFlow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            error: ""
        };
    }

    signIn = (event) => {
        doLaunchWebAuthFlow(TYPE_COGNITO_SIGN_IN)
            .catch(() => this.setState(() => ({error: MESSAGE_ERROR_SIGN_IN})));
        if (event) {
            event.preventDefault();
        }
    };

    signUp = (event) => {
        doLaunchWebAuthFlow(TYPE_COGNITO_SIGN_UP)
            .catch(() => this.setState(() => ({error: MESSAGE_ERROR_SIGN_IN})));
        if (event) {
            event.preventDefault();
        }
    };

    signInWithFacebook = (event) => {
        doLaunchWebAuthFlow(TYPE_FACEBOOK)
            .catch(() => this.setState(() => ({error: MESSAGE_ERROR_SIGN_IN})));
        if (event) {
            event.preventDefault();
        }
    };

    signInWithGoogle = (event) => {
        doLaunchWebAuthFlow(TYPE_GOOGLE)
            .catch(() => this.setState(() => ({error: MESSAGE_ERROR_SIGN_IN})));
        if (event) {
            event.preventDefault();
        }
    };

    signInWithAmazon = (event) => {
        doLaunchWebAuthFlow(TYPE_AMAZON)
            .catch(() => this.setState(() => ({error: MESSAGE_ERROR_SIGN_IN})));
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
                <p className="text-center text-danger">{this.state.error}</p>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(null, mapDispatchToProps)(AuthFlow);
