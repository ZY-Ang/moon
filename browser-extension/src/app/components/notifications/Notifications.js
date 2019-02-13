/*
 * Copyright (c) 2019 moon
 */

import React from "react";
import "./Notifications.css";
import AppMixpanel from "../../services/AppMixpanel";
import {connect} from "react-redux";




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
            <div id="notification-box">
                <div className="notification-body">
                    <div className="btn-box">
                        {
                            !!this.state.isCloseable &&
                            <div
                                className="btn-close"
                                onClick={() => {
                                    AppMixpanel.track('button_click_close');
                                    this.onBtnClick();
                                }}
                            > x
                            </div>
                        }
                    </div>
                    <div>
                        <p>Your email address is not verified</p>
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
