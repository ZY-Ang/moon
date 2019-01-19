import React from "react";
import BackButton from "../../BackButton";
import AppRuntime from "../../../../browser/AppRuntime";
import {REQUEST_GET_ID_JWTOKEN, REQUEST_TEST_FUNCTION} from "../../../../../constants/events/appEvents";
import {copyToClipboard} from "../../../../utils/dom";
import appLogger from "../../../../utils/AppLogger";
import AppMixpanel from "../../../../services/AppMixpanel";

class DevelopersScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSuccess: false,
            isError: false
        };
    }

    componentDidMount() {
        AppMixpanel.track('view_screen_developers');
    }

    onTest = () => {
        this.setState(() => ({
            isSuccess: false,
            isError: false
        }));
        const params = this.state;
        AppRuntime.sendMessage(REQUEST_TEST_FUNCTION, {params})
            .then(response => {
                appLogger.log("%cTEST FUNCTION SUCCEEDED. Response:", 'background: #6b0; color: #fff', response);
                this.setState(() => ({
                    isSuccess: true,
                    isError: false
                }));
            })
            .catch(err => {
                appLogger.error("TEST FUNCTION FAILED. Error:", err);
                this.setState(() => ({
                    isSuccess: false,
                    isError: true
                }));
            })
            .finally(() => window.URL.revokeObjectURL(this.state.file.url));
    };

    getIdToken = () => {
        appLogger.log("getIdToken");
        AppRuntime.sendMessage(REQUEST_GET_ID_JWTOKEN)
            .then(res => copyToClipboard(res))
            .then(res => appLogger.log(res))
            .then(() => this.setState(() => ({idJWToken: "Copied to clipboard"})))
            .catch(err => {
                this.setState(() => ({idJWToken: "Error. Check logs"}));
                appLogger.error(err);
            });
    };

    render() {
        return (
            <div className="moon-mainflow-screen" style={{display: 'flex', flexDirection: 'column'}}>
                <BackButton/>
                <h1 style={{textAlign: 'center'}}>Developers</h1>
                <button className="btn btn-primary my-3" onClick={() => appLogger.error("I am an error")}>Log an error</button>
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
