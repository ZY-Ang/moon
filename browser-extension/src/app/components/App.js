/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import SwipeableViews from 'react-swipeable-views';
import logo from '../../../../assets/icons/logo_300_text.png';
import {MOON_DIV_ID} from "../../constants/dom";
import Navbar from "./nav/Navbar";

const INITIAL_STATE = {
    isMaximized: true,
    currentTab: null // TODO: Map to an integer index that can be used to switch tabs on swipeable views
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

    onClose = () => {
        const moonDiv = document.getElementById(MOON_DIV_ID);
        if (!!moonDiv) {
            moonDiv.remove();
        }
    };

    changeTab = (tab) => {
        this.setState(() => ({currentTab: tab}));
    };

    render() {
        // TODO: Use react swipeable views to animate height content on different pages
        return (
            <div>
                <div id="moon-navbar">
                    <img id="moon-header-img" src={chrome.extension.getURL(logo)} alt="Moon"/>
                    <div id="moon-navbar-buttons-div">
                        <button onClick={this.onToggleMaximize}>
                            +
                        </button>
                        <button onClick={this.onClose}>
                            X
                        </button>
                    </div>
                </div>
                <SwipeableViews
                    ref={c => (this.swiper = c)}
                    disabled
                    className="bg-transparent"
                    animateHeight
                    index={this.state.currentTab}
                >
                    {

                    }
                </SwipeableViews>
                <div>
                    {
                        this.state.isMaximized &&
                        <p>Welcome to {this.props.source}!</p>
                    }
                </div>
                <Navbar changeTab={this.changeTab}/>
            </div>
        );
    }
}

const mapStateToProps = () => {

};

export default App;
