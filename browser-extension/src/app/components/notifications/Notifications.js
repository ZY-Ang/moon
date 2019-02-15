/*
 * Copyright (c) 2019 moon
 */

import React from "react";
import "./Notifications.css";
import AppMixpanel from "../../services/AppMixpanel";
import {connect} from "react-redux";
import FaIcon from "../misc/fontawesome/FaIcon";

class Notification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isVerified: true,
            isCloseable: false,
            isDisplay: true
        };
    }

    componentDidMount(prevProps, prevState) {
                const authUserInfo = this.props.authUser;
                    if(authUserInfo !== null) {
                        const verifiedUser = authUserInfo.email_verified;
                        this.setState(() => ({
                            isVerified: verifiedUser
                        }))
                    }
    }

    onBtnClick = () => {
        this.setState( () => ({
            isDisplay: false
        }))
    };

    render() {

        return(
            <div>
            {
                !!this.state.isDisplay &&
                !this.state.isVerified &&
        <div>
            <div id="notification-mainflow">
                <div className="notification-body">
                    <div className="notification-btn-container">
                        {
                            !!this.state.isCloseable &&
                            <div
                                className="notification-close-btn"
                                onClick={() => {
                                    AppMixpanel.track('button_click_close');
                                    this.onBtnClick();
                                }}
                            > <FaIcon icon="times-circle"/>
                            </div>
                        }
                    </div>
                    <div>
                        <p>Your email address is not verified, Please click
                            <a onClick={() =>{
                                const userEmail = this.props.authUser.email;
                                const userAddress = userEmail.substr(userEmail.indexOf("@") +1);
                                window.open(userAddress, '_blank');
                            }}
                            >
                                <span> here </span>
                            </a>
                            to verify your email
                        </p>
                    </div>
                </div>
            </div>
        </div>

            }
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser
});

export default connect(mapStateToProps)(Notification);
