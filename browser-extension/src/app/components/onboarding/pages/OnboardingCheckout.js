import React from "react";

const OnboardingCheckout = ({next}) => (
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
