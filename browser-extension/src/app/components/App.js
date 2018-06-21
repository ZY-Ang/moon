/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import logo from '../../../../assets/icons/logo_300_text.png';
import {MOON_DIV_ID} from "../../constants/dom";

class App extends Component {
    constructor() {
        super();
        this.state = {
            isMaximized: true
        };
    }

    componentDidMount() {
        console.log("Component Mounted");
    }

    onToggleMaximize = () => {
        this.setState(() => ({isMaximized: !this.state.isMaximized}));
    };

    onClose = () => {
        const moonDiv = document.getElementById(MOON_DIV_ID);
        if (!!moonDiv) {
            moonDiv.remove();
        }
    };

    render() {
        return (
            <div>
                <div id="moon-navbar">
                    <img id="moon-header-img" src={chrome.extension.getURL(logo)} alt="Moon"/>
                    <div id="moon-navbar-buttons-div">
                        <button onClick={this.onToggleMaximize}>
                            +
                        </button>
                        <button onClick={this.onClose}>
                            X
                        </button>
                    </div>
                </div>
                <div>
                    {
                        this.state.isMaximized &&
                        <p>Welcome to {this.props.source}!</p>
                    }
                </div>
            </div>
        );
    }
}

export default App
