import React from "react";
import {connect} from "react-redux";
import CoinbaseIcon from "../../../misc/coinbase/CoinbaseIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_LAUNCH_COINBASE_AUTH_FLOW} from "../../../../../constants/events/appEvents";
import {handleErrors} from "../../../../../utils/errors";
import BackButton from "../../BackButton";
import {ACTION_SET_AUTH_USER_TEMPORARY_ONBOARD_SKIP} from "../../../../redux/reducers/constants";

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
        // Redux is used to temporarily force user into skipped mode without waiting for dynamodb eventual consistency to take effect
        this.props.delayAuthUserOnboarding();
    };

    render() {
        return (
            <div className="moon-mainflow-screen text-center">
                <BackButton/>
                <h2>Connect a Wallet</h2>
                <div className="mb-2 w-100">
                    <button className="btn w-80 btn-coinbase my-2" onClick={this.launchCoinbaseAuthFlow}>
                        <div className="btn-brand-icon"><CoinbaseIcon/></div>
                        <div className="btn-brand-text">Connect Coinbase</div>
                    </button>
                    <button className="btn w-80 btn-coinbase">
                        <div className="btn-brand-icon"><CoinbaseIcon/></div>
                        <div className="btn-brand-text">Connect Coinbase</div>
                    </button>
                </div>
                <p>More coming soon...</p>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    delayAuthUserOnboarding: () => dispatch({type: ACTION_SET_AUTH_USER_TEMPORARY_ONBOARD_SKIP})
});

export default connect(null, mapDispatchToProps)(AddWalletsScreen);
