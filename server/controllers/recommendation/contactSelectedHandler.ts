import { Request, Response } from 'express'
import logger from '../../../logger'
import { SelectableContact } from '../../@types'
import { getRecommendation, saveRecommendation } from './utils/persistedRecommendation'

export const contactSelectedHandler = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, contact, isSelected } = req.body
  const existing = await getRecommendation(crn)
  const contacts = existing?.contacts || []
  const parsed = JSON.parse(contact)
  const updatedContacts =
    isSelected === '1' ? contacts.filter((c: SelectableContact) => c.id !== parsed.id) : [...contacts, parsed]
  const data = {
    ...(existing || {}),
    contacts: updatedContacts,
  }
  saveRecommendation({ data, crn })
  res.render(
    'partials/evidenceContactsList',
    {
      addedContacts: data.contacts,
    },
    (err, html) => {
      if (err) {
        logger.error(err)
        throw err
      }
      return res.json({
        success: html,
      })
    }
  )
}
