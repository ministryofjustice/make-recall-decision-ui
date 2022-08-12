import { PageMetaData } from '../../../@types'
import { AppError } from '../../../AppError'
import { strings } from '../../../textStrings/en'
import { validateRecallType } from '../recallType/formValidator'
import { validateCustodyStatus } from '../custodyStatus/formValidator'
import { inputDisplayValuesRecallType } from '../recallType/inputDisplayValues'
import { inputDisplayValuesCustodyStatus } from '../custodyStatus/inputDisplayValues'
import { validateResponseToProbation } from '../responseToProbation/formValidator'
import { inputDisplayValuesResponseToProbation } from '../responseToProbation/inputDisplayValues'

export const pageMetaData = (pageId?: unknown): PageMetaData => {
  switch (pageId) {
    case 'response-to-probation':
      return {
        templateName: 'responseToProbation',
        validator: validateResponseToProbation,
        inputDisplayValues: inputDisplayValuesResponseToProbation,
        pageHeading: strings.pageHeadings.responseToProbation,
        pageTitle: strings.pageTitles.responseToProbation,
      }
    case 'recall-type':
      return {
        templateName: 'recallType',
        validator: validateRecallType,
        inputDisplayValues: inputDisplayValuesRecallType,
        pageHeading: strings.pageHeadings.recallType,
        pageTitle: strings.pageHeadings.recallType,
      }
    case 'custody-status':
      return {
        templateName: 'custodyStatus',
        validator: validateCustodyStatus,
        inputDisplayValues: inputDisplayValuesCustodyStatus,
        pageHeading: strings.pageHeadings.custodyStatus,
        pageTitle: strings.pageTitles.custodyStatus,
      }
    case 'confirmation-part-a':
      return {
        templateName: 'confirmationPartA',
        pageHeading: strings.pageHeadings.confirmationPartA,
        pageTitle: strings.pageTitles.confirmationPartA,
      }
    case 'start-no-recall':
      return {
        templateName: 'startNoRecall',
        pageHeading: strings.pageHeadings.startNoRecall,
        pageTitle: strings.pageTitles.startNoRecall,
      }
    default:
      throw new AppError(`getPageMetaData - invalid pageId: ${pageId}`, { status: 404 })
  }
}
