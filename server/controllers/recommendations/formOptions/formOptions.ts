import { recallType } from '../recallType/formOptions'
import { custodyStatus } from '../custodyStatus/formOptions'

import { standardLicenceConditions } from './licenceConditions'
import { hasVictimsInContactScheme } from '../victimContactScheme/formOptions'
import { alternativesToRecallTried } from '../alternativesToRecallTried/formOptions'
import { isUnderIntegratedOffenderManagement } from '../integratedOffenderManagement/formOptions'
import { vulnerabilities } from '../vulnerabilities/formOptions'
import { indeterminateSentenceType } from '../indeterminateSentenceType/formOptions'
import { recallTypeIndeterminate, recallTypeIndeterminateApi } from '../recallTypeIndeterminate/formOptions'
import { indeterminateOrExtendedSentenceDetails } from '../indeterminateOrExtendedSentenceDetails/formOptions'
import { whyConsideredRecall } from '../whyConsideredRecall/formOptions'
import { howWillAppointmentHappen } from '../nextAppointment/formOptions'
import { renderTemplateString } from '../../../utils/nunjucks'
import { yesNo } from './yesNo'
import { roshLevels } from '../rosh/formOptions'
import { UiListItem } from '../../../@types/pagesForms'
import { spoRecallTypeEnum } from './spoRecallTypeEnum'
import { rationaleCheck } from '../rationaleCheck/formOptions'

export const formOptions = {
  recallType,
  rationaleCheck,
  spoRecallTypeEnum,
  recallTypeIndeterminate,
  recallTypeIndeterminateApi,
  standardLicenceConditions,
  custodyStatus,
  alternativesToRecallTried,
  vulnerabilities,
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
