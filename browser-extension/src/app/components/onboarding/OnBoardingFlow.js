/*
 * Copyright (c) 2018 moon
 */
import React from 'react';
import './OnBoardingFlow.css';
import SwipeableViews from "react-swipeable-views";
import CoinbaseIcon from "../misc/coinbase/CoinbaseIcon";
import AppRuntime from "../../browser/AppRuntime";
import {REQUEST_LAUNCH_COINBASE_AUTH_FLOW} from "../../../constants/events/appEvents";
import {handleErrors} from "../../../utils/errors";
import FaIcon from "../misc/fontawesome/FaIcon";

// TODO: Let background script handle onboarding flow state and nonreminder caching for session
export const isOnBoardingFlowCompleteOrSkipped = (authUser) => {
    return (
        !!authUser &&
        !!authUser.wallets &&
        !!authUser.wallets.length
    );
};

const INITIAL_STATE = {
    currentTabIndex: 0
};

class OnBoardingFlow extends React.Component {
    constructor() {
        super();
        this.state = {
            ...INITIAL_STATE
        };
    }

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

    render() {
        return (
            <div className="onboarding-wrapper">
                <SwipeableViews
                    animateHeight
                    enableMouseEvents
                    resistance
                    ref={c => (this.tabSwiper = c)}
                    style={{
                        height: '100%',
                        overflowY: 'hidden !important'
                    }}
                    onChangeIndex={currentTabIndex => this.setState(() => ({currentTabIndex}))}
                    index={this.state.currentTabIndex}
                >
                    <div className="onboarding-tab">
                        <span
                            className="onboarding-emoji"
                            role="img"
                            aria-label="Shop Online"
                            style={{fontSize: 100}}
                        >
                            🛍️
                        </span>
                        <p><i>How it Works</i></p>
                        <h1>Shop Online</h1>
                        <h4>Moon stays hidden until you need it</h4>
                        <button
                            className="btn btn-primary full-width"
                            onClick={() => this.setState(() => ({currentTabIndex: 1}))}
                        >
                            Next
                        </button>
                    </div>
                    <div className="onboarding-tab">
                        <span
                            className="onboarding-emoji"
                            role="img"
                            aria-label="Shop Online"
                            style={{fontSize: 100}}
                        >
                            🛒
                        </span>
                        <p><i>How it Works</i></p>
                        <h1>Checkout</h1>
                        <h4>Opt to pay with Moon at checkout</h4>
                        <button
                            className="btn btn-primary full-width"
                            onClick={() => this.setState(() => ({currentTabIndex: 2}))}
                        >
                            Let's Go!
                        </button>
                    </div>
                    <div className="onboarding-tab">
                        <h2>Add one of our supported wallet providers to get started</h2>
                        <div className="mb-10 w-100">
                            <button className="btn full-width btn-coinbase" onClick={this.launchCoinbaseAuthFlow}>
                                <div className="btn-brand-icon"><CoinbaseIcon/></div>
                                <div className="btn-brand-text">Connect Coinbase</div>
                            </button>
                        </div>
                        <p><i>Don't worry, you can add more later!</i></p>
                    </div>
                </SwipeableViews>
            </div>
        );
    }
}

export default OnBoardingFlow;
