import { CaseDocument } from '../../../../@types/make-recall-decision-api'
import { isDefined } from '../../../../utils/utils'
import { sortListByDateField } from '../../../../utils/dates'

export const processContactDocuments = (documents?: CaseDocument[]) => {
  if (!isDefined(documents)) {
    return undefined
  }
  return sortListByDateField({
    list: documents,
    dateKey: 'lastModifiedAt',
    newestFirst: true,
  })
}
