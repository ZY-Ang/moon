/*
 * Copyright (c) 2019 moon
 */

import React from "react";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_MOON_VALID_CHECKOUT_REPORT} from "../../../../../constants/events/appEvents";
import appLogger from "../../../../utils/AppLogger";
import DominosSiteLogo from "./DominosCatchAllScreen";
import smilingFaceEmoji
    from "../../../../../../../assets/emoji/windows10/smiling-face-with-open-mouth-and-smiling-eyes.png";
import AppMixpanel from "../../../../services/AppMixpanel";
import SettingsIcon from "../settings/SettingsIcon";

class DominosNotAtPaymentScreen extends React.Component {
    reportIsCheckout = () => {
        AppMixpanel.track('button_click_dominos_checkout_report_is_checkout');
        this.props.onSetAppModalLoadingState({isActive: true, text: "✈ Sending us a bug report..."});
        AppRuntime.sendMessage(REQUEST_MOON_VALID_CHECKOUT_REPORT, {
            url: window.location.href,
            content: (document.documentElement.innerHTML.length > 300000)
                ? "Large payload"
                : document.documentElement.innerHTML
        })
            .then(() => {
                this.props.onSetAppModalSuccessState({
                    isActive: true,
                    text: "Hang tight! Support is on the way to you! 🚀🚀🚀"
                });
            })
            .catch(err => {
                appLogger.error("DominosNotAtPaymentScreen.reportIsCheckout REQUEST_MOON_VALID_CHECKOUT_REPORT exception: ", err);
                this.props.onSetAppModalErrorState({
                    isActive: true,
                    text: "Hmmm... Something went wrong, try again! If that doesn't work either, you can always contact us ❤!"
                });
            })
            .finally(() => this.props.onSetAppModalLoadingState({isActive: false}));
    };

    render() {
        return (
            <div className="moon-mainflow-screen text-center">
                <div className="settings-icon-parent">
                    <DominosSiteLogo/>
                    <SettingsIcon/>
                </div>
                <div>
                    <div>
                        <span
                            className="site-logo unsupported"
                            role="img"
                            aria-label="Not at Checkout"
                            style={{fontSize: 100}}
                        >
                            <img alt="Not at Checkout" src={AppRuntime.getURL(smilingFaceEmoji)}/>
                        </span>
                    </div>
                    <h2>Not at Payment Page</h2>
                    <p>When you're about to pay, you'll have the option to pay with cryptocurrency.</p>
                    <a onClick={this.reportIsCheckout}>
                        Click here if you think this is a mistake
                    </a>
                </div>
            </div>
        );
    }
}

export default DominosNotAtPaymentScreen;
