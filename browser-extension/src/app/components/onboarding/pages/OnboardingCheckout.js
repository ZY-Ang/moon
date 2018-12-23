import React from "react";
import AppRuntime from "../../../browser/AppRuntime";
import shoppingCartEmoji from "../../../../../../assets/emoji/windows10/shopping-trolley_1f6d2.png";

const OnboardingCheckout = ({next}) => (
    <div className="onboarding-tab">
        <span
            className="onboarding-emoji"
            role="img"
            aria-label="Checkout"
            style={{fontSize: 100}}
        >
            <img alt="Shop Online" src={AppRuntime.getURL(shoppingCartEmoji)}/>
        </span>
        <p><i>How it Works</i></p>
        <h1 style={{margin: '0'}}>Checkout</h1>
        <p className="font-weight-bold">Opt to pay with Moon at checkout</p>
        <button
            className="btn btn-primary w-77"
            onClick={next}
        >
            Let's Go!
        </button>
    </div>
);

export default OnboardingCheckout;
