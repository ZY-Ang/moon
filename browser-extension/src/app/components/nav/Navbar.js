/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './Navbar.css';
import {TAB_GROUP_AUTH} from "./constants";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

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
                    TAB_GROUP_AUTH.navTabs.map(tab => {
                        const tabObject = TAB_GROUP_AUTH[tab];
                        return (
                            <div
                                onClick={this.changeTab(tabObject.index)}
                                className={`moon-navbar-item${(this.props.activeTab === tabObject.index) ? ' active' : ''}`}
                            >
                                <div style={{width: '100%', fontSize: 18}}>
                                    <FontAwesomeIcon icon={tabObject.icon}/>
                                </div>
                                <div style={{paddingTop: 4, width: '100%'}}>
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
