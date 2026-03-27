import { FormValidatorArgs, FormValidatorReturn } from '../../../@types/pagesForms'
import { isValueValid } from '../formOptions/formOptions'
import { makeErrorObject } from '../../../utils/errors'
import { nextPageLinkUrl, nextPagePreservingFromPageAndAnchor } from '../helpers/urls'
import { SentenceGroup } from './formOptions'
import ppPaths from '../../../routes/paths/pp'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api/models/RecommendationResponse'
import { IndeterminateSentenceType } from '../../../@types/make-recall-decision-api/models/IndeterminateSentenceType'
import { indeterminateSentenceTypeFtr56 } from '../indeterminateSentenceType/formOptions'

const validateSentenceInformation = async ({ requestBody, urlInfo }: FormValidatorArgs): FormValidatorReturn => {
  const { sentenceGroup, previousSentenceGroup } = requestBody

  const errors = []
  if (!sentenceGroup || !isValueValid(sentenceGroup as SentenceGroup, 'sentenceGroup')) {
    const errorId = 'missingSentenceGroup'
    errors.push(
      makeErrorObject({
        id: 'sentenceGroup',
        text: 'Select a sentence group',
        errorId,
      }),
    )
  }

  if (errors.length > 0) {
    return {
      errors,
      unsavedValues: { sentenceGroup },
    }
  }

  // The hint field can't be stored in the DB, so we remove it here
  const apiCompatibleIndeterminateSentenceTypes = indeterminateSentenceTypeFtr56.map(({ value, text }) => ({
    value,
    text,
  }))

  const valuesToSave: Partial<RecommendationResponse> = {
    sentenceGroup: sentenceGroup as SentenceGroup,
  }
  if (!previousSentenceGroup || previousSentenceGroup === sentenceGroup) {
    if (sentenceGroup !== SentenceGroup.INDETERMINATE) {
      valuesToSave.indeterminateSentenceType = {
        selected: IndeterminateSentenceType.selected.NO,
        allOptions: apiCompatibleIndeterminateSentenceTypes,
      }
    }
  } else {
    switch (previousSentenceGroup as SentenceGroup) {
      case SentenceGroup.ADULT_SDS:
        valuesToSave.wasReferredToParoleBoard244ZB = null
        valuesToSave.wasRepatriatedForMurder = null
        valuesToSave.isServingSOPCSentence = null
        valuesToSave.isServingDCRSentence = null
        valuesToSave.isChargedWithOffence = null
        valuesToSave.isServingTerroristOrNationalSecurityOffence = null
        valuesToSave.isAtRiskOfInvolvedInForeignPowerThreat = null
        valuesToSave.isThisAnEmergencyRecall = null
        valuesToSave.fixedTermAdditionalLicenceConditions = null
        valuesToSave.recallType = null
        if (sentenceGroup !== SentenceGroup.YOUTH_SDS) {
          valuesToSave.isMappaCategory4 = null
          valuesToSave.isMappaLevel2Or3 = null
        }
        if (sentenceGroup === SentenceGroup.INDETERMINATE) {
          valuesToSave.indeterminateSentenceType = null
        } else {
          valuesToSave.indeterminateSentenceType = {
            selected: IndeterminateSentenceType.selected.NO,
            allOptions: apiCompatibleIndeterminateSentenceTypes,
          }
        }
        break
      case SentenceGroup.YOUTH_SDS:
        valuesToSave.isYouthSentenceOver12Months = null
        valuesToSave.isYouthChargedWithSeriousOffence = null
        valuesToSave.isThisAnEmergencyRecall = null
        valuesToSave.fixedTermAdditionalLicenceConditions = null
        valuesToSave.recallType = null
        if (sentenceGroup !== SentenceGroup.ADULT_SDS) {
          valuesToSave.isMappaCategory4 = null
          valuesToSave.isMappaLevel2Or3 = null
        }
        if (sentenceGroup === SentenceGroup.INDETERMINATE) {
          valuesToSave.indeterminateSentenceType = null
        } else {
          valuesToSave.indeterminateSentenceType = {
            selected: IndeterminateSentenceType.selected.NO,
            allOptions: apiCompatibleIndeterminateSentenceTypes,
          }
        }
        break
      case SentenceGroup.INDETERMINATE:
        valuesToSave.indeterminateSentenceType = {
          selected: IndeterminateSentenceType.selected.NO,
          allOptions: apiCompatibleIndeterminateSentenceTypes,
        }
        valuesToSave.isThisAnEmergencyRecall = null
        valuesToSave.recallType = null
        if (sentenceGroup !== SentenceGroup.EXTENDED) {
          valuesToSave.indeterminateOrExtendedSentenceDetails = null
        }
        break
      case SentenceGroup.EXTENDED:
        valuesToSave.isThisAnEmergencyRecall = null
        valuesToSave.recallType = null
        if (sentenceGroup !== SentenceGroup.INDETERMINATE) {
          valuesToSave.indeterminateSentenceType = {
            selected: IndeterminateSentenceType.selected.NO,
            allOptions: apiCompatibleIndeterminateSentenceTypes,
          }
          valuesToSave.indeterminateOrExtendedSentenceDetails = null
        } else {
          valuesToSave.indeterminateSentenceType = null
        }
        break
      default:
      // unknown previous group
    }
  }
  const nextPageId =
    sentenceGroup === SentenceGroup.INDETERMINATE ? ppPaths.indeterminateSentenceType : ppPaths.taskListConsiderRecall
  // In case of INDETERMINATE, always go to the /indeterminate-type page
  const nextPagePath =
    sentenceGroup === SentenceGroup.INDETERMINATE
      ? nextPagePreservingFromPageAndAnchor({ pageUrlSlug: 'indeterminate-type', urlInfo })
      : nextPageLinkUrl({ nextPageId, urlInfo })

  return {
    valuesToSave,
    nextPagePath,
  }
}

export default validateSentenceInformation
