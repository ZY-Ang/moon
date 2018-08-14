/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import AppRuntime from "../../browser/AppRuntime";
import {REQUEST_TEST_FUNCTION} from "../../../constants/events/app";
import {getFormattedFileForS3} from "../../utils/file";

class PayTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fib: "0",
            file: null,
            isSuccess: false,
            isError: false
        };
    }

    onTest = () => {
        this.setState(() => ({
            isSuccess: false,
            isError: false
        }));
        const params = this.state.file;
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
                    process.env.BUILD_ENV !== 'production' &&
                    <div>
                        <input
                            type="file"
                            onChange={event =>
                                getFormattedFileForS3(event.target.files[0])
                                    .then(formattedFile => this.setState(() => ({file: formattedFile})))
                            }
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
