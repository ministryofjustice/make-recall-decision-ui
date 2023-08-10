export type CvlLicenceConditionsBreached = {
  standardLicenceConditions?: LicenceConditionSection;
  additionalLicenceConditions?: LicenceConditionSection;
  bespokeLicenceConditions?: LicenceConditionSection;
};

export type LicenceConditionSection = {
  selected: string[],
  allOptions: LicenceConditionOption[]
}

export type LicenceConditionOption = {
  code: string,
  text: string
}
