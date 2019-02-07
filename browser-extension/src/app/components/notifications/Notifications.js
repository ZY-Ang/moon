/*
 * Copyright (c) 2019 moon
 */

import React from "react";
import "./Notifications.css";
import AppMixpanel from "../../services/AppMixpanel";

import AuthUser from "../../../background/auth/AuthUser";


class Notification extends React.Component {

    onBtnClick = () => {

    };

    render() {
        const emailVerification =  (AuthUser.trim().then(function (data) {data.email_verified}));

        return(
            <div>
                {
                    !emailVerification &&
                    <div id="notification-box">
                        <div className="notification-body">
                            <div className="btn-box">
                                <div
                                    className="btn-close"
                                    onClick={() => {
                                        AppMixpanel.track('button_click_close');
                                        this.onBtnClick();
                                    }}
                                >
                                </div>
                            </div>
                            <div>
                                <p>This is the message</p>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default Notification;
