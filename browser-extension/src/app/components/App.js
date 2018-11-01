/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './App.css';
import logo from '../../../../assets/icons/logo_300_text_dark.png';
import {TAB_GROUP_AUTH, TAB_PAY} from "./nav/constants";
import {connect} from "react-redux";
import AuthFlow from "./auth/AuthFlow";
import SwipeableViews from "react-swipeable-views";
import AppRuntime from "../browser/AppRuntime";
import FaIcon from "./misc/fontawesome/FaIcon";
import {ACTION_SET_IS_APP_ACTIVE} from "../redux/reducers/constants";
import OnBoardingFlow, {isOnBoardingFlowCompleteOrSkipped} from "./onboarding/OnBoardingFlow";
import AppModal from "./misc/appmodals/AppModal";
import UIBlocker from "./uiblocker/UIBlocker";

const INITIAL_STATE = {
    isMaximized: true,
    isHoverHeaderButtons: false,
    currentTabIndex: TAB_GROUP_AUTH[TAB_PAY].index
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
        if (this.tabSwiper) {
            setTimeout(this.tabSwiper.updateHeight, 100);
        }
    }

    componentDidUpdate() {
        if (this.tabSwiper) {
            this.tabSwiper.updateHeight();
        }
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

    changeTab = (tabIndex) => {
        const currentTabIndex = this.state.currentTabIndex;
        if (tabIndex === currentTabIndex) {
            // TODO: Pop inner stack for the currentTabIndex
            console.log("Pop", currentTabIndex);
        }
        this.setState(() => ({
            currentTabIndex: tabIndex
        }));
    };

    componentWillReceiveProps(nextProps) {
        if (!nextProps.authUser) {
            this.setState(() => INITIAL_STATE);
        }
    }

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
                        {
                            !!this.props.authUser &&
                            <div id="moon-body" className={CLASS_MOON_BODY}>
                                <AppModal/>
                                {
                                    isOnBoardingFlowCompleteOrSkipped(this.props.authUser)
                                        ? (
                                            <SwipeableViews
                                                animateHeight
                                                ref={c => (this.tabSwiper = c)}
                                                disabled
                                                style={{height: '100%', overflowY: 'hidden !important'}}
                                                index={this.state.currentTabIndex}
                                            >
                                                {
                                                    TAB_GROUP_AUTH.components.map((AuthTab, index) =>
                                                        <AuthTab key={index} changeTab={this.changeTab}/>
                                                    )
                                                }
                                            </SwipeableViews>
                                        ) : (
                                            <OnBoardingFlow/>
                                        )
                                }
                                {/*<Navbar changeTab={this.changeTab} activeTab={this.state.currentTabIndex}/>*/}
                            </div>
                        }
                        {
                            !this.props.authUser &&
                            <div id="moon-body" className={CLASS_MOON_BODY}>
                                <AuthFlow/>
                            </div>
                        }
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
