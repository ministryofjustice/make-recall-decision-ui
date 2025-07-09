import express, { Router } from 'express'

import config from '../config'
import { isDateTimeRangeCurrent } from '../utils/utils'
import logger from '../../logger'
import { formatDateTimeFromIsoString } from '../utils/dates/formatting'

export default function setUpMaintenance(): Router {
  const router = express.Router()

  router.get('*', (req, res, next) => {
    try {
      const {
        maintenancePage: { startDateTime, endDateTime, body },
      } = config

      if (isDateTimeRangeCurrent(startDateTime, endDateTime)) {
        logger.info('Maintenance page enabled')
        res.locals.maintenancePageBody = body
        res.locals.maintenancePageStartDateTime = formatDateTimeFromIsoString({
          isoDate: startDateTime,
          dateOnly: false,
          timeOnly: false,
          monthAndYear: false,
          shortDate: true,
        })
        res.locals.maintenancePageEndDateTime = formatDateTimeFromIsoString({
          isoDate: endDateTime,
          dateOnly: false,
          timeOnly: false,
          monthAndYear: false,
          shortDate: true,
        })
        return res.render('pages/maintenance.njk')
      }
      return next()
    } catch (error) {
      return next(error)
    }
  })
  return router
}
