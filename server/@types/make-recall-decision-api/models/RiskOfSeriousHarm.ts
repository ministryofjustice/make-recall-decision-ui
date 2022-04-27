/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RiskLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW'

export type RiskOfSeriousHarm = {
  overallRisk: RiskLevel
  riskToChildren: RiskLevel
  riskToPublic: RiskLevel
  riskToKnownAdult: RiskLevel
  riskToStaff: RiskLevel
  riskToPrisoners: RiskLevel
  lastUpdated: string
}
