import React from "react";
import {connect} from "react-redux";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_MOON_VALID_CHECKOUT_REPORT} from "../../../../../constants/events/appEvents";
import {
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE
} from "../../../../redux/reducers/constants";
import smilingFaceEmoji
    from "../../../../../../../assets/emoji/windows10/smiling-face-with-open-mouth-and-smiling-eyes_1f604.png";

class AmazonNotAtCheckoutScreen extends React.Component {
    reportIsCheckout = () => {
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
                logger.error("AmazonNotAtCheckoutScreen.reportIsCheckout REQUEST_MOON_VALID_CHECKOUT_REPORT exception: ", err);
                this.props.onSetAppModalErrorState({
                    isActive: true,
                    text: "Hmmm... Something went wrong, try again! If that doesn't work either, you can always call to tell us ❤!"
                });
            })
            .finally(() => this.props.onSetAppModalLoadingState({isActive: false}));
    };

    render() {
        return (
            <div className="moon-mainflow-screen text-center">
                <div className="settings-icon-parent">
                    <AmazonSiteLogo/>
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
                    <h2>Not at Checkout Page</h2>
                    <p>When you're about to checkout, you'll have the option to pay with cryptocurrency.</p>
                    <a
                        onClick={this.reportIsCheckout}
                    >
                        Click here if you think this is a mistake
                    </a>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAppModalLoadingState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_LOADING_STATE}),
    onSetAppModalSuccessState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_SUCCESS_STATE}),
    onSetAppModalErrorState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_ERROR_STATE})
});

export default connect(null, mapDispatchToProps)(AmazonNotAtCheckoutScreen);
