import React from "react";
import CoinbaseIcon from "../../misc/coinbase/CoinbaseIcon";
import AppRuntime from "../../../browser/AppRuntime";
import {REQUEST_LAUNCH_COINBASE_AUTH_FLOW} from "../../../../constants/events/appEvents";
import {handleErrors} from "../../../../utils/errors";

class OnboardingAddProviders extends React.Component {
    constructor(props) {
        super(props);
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
            <div className="onboarding-tab">
                <h2>Add one of our supported wallet providers to get started</h2>
                <div className="mb-10 w-100">
                    <button className="btn w-80 btn-coinbase" onClick={this.launchCoinbaseAuthFlow}>
                        <div className="btn-brand-icon"><CoinbaseIcon/></div>
                        <div className="btn-brand-text">Connect Coinbase</div>
                    </button>
                </div>
                <p><i>Don't worry, you can add more later!</i></p>
            </div>
        );
    }
}

export default OnboardingAddProviders;
