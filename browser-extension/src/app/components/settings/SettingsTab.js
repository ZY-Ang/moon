/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import {connect} from "react-redux";
import {
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE,
    ACTION_SET_AUTH_USER
} from "../../redux/reducers/constants";
import {
    REQUEST_GLOBAL_SIGN_OUT,
    REQUEST_LAUNCH_COINBASE_AUTH_FLOW, REQUEST_LAUNCH_WEB_AUTH_FLOW, REQUEST_RESET_PASSWORD,
    REQUEST_SIGN_OUT
} from "../../../constants/events/appEvents";
import AppRuntime from "../../browser/AppRuntime";
import FaIcon from "../misc/fontawesome/FaIcon";
import {handleErrors} from "../../../utils/errors";
import {TAB_DEVELOPER, TAB_GROUP_AUTH, TAB_PAY} from "../nav/constants";
import CoinbaseIcon from "../misc/coinbase/CoinbaseIcon";

const MESSAGE_ERROR_CHANGE_FAILURE = "We were unable to change your password!";

class SettingsTab extends Component {
    launchCoinbaseAuthFlow = () => {
        AppRuntime.sendMessage(REQUEST_LAUNCH_COINBASE_AUTH_FLOW)
            .then(response => {
                // FIXME: Show user permission warnings and shit
                console.log(response);
            })
            .catch(err => {
                handleErrors(err);
                // FIXME: Show user errors and shit
            });
    };

    launchWebAuthFlow = (type) => AppRuntime.sendMessage(REQUEST_LAUNCH_WEB_AUTH_FLOW, {type})
        .catch(err => {
            console.error(err);
            this.props.onSetAuthUser(null);
            this.setState(() => ({error: MESSAGE_ERROR_CHANGE_FAILURE}));
        });

    changePassword = (event) => {
        this.props.onSetAppModalLoadingState({isActive: true, text: "Chotto matte..."});
        AppRuntime.sendMessage(REQUEST_RESET_PASSWORD)
            .then(() => this.props.onSetAppModalSuccessState({isActive: true, text: "A password reset link has been sent to your email!"}))
            .catch(err => {
                handleErrors(err);
                this.props.onSetAppModalErrorState({isActive: true, text: "Something went wrong! Please try again."});
            })
            .finally(() => this.props.onSetAppModalLoadingState({isActive: false}));
        if (event) {
            event.preventDefault();
        }
    };

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
            <div className="moon-tab overflow-hidden">
                <div
                    className="btn-nav-back btn-nav"
                    onClick={() => this.props.changeTab(TAB_GROUP_AUTH[TAB_PAY].index)}
                >
                    <FaIcon icon="chevron-left"/> Back
                </div>
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
                                <p>Welcome, {this.props.authUser.name}</p>
                            </div>
                        }
                    </div>
                }
                <div className="moon-settings-menu overflow-y-auto">
                    {
                        process.env.NODE_ENV !== 'production' &&
                        <div className="mb-2">
                            <button className="btn w-100" onClick={() => this.props.changeTab(TAB_GROUP_AUTH[TAB_DEVELOPER].index)}>
                                <FaIcon icon="wrench"/> Developers
                            </button>
                        </div>
                    }
                    <div className="mb-2">
                        <button className="btn w-100" onClick={() => window.open("https://paywithmoon.com/#howitworks", "_blank")}><FaIcon icon="question"/> How Moon works</button>
                    </div>
                    <div className="mb-2">
                        <button className="btn w-100" onClick={this.launchCoinbaseAuthFlow}><CoinbaseIcon/> Update your Coinbase account</button>
                    </div>
                    <div className="mb-2">
                        <button className="btn w-100" onClick={this.changePassword}><FaIcon icon="user"/> Change Password</button>
                    </div>
                    {/*<div className="mb-2"><button className="btn w-100" onClick={this.onSignOutClick}><FaIcon icon="sign-out-alt"/> Sign Out</button></div>*/}
                    <div className="mb-2">
                        <button className="btn w-100" onClick={this.onGlobalSignOutClick}><FaIcon icon="sign-out-alt"/> Sign Out</button>
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
    onSetAppModalLoadingState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_LOADING_STATE}),
    onSetAppModalSuccessState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_SUCCESS_STATE}),
    onSetAppModalErrorState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_ERROR_STATE})
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsTab);
