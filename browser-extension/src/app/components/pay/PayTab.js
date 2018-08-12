/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import AppRuntime from "../../browser/AppRuntime";
import {REQUEST_TEST_FUNCTION} from "../../../constants/events/app";

class PayTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fib: "0",
            isSuccess: false,
            isError: false
        };
    }

    onTest = () => AppRuntime.sendMessage(REQUEST_TEST_FUNCTION, {params: {
            fib: parseInt(this.state.fib)
        }})
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
        });

    render() {
        return (
            <div className="moon-tab">
                <h1>I am a pay tab</h1>
                {
                    process.env.BUILD_ENV !== 'production' &&
                    <div>
                        <input
                            type="number"
                            onChange={event => {
                                const val = event.target.value;
                                this.setState(() => ({fib: val}));
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
