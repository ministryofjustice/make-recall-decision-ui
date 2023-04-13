/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import {DeliusOffence} from "./Offence";
import {Sentence} from "./Sentence";
import {LicenceCondition} from "./LicenceCondition";

export type Conviction = {
    mainOffence?: DeliusOffence;
    additionalOffences?: Array<DeliusOffence>;
    sentence?: Sentence;
    licenceConditions?: Array<LicenceCondition>;
};
