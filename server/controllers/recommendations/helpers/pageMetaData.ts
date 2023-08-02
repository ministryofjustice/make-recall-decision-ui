import { AppError } from '../../../AppError'
import { validateRecallType } from '../recallType/formValidator'
import { inputDisplayValuesRecallType } from '../recallType/inputDisplayValues'
import { validateArrestIssues } from '../arrestIssues/formValidator'
import { inputDisplayValuesArrestIssues } from '../arrestIssues/inputDisplayValues'
import { validateRecallTypeIndeterminate } from '../recallTypeIndeterminate/formValidator'
import { inputDisplayValuesRecallTypeIndeterminate } from '../recallTypeIndeterminate/inputDisplayValues'
import { validateOffenceAnalysis } from '../offenceAnalysis/formValidator'
import { inputDisplayValuesOffenceAnalysis } from '../offenceAnalysis/inputDisplayValues'
import { validatePreviousReleases } from '../previousReleases/formValidator'
import { validateAddPreviousRelease } from '../addPreviousRelease/formValidator'
import { inputDisplayValuesAddPreviousRelease } from '../addPreviousRelease/inputDisplayValues'
import { validateRosh } from '../rosh/formValidator'
import { inputDisplayValuesRosh } from '../rosh/inputDisplayValues'
import { PageMetaData } from '../../../@types/pagesForms'
import { validatePreviousRecalls } from '../previousRecalls/formValidator'
import { validateAddPreviousRecall } from '../addPreviousRecall/formValidator'
import { inputDisplayValuesAddPreviousRecall } from '../addPreviousRecall/inputDisplayValues'
import { inputDisplayValuesCustodyStatus } from '../custodyStatus/inputDisplayValues'
import { validateCustodyStatus } from '../custodyStatus/formValidator'

/* The PageMetaData properties explained:
 * id - used as a key to get the page title. Also the name of the nunjucks HTML template
 * validator - will be called by postRecommendationForm, with the submitted form values
 * inputDisplayValues - called by getRecommendationPage, used to determine what input values to render, using errors / unsaved values / API values
 * reviewedProperty - used to mark a property on the recommendation record as 'reviewed'
 * propertyToRefresh - ask the API to refresh its copy of this data property, from its upstream services
 *  */
export const pageMetaData = (pageUrlSlug?: string): PageMetaData => {
  switch (pageUrlSlug) {
    case 'arrest-issues':
      return {
        id: 'arrestIssues',
        validator: validateArrestIssues,
        inputDisplayValues: inputDisplayValuesArrestIssues,
      }
    case 'add-previous-release':
      return {
        id: 'addPreviousRelease',
        validator: validateAddPreviousRelease,
        inputDisplayValues: inputDisplayValuesAddPreviousRelease,
      }

    case 'add-previous-recall':
      return {
        id: 'addPreviousRecall',
        validator: validateAddPreviousRecall,
        inputDisplayValues: inputDisplayValuesAddPreviousRecall,
      }
    case 'previous-releases':
      return {
        id: 'previousReleases',
        propertyToRefresh: 'previousReleases',
        validator: validatePreviousReleases,
      }
    case 'offence-analysis':
      return {
        id: 'offenceAnalysis',
        propertyToRefresh: 'indexOffenceDetails',
        validator: validateOffenceAnalysis,
        inputDisplayValues: inputDisplayValuesOffenceAnalysis,
      }
    case 'rosh':
      return {
        id: 'rosh',
        propertyToRefresh: 'riskOfSeriousHarm',
        validator: validateRosh,
        inputDisplayValues: inputDisplayValuesRosh,
      }
    case 'previous-recalls':
      return {
        id: 'previousRecalls',
        propertyToRefresh: 'previousRecalls',
        validator: validatePreviousRecalls,
      }

    case 'recall-type':
      // ALREADY MIGRATED
      return {
        id: 'recallType',
        validator: validateRecallType,
        inputDisplayValues: inputDisplayValuesRecallType,
      }
    case 'custody-status':
      // ALREADY MIGRATED
      return {
        id: 'custodyStatus',
        validator: validateCustodyStatus,
        inputDisplayValues: inputDisplayValuesCustodyStatus,
      }
    case 'recall-type-indeterminate':
      // ALREADY MIGRATED
      return {
        id: 'recallTypeIndeterminate',
        validator: validateRecallTypeIndeterminate,
        inputDisplayValues: inputDisplayValuesRecallTypeIndeterminate,
      }
    default:
      throw new AppError(`getPageMetaData - invalid pageUrlSlug: ${pageUrlSlug}`, { status: 404 })
  }
}
