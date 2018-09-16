/*
 * Copyright (c) 2018 moon
 */

import {FontAwesomeIcon as FaIcon} from "@fortawesome/react-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faFacebook} from "@fortawesome/free-brands-svg-icons/faFacebook";
import {faGoogle} from "@fortawesome/free-brands-svg-icons/faGoogle";
import {faAmazon} from "@fortawesome/free-brands-svg-icons/faAmazon";
// import {} from "@fortawesome/free-regular-svg-icons";
import {faMinusCircle} from '@fortawesome/free-solid-svg-icons/faMinusCircle';
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import {faQuestion} from '@fortawesome/free-solid-svg-icons/faQuestion';
import {faUser} from '@fortawesome/free-solid-svg-icons/faUser';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faInfo} from '@fortawesome/free-solid-svg-icons/faInfo';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import {faMoon} from '@fortawesome/free-solid-svg-icons/faMoon';
import {faRocket} from '@fortawesome/free-solid-svg-icons/faRocket';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';

library.add(faFacebook, faGoogle, faAmazon);
library.add(faMinusCircle, faPlusCircle, faTimesCircle, faQuestion, faUser, faWallet, faInfo, faSignOutAlt, faMoon, faRocket, faCog);

export default FaIcon;
