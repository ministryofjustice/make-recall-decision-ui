import custodyStatus from '../custodyStatus/formOptions'
import recallType from '../recallType/formOptions'

import { UiListItem } from '../../../@types/pagesForms'
import { renderTemplateString } from '../../../utils/nunjucks'
import alternativesToRecallTried from '../alternativesToRecallTried/formOptions'
import indeterminateOrExtendedSentenceDetails from '../indeterminateOrExtendedSentenceDetails/formOptions'
import indeterminateSentenceType from '../indeterminateSentenceType/formOptions'
import isUnderIntegratedOffenderManagement from '../integratedOffenderManagement/formOptions'
import howWillAppointmentHappen from '../nextAppointment/formOptions'
import rationaleCheck from '../rationaleCheck/formOptions'
import recallTypeExtended from '../recallTypeExtended/formOptions'
import { recallTypeIndeterminate, recallTypeIndeterminateApi } from '../recallTypeIndeterminate/formOptions'
import roshLevels from '../rosh/formOptions'
import hasVictimsInContactScheme from '../victimContactScheme/formOptions'
import { vulnerabilities, vulnerabilitiesRiskToSelf } from '../vulnerabilities/formOptions'
import whyConsideredRecall from '../whyConsideredRecall/formOptions'
import standardLicenceConditions from './licenceConditions'
import spoRecallTypeEnum from './spoRecallTypeEnum'
import yesNo from './yesNo'

export type FormOption = {
  value: string
  text: string
  detailsLabel?: string
}

type FormOptionsType = {
  [key: string]: FormOption[]
}

export const formOptions: FormOptionsType = {
  recallType,
  rationaleCheck,
  spoRecallTypeEnum,
  recallTypeIndeterminate,
  recallTypeExtended,
  recallTypeIndeterminateApi,
  standardLicenceConditions,
  custodyStatus,
  alternativesToRecallTried,
  vulnerabilities,
  vulnerabilitiesRiskToSelf,
  indeterminateSentenceType,
  indeterminateOrExtendedSentenceDetails,
  whyConsideredRecall,
  howWillAppointmentHappen,
  yesNo,
  hasVictimsInContactScheme,
  isUnderIntegratedOffenderManagement,
  roshLevels,
}

export const isValueValid = (val: string, optionId: string) =>
  Boolean(formOptions[optionId].find((option: UiListItem) => option.value === val))

export const optionTextFromValue = (val: string, optionId: string) =>
  formOptions[optionId].find((option: UiListItem) => option.value === val)?.text

export const renderFormOptions = (renderParams: Record<string, string>): Record<string, UiListItem[]> => {
  const copy: Record<string, UiListItem[]> = {}
  Object.keys(formOptions).forEach(key => {
    const options = formOptions[key]
    copy[key] = options.map((option: UiListItem) => ({
      ...option,
      text: renderTemplateString(option.text, renderParams),
    }))
  })
  return copy
}
