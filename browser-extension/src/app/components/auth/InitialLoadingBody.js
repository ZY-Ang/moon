/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import Throbber from "../misc/throbber/Throbber";
import {connect} from "react-redux";

const InitialLoadingBody = ({authUser}) => !authUser ? (
    <div className="app-modal">
        <Throbber style={{height: 100}}/>
        <div className="text-center" style={{padding:'0 30px'}}>
            <p>To the Moon!</p>
        </div>
    </div>
) : null;

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser
});

export default connect(mapStateToProps)(InitialLoadingBody);
