import { renderTemplateString } from '../../../utils/nunjucks'

const renderStrings = (strings: Record<string, string>, stringRenderParams: Record<string, string>) => {
  const copy = { ...strings }
  Object.entries(copy).forEach(([key, value]) => {
    copy[key] = renderTemplateString(value, stringRenderParams)
  })
  return copy
}

export default renderStrings
