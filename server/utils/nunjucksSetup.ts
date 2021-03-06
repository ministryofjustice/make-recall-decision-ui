/* eslint-disable no-param-reassign */
import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'
import { formatSingleLineAddress, makePageTitle, errorMessage, countLabel } from './utils'
import config from '../config'
import { formatDateTimeFromIsoString } from './dates/format'
import { dateTimeItems, removeUndefinedListItems, selectedFilterItems } from './nunjucks'
import { radioCheckboxItems } from './lists'

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

  // globals
  njkEnv.addGlobal('formatDateTimeFromIsoString', formatDateTimeFromIsoString)
  njkEnv.addGlobal('makePageTitle', makePageTitle)
  njkEnv.addGlobal('errorMessage', errorMessage)
  njkEnv.addGlobal('formatSingleLineAddress', formatSingleLineAddress)
  njkEnv.addGlobal('dateTimeItems', dateTimeItems)
  njkEnv.addGlobal('radioCheckboxItems', radioCheckboxItems)
  njkEnv.addGlobal('selectedFilterItems', selectedFilterItems)
  njkEnv.addGlobal('countLabel', countLabel)
  njkEnv.addGlobal('removeUndefinedListItems', removeUndefinedListItems)
}
