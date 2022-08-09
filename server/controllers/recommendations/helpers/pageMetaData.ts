import { PageMetaData } from '../../../@types'
import { AppError } from '../../../AppError'
import { validateRecallType } from '../validators/validateRecallType'
import { strings } from '../../../textStrings/en'
import { validateCustodyStatus } from '../validators/validateCustodyStatus'

export const getPageMetaData = (pageId?: unknown): PageMetaData => {
  switch (pageId) {
    case 'recall-type':
      return {
        templateName: 'recallType',
        validator: validateRecallType,
        pageHeading: strings.pageHeadings.recallType,
        pageTitle: strings.pageHeadings.recallType,
      }
    case 'custody-status':
      return {
        templateName: 'custodyStatus',
        validator: validateCustodyStatus,
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
