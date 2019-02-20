/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import Throbber from "../../throbber/Throbber";
import {connect} from "react-redux";

const LoadingBody = ({isActive, text}) => !!isActive ? (
    <div className="app-modal">
        <Throbber style={{height: 100}}/>
        <div className="text-center" style={{padding:'0 30px', maxHeight: 160}}>
            <p>{text}</p>
        </div>
    </div>
) : null;

const mapStateToProps = (state) => ({
    isActive: state.appState.appModalLoadingState.isActive,
    text: state.appState.appModalLoadingState.text
});

export default connect(mapStateToProps)(LoadingBody);
