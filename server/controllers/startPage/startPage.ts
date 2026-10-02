import { Request, Response } from 'express'
import config from '../../config'
import { isDateTimeRangeCurrent } from '../../utils/utils'
import hasValidPpudUserMapping from '../../booking/hasValidPpudUserMapping'

export enum HMPPS_AUTH_ROLE {
  PPCS = 'ROLE_MAKE_RECALL_DECISION_PPCS',
}

export const startPage = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.maintenanceBanner = {
    headerText: config.maintenanceBanner.header,
    bodyContent: config.maintenanceBanner.body,
    isHidden: !isDateTimeRangeCurrent(config.maintenanceBanner.startDateTime, config.maintenanceBanner.endDateTime),
  }
  const {
    user: { username, userId, token },
  } = res.locals

  if (res.locals.user.hasPpcsRole) {
    res.locals.hasValidPpudUserMapping = await hasValidPpudUserMapping({ username, userId, token })
    if (res.locals.hasValidPpudUserMapping) {
      res.render('pages/startPPCS')
    } else {
      res.render('pages/recommendations/ppcs/ppudUserMapping/ppudUserNotMapped')
    }
  } else if (res.locals.user.hasPpcsAdminRole) {
    // Will need to implement a different start page for PPCS Admins once there is a specific role for them
    res.render('pages/recommendations/ppcs/ppudUserMapping/ppudUserMappings')
  } else {
    res.locals.searchEndpoint = '/search-by-name'
    res.render('pages/startPage')
  }
}
