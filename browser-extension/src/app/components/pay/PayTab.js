/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import AppRuntime from "../../browser/AppRuntime";
import {REQUEST_TEST_FUNCTION} from "../../../constants/events/appEvents";

class PayTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSuccess: false,
            isError: false
        };
    }

    onTest = () => {
        this.setState(() => ({
            isSuccess: false,
            isError: false
        }));
        const params = this.state;
        AppRuntime.sendMessage(REQUEST_TEST_FUNCTION, {params})
            .then(response => {
                console.log("%cTEST FUNCTION SUCCEEDED. Response:", 'background: #6b0; color: #fff', response);
                if (response.success) {
                    this.setState(() => ({
                        isSuccess: true,
                        isError: false
                    }));
                } else {
                    throw response;
                }
            })
            .catch(err => {
                console.error("TEST FUNCTION FAILED. Error:", err);
                this.setState(() => ({
                    isSuccess: false,
                    isError: true
                }));
            })
            .finally(() => window.URL.revokeObjectURL(this.state.file.url));
    };

    render() {
        return (
            <div className="moon-tab">
                <h1>I am a pay tab</h1>
                {
                    process.env.NODE_ENV !== 'production' &&
                    <div>
                        <input
                            type="text"
                            placeholder="key"
                            value={this.state.key}
                            onChange={event => {
                                const key = event.target.value;
                                this.setState(() => ({key}));
                            }}
                        />
                        <input
                            type="text"
                            placeholder="secret"
                            value={this.state.secret}
                            onChange={event => {
                                const secret = event.target.value;
                                this.setState(() => ({secret}));
                            }}
                        />
                        <button onClick={this.onTest}>I am a test button</button>
                        {this.state.isSuccess && <p style={{color: 'green'}}>Test function succeeded</p>}
                        {this.state.isError && <p style={{color: 'red'}}>Test function failed</p>}
                    </div>
                }
            </div>
        );
    }
}

export default PayTab;
