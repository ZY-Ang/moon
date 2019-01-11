import React from "react";
import BackButton from "../../BackButton";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_GET_ID_JWTOKEN, REQUEST_TEST_FUNCTION} from "../../../../../constants/events/appEvents";
import {copyToClipboard} from "../../../../utils/dom";

class DevelopersScreen extends React.Component {
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
                moonLogger.log("%cTEST FUNCTION SUCCEEDED. Response:", 'background: #6b0; color: #fff', response);
                this.setState(() => ({
                    isSuccess: true,
                    isError: false
                }));
            })
            .catch(err => {
                moonLogger.error("TEST FUNCTION FAILED. Error:", err);
                this.setState(() => ({
                    isSuccess: false,
                    isError: true
                }));
            })
            .finally(() => window.URL.revokeObjectURL(this.state.file.url));
    };

    getIdToken = () => {
        moonLogger.log("getIdToken");
        AppRuntime.sendMessage(REQUEST_GET_ID_JWTOKEN)
            .then(response => copyToClipboard(response))
            .then(res => moonLogger.log(res))
            .then(() => this.setState(() => ({idJWToken: "Copied to clipboard"})))
            .catch(err => {
                this.setState(() => ({idJWToken: "Error. Check logs"}));
                moonLogger.error(err);
            });
    };

    render() {
        return (
            <div className="moon-mainflow-screen" style={{display: 'flex', flexDirection: 'column'}}>
                <BackButton/>
                <h1 style={{textAlign: 'center'}}>Developers</h1>
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

                <button className="btn btn-primary mt-auto" onClick={this.getIdToken}>Get idToken</button>
                <div className="text-center my-3">{this.state.idJWToken}</div>
            </div>
        );
    }
}

export default DevelopersScreen;
