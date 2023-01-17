/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AdditionalLicenceConditionOption } from './AdditionalLicenceConditionOption';
import { SelectedLicenceConditionOption } from './SelectedLicenceConditionOption'

export type AdditionalLicenceConditions = {
    selected?: Array<string>;
    selectedOptions?: Array<SelectedLicenceConditionOption>;
    allOptions?: Array<AdditionalLicenceConditionOption>;
};

