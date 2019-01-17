import React from "react";
import {connect} from "react-redux";
import "./UnsupportedScreen.css";
import SettingsIcon from "../settings/SettingsIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_MOON_SITE_SUPPORT} from "../../../../../constants/events/appEvents";
import {
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE
} from "../../../../redux/reducers/constants";
import appLogger from "../../../../utils/AppLogger";
import AppMixpanel from "../../../../services/AppMixpanel";

class UnsupportedScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRequested: false
        };
    }

    componentDidMount(){
        AppMixpanel.track('view_screen_unsupported_site');
    }

    requestSite = () => {
        this.props.onSetAppModalLoadingState({isActive: true, text: "Submitting ❤"});
        AppRuntime.sendMessage(REQUEST_MOON_SITE_SUPPORT, {host: window.location.host})
            .then(() => {
                this.props.onSetAppModalSuccessState({
                    isActive: true,
                    text: `Hang tight! We've gotten your request and are getting to work on ${window.location.host}!`
                });
                this.setState(() => ({isRequested: true}));
            })
            .catch(err => {
                appLogger.error("UnsupportedScreen.requestSite REQUEST_MOON_SITE_SUPPORT exception: ", err);
                this.props.onSetAppModalErrorState({
                    isActive: true,
                    text: "Hmmm. Something went wrong... Try again! If that doesn't work either, you can always call us ❤!"
                });
            })
            .finally(() => this.props.onSetAppModalLoadingState({isActive: false}));
    };

    render() {
        return (
            <div className="moon-mainflow-screen text-center">
                <div>
                    <div className="settings-icon-parent">
                        <SettingsIcon/>
                    </div>
                </div>
                <div className="mt-5">
                    <h2>Pay with Moon on</h2>
                    <div className="unsuportedScreen-body w-90 mt-5">
                        <a href="http://www.amazon.com" >
                            <img className="site-logo"
                                 src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Amazon_logo_plain.svg/200px-Amazon_logo_plain.svg.png"
                                 alt="Amazon"
                            />
                        </a>
                        <div className="mt-5">
                            <h3><b>More coming soon...</b></h3>
                        </div>
                        <div className="mt-5 w-100">
                            {
                                this.state.isRequested
                                    ? <button className="btn btn-primary w-100" disabled>We're working on {window.location.host}!</button>
                                    : <button className="btn btn-primary-outline w-100" onClick={this.requestSite}>I want to pay with Moon!</button>
                            }
                        </div>
                    </div>
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

export default connect(null, mapDispatchToProps)(UnsupportedScreen);
