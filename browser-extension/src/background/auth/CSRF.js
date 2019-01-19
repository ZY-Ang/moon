/*
 * Copyright (c) 2019 moon
 */

import {generate as randomstring} from "randomstring";

class CSRF {
    static state = randomstring(8);

    static generateNewState = () => {
        CSRF.state = randomstring(8);
        return CSRF.state;
    };

    static getState = () => CSRF.state;
}

export default CSRF;
