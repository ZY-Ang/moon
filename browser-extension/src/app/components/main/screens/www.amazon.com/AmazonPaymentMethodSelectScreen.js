import React from "react";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import {QUERY_SELECTOR_PAYMENT_METHOD_SELECT} from "./constants/querySelectors";
import AppMixpanel from "../../../../services/AppMixpanel";

class AmazonPaymentMethodSelectScreen extends React.Component {
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
        AppMixpanel.track('view_screen_amazon_payment_method_select');
        this.parseContinueButton();
    }

    parseContinueButton = () => {
        if (document.querySelector(QUERY_SELECTOR_PAYMENT_METHOD_SELECT)) {
            this.setState({continueButton: true});
        }
    };

    onContinueClick = () => {
        const useThisAddressButton = document.querySelector(QUERY_SELECTOR_PAYMENT_METHOD_SELECT);
        if (useThisAddressButton) {
            useThisAddressButton.click();
        }
    };

    render() {
        return (
            <div className="moon-mainflow-screen text-center">
                <div className="settings-icon-parent mb-2">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                <div className="my-2 w-100 text-left">
                    <h2 className="font-weight-bold mb-0">You're almost there!</h2>
                    <p className="mt-1">To Pay with Moon,</p>
                </div>
                <ol className="sequence">
                    <li className="text-left pb-5 mt-4 done">Choose a Shipping Address</li>
                    <li className="text-left pb-5 current">
                        Choose an Amazon Payment Method <a
                        className="text-small"
                        href="https://paywithmoon.com/FAQs"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={AppMixpanel.track('button_click_amazon_payment_method_select_why')}
                    >
                        Why?
                    </a>
                    </li>
                    <li className="text-left mb-5">Review Items and Shipping</li>
                </ol>
                {
                    this.state.continueButton &&
                    <div className="w-100">
                        <button className="btn btn-primary w-77" onClick={() => {
                            AppMixpanel.track('button_click_amazon_payment_method_select_continue');
                            this.onContinueClick()
                        }}>Continue</button>
                    </div>
                }
            </div>
        );
    }
}

export default AmazonPaymentMethodSelectScreen;
