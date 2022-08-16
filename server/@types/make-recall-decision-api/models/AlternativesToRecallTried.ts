/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SelectedAlternative } from './SelectedAlternative';
import type { TextValueOption } from './TextValueOption';

export type AlternativesToRecallTried = {
    selected?: Array<SelectedAlternative>;
    allOptions?: Array<TextValueOption>;
};
