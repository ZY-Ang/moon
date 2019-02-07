/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './App.css';
import logo from '../../../../assets/icons/logo_300_text_dark.png';
import {connect} from "react-redux";
import AuthFlow from "./auth/AuthFlow";
import AppRuntime from "../browser/AppRuntime";
import FaIcon from "./misc/fontawesome/FaIcon";
import {ACTION_SET_IS_APP_ACTIVE} from "../redux/reducers/constants";
import OnBoardingFlow, {isOnBoardingFlowCompleteOrSkipped} from "./onboarding/OnBoardingFlow";
import UIBlocker from "./uiblocker/UIBlocker";
import ErrorBody from "./misc/appmodals/error/ErrorBody";
import SuccessBody from "./misc/appmodals/success/SuccessBody";
import LoadingBody from "./misc/appmodals/loading/LoadingBody";
import MainFlow from "./main/MainFlow";
import {REQUEST_OPEN_POPUP} from "../../constants/events/appEvents";
import {URL_MOON_TAWK_SUPPORT} from "../../../src/constants/url";
import appLogger from "../utils/AppLogger";
import AppMixpanel from "../services/AppMixpanel";
import Notification from "./notifications/Notifications";

const INITIAL_STATE = {
    isMaximized: true,
    isHoverHeaderButtons: false
};

class App extends Component {
    constructor() {
        super();
        this.state = {
            ...INITIAL_STATE
        };
    }

    componentDidMount() {
        appLogger.log("Main App Mounted");
    }

    onToggleMaximize = () => {
        this.setState(() => ({isMaximized: !this.state.isMaximized}));
    };

    onMouseEnterHeaderButtons = () =>
        this.setState(() => ({isHoverHeaderButtons: true}));

    onMouseLeaveHeaderButtons = () =>
        this.setState(() => ({isHoverHeaderButtons: false}));

    onClose = () => {
        this.props.onSetIsAppActive(false);
    };

    componentWillReceiveProps(nextProps) {
        if (!nextProps.authUser) {
            this.setState(() => INITIAL_STATE);
        }
        if (nextProps.isAppActive) {
            this.onMouseLeaveHeaderButtons();
        }
    };

    openChatPopUp = (event) => {
        AppRuntime.sendMessage(REQUEST_OPEN_POPUP, {
            url: URL_MOON_TAWK_SUPPORT,
            height: 600,
            width: 400,
            type: "popup"
        });
        if (event) {
            event.preventDefault();
        }
    };

    render() {
        const CLASS_MOON_BODY = this.state.isMaximized ? "moon-body-maximized" : "moon-body-minimized";
        return (
            <div id="moon-div-shadow">
                {
                    this.props.isAppActive &&
                    <div id="moon-wrapper">
                            <Notification/>
                        <div id="moon-header">
                            <img id="moon-header-img" src={AppRuntime.getURL(logo)} alt="Moon"/>
                            <div
                                id="moon-header-buttons-div"
                                onMouseEnter={this.onMouseEnterHeaderButtons}
                                onMouseLeave={this.onMouseLeaveHeaderButtons}
                            >
                                <div
                                    className="text-center"
                                >
                                    <div
                                        id="moon-header-support-button"
                                        className={`moon-header-button${this.state.isHoverHeaderButtons ? " hover" : ""}`}
                                        onClick={() => {
                                            AppMixpanel.track('button_click_support');
                                            this.openChatPopUp();
                                        }}
                                    >
                                        <FaIcon icon="comments"/>
                                    </div>
                                </div>
                                <div
                                    id="moon-header-toggle-button"
                                    className={`moon-header-button ${(this.state.isMaximized ? "maximized" : "minimized")}`}
                                    onClick={() => {
                                        AppMixpanel.track('button_click_toggle_maximize');
                                        this.onToggleMaximize();
                                    }}
                                >
                                    {
                                        this.state.isHoverHeaderButtons
                                            ? <FaIcon icon="chevron-circle-up"/>
                                            : <FaIcon icon="circle"/>
                                    }
                                </div>
                                <div
                                    id="moon-header-close-button"
                                    className="moon-header-button"
                                    onClick={() => {
                                        AppMixpanel.track('button_click_close');
                                        this.onClose();
                                    }}
                                >
                                    {
                                        this.state.isHoverHeaderButtons
                                            ? <FaIcon icon="dot-circle"/>
                                            : <FaIcon icon="circle"/>
                                    }
                                </div>
                            </div>
                        </div>
                        <div id="moon-body" className={CLASS_MOON_BODY}>
                            <ErrorBody/>
                            <SuccessBody/>
                            <LoadingBody/>
                            {
                                !!this.props.authUser &&
                                isOnBoardingFlowCompleteOrSkipped(this.props.authUser) &&
                                <MainFlow/>
                            }
                            {
                                !!this.props.authUser &&
                                !isOnBoardingFlowCompleteOrSkipped(this.props.authUser) &&
                                <OnBoardingFlow/>
                            }
                            {!this.props.authUser && <AuthFlow/>}
                        </div>
                    </div>
                }
                <UIBlocker/>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAppActive: state.appState.isAppActive,
    authUser: state.sessionState.authUser
});

const mapDispatchToProps = (dispatch) => ({
    onSetIsAppActive: (isAppActive) => dispatch({type: ACTION_SET_IS_APP_ACTIVE, isAppActive})
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
