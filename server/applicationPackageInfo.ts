// eslint-disable import/no-unresolved,global-require
import fs from 'fs'

const packageData = JSON.parse(fs.readFileSync('./package.json').toString())

export default { packageData }
