import React from "react";
import AppRuntime from "../../../browser/AppRuntime";
import shoppingBagsEmoji from "../../../../../../assets/emoji/windows10/shopping-bags_1f6cd.png";

const OnboardingShopOnline = ({next}) => (
    <div className="onboarding-tab">
        <span
            className="onboarding-emoji"
            role="img"
            aria-label="Shop Online"
            style={{fontSize: 100}}
        >
            <img alt="Shop Online" src={AppRuntime.getURL(shoppingBagsEmoji)}/>
        </span>
        <p><i>How it Works</i></p>
        <h1 style={{margin: '0'}}>Shop Online</h1>
        <p className="font-weight-bold">Moon stays hidden until you need it</p>
        <button
            className="btn btn-primary w-77"
            onClick={next}
        >
            Next
        </button>
    </div>
);

export default OnboardingShopOnline;
