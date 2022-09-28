import { ObjectMap } from '../../../@types'
import { renderTemplateString } from '../../../utils/nunjucks'

export const renderStrings = (strings: ObjectMap<string>, stringRenderParams: ObjectMap<string>) => {
  const copy = { ...strings }
  Object.entries(copy).forEach(([key, value]) => {
    copy[key] = renderTemplateString(value, stringRenderParams)
  })
  return copy
}
