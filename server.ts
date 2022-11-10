/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from './server/monitoring/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import { app, metricsApp } from './server/index'
import logger from './logger'

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})

metricsApp.listen(metricsApp.get('port'), () => {
  logger.info(`Metrics server listening on port ${metricsApp.get('port')}`)
})

// ================================= run localhost with https ===============================
// 1. brew install mkcert
// 2. mkcert -install
// 3. mkcert localhost
// then uncomment the following code, and comment out the app.listen block above
// const fs = require('fs')
// const https = require('https')
//
// const key = fs.readFileSync('localhost-key.pem', 'utf-8')
// const cert = fs.readFileSync('localhost.pem', 'utf-8')
// https.createServer({ key, cert }, app).listen(app.get('port'))
