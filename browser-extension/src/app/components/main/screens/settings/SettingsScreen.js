import React from "react";
import {connect} from "react-redux";
import "./Settings.css";
import AppRuntime from "../../../../browser/AppRuntime";
import {
    REQUEST_GLOBAL_SIGN_OUT,
    REQUEST_RESET_PASSWORD,
    REQUEST_SIGN_OUT
} from "../../../../../constants/events/appEvents";
import FaIcon from "../../../misc/fontawesome/FaIcon";
import {
    ACTION_PUSH_SCREEN,
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE,
    ACTION_SET_AUTH_USER,
    SCREEN_ADD_WALLETS,
    SCREEN_DEVELOPER,
    SCREEN_HELP_TAWK
} from "../../../../redux/reducers/constants";
import BackButton from "../../BackButton";

class SettingsScreen extends React.Component {
    changePassword = (event) => {
        this.props.onSetAppModalLoadingState({isActive: true, text: "Chotto matte..."});
        AppRuntime.sendMessage(REQUEST_RESET_PASSWORD)
            .then(() => this.props.onSetAppModalSuccessState({isActive: true, text: "A password reset link has been sent to your email!"}))
            .catch(err => {
                moonLogger.error("SettingsScreen.changePassword REQUEST_RESET_PASSWORD exception: ", err);
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
            <div className="moon-mainflow-screen overflow-hidden">
                <BackButton/>
                {
                    !!this.props.authUser &&
                    <div className="moon-settings-menu-header">
                        <h1 className="pr-2 ml-auto my-0">Settings</h1>
                        {
                            !!this.props.authUser.name &&
                            <p className="pr-2 ml-auto my-0">Hi, {this.props.authUser.name}</p>
                        }
                        {
                            // !!this.props.authUser.picture &&
                            // <img src={this.props.authUser.picture} className="avatar"/>
                        }
                    </div>
                }
                <div className="moon-settings-menu overflow-y-auto">
                    {
                        process.env.NODE_ENV !== 'production' &&
                        <div className="mb-2">
                            <button className="btn w-100" onClick={() => this.props.onPushScreen(SCREEN_DEVELOPER)}><FaIcon icon="wrench"/> Developers</button>
                        </div>
                    }
                    <div className="mb-2">
                        <button className="btn w-100" onClick={() => window.open("https://paywithmoon.com/#howitworks", "_blank")}><FaIcon icon="question"/> How Moon works</button>
                    </div>
                    <div className="mb-2">
                        <button className="btn w-100" onClick={() => this.props.onPushScreen(SCREEN_ADD_WALLETS)}><FaIcon icon="wallet"/> Connect Wallets</button>
                    </div>
                    <div className="mb-2">
                        <button className="btn w-100" onClick={this.changePassword}><FaIcon icon="user"/> Change Password</button>
                    </div>
                    <div className="mb-2">
                        <button className="btn w-100" onClick={() => this.props.onPushScreen(SCREEN_HELP_TAWK)}><FaIcon icon="hands-helping"/> Support</button>
                    </div>
                    {/*<div className="mb-2"><button className="btn w-100" onClick={this.onSignOutClick}><FaIcon icon="sign-out-alt"/> Sign Out</button></div>*/}
                    <div className="mb-2">
                        <button className="btn w-100" onClick={this.onGlobalSignOutClick}><FaIcon icon="sign-out-alt"/> Sign Out</button>
                    </div>
                    <p className="my-0 text-center">Moon v{AppRuntime.getManifest().version}</p>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser
});

const mapDispatchToProps = (dispatch) => ({
    onPushScreen: (screen) => dispatch({screen, type: ACTION_PUSH_SCREEN}),
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
    onSetAppModalLoadingState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_LOADING_STATE}),
    onSetAppModalSuccessState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_SUCCESS_STATE}),
    onSetAppModalErrorState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_ERROR_STATE})
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
