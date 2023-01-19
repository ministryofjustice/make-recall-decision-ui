const superagent = require('superagent')
const OpenAPI = require('openapi-typescript-codegen')
const fs = require('fs')

const swaggerUrl = 'https://make-recall-decision-api-dev.hmpps.service.justice.gov.uk/v3/api-docs'

superagent.get(swaggerUrl).then(({ body }) => {
  const outputPath = './server/@types/make-recall-decision-api'
  OpenAPI.generate({
    input: body,
    output: outputPath,
    exportCore: false,
    exportServices: false,
  }).then(() => {
    // TS requires that every subfolder under a @types/ folder, has a index.d.ts
    fs.closeSync(fs.openSync(`${outputPath}/models/index.ts`, 'w'))
    fs.rename(`${outputPath}/index.ts`, `${outputPath}/index.d.ts`, err => {
      // eslint-disable-next-line no-console
      if (err) console.error(err)
    })
  })
})
