/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';

class PayTab extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="moon-tab text-center">
                <h2>Site Title</h2>
                TODO: Cart icon or product icon
                TODO: Total value
                <button>Pay</button>
                TODO: Wallet selection Dropdown menu (Use chrome.storage.local for readonly store of user data to bypass need for Redux)
            </div>
        );
    }
}

export default PayTab;
