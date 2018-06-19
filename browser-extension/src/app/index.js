import React from 'react';
import ReactDOM from 'react-dom';
import logo from '../logo.svg';
import '../index.css';

import Button from './components/Button';
import {MOON_DIV_ID} from "../constants/dom";

// try {
//     var promoInput = document.getElementById('spc-gcpromoinput');
//     promoInput.value = "95UF-HDQQAT-3N62";
// // input.remove();
//
//     var submitButton = document.getElementById('gcApplyButtonId');
//     submitButton.click();
//     // todo: check for message "You successfully redeemed your gift card"
// } catch (e) {
//     console.error(e);
// }

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            logoUrl: chrome.extension.getURL(logo)
        };
    }

    render() {
        return (
            <div>
                {this.state.logoUrl && <img src={this.state.logoUrl} alt="Moon Logo"/>}
                Welcome to moon!
                <Button />
            </div>
        )
    }
}

// Message Listener function
chrome.runtime.onMessage.addListener((request, sender, response) => {
    // If message is injectApp
    if(request.injectApp) {
        // Inject our app to DOM and send response
        injectApp();
        response({
            startedExtension: true,
        });
    }
});

function injectApp() {
    const newDiv = document.createElement("div");
    newDiv.setAttribute("id", MOON_DIV_ID);
    document.body.appendChild(newDiv);
    ReactDOM.render(<App />, newDiv);
}