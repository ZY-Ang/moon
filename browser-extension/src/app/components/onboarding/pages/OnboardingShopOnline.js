import React from "react";

const OnboardingShopOnline = ({next}) => (
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
