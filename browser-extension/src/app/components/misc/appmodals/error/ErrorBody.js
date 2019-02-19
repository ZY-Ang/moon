/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import './ErrorBody.css';
import {connect} from "react-redux";
import {
    ACTION_PUSH_SCREEN,
    ACTION_SET_APP_MODAL_ERROR_STATE,
    SCREEN_HELP_TAWK
} from "../../../../redux/reducers/constants";
import {copyToClipboard} from "../../../../utils/dom";

const ErrorBody = ({isActive, text, onSetAppModalErrorState, onPushScreen}) => !!isActive && !!onSetAppModalErrorState && !!onPushScreen ? (
    <div className="app-modal">
        <div
            style={{width: 80, height: 80, borderWidth: 4, borderStyle: 'solid', borderColor: 'rgb(212, 63, 58)', borderRadius: '50%', margin: '20px auto', position: 'relative', boxSizing: 'content-box', animation: 'animateErrorIcon 0.5s'}}
        >
            <span style={{position: 'relative', display: 'block', animation: 'animateXMark 0.5s'}}>
                <span style={{position: 'absolute', height: 5, width: 47, backgroundColor: 'rgb(217, 83, 79)', display: 'block', top: 37, borderRadius: 2, transform: 'rotate(45deg)', left: 17}}/>
                <span style={{position: 'absolute', height: 5, width: 47, backgroundColor: 'rgb(217, 83, 79)', display: 'block', top: 37, borderRadius: 2, transform: 'rotate(-45deg)', right: 16}}/>
            </span>
        </div>
        <div className="text-center" style={{padding:'0 30px', maxHeight: 160}}>
            <p className="app-modal-text" onClick={() => copyToClipboard(text)}>{text}</p>
            <p>If the error persists, <a style={{cursor: 'pointer'}} onClick={() => {onSetAppModalErrorState({isActive: false});onPushScreen(SCREEN_HELP_TAWK);}}><u><i>contact us</i></u></a> for support.</p>
        </div>
        <button
            className="btn"
            onClick={() => onSetAppModalErrorState({isActive: false})}
        >
            Got it
        </button>
    </div>
) : null;

const mapStateToProps = (state) => ({
    isActive: state.appState.appModalErrorState.isActive,
    text: state.appState.appModalErrorState.text
});

const mapDispatchToProps = (dispatch) => ({
    onPushScreen: (screen) => dispatch({screen, type: ACTION_PUSH_SCREEN}),
    onSetAppModalErrorState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_ERROR_STATE})
});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorBody);
