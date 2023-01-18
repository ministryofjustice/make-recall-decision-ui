/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AdditionalLicenceConditionOption } from './AdditionalLicenceConditionOption';
import type { SelectedOption } from './SelectedOption';

export type AdditionalLicenceConditions = {
    selected?: Array<string>;
    selectedOptions?: Array<SelectedOption>;
    allOptions?: Array<AdditionalLicenceConditionOption>;
};

