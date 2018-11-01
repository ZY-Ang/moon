/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import {connect} from "react-redux";
import Throbber from "../misc/throbber/Throbber";

const UIBlocker = ({uiBlockerState}) => (uiBlockerState && uiBlockerState.isActive) ? (
    <div id="moon-ui-blocker">
        <div id="moon-ui-blocker-ui" className="container">
            <div className="text-center">
                <Throbber/>
                <h1>{uiBlockerState.title}</h1>
                <p>{uiBlockerState.subTitle}</p>
            </div>
        </div>
    </div>
) : null;

const mapStateToProps = (state) => ({
    uiBlockerState: state.appState.uiBlockerState
});

export default connect(mapStateToProps)(UIBlocker);
