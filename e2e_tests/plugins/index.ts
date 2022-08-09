import browserify from '@cypress/browserify-preprocessor'
import resolve from 'resolve'
import { readDocX } from '../../cypress_shared/plugins'

const cucumber = require('cypress-cucumber-preprocessor').default

export default (on: (string, Record) => void, config: { projectRoot: string }): void => {
  const options = {
    ...browserify.defaultOptions,
    typescript: resolve.sync('typescript', { baseDir: config.projectRoot }),
  }
  on('task', {
    readDocX,
  })

  on('file:preprocessor', cucumber(options))
}
