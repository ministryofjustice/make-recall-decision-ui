import { CVLLicenceCondition } from "./CVLLicenceCondition";

export type CVLLicence = {
  licenceStartDate?: string,
  topupSupervisionStartDate?: string,
  actualReleaseDate?: string,
  licenceExpiryDate?: string,
  conditionalReleaseDate?: string,
  topupSupervisionExpiryDate?: string,
  sentenceStartDate?: string,
  sentenceEndDate?: string,
  bespokeConditions: Array<CVLLicenceCondition>,
  standardLicenceConditions: Array<CVLLicenceCondition>,
  additionalLicenceConditions: Array<CVLLicenceCondition>,
};
