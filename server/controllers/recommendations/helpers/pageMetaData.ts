import { PageMetaData } from '../../../@types'
import { AppError } from '../../../AppError'
import { validateRecallType } from '../validators/validateRecallType'
import { strings } from '../../../textStrings/en'

export const getPageMetaData = (pageId?: unknown): PageMetaData => {
  switch (pageId) {
    case 'recall-type':
      return {
        templateName: 'recallType',
        validator: validateRecallType,
        pageHeading: strings.pageHeadings.recallType,
      }
    default:
      throw new AppError(`getPageMetaData - invalid pageId: ${pageId}`, { status: 404 })
  }
}
