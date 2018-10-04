/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './App.css';
import logo from '../../../../assets/icons/logo_300_text_dark.png';
import {MOON_DIV_ID} from "../constants/dom";
import {TAB_GROUP_AUTH, TAB_PAY} from "./nav/constants";
import {connect} from "react-redux";
import AuthFlow from "./auth/AuthFlow";
import SwipeableViews from "react-swipeable-views";
import AppRuntime from "../browser/AppRuntime";
import FaIcon from "./misc/fontawesome/FaIcon";

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

    onHoverHeaderButtons = () =>
        this.setState(state => ({isHoverHeaderButtons: !state.isHoverHeaderButtons}));

    onClose = () => {
        const moonDiv = document.getElementById(MOON_DIV_ID);
        if (!!moonDiv) {
            moonDiv.remove();
        }
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
                <div id="moon-wrapper">
                    <div id="moon-header">
                        <img id="moon-header-img" src={AppRuntime.getURL(logo)} alt="Moon"/>
                        <div id="moon-header-buttons-div">
                            <div
                                id="moon-header-toggle-button"
                                className={`moon-header-button ${(this.state.isMaximized ? "maximized" : "minimized")}`}
                                // data-tip="Toggle Size"
                                onClick={this.onToggleMaximize}
                                onMouseEnter={this.onHoverHeaderButtons}
                                onMouseLeave={this.onHoverHeaderButtons}
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
                                // data-tip="Close"
                                onClick={this.onClose}
                                onMouseEnter={this.onHoverHeaderButtons}
                                onMouseLeave={this.onHoverHeaderButtons}
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
                        !!this.props.authUser
                            ? (
                                <div id="moon-body" className={CLASS_MOON_BODY}>
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
                                    {/*<Navbar changeTab={this.changeTab} activeTab={this.state.currentTabIndex}/>*/}
                                </div>
                            ) : (
                                <div id="moon-body" className={CLASS_MOON_BODY}>
                                    <AuthFlow/>
                                </div>
                            )
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser
});

export default connect(mapStateToProps)(App);
