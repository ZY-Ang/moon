/*
 * Copyright (c) 2018 moon
 */
import React from 'react';
import {connect} from "react-redux";
import LoadingBody from "./loading/LoadingBody";
import SuccessBody from "./success/SuccessBody";
import ErrorBody from "./error/ErrorBody";

class AppModal extends React.Component {
    render() {
        const {appModalState} = this.props;
        return (appModalState && appModalState.isActive) ? ({
            loading: <LoadingBody loadingText={appModalState.loadingText}/>,
            success: <SuccessBody successText={appModalState.successText}/>,
            error: <ErrorBody errorText={appModalState.errorText}/>
        })[appModalState.state] : null;
    }
}

const mapStateToProps = (state) => ({
    appModalState: state.appState.appModalState
});

export default connect(mapStateToProps)(AppModal);
