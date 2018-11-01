/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import './ErrorBody.css';
import {ACTION_SET_APP_MODAL_STATE} from "../../../../redux/reducers/constants";
import connect from "react-redux/es/connect/connect";

const ErrorBody = ({errorText, onSetAppModalState}) => (
    <div className="app-modal">
        <div
            style={{width: 80, height: 80, borderWidth: 4, borderStyle: 'solid', borderColor: 'rgb(212, 63, 58)', borderRadius: '50%', margin: '20px auto', position: 'relative', boxSizing: 'content-box', animation: 'animateErrorIcon 0.5s'}}
        >
            <span style={{position: 'relative', display: 'block', animation: 'animateXMark 0.5s'}}>
                <span style={{position: 'absolute', height: 5, width: 47, backgroundColor: 'rgb(217, 83, 79)', display: 'block', top: 37, borderRadius: 2, transform: 'rotate(45deg)', left: 17}}/>
                <span style={{position: 'absolute', height: 5, width: 47, backgroundColor: 'rgb(217, 83, 79)', display: 'block', top: 37, borderRadius: 2, transform: 'rotate(-45deg)', right: 16}}/>
            </span>
        </div>
        <p>{errorText}</p>
        <button
            className="btn"
            onClick={() => {if (onSetAppModalState) {onSetAppModalState({isActive: false})}}}
        >
            Oh man
        </button>
    </div>
);

const mapDispatchToProps = (dispatch) => ({
    onSetAppModalState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_STATE})
});

export default connect(null, mapDispatchToProps)(ErrorBody);
