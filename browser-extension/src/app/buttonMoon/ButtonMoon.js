/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import {connect} from "react-redux";
import {ACTION_SET_IS_APP_ACTIVE} from "../redux/reducers/constants";
import AppRuntime from "../browser/AppRuntime";
import whiteLogo from "../../../../assets/icons/logo_12_text.png";
import {SOURCE_MANUAL} from "../../constants/events/backgroundEvents";
import {toggleApp} from "../index";
import {handleErrors} from "../../utils/errors";

const defaultStyle = {
    backgroundColor: '#0F62BD',
    boxShadow: 'none',
    border: '2px solid #0F62BD',
    borderRadius: 3,
    color: '#FFF',
    cursor: 'pointer',
    fontFamily: 'Quicksand,Raleway',
    fontSize: 14,
    lineHeight: '14px',
    padding: '9px 16px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5
};

const hoverStyle = {
    ...defaultStyle,
    backgroundColor: '#576CA8',
    border: '2px solid #576CA8'
};

const activeStyle = {
    ...defaultStyle,
    backgroundColor: '#1B264F',
    border: '2px solid #1B264F'
};

class ButtonMoon extends Component {
    constructor() {
        super();
        this.state = {
            style: defaultStyle
        };
    }

    setDefaultStyle = () => this.setState({style: defaultStyle});
    setHoverStyle = () => this.setState({style: hoverStyle});
    setActiveStyle = () => this.setState({style: activeStyle});

    render() {
        return this.props.isAppActive ? null : (
            <div
                style={this.state.style}
                onClick={() => toggleApp(SOURCE_MANUAL).catch(handleErrors)}
                onMouseEnter={this.setHoverStyle}
                onMouseLeave={this.setDefaultStyle}
                onMouseDown={this.setActiveStyle}
                onMouseUp={this.setDefaultStyle}
            >
                Pay With <img
                    src={AppRuntime.getURL(whiteLogo)}
                    alt="Moon"
                    style={{height: 12, paddingLeft: 5}}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAppActive: state.appState.isAppActive
});

const mapDispatchToProps = (dispatch) => ({
    onSetIsAppActive: (isAppActive) => dispatch({type: ACTION_SET_IS_APP_ACTIVE, isAppActive})
});

export default connect(mapStateToProps, mapDispatchToProps)(ButtonMoon);
