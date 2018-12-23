/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import './SuccessBody.css';
import thumbsUpEmoji from "../../../../../../../assets/emoji/windows10/thumbs-up-sign_1f44d.png";
import {connect} from "react-redux";
import {ACTION_SET_APP_MODAL_SUCCESS_STATE} from "../../../../redux/reducers/constants";
import AppRuntime from "../../../../browser/AppRuntime";

const SuccessBody = ({isActive, text, onSetAppModalSuccessState}) => !!isActive && !!onSetAppModalSuccessState ? (
    <div className="app-modal">
        <div
            style={{width: 80, height: 80, borderWidth: 4, borderStyle: 'solid', borderColor: 'rgb(76, 174, 76)', borderRadius: '50%', margin: '20px auto', position: 'relative', boxSizing: 'content-box'}}
        >
            <div style={{borderRadius: '120px 0px 0px 120px', position: 'absolute', width: 60, height: 100, background: 'white', transform: 'rotate(-45deg)', top: -7, left: -33, transformOrigin: '60px 60px 0px'}}/>
            <span style={{height: 5, backgroundColor: 'rgb(92, 184, 92)', display: 'block', borderRadius: 2, position: 'absolute', zIndex: 2, width: 25, left: 14, top: 46, transform: 'rotate(45deg)', animation: 'animateSuccessTip 0.75s'}}/>
            <span style={{height: 5, backgroundColor: 'rgb(92, 184, 92)', display: 'block', borderRadius: 2, position: 'absolute', zIndex: 2, width: 47, right: 8, top: 38, transform: 'rotate(-45deg)', animation: 'animateSuccessLong 0.75s'}}/>
            <div style={{width: 80, height: 80, border: '4px solid rgba(92, 184, 92, 0.2)', borderRadius: '50%', boxSizing: 'content-box', position: 'absolute', left: -4, top: -4, zIndex: 2}}/>
            <div style={{width: 5, height: 90, backgroundColor: 'rgb(255, 255, 255)', position: 'absolute', left: 28, top: 8, zIndex: 1, transform: 'rotate(-45deg)'}}/>
            <div style={{borderRadius: '0px 120px 120px 0px', position: 'absolute', width: 60, height: 120, background: 'white', transform: 'rotate(-45deg)', top: -11, left: 30, transformOrigin: '0px 60px 0px', animation: 'rotatePlaceholder 4.25s ease-in'}}/>
        </div>
        <div className="text-center" style={{padding:'0 30px'}}>
            <p>{text}</p>
        </div>
        <button
            className="btn btn-primary-outline"
            onClick={() => onSetAppModalSuccessState({isActive: false})}
        >
            <span role="img" aria-label="Ok"><img alt="Ok" src={AppRuntime.getURL(thumbsUpEmoji)}/></span> Ok
        </button>
    </div>
) : null;

const mapStateToProps = (state) => ({
    isActive: state.appState.appModalSuccessState.isActive,
    text: state.appState.appModalSuccessState.text
});

const mapDispatchToProps = (dispatch) => ({
    onSetAppModalSuccessState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_SUCCESS_STATE})
});

export default connect(mapStateToProps, mapDispatchToProps)(SuccessBody);
