import { Request, Response } from 'express'
import { getValue } from '../../data/fetchFromCacheOrApi'
import { createRedisClient } from '../../data/redisClient'
import logger from '../../../logger'
import { SelectableContact } from '../../@types'

export const contactSelectedHandler = async (req: Request, res: Response): Promise<Response | void> => {
  const { crn, contact, isSelected } = req.body
  const cacheKey = `evidence:${crn}`
  const existing = await getValue(cacheKey)
  const contacts = existing?.contacts || []
  const parsed = JSON.parse(contact)
  const updatedContacts =
    isSelected === '1' ? contacts.filter((c: SelectableContact) => c.id !== parsed.id) : [...contacts, parsed]
  const updated = {
    ...(existing || {}),
    contacts: updatedContacts,
  }
  const redisClient = createRedisClient()
  redisClient.set(cacheKey, JSON.stringify(updated))
  res.render(
    'partials/evidenceContactsList',
    {
      addedContacts: updated.contacts,
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
