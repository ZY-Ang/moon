/*
 * Copyright (c) 2018 moon
 */

import React, {Component} from 'react';
import './AuthFlow.css';
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {connect} from "react-redux";
import {
    REQUEST_LAUNCH_WEB_AUTH_FLOW, TYPE_AMAZON,
    TYPE_STANDARD_SIGN_IN,
    TYPE_STANDARD_SIGN_UP,
    TYPE_FACEBOOK, TYPE_GOOGLE
} from "../../../constants/events/appEvents";
import AppRuntime from "../../browser/AppRuntime";
import FaIcon from "../misc/fontawesome/FaIcon";

const MESSAGE_ERROR_SIGN_IN = 'Oh no! We were unable to sign you in. Please wait a few moments and try again';

class AuthFlow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            error: ""
        };
    }

    launchWebAuthFlow = (type) => AppRuntime.sendMessage(REQUEST_LAUNCH_WEB_AUTH_FLOW, {type})
        .catch(err => {
            console.error(err);
            this.props.onSetAuthUser(null);
            this.setState(() => ({error: MESSAGE_ERROR_SIGN_IN}));
        });

    signIn = (event) => {
        this.launchWebAuthFlow(TYPE_STANDARD_SIGN_IN);
        if (event) {
            event.preventDefault();
        }
    };

    signUp = (event) => {
        this.launchWebAuthFlow(TYPE_STANDARD_SIGN_UP);
        if (event) {
            event.preventDefault();
        }
    };

    signInWithFacebook = (event) => {
        this.launchWebAuthFlow(TYPE_FACEBOOK);
        if (event) {
            event.preventDefault();
        }
    };

    signInWithGoogle = (event) => {
        this.launchWebAuthFlow(TYPE_GOOGLE);
        if (event) {
            event.preventDefault();
        }
    };

    signInWithAmazon = (event) => {
        this.launchWebAuthFlow(TYPE_AMAZON);
        if (event) {
            event.preventDefault();
        }
    };

    render() {
        return (
            <div className="moon-tab moon-authflow-tab">
                <div style={{width: '100%'}}>
                    <button className="btn-auth" onClick={this.signIn}>
                        <div className="btn-auth-icon"><FaIcon icon="moon"/></div>
                        <div className="btn-auth-text">Sign In With Moon</div>
                    </button>
                </div>
                <div
                    className="text-center"
                    style={{padding: '10px 0', fontSize: 'smaller'}}
                >
                    Don't have an account? <a
                    style={{fontStyle: 'none', textDecoration: 'none'}}
                    onClick={this.signUp}
                    >
                        Sign Up!
                    </a>
                </div>
                <hr
                    className="sign-in-divider"
                    data-content="or log in with"
                    style={{width: '100%'}}
                />
                <div className="text-center">
                    <button
                        className="btn-auth-social btn-auth-social-facebook"
                        onClick={this.signInWithFacebook}
                    >
                        <FaIcon icon={['fab', 'facebook']}/>
                    </button>
                    <button
                        className="btn-auth-social btn-auth-social-google"
                        onClick={this.signInWithGoogle}
                    >
                        <FaIcon icon={['fab', 'google']}/>
                    </button>
                    <button
                        className="btn-auth-social btn-auth-social-amazon"
                        onClick={this.signInWithAmazon}
                    >
                        <FaIcon icon={['fab', 'amazon']}/>
                    </button>
                </div>
                <p className="text-center text-error">{this.state.error}</p>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(null, mapDispatchToProps)(AuthFlow);
