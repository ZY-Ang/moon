/*
 * Copyright (c) 2019 moon
 */

import React from "react";
import "./SuccessTicker.css";

class SuccessTicker extends React.Component {
    render() {
        return (
            <div
                style={{width: 80, height: 80, borderWidth: 4, borderStyle: 'solid', borderColor: 'rgb(76, 174, 76)', borderRadius: '50%', margin: '20px auto', position: 'relative', boxSizing: 'content-box'}}>
                <div style={{borderRadius: '120px 0px 0px 120px', position: 'absolute', width: 60, height: 100, background: 'transparent', transform: 'rotate(-45deg)', top: -7, left: -33, transformOrigin: '60px 60px 0px'}}/>
                <span style={{height: 5, backgroundColor: 'rgb(92, 184, 92)', display: 'block', borderRadius: 2, position: 'absolute', zIndex: 2, width: 25, left: 14, top: 46, transform: 'rotate(45deg)', animation: 'animateSuccessTip 0.75s'}}/>
                <span style={{height: 5, backgroundColor: 'rgb(92, 184, 92)', display: 'block', borderRadius: 2, position: 'absolute', zIndex: 2, width: 47, right: 8, top: 38, transform: 'rotate(-45deg)', animation: 'animateSuccessLong 0.75s'}}/>
                <div style={{width: 80, height: 80, border: '4px solid rgba(92, 184, 92, 0.2)', borderRadius: '50%', boxSizing: 'content-box', position: 'absolute', left: -4, top: -4, zIndex: 2}}/>
                <div style={{width: 5, height: 90, backgroundColor: 'rgba(255, 255, 255, 0)', position: 'absolute', left: 28, top: 8, zIndex: 1, transform: 'rotate(-45deg)'}}/>
                <div style={{borderRadius: '0px 120px 120px 0px', position: 'absolute', width: 60, height: 120, background: 'transparent', transform: 'rotate(-45deg)', top: -11, left: 30, transformOrigin: '0px 60px 0px', animation: 'rotatePlaceholder 4.25s ease-in'}}/>
            </div>
        );
    }
}

export default SuccessTicker;
