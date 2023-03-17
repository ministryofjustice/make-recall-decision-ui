/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'
import {
  formatSingleLineAddress,
  makePageTitle,
  errorMessage,
  countLabel,
  isNotNull,
  isDefined,
  hasData,
  logMessage,
} from './utils'
import config from '../config'
import { formatDateTimeFromIsoString } from './dates/format'
import {
  dateTimeItems,
  possessiveSuffix,
  isDatePartInvalid,
  removeUndefinedListItems,
  selectedFilterItems,
  riskLevelLabel,
  defaultValue,
  roshYesNoLabel,
  formatDateFilterQueryString,
  isObjectInArray,
  countLabelSuffix,
} from './nunjucks'
import { radioCheckboxItems, findListItemByValue } from './lists'
import { getDisplayValueForOption } from '../controllers/recommendations/helpers/getDisplayValueForOption'
import { nextPageLinkUrl, changeLinkUrl } from '../controllers/recommendations/helpers/urls'
import { recommendationsListStatusLabel } from '../controllers/recommendations/helpers/recommendationStatus'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = config.applicationName

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  njkEnv.addFilter('initialiseName', (fullName: string) => {
    // this check is for the authError page
    if (!fullName) {
      return null
    }
    const array = fullName.split(' ')
    return `${array[0][0]}. ${array.reverse()[0]}`
  })
  njkEnv.addFilter('defaultValue', defaultValue)

  // globals
  njkEnv.addGlobal('formatDateTimeFromIsoString', formatDateTimeFromIsoString)
  njkEnv.addGlobal('makePageTitle', makePageTitle)
  njkEnv.addGlobal('errorMessage', errorMessage)
  njkEnv.addGlobal('isDatePartInvalid', isDatePartInvalid)
  njkEnv.addGlobal('formatSingleLineAddress', formatSingleLineAddress)
  njkEnv.addGlobal('dateTimeItems', dateTimeItems)
  njkEnv.addGlobal('radioCheckboxItems', radioCheckboxItems)
  njkEnv.addGlobal('findListItemByValue', findListItemByValue)
  njkEnv.addGlobal('selectedFilterItems', selectedFilterItems)
  njkEnv.addGlobal('countLabel', countLabel)
  njkEnv.addGlobal('removeUndefinedListItems', removeUndefinedListItems)
  njkEnv.addGlobal('getDisplayValueForOption', getDisplayValueForOption)
  njkEnv.addGlobal('isNotNull', isNotNull)
  njkEnv.addGlobal('hasData', hasData)
  njkEnv.addGlobal('logMessage', logMessage)
  njkEnv.addGlobal('changeLinkUrl', changeLinkUrl)
  njkEnv.addGlobal('nextPageLinkUrl', nextPageLinkUrl)
  njkEnv.addGlobal('possessiveSuffix', possessiveSuffix)
  njkEnv.addGlobal('riskLevelLabel', riskLevelLabel)
  njkEnv.addGlobal('roshYesNoLabel', roshYesNoLabel)
  njkEnv.addGlobal('isDefined', isDefined)
  njkEnv.addGlobal('formatDateFilterQueryString', formatDateFilterQueryString)
  njkEnv.addGlobal('recommendationsListStatusLabel', recommendationsListStatusLabel)
  njkEnv.addGlobal('isObjectInArray', isObjectInArray)
  njkEnv.addGlobal('countLabelSuffix', countLabelSuffix)
}
