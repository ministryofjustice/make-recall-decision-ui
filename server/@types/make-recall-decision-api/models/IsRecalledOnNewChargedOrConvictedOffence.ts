/* tslint:disable */
/* eslint-disable */

import type { TextValueOption } from "./TextValueOption";

export type IsRecalledOnNewChargedOrConvictedOffence = {
  selected?: IsRecalledOnNewChargedOrConvictedOffence.selected;
  allOptions?: Array<TextValueOption>;
}

export namespace IsRecalledOnNewChargedOrConvictedOffence {
  export enum selected {
    ONLY_CHARGED = 'ONLY_CHARGED',
    CHARGED_AND_CONVICTED = 'CHARGED_AND_CONVICTED',
    NO = 'NO',
  }
}
