import React from "react";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import {QUERY_SELECTOR_GIFT_OPTIONS_SELECT} from "./constants/querySelectors";

class AmazonGiftOptionScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            continueButton: false
        };
    }
    componentWillMount() {
        this.parseContinueButton();
    }

    componentDidMount() {
        this.parseContinueButton();
    }

    parseContinueButton = () => {
        if (document.querySelector(QUERY_SELECTOR_GIFT_OPTIONS_SELECT)) {
            this.setState({continueButton: true});
        }
    };

    onContinueClick = () => {
        const saveGiftOptionButton = document.querySelector(QUERY_SELECTOR_GIFT_OPTIONS_SELECT);
        if (saveGiftOptionButton) {
            saveGiftOptionButton.click();
        }
    };
    render() {
        return(
            <div className="moon-mainflow-screen text-center">
                <div className="settings-icon-parent mb-2">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                <div className="my-2 w-100 text-left">
                    <h2 className="font-weight-bold mn-0">You're almost there!</h2>
                    <p className="mt-1">To Pay with Moon, </p>
                </div>
                <ol className="sequence">
                    <li className="text-left pb-5 done">
                        Choose a Shipping Address
                    </li>
                    <li className="text-left pb-5 done">
                        Choose an Amazon Payment Method
                    </li>
                    <li className="text-left pb-5 current">
                        Review Items and Shipping
                    </li>
                </ol>
                {
                    this.state.continueButton &&
                    <div className="w-100">
                        <button className="btn btn-primary w-77" onClick={this.onContinueClick}>Continue</button>
                    </div>
                }
            </div>
        )}
}

export default AmazonGiftOptionScreen;
