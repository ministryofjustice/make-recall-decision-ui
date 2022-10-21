const report = require('multiple-cucumber-html-reporter')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const cucumberJsonDir = './e2e_tests/cucumber-json'
const cucumberReportFileMap = {}
const cucumberReportMap = {}
const jsonIndentLevel = 2
const ReportDir = './e2e_tests/reports'
const screenshotsDir = './e2e_tests/screenshots'

getCucumberReportMaps()
addScreenshots()
generateReport()

function generateReport() {
  if (!fs.existsSync(cucumberJsonDir)) {
    console.warn(chalk.yellow(`WARNING: Folder './${cucumberJsonDir}' not found.REPORT CANNOT BE CREATED!`))
  } else {
    report.generate({
      jsonDir: cucumberJsonDir,
      reportPath: ReportDir,
      saveCollectedJSON: true,
      displayDuration: true,
      reportName: `Manage a recall - ${new Date().toLocaleString()}`,
    })
  }
}

// Mapping cucumber json files from the cucumber-json directory to the features
function getCucumberReportMaps() {
  const files = fs.readdirSync(cucumberJsonDir).filter(file => {
    return file.indexOf('.json') > -1
  })
  files.forEach(file => {
    const json = JSON.parse(fs.readFileSync(path.join(cucumberJsonDir, file)))
    if (!json[0]) {
      return
    }
    const [feature] = json[0].uri.split('/').reverse()
    cucumberReportFileMap[feature] = file
    cucumberReportMap[feature] = json
  })
}

// Adding screenshots to the respective failed test steps in the feature files
function addScreenshots() {
  if (!fs.existsSync(screenshotsDir)) {
    return
  }

  const prependPathSegment = pathSegment => location => path.join(pathSegment, location)

  const readdirPreserveRelativePath = location => fs.readdirSync(location).map(prependPathSegment(location))

  const readdirRecursive = location =>
    readdirPreserveRelativePath(location).reduce(
      (result, currentValue) =>
        fs.statSync(currentValue).isDirectory()
          ? result.concat(readdirRecursive(currentValue))
          : result.concat(currentValue),
      []
    )
  const screenshots = readdirRecursive(path.resolve(screenshotsDir)).filter(file => {
    return file.indexOf('.png') > -1
  })

  const featuresList = Array.from(new Set(screenshots.map(x => x.match(/[\w-_.]+\.feature/g)[0])))
  featuresList.forEach(feature => {
    screenshots.forEach(screenshot => {
      const regex = /(?<=\ --\ ).*?((?=\ \(example\ \#\d+\))|(?=\ \(failed\)))/g
      const [scenarioName] = screenshot.match(regex)
      console.info(chalk.blue('\n Adding screenshot to cucumber-json report for'))
      console.info(chalk.blue(scenarioName))

      console.log(featuresList)
      console.log(feature)
      console.log(cucumberReportMap)
      const myScenarios = cucumberReportMap[feature][0].elements.filter(e => scenarioName.includes(e.name))
      if (!myScenarios) {
        return
      }
      let foundFailedStep = false
      myScenarios.forEach(myScenario => {
        if (foundFailedStep) {
          return
        }
        let myStep
        if (screenshot.includes('(failed)')) {
          myStep = myScenario.steps.find(step => step.result.status === 'failed')
        } else {
          myStep = myScenario.steps.find(step => step.name.includes('screenshot'))
        }
        if (!myStep) {
          return
        }
        const data = fs.readFileSync(path.resolve(screenshot))
        if (data) {
          const base64Image = Buffer.from(data, 'binary').toString('base64')
          if (!myStep.embeddings) {
            myStep.embeddings = []
            myStep.embeddings.push({ data: base64Image, mime_type: 'image/png' })
            foundFailedStep = true
          }
        }
      })
      // Write JSON with screenshot back to report file.
      fs.writeFileSync(
        path.join(cucumberJsonDir, cucumberReportFileMap[feature]),
        JSON.stringify(cucumberReportMap[feature], null, jsonIndentLevel)
      )
    })
  })
}
