import { Request, Response } from 'express'
import logger from '../../../logger'
import { SelectableItem } from '../../@types'
import { getRecommendation, saveRecommendation } from './utils/persistedRecommendation'

export const itemSelectedHandler = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, itemId, itemText, isSelected, componentType } = req.body
  const existing = await getRecommendation(crn)
  const items = existing ? existing[componentType] || [] : []
  const item = { id: itemId, text: itemText }
  const updated =
    isSelected === '1' ? items.filter((c: SelectableItem) => c.id !== item.id) : [...items, { ...item, added: true }]
  const data = {
    ...(existing || {}),
    ...(componentType === 'contacts' ? { contacts: updated } : { licenceConditions: updated }),
  }
  await saveRecommendation({ data, crn })
  const template = componentType === 'contacts' ? 'evidenceContactsList' : 'evidenceLicenceConditionsList'
  res.render(
    `partials/${template}`,
    {
      crn,
      ...data,
    },
    (err, html) => {
      if (err) {
        logger.error(err)
        throw err
      }
      return res.json({
        success: html,
        reloadPage: isSelected === '1',
      })
    }
  )
}
