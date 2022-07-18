import { CaseDocument } from '../../../../@types/make-recall-decision-api'
import { isDefined } from '../../../../utils/utils'
import { sortListByDateField } from '../../../../utils/dates'

const getDocumentNameWithoutExtension = (documentName: string) => {
  const extensionIdx = documentName.lastIndexOf('.')
  return documentName.substring(0, extensionIdx)
}

export const processContactDocuments = (documents?: CaseDocument[]) => {
  if (!isDefined(documents)) {
    return undefined
  }
  const sorted = sortListByDateField({
    list: documents,
    dateKey: 'lastModifiedAt',
    newestFirst: true,
  })
  return sorted.map(doc => ({
    ...doc,
    documentNameNoExtension: getDocumentNameWithoutExtension(doc.documentName),
  }))
}
