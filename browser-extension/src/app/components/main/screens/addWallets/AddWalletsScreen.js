import React from "react";
import CoinbaseIcon from "../../../misc/coinbase/CoinbaseIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_LAUNCH_COINBASE_AUTH_FLOW} from "../../../../../constants/events/appEvents";
import {handleErrors} from "../../../../../utils/errors";
import BackButton from "../../BackButton";

class AddWalletsScreen extends React.Component {
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
            <div className="moon-tab text-center">
                <BackButton/>
                <h2>Add a Wallet</h2>
                <div className="mb-2 w-100">
                    <button className="btn w-80 btn-coinbase" onClick={this.launchCoinbaseAuthFlow}>
                        <div className="btn-brand-icon"><CoinbaseIcon/></div>
                        <div className="btn-brand-text">Connect Coinbase</div>
                    </button>
                </div>
            </div>
        );
    }
}

export default AddWalletsScreen;
