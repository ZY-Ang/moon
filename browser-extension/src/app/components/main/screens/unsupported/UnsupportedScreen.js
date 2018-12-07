import React from "react";
import {connect} from "react-redux";
import SettingsIcon from "../settings/SettingsIcon";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_MOON_SITE_SUPPORT} from "../../../../../constants/events/appEvents";
import {handleErrors} from "../../../../../utils/errors";
import {
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE
} from "../../../../redux/reducers/constants";

class UnsupportedScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRequested: false
        };
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
                handleErrors(err);
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
                        <span
                            className="site-logo unsupported"
                            role="img"
                            aria-label="Unsupported Site"
                            style={{fontSize: 100}}
                        >
                            🌚
                        </span>
                        <SettingsIcon/>
                    </div>
                    <h2>Unsupported Site</h2>
                </div>
                <div>
                    <p>We are working hard to make Moon available on your favourite shopping sites!</p>
                    <p>If you really want us to support this shopping site, click the button below and we'll work as fast as we can!</p>
                    {
                        this.state.isRequested
                            ? <button className="btn btn-primary" disabled>We're working on {window.location.host}!</button>
                            : <button className="btn btn-primary-outline" onClick={this.requestSite}>I want to shop here with Moon!</button>
                    }
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
