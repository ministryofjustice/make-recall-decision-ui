/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RoshData = {
  riskToChildren?: RoshEnum;
  riskToPublic?: RoshEnum;
  riskToKnownAdult?: RoshEnum;
  riskToStaff?: RoshEnum;
  riskToPrisoners?: RoshEnum;
};

export enum RoshEnum {
  VERY_HIGH = 'VERY_HIGH',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}