/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './misc/fontawesome/library';
import './App.css';
import logo from '../../../../assets/icons/logo_300_text_dark.png';
import {MOON_DIV_ID} from "../../constants/dom";
import {TAB_GROUP_AUTH, TAB_PAY} from "./nav/constants";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {connect} from "react-redux";
import AuthFlow from "./auth/AuthFlow";
import Navbar from "./nav/Navbar";
import SwipeableViews from "react-swipeable-views";

const INITIAL_STATE = {
    isMaximized: true,
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
        // if (this.tabSwiper) {
        //     setTimeout(this.tabSwiper.updateHeight, 500);
        // }
    }

    componentDidUpdate() {
        if (this.tabSwiper) {
            this.tabSwiper.updateHeight();
        }
    }

    onToggleMaximize = () => {
        this.setState(() => ({isMaximized: !this.state.isMaximized}));
    };

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

    render() {
        const CLASS_MOON_BODY = this.state.isMaximized ? "moon-body-maximized" : "moon-body-minimized";
        return (
            <div id="moon-div-shadow">
                <div id="moon-wrapper">
                    <div id="moon-header">
                        <img id="moon-header-img" src={chrome.extension.getURL(logo)} alt="Moon"/>
                        <div id="moon-header-buttons-div">
                            <div
                                id="moon-header-toggle-button"
                                className={`moon-header-button ${(this.state.isMaximized ? "maximized" : "minimized")}`}
                                // data-tip="Toggle Size"
                                onClick={this.onToggleMaximize}
                            >
                                {
                                    this.state.isMaximized
                                        ? <FontAwesomeIcon icon="minus-circle"/>
                                        : <FontAwesomeIcon icon="plus-circle"/>
                                }
                            </div>
                            <div
                                id="moon-header-close-button"
                                className="moon-header-button"
                                // data-tip="Close"
                                onClick={this.onClose}
                            >
                                <FontAwesomeIcon icon="times-circle"/>
                            </div>
                        </div>
                    </div>
                    {
                        !!this.props.authUser
                            ? (
                                <div id="moon-body" className={CLASS_MOON_BODY}>
                                    <SwipeableViews
                                        ref={c => (this.tabSwiper = c)}
                                        disabled
                                        style={{height: 'calc(100% - 66px)', overflowY: 'auto !important'}}
                                        index={this.state.currentTabIndex}
                                    >
                                        {
                                            TAB_GROUP_AUTH.components.map((AuthTab, index) =>
                                                <AuthTab key={index}/>
                                            )
                                        }
                                    </SwipeableViews>
                                    <Navbar changeTab={this.changeTab} activeTab={this.state.currentTabIndex}/>
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
