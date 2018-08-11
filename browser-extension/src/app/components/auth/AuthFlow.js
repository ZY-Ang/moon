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
} from "../../../constants/events/app";
import AppRuntime from "../../browser/AppRuntime";
import Icon from "../misc/fontawesome/Icon";

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
            <div className="moon-tab" style={{paddingTop: '35%'}}>
                <div>
                    <button className="btn-auth" onClick={this.signIn}>Authenticate With Moon</button>
                </div>
                <hr className="sign-in-divider" data-content="or use a social provider"/>
                {/*<button onClick={this.signUp}>Sign Up</button>*/}
                <div className="text-center">
                    <button className="btn-auth-social btn-auth-social-facebook" onClick={this.signInWithFacebook}><Icon icon={['fab', 'facebook']}/></button>
                    <button className="btn-auth-social btn-auth-social-google" onClick={this.signInWithGoogle}><Icon icon={['fab', 'google']}/></button>
                    <button className="btn-auth-social btn-auth-social-amazon" onClick={this.signInWithAmazon}><Icon icon={['fab', 'amazon']}/></button>
                </div>
                <p className="text-center text-danger">{this.state.error}</p>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(null, mapDispatchToProps)(AuthFlow);
