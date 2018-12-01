/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import "./OnBoardingFlow.css";
import {connect} from "react-redux";
import SwipeableViews from "react-swipeable-views";
import ONBOARDING_PAGES from "./pages";
import AppRuntime from "../../browser/AppRuntime";
import {REQUEST_UPDATE_ONBOARDING_SKIP} from "../../../constants/events/appEvents";
import {ACTION_SET_AUTH_USER_TEMPORARY_ONBOARD_SKIP} from "../../redux/reducers/constants";

// TODO: Let background script handle onboarding flow state and nonreminder caching for session
export const isOnBoardingFlowCompleteOrSkipped = (authUser) => {
    return !!authUser && (
        (
            !!authUser.onboardingSkipExpiry &&
            !!(new Date(authUser.onboardingSkipExpiry)) &&
            !!(new Date() < new Date(authUser.onboardingSkipExpiry))
        ) || (
            !!authUser.wallets &&
            !!authUser.wallets.length
        )
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

    skip = () => {
        AppRuntime.sendMessage(REQUEST_UPDATE_ONBOARDING_SKIP)
        // Redux is used to temporarily force user into skipped mode without waiting for dynamodb eventual consistency to take effect
            .then(() => this.props.delayAuthUserOnboarding());
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
                        height: '85%',
                        overflowY: 'hidden !important'
                    }}
                    onChangeIndex={currentTabIndex => this.setState(() => ({currentTabIndex}))}
                    index={this.state.currentTabIndex}
                >
                    {
                        ONBOARDING_PAGES.map(({Component}, index) =>
                            <Component
                                key={index}
                                next={() => this.setState(() => ({currentTabIndex: index + 1}))}
                                previous={() => this.setState(() => ({currentTabIndex: index - 1}))}
                            />
                        )
                    }
                </SwipeableViews>
                <div className="onboarding-skip-wrapper">
                    <a href="#skip" onClick={this.skip}>Skip for now</a>
                </div>
                <div className="onboarding-carousel-dots onboarding-carousel-dots-draw">
                    <ul>
                        {
                            ONBOARDING_PAGES.map((item, index) =>
                                <li
                                    key={index}
                                    className={this.state.currentTabIndex === index ? "current" : ""}
                                    onClick={() => this.setState(() => ({currentTabIndex: index}))}
                                >
                                    <a>{index}</a>
                                    <svg
                                        version="1.1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 16 16"
                                        preserveAspectRatio="none"
                                    >
                                        <circle cx="8" cy="8" r="6.215"/>
                                    </svg>
                                </li>
                            )
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    delayAuthUserOnboarding: () => dispatch({type: ACTION_SET_AUTH_USER_TEMPORARY_ONBOARD_SKIP})
});

export default connect(null, mapDispatchToProps)(OnBoardingFlow);
