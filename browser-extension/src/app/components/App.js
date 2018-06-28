/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './misc/fontawesome/library';
import './App.css';
import ReactTooltip from 'react-tooltip';
import SwipeableViews from 'react-swipeable-views';
import logo from '../../../../assets/icons/logo_300_text.png';
import {MOON_DIV_ID} from "../../constants/dom";
import Navbar from "./nav/Navbar";
import {TAB_GROUP_AUTH, TAB_PAY} from "./nav/constants";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const INITIAL_STATE = {
    isMaximized: true,
    currentTabIndex: TAB_GROUP_AUTH[TAB_PAY].index
};

const TOOLTIP_ID_HEADER_BUTTONS = 'tipBtnHeaderControls';

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

    onClose = () => {
        const moonDiv = document.getElementById(MOON_DIV_ID);
        if (!!moonDiv) {
            moonDiv.remove();
        }
    };

    changeTab = (tabIndex) => {
        this.setState(() => ({currentTabIndex: tabIndex}));
    };

    render() {
        // TODO: Use react swipeable views to animate height content on different pages
        return (
            <div id="moon-wrapper">
                <div id="moon-header">
                    <img id="moon-header-img" src={chrome.extension.getURL(logo)} alt="Moon"/>
                    <div id="moon-header-buttons-div">
                        <div
                            id="moon-header-toggle-button"
                            className={`moon-header-button ${(this.state.isMaximized ? "maximized" : "minimized")}`}
                            data-tip="Toggle Size"
                            data-for={TOOLTIP_ID_HEADER_BUTTONS}
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
                            data-tip="Close"
                            data-for={TOOLTIP_ID_HEADER_BUTTONS}
                            onClick={this.onClose}
                        >
                            <FontAwesomeIcon icon="times-circle"/>
                        </div>
                        <ReactTooltip place="bottom" effect="solid" id={TOOLTIP_ID_HEADER_BUTTONS}/>
                    </div>
                </div>
                {
                    // Redux check if signed in?
                }
                <div id={"moon-body"} className={(this.state.isMaximized ? "moon-body-maximized" : "moon-body-minimized")}>
                    <SwipeableViews
                        ref={c => (this.swiper = c)}
                        disabled
                        className="bg-transparent"
                        animateHeight
                        index={this.state.currentTabIndex}
                    >
                        {TAB_GROUP_AUTH.components.map(AuthTab => <AuthTab/>)}
                    </SwipeableViews>
                    <Navbar changeTab={this.changeTab} activeTab={this.state.currentTabIndex}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({

});

export default App;
