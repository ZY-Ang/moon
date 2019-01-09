/*
 * Copyright (c) 2018 moon
 */

import React, {Component} from 'react';
import './AuthFlow.css';
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {connect} from "react-redux";
import {
    REQUEST_LAUNCH_WEB_AUTH_FLOW,
    TYPE_FACEBOOK,
    TYPE_GOOGLE,
    TYPE_STANDARD_SIGN_IN,
    TYPE_STANDARD_SIGN_UP
} from "../../../constants/events/appEvents";
import AppRuntime from "../../browser/AppRuntime";
import moonLogo from "../../../../../assets/icons/logo_32_text_thick_infinity.png";
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
            logger.error(err);
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

    render() {
        return (
            <div className="moon-tab moon-authflow-tab py-5">
                <div style={{width: '100%'}}>
                    <button className="btn-auth" onClick={this.signIn}>
                        <div className="btn-auth-icon">
                            <img src={AppRuntime.getURL(moonLogo)} alt="Sign In With Moon"/>
                        </div>
                        <div className="btn-auth-text">Sign In With Moon</div>
                    </button>
                </div>
                <div
                    className="text-center pt-2 font-weight-bold"
                    style={{fontSize: 'smaller'}}
                >
                    Don't have an account? <a
                    style={{fontStyle: 'none', textDecoration: 'none'}}
                    onClick={this.signUp}
                    >
                        Sign Up!
                    </a>
                </div>
                <hr
                    className="sign-in-divider py-2"
                    data-content="or log in with"
                    style={{width: '100%'}}
                />
                <div className="text-center">
                    <button
                        className="btn-auth-social btn-login-facebook my-2"
                        onClick={this.signInWithFacebook}
                    >
                        <div className="btn-auth-social-icon btn-auth-social-text btn-auth-social-icon-facebook">
                            {/*<FaIcon icon={['fab', 'facebook']}/>*/}
                        </div>
                        <div className=" btn-auth-text btn-auth-social-text">Sign in With Facebook</div>
                    </button>
                    <button
                        className="btn-auth-social btn-login-google"

                        onClick={this.signInWithGoogle}
                    >
                        <div className="btn-auth-social-icon">
                            <FaIcon icon={['fab', 'google']}/>
                        </div>
                        <div className="btn-auth-text btn-auth-social-text">Sign in With Google</div>
                    </button>
                </div>

                {!!this.state.error && <p className="text-center text-error">{this.state.error}</p>}
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(null, mapDispatchToProps)(AuthFlow);
