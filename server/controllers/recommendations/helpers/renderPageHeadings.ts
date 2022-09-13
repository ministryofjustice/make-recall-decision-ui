import { ObjectMap } from '../../../@types'
import { strings } from '../../../textStrings/en'
import { renderTemplateString } from '../../../utils/nunjucks'

export const renderPageHeadings = (stringRenderParams: ObjectMap<string>) => {
  const headings = { ...strings.pageHeadings }
  Object.entries(headings).forEach(([key, value]) => {
    headings[key] = renderTemplateString(value, stringRenderParams)
  })
  return headings
}
