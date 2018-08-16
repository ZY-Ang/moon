/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './Navbar.css';
import {TAB_GROUP_AUTH} from "./constants";
import FaIcon from "../misc/fontawesome/FaIcon";

class Navbar extends Component {
    changeTab = (index) => (event) => {
        this.props.changeTab(index);
        if (event) {
            event.preventDefault();
        }
    };

    render() {
        return (
            <div id="moon-navbar">
                {
                    TAB_GROUP_AUTH.navTabs.map((tab, index) => {
                        const tabObject = TAB_GROUP_AUTH[tab];
                        return (
                            <div
                                key={index}
                                onClick={this.changeTab(tabObject.index)}
                                className={`moon-navbar-item${(this.props.activeTab === tabObject.index) ? ' active' : ''}`}
                            >
                                <div>
                                    <FaIcon icon={tabObject.icon}/>
                                </div>
                                <div className="moon-navbar-item-text">
                                    {tabObject.name}
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

export default Navbar;
