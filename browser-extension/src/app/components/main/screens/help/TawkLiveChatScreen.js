import React from "react";
import "./TawkLiveChatScreen.css";
import BackButton from "../../BackButton";

class TawkLiveChatScreen extends React.Component {
    render() {
        return (
            <div className="tawk-live-chat-tab">
                <div className="tawk-live-chat-tab-back-button-wrapper">
                    <BackButton/>
                </div>
                <div className="tawk-live-chat-iframe-wrapper">
                    <iframe
                        src="https://tawk.to/chat/5bf7291379ed6453ccaab1af/1ct92sc5n"
                        height="100%"
                        width="100%"
                    />
                </div>
            </div>
        );
    }
}

export default TawkLiveChatScreen;
