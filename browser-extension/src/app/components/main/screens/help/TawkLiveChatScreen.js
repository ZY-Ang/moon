import React from "react";
import "./TawkLiveChatScreen.css";
import BackButton from "../../BackButton";
import Throbber from "../../../misc/throbber/Throbber";
import {URL_MOON_TAWK_SUPPORT} from "../../../../../constants/url";
import AppMixpanel from "../../../../services/AppMixpanel";

class TawkLiveChatScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    componentDidMount() {
        AppMixpanel.track('view_screen_support');
    }

    render() {
        return (
            <div className="tawk-live-chat-tab">
                <div className="tawk-live-chat-tab-back-button-wrapper">
                    <BackButton/>
                </div>
                <div className="tawk-live-chat-iframe-wrapper">
                    <iframe
                        src={URL_MOON_TAWK_SUPPORT}
                        height={this.state.loaded ? "100%" : "0%"}
                        width="100%"
                        onLoad={() => this.setState(() => ({loaded: true}))}
                    />
                    {
                        !this.state.loaded &&
                        <div
                            style={{
                                height: "100%",
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <Throbber style={{height: 100}}/>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default TawkLiveChatScreen;
