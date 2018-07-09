/*
 * Copyright (c) 2018 moon
 */
import React, {Component} from 'react';
import './SettingsTab.css';
import {Menu} from "antd";
import {connect} from "react-redux";
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const MenuItemGroup = Menu.ItemGroup;

const KEY_SIGN_OUT = "keysignout";
const KEY_HOW_IT_WORKS = "keyhowitworks";

class SettingsTab extends Component {
    handleClick = (e) => {
        console.log('click ', e);
        const {onSetAuthUser} = this.props;
        switch (e.key) {
            case KEY_SIGN_OUT:
                onSetAuthUser(null);
                return;
        }
    };

    handleMenuClick = (event) => {
        console.log("submenu got clicked");
    };

    render() {
        return (
            <Menu
                onClick={this.handleClick}
                onOpenChange={this.handleMenuClick}
                style={{width: '100%'}}
                defaultSelectedKeys={[]}
                defaultOpenKeys={[]}
                mode="inline"
            >
                <MenuItem key={KEY_HOW_IT_WORKS}>
                    <span className="moon-settings-menu">
                        <FontAwesomeIcon icon="question"/>
                        <span>How it works</span>
                    </span>
                </MenuItem>
                <SubMenu
                    key="sub1"
                    title={
                        <span className="moon-settings-menu">
                            <FontAwesomeIcon icon="user"/>
                            <span>User</span>
                        </span>
                    }
                >
                    <MenuItem key="1">Update Email</MenuItem>
                    <MenuItem key="2">Change Password</MenuItem>
                </SubMenu>
                <SubMenu
                    key="sub2"
                    title={
                        <span className="moon-settings-menu">
                            <FontAwesomeIcon icon="wallet" />
                            <span>Wallets</span>
                        </span>
                    }
                >
                    <MenuItem key="5">Coinbase</MenuItem>
                    <MenuItem key="6">Kraken</MenuItem>
                    <SubMenu key="sub3" title="Manual">
                        <MenuItem key="7">Bitcoin</MenuItem>
                        <MenuItem key="8">Ethereum</MenuItem>
                        <MenuItem key="9">Litecoin</MenuItem>
                    </SubMenu>
                </SubMenu>
                <SubMenu
                    key="sub4"
                    title={
                        <span className="moon-settings-menu">
                            <FontAwesomeIcon icon="info" /><span>Info</span>
                        </span>
                    }
                >
                    <MenuItem key="10">About</MenuItem>
                    <MenuItem key="11">Support</MenuItem>
                    <MenuItem key="12">Terms & Conditions</MenuItem>
                    <MenuItem key="13">Privacy Policy</MenuItem>
                </SubMenu>
                <MenuItem key={KEY_SIGN_OUT}>
                    <span className="moon-settings-menu">
                        <FontAwesomeIcon icon="sign-out-alt"/>
                        <span>Sign Out</span>
                    </span>
                </MenuItem>
            </Menu>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default connect(null, mapDispatchToProps)(SettingsTab);
