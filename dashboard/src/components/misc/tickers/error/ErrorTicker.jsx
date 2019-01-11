/*
 * Copyright (c) 2019 moon
 */

import React from "react";
import "./ErrorTicker.css";

class ErrorTicker extends React.Component {
    render() {
        return (
            <div style={{width: 80, height: 80, borderWidth: 4, borderStyle: 'solid', borderColor: 'rgb(212, 63, 58)', borderRadius: '50%', margin: '20px auto', position: 'relative', boxSizing: 'content-box', animation: 'animateErrorIcon 0.5s'}}>
                <span style={{position: 'relative', display: 'block', animation: 'animateXMark 0.5s'}}>
                    <span style={{position: 'absolute', height: 5, width: 47, backgroundColor: 'rgb(217, 83, 79)', display: 'block', top: 37, borderRadius: 2, transform: 'rotate(45deg)', left: 17}}/>
                    <span style={{position: 'absolute', height: 5, width: 47, backgroundColor: 'rgb(217, 83, 79)', display: 'block', top: 37, borderRadius: 2, transform: 'rotate(-45deg)', right: 16}}/>
                </span>
            </div>
        );
    }
}

export default ErrorTicker;
