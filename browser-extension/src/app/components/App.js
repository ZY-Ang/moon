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
import {REQUEST_POPUP} from "../../constants/events/appEvents";

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
        console.log("Main App Mounted");
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

    chatPopUp = (event) => {
        AppRuntime.sendMessage(REQUEST_POPUP);
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
                                    <button
                                        id="moon-header-support-button"
                                        className="btn-support"
                                        onClick={this.chatPopUp}
                                    >
                                        <FaIcon icon="comments"/>
                                    </button>
                                </div>
                                <div
                                    id="moon-header-toggle-button"
                                    className={`moon-header-button ${(this.state.isMaximized ? "maximized" : "minimized")}`}
                                    onClick={this.onToggleMaximize}
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
                                    onClick={this.onClose}
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
