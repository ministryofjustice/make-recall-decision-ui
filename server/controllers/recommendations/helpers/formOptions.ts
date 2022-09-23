import { recallType } from '../recallType/formOptions'
import { custodyStatus } from '../custodyStatus/formOptions'
import { isThisAnEmergencyRecall } from '../emergencyRecall/formOptions'
import { ObjectMap, UiListItem } from '../../../@types'
import { standardLicenceConditions } from '../formOptions/licenceConditions'
import { hasVictimsInContactScheme } from '../victimContactScheme/formOptions'
import { alternativesToRecallTried } from '../alternativesToRecallTried/formOptions'
import { hasArrestIssues } from '../arrestIssues/formOptions'
import { isUnderIntegratedOffenderManagement } from '../integratedOffenderManagement/formOptions'
import { vulnerabilities } from '../vulnerabilities/formOptions'
import { hasContrabandRisk } from '../contraband/formOptions'
import { isIndeterminateSentence } from '../isIndeterminateSentence/formOptions'
import { indeterminateSentenceType } from '../indeterminateSentenceType/formOptions'
import { isExtendedSentence } from '../isExtendedSentence/formOptions'
import { recallTypeIndeterminate } from '../recallTypeIndeterminate/formOptions'
import { hasFixedTermLicenceConditions } from '../fixedTermAdditionalLicenceConditions/formOptions'
import { indeterminateOrExtendedSentenceDetails } from '../indeterminateOrExtendedSentenceDetails/formOptions'
import { whyConsideredRecall } from '../whyConsideredRecall/formOptions'
import { howWillAppointmentHappen } from '../nextAppointment/formOptions'
import { renderTemplateString } from '../../../utils/nunjucks'
import { isMainAddressWherePersonCanBeFound } from '../addressDetails/formOptions'

export const formOptions = {
  recallType,
  recallTypeIndeterminate,
  standardLicenceConditions,
  isThisAnEmergencyRecall,
  custodyStatus,
  hasVictimsInContactScheme,
  alternativesToRecallTried,
  hasArrestIssues,
  isUnderIntegratedOffenderManagement,
  vulnerabilities,
  hasContrabandRisk,
  isIndeterminateSentence,
  indeterminateSentenceType,
  isExtendedSentence,
  hasFixedTermLicenceConditions,
  indeterminateOrExtendedSentenceDetails,
  whyConsideredRecall,
  howWillAppointmentHappen,
  isMainAddressWherePersonCanBeFound,
}

export const isValueValid = (val: string, optionId: string) =>
  Boolean(formOptions[optionId].find((option: UiListItem) => option.value === val))

export const optionTextFromValue = (val: string, optionId: string) =>
  formOptions[optionId].find((option: UiListItem) => option.value === val)?.text

export const renderFormOptions = (renderParams: ObjectMap<string>): ObjectMap<UiListItem[]> => {
  const copy = {}
  Object.keys(formOptions).forEach(key => {
    const options = formOptions[key]
    copy[key] = options.map((option: UiListItem) => ({
      ...option,
      text: renderTemplateString(option.text, renderParams),
    }))
  })
  return copy
}
