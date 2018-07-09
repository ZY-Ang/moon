/*
 * Copyright (c) 2018 moon
 */

import React, {Component} from 'react';
import './AuthFlow.css';
import {Form, Input, Button, Checkbox} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {ACTION_SET_AUTH_USER} from "../../redux/reducers/constants";
import {compose} from "redux";
import {connect} from "react-redux";

const FormItem = Form.Item;

class AuthFlow extends Component {
    handleSubmit = (event) => {
        if (event) {
            event.preventDefault();
        }
        this.props.form.validateFields((err, values) => {
            if (!!err) {
                console.error('Failed to login: ', err);
            } else {
                console.log("Logging in: ", values);
                this.props.onSetAuthUser(true);
            }
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <div className="moon-tab" style={{paddingTop: '35%'}}>

                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                        {
                            getFieldDecorator('email', {
                                rules: [{
                                    required: true,
                                    message: 'Please input your email!'
                                }],
                            })(
                                <Input
                                    prefix={<FontAwesomeIcon icon="user" />}
                                    type="email"
                                    placeholder="Email"
                                />
                            )
                        }
                    </FormItem>
                    <FormItem>
                        {
                            getFieldDecorator('password', {
                                rules: [{
                                    required: true,
                                    message: 'Please input your Password!'
                                }],
                            })(
                                <Input
                                    prefix={<FontAwesomeIcon icon="lock" />}
                                    type="password"
                                    placeholder="Password"
                                />
                            )
                        }
                    </FormItem>
                    <FormItem>
                        {
                            getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(
                                <Checkbox className="login-form-remember">
                                    Remember me
                                </Checkbox>
                            )
                        }
                        <a className="login-form-forgot" href="">Forgot password</a>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>
                        Or <a href="">register now!</a>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAuthUser: (authUser) => dispatch({type: ACTION_SET_AUTH_USER, authUser}),
});

export default compose(
    Form.create(),
    connect(null, mapDispatchToProps)
)(AuthFlow);
