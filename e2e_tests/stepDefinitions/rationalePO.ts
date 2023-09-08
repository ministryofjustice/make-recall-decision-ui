import { Given, Then, DataTable, When } from '@badeball/cypress-cucumber-preprocessor'
import { faker } from '@faker-js/faker/locale/en_GB'
import { proxy } from '@alfonso-presa/soft-assert'
import {
  appointmentDate,
  appointmentOptions,
  futureActionDetails,
  letterSubject,
  licenceBreachDetails,
  licenceBreachExplanation,
  noRecallReasonDetails,
  offendersPhoneNumber,
  progressDetails,
  whyRecall,
} from './assertionsDNTR'

import { crns, deleteOpenRecommendation } from './index'

import {
  IndeterminateOrExtendedSentenceDetailType,
  IndeterminateRecallType,
  NonIndeterminateRecallType,
  YesNoType,
  CustodyType,
  YesNoNAType,
  Vulnerabilities,
  ROSHLevels,
  WhyConsiderRecall,
  ApptOptions,
} from '../support/enums'
import { formatDateToCompletedDocumentFormat } from '../utils'

const expectSoftly = proxy(expect)

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
let testData: Record<string, any>
let currentPage

const makeRecommendation = function (crn, recommendationDetails?: Record<string, string>) {
  cy.clickLink('Start now')
  cy.clickLink('Search by case reference number (CRN)')
  cy.fillInputByName('crn', crn)
  cy.clickButton('Search')
  // get offender name for use in subsequent pages
  cy.get(`[data-qa="row-${crn}"] [data-qa="name"]`)
    .first()
    .click()
    .invoke('text')
    .as('offenderName')
    .then(offenderName => {
      deleteOpenRecommendation()
      // Create a new recommendation - START
      cy.clickLink('Make a recommendation')
      cy.clickButton('Continue')
      cy.clickLink(`What has made you think about recalling ${offenderName}`)
      testData.recallReason = faker.hacker.phrase()
      cy.fillInput(`What has made you think about recalling ${offenderName}`, testData.recallReason)
      cy.clickButton('Continue')
      cy.clickLink(`How has ${offenderName} responded to probation so far`)
      testData.probationResponse = faker.hacker.phrase()
      cy.fillInput(`How has ${offenderName} responded to probation so far`, testData.probationResponse)
      cy.clickButton('Continue')
      cy.clickLink(`What licence conditions has ${offenderName} breached`)
      // select all standard recommendation if recommendationDetails.LicenceConditions === 'all' passed else choose a few randomly
      cy.get('input[id^=standard-]').then(standardLicenceConditions => {
        const stdConditions =
          recommendationDetails.LicenceConditions && recommendationDetails.LicenceConditions.toLowerCase() === 'all'
            ? standardLicenceConditions.toArray()
            : faker.helpers.arrayElements(standardLicenceConditions.toArray())
        stdConditions.forEach(htmlElement => {
          htmlElement.click()
          testData.licenceConditions.standard.push(htmlElement.getAttribute('value').replace('standard|', ''))
        })
      })
      // select additional licence randomly or if recommendationDetails.LicenceConditions === 'all' is passed
      if (
        faker.datatype.boolean() ||
        (recommendationDetails.LicenceConditions && recommendationDetails.LicenceConditions.length !== 0)
      ) {
        cy.get('body').then($body => {
          if ($body.find('input[id^=additional-]').length !== 0) {
            cy.get('input[id^=additional-]').then(advancedLicenceConditions => {
              const addConditions =
                recommendationDetails.LicenceConditions &&
                recommendationDetails.LicenceConditions.toLowerCase() === 'all'
                  ? advancedLicenceConditions.toArray()
                  : faker.helpers.arrayElements(advancedLicenceConditions.toArray())
              addConditions.forEach(htmlElement => {
                htmlElement.click()
                cy.wrap(htmlElement)
                  .next('label')
                  .next('div')
                  .invoke('text')
                  .then(text => {
                    testData.licenceConditions.advanced.push(
                      text
                        .replace(/\n/g, '')
                        .replace(/\s{2,}/g, '')
                        .replace('Notes', 'Note: ')
                        .trim()
                    )
                  })
              })
            })
          }
        })
      }
      cy.clickButton('Continue')
      // Select if offender is on indeterminate sentence
      cy.clickLink(`Is ${offenderName} on an indeterminate sentence`)
      testData.indeterminate = recommendationDetails?.Indeterminate
        ? recommendationDetails.Indeterminate.toString().toUpperCase()
        : faker.helpers.arrayElement(Object.keys(YesNoType))
      cy.selectRadioByValue(`Is ${offenderName} on an indeterminate sentence`, testData.indeterminate)
      cy.clickButton('Continue')
      testData.extended = recommendationDetails?.Extended
        ? recommendationDetails.Extended.toString().toUpperCase()
        : faker.helpers.arrayElement(Object.keys(YesNoType))
      cy.selectRadioByValue(`Is ${offenderName} on an extended sentence`, testData.extended)
      cy.clickButton('Continue')
      if (recommendationDetails?.Indeterminate.toString().toUpperCase() === 'YES') {
        testData.TypeOfSentence = recommendationDetails?.TypeOfSentence
          ? recommendationDetails.TypeOfSentence.toString().toUpperCase()
          : faker.helpers.arrayElement(['LIFE', 'IPP', 'DPP'])
        cy.selectRadioByValue(`What type of sentence is ${offenderName} on`, testData.TypeOfSentence)
        cy.clickButton('Continue')
      }
    })
  cy.clickLink(`What alternatives to recall have been tried already`)
  const alternativesTried = recommendationDetails?.AlternativesTried
  if (['All', 'Some'].includes(alternativesTried)) {
    cy.get('.govuk-checkboxes input:not([data-behaviour="exclusive"])').then(alternatives => {
      const htmlElements =
        alternativesTried === 'All' ? alternatives.toArray() : faker.helpers.arrayElements(alternatives.toArray())
      selectAlternativesTried(htmlElements)
    })
  } else if (alternativesTried === 'None') {
    cy.get(`.govuk-checkboxes input[value="${alternativesTried.toUpperCase()}"]`).then(vulnerabilities => {
      cy.wrap(vulnerabilities).click()
      testData.alternativesTried.push(alternativesTried)
    })
  } else {
    cy.get(
      `.govuk-checkboxes ${faker.helpers.arrayElement([
        'input:not([data-behaviour="exclusive"])',
        'input[data-behaviour="exclusive"]',
      ])}`
    ).then(alternativesToRecall => {
      if (alternativesToRecall.length === 1) {
        cy.wrap(alternativesToRecall).click()
        testData.alternativesTried.length = 0
        testData.alternativesTried.push('NONE')
      } else {
        const htmlElements = faker.helpers.arrayElements(alternativesToRecall.toArray())
        htmlElements.forEach(htmlElement => {
          htmlElement.click()
          const alternativeName = htmlElement.getAttribute('value')
          const alternativeNotes = faker.hacker.phrase()
          cy.get(`#conditional-${alternativeName}`).find('textarea').type(alternativeNotes)
          testData.alternativesTried.push({ alternativeName, alternativeNotes })
        })
      }
    })
  }
  cy.clickButton('Continue')
  cy.wrap(testData).as('testData')
  cy.clickButton('Continue')
}

const selectVulnerabilities = function (htmlElements: HTMLElement[]) {
  htmlElements.forEach(htmlElement => {
    htmlElement.click()
    const vulnerabilityName = htmlElement.getAttribute('value')
    const vulnerabilityNotes = faker.hacker.phrase()
    cy.get(`textarea#vulnerabilitiesDetail-${vulnerabilityName}`).type(vulnerabilityNotes)
    cy.wrap(htmlElement)
      .next('label')
      .invoke('text')
      .then(text => {
        testData.vulnerabilities.push({ vulnerabilityName: text.trim(), vulnerabilityNotes })
      })
  })
}
function selectAlternativesTried(htmlElements: HTMLElement[]) {
  htmlElements.forEach(htmlElement => {
    htmlElement.click()
    const alternativeName = htmlElement.getAttribute('value')
    const alternativeNotes = faker.hacker.phrase()
    cy.get(`textarea#alternativesToRecallTriedDetail-${alternativeName}`).type(alternativeNotes)
    testData.alternativesTried.push({ alternativeName, alternativeNotes })
  })
}

const createPartAOrNoRecallLetter = function (partADetails?: Record<string, string>) {
  cy.log(`testData before Part A creation--> ${JSON.stringify(testData)}`)
  if (testData.indeterminate === 'NO' && testData.extended === 'NO') {
    testData.recallType = partADetails?.RecallType
      ? partADetails.RecallType.toString().toUpperCase()
      : faker.helpers.arrayElement(Object.keys(NonIndeterminateRecallType))
    cy.logPageTitle('What do you recommend?')
    cy.selectRadioByValue('What do you recommend', testData.recallType)
    if (testData.recallType !== 'NO_RECALL') {
      testData.partARecallReason = faker.hacker.phrase()
      cy.get(
        `#recallTypeDetails${testData.recallType
          .toString()
          .split('_')
          .map(i => Cypress._.capitalize(i))
          .join('')}`
      ).type(testData.partARecallReason)
    }
    cy.clickButton('Continue')
    testData.emergencyRecall = partADetails?.EmergencyRecall
      ? partADetails.EmergencyRecall.toString().toUpperCase()
      : faker.helpers.arrayElement(Object.keys(YesNoType))
    cy.logPageTitle('Is this an emergency recall?')
    cy.selectRadioByValue('Is this an emergency recall', testData.emergencyRecall)
    cy.clickButton('Continue')
    if (testData.recallType === 'FIXED_TERM') {
      testData.fixedTermRecall = faker.helpers.arrayElement(Object.keys(YesNoType))
      cy.logPageTitle('Fixed term call')
      cy.selectRadioByValue('Fixed term recall', testData.fixedTermRecall)
      if (testData.fixedTermRecall === 'YES') {
        cy.get('#hasFixedTermLicenceConditionsDetails').type((testData.fixedTermRecallNotes = faker.hacker.phrase()))
      }
      cy.clickButton('Continue')
    }
    cy.clickLink('Continue')
  } else {
    testData.recallType = partADetails?.RecallType
      ? partADetails.RecallType.toString().toUpperCase()
      : faker.helpers.arrayElement(Object.keys(IndeterminateRecallType))
    cy.logPageTitle('What do you recommend?')
    cy.selectRadioByValue('What do you recommend', testData.recallType)
    cy.clickButton('Continue')
    if (testData.recallType === 'EMERGENCY') {
      testData.emergencyRecall = YesNoType.YES.toUpperCase()
      testData.indeterminateOrExtendedSentenceDetails = partADetails?.IndeterminateOrExtendedSentenceDetails
        ? Object.assign(
            {},
            ...partADetails.IndeterminateOrExtendedSentenceDetails.split(',')
              .map(i => i.trim())
              .map(k => ({ [k]: faker.hacker.phrase() }))
          )
        : Object.assign(
            {},
            ...faker.helpers
              .arrayElements(Object.keys(IndeterminateOrExtendedSentenceDetailType))
              .map(k => ({ [k]: faker.hacker.phrase() }))
          )
      Object.keys(testData.indeterminateOrExtendedSentenceDetails).forEach(k => {
        cy.selectCheckboxesByValue('Indeterminate and extended sentences', Array.of(k))
        cy.get(`#indeterminateOrExtendedSentenceDetailsDetail-${k}`).type(
          testData.indeterminateOrExtendedSentenceDetails[k]
        )
      })
      cy.clickButton('Continue')
      cy.clickLink('Continue')
    }
  }
  testData.inCustody = partADetails?.InCustody
    ? partADetails.InCustody.toString().trim().replace(/\s/g, '_').toUpperCase()
    : faker.helpers.arrayElement(Object.keys(CustodyType))
  currentPage = `Is ${this.offenderName} in custody now`
  cy.logPageTitle(`${currentPage}?`)
  cy.selectRadioByValue(currentPage, testData.inCustody)
  if (testData.inCustody === 'YES_POLICE') {
    testData.custodyAddress = faker.address.streetAddress(true)
    cy.get('#custodyStatusDetailsYesPolice').type(testData.custodyAddress)
  }
  cy.clickButton('Continue')
  cy.clickLink(`What has led to this recall`)
  cy.logPageTitle('What has led to this recall?')
  cy.get(`#whatLedToRecall`).type((testData.reasonForRecall = faker.hacker.phrase()))
  cy.clickButton('Continue')
  cy.clickLink(`Personal details`)
  cy.logPageTitle('Personal details')
  cy.getOffenderDetails().then(offenderDetails => {
    testData.offenderDetails = offenderDetails
  })
  cy.clickLink('Continue')
  cy.clickLink(`Offence details`)
  cy.logPageTitle('Offence details')
  cy.getOffenceDetails().then(det => {
    testData.offenceDetails = det
  })
  cy.clickLink('Continue')
  cy.clickLink(`Offence analysis`)
  cy.logPageTitle('Offence analysis')
  testData.offenceAnalysis = faker.hacker.phrase()
  cy.get(`#offenceAnalysis`).type(testData.offenceAnalysis)
  cy.clickButton('Continue')
  cy.clickLink(`Previous releases`)
  cy.logPageTitle('Previous releases')
  if (partADetails?.PreviousReleases) {
    const previousReleases = partADetails?.PreviousReleases.split(',').map(s => s.trim())
    previousReleases.forEach(previousRelease => {
      const dateParts = previousRelease.split('-').map(s => s.trim())
      const releaseDay = { day: dateParts[0], month: dateParts[1], year: dateParts[2] }
      cy.clickLink(`Add a previous release`)
      cy.enterDateTime(releaseDay)
      cy.clickButton('Continue')
    })
  }
  cy.getPreviousReleases().then(previousReleases => {
    Object.assign(testData.offenderDetails, previousReleases)
  })
  cy.clickButton('Continue')
  cy.clickLink(`Previous recalls`)
  cy.logPageTitle('Previous recalls')
  if (partADetails?.PreviousRecalls) {
    const previousRecalls = partADetails?.PreviousRecalls.split(',').map(s => s.trim())
    previousRecalls.forEach(previousRelease => {
      const dateParts = previousRelease.split('-').map(s => s.trim())
      const recallDay = { day: dateParts[0], month: dateParts[1], year: dateParts[2] }
      cy.clickLink(`Add a previous recall`)
      cy.enterDateTime(recallDay)
      cy.clickButton('Continue')
    })
  }
  cy.getPreviousRecalls().then(previousRecallDates => {
    testData.offenderDetails.previousRecallDates = previousRecallDates.join()
  })
  cy.clickButton('Continue')
  if (!['YES_POLICE', 'YES_PRISON'].includes(testData.inCustody)) {
    cy.clickLink(`Address`)
    cy.logPageTitle('Address')
    testData.lastKnownAddressCorrect = partADetails?.LastKnownAddressCorrect
      ? partADetails.LastKnownAddressCorrect.toString().toUpperCase()
      : faker.helpers.arrayElement(Object.keys(YesNoType))
    cy.selectRadioByValue(`Is this where the police can find ${this.offenderName}`, testData.lastKnownAddressCorrect)
    if (testData.lastKnownAddressCorrect === 'NO') {
      cy.get(`#isMainAddressWherePersonCanBeFoundDetailsNo`).type(faker.address.streetAddress(true))
    }
    cy.clickButton('Continue')
  }
  cy.clickLink(`Would recall affect vulnerability or additional needs`)
  cy.logPageTitle('Would recall affect vulnerability or additional needs?')
  const vulnerability = partADetails?.Vulnerabilities
  if (['All', 'Some'].includes(vulnerability)) {
    cy.get('.govuk-checkboxes input:not([data-behaviour="exclusive"])').then(vulnerabilities => {
      const htmlElements =
        vulnerability === 'All' ? vulnerabilities.toArray() : faker.helpers.arrayElements(vulnerabilities.toArray())
      selectVulnerabilities(htmlElements)
    })
  } else if (['None', 'Not known'].includes(vulnerability)) {
    const vulnerabilityName = Object.entries(Vulnerabilities).find(vu => vu.includes(vulnerability))[0]
    cy.get(`.govuk-checkboxes input[value="${vulnerabilityName}"]`).then(vulnerabilities => {
      cy.wrap(vulnerabilities).click()
      testData.vulnerabilities.push(Vulnerabilities[vulnerabilityName])
    })
  } else {
    cy.get(
      `.govuk-checkboxes ${faker.helpers.arrayElement([
        'input:not([data-behaviour="exclusive"])',
        'input[data-behaviour="exclusive"]',
      ])}`
    ).then(vulnerabilities => {
      if (vulnerabilities.length === 2) {
        const htmlElement = faker.helpers.arrayElement(vulnerabilities.toArray())
        htmlElement.click()
        testData.vulnerabilities.length = 0
        cy.wrap(htmlElement)
          .next('label')
          .invoke('text')
          .then(text => {
            testData.vulnerabilities.push(text.trim())
          })
      } else {
        const htmlElements = faker.helpers.arrayElements(vulnerabilities.toArray())
        selectVulnerabilities(htmlElements)
      }
    })
  }
  cy.clickButton('Continue')
  currentPage = 'Are there any victims in the victim contact scheme'
  cy.clickLink(currentPage)
  cy.logPageTitle(`${currentPage}?`)
  testData.vlo = {}
  testData.vlo.inVLOScheme = partADetails?.VictimContactScheme
    ? partADetails.VictimContactScheme.toString().replace(' ', '_').toUpperCase()
    : faker.helpers.arrayElement(Object.keys(YesNoNAType))
  cy.selectRadioByValue(currentPage, testData.vlo.inVLOScheme)
  cy.clickButton('Continue')
  if (testData.vlo.inVLOScheme === 'YES') {
    testData.vlo.vloDate = faker.date.past(1)
    cy.enterDateTime({
      day: testData.vlo.vloDate.getDate().toString(),
      month: (testData.vlo.vloDate.getMonth() + 1).toString(),
      year: testData.vlo.vloDate.getFullYear().toString(),
    })
    cy.clickButton('Continue')
  }
  if (!['YES_POLICE', 'YES_PRISON'].includes(testData.inCustody)) {
    cy.clickLink(`Local police contact details`)
    cy.logPageTitle('Local police contact details')
    testData.localPoliceDetails = {}
    cy.fillInput('Police contact name', (testData.localPoliceDetails.contact = faker.name.fullName()))
    cy.fillInput('Telephone number', (testData.localPoliceDetails.phoneNumber = '01277 960 001'))
    cy.fillInput('Email address', (testData.localPoliceDetails.email = faker.internet.email()))
    cy.clickButton('Continue')
    currentPage = `Is there anything the police should know before they arrest ${this.offenderName}`
    cy.clickLink(currentPage)
    cy.logPageTitle(`${currentPage}?`)
    testData.hasArrestIssues = partADetails?.HasArrestIssues
      ? partADetails.HasArrestIssues.toString().toUpperCase()
      : faker.helpers.arrayElement(Object.keys(YesNoType))
    cy.selectRadioByValue(currentPage, testData.hasArrestIssues)
    if (testData.hasArrestIssues === 'YES')
      cy.get('#hasArrestIssuesDetailsYes').type((testData.arrestIssueDetails = faker.hacker.phrase()))
    cy.clickButton('Continue')
  }
  currentPage = `Is ${this.offenderName} under Integrated Offender Management (IOM)`
  cy.clickLink(currentPage)
  cy.logPageTitle(`${currentPage}?`)
  testData.iom = partADetails?.IOM
    ? partADetails.IOM.toString().replace(' ', '_').toUpperCase()
    : faker.helpers.arrayElement(Object.keys(YesNoNAType))
  cy.selectRadioByValue(currentPage, testData.iom)
  cy.clickButton('Continue')
  currentPage = `Do you think ${this.offenderName} is using recall to bring contraband into prison`
  cy.clickLink(currentPage)
  cy.logPageTitle(`${currentPage}?`)
  testData.contraband = {}
  testData.contraband.hasRisk = partADetails?.HasContrabandRisk
    ? partADetails.HasContrabandRisk.toString().toUpperCase()
    : faker.helpers.arrayElement(Object.keys(YesNoType))
  cy.selectRadioByValue(currentPage, testData.contraband.hasRisk)
  if (testData.contraband.hasRisk === 'YES')
    cy.get('#hasContrabandRiskDetailsYes').type((testData.contraband.riskDetails = faker.hacker.phrase()))
  cy.clickButton('Continue')
  currentPage = `Current risk of serious harm`
  cy.clickLink(currentPage)
  cy.logPageTitle(currentPage)
  testData.currentRoshForPartA = {}
  cy.selectRadioByValue(
    'Risk to children',
    (testData.currentRoshForPartA.riskToChildren = faker.helpers.arrayElement(Object.keys(ROSHLevels)))
  )
  cy.selectRadioByValue(
    'Risk to the public',
    (testData.currentRoshForPartA.riskToPublic = faker.helpers.arrayElement(Object.keys(ROSHLevels)))
  )
  cy.selectRadioByValue(
    'Risk to a known adult',
    (testData.currentRoshForPartA.riskToKnownAdult = faker.helpers.arrayElement(Object.keys(ROSHLevels)))
  )
  cy.selectRadioByValue(
    'Risk to staff',
    (testData.currentRoshForPartA.riskToStaff = faker.helpers.arrayElement(Object.keys(ROSHLevels)))
  )
  cy.selectRadioByValue(
    'Risk to prisoners',
    (testData.currentRoshForPartA.riskToPrisoner = faker.helpers.arrayElement(Object.keys(ROSHLevels)))
  )
  cy.clickButton('Continue')
  currentPage = `MAPPA for ${this.offenderName}`
  cy.clickLink(currentPage)
  cy.logPageTitle(currentPage)
  testData.mappa = {}
  cy.get('body').then($body => {
    if ($body.find('[data-qa="mappa-heading"] strong').length) {
      cy.get('[data-qa="mappa-heading"] strong')
        .invoke('text')
        .then(text => {
          testData.mappa.mappaCategory = text.split('/')[0].replace('Cat', 'Category')
          // eslint-disable-next-line prefer-destructuring
          testData.mappa.mappaLevel = text.split('/')[1]
        })
    } else {
      testData.mappa.mappaCategory = 'N/A'
      testData.mappa.mappaLevel = 'N/A'
    }
  })
  cy.clickLink('Continue')
}

const createDNTRLetter = function () {
  cy.clickLink('Why you considered recall')
  cy.selectRadio(
    'Why you considered recall',
    (testData.whyRecall = faker.helpers.arrayElement(Object.values(WhyConsiderRecall)))
  )
  cy.clickButton('Continue')

  cy.fillInput(
    `Tell ${this.offenderName} why the licence breach is a problem`,
    (testData.licenceBreachDetails = faker.hacker.phrase())
  )
  cy.fillInput(
    `Tell ${this.offenderName} why you've made this decision`,
    (testData.noRecallReasonDetails = faker.hacker.phrase())
  )
  cy.fillInput(
    `Remind ${this.offenderName} about their progress so far`,
    (testData.progressDetails = faker.hacker.phrase())
  )
  cy.fillInput(
    `Write down what ${this.offenderName} thinks about the licence breach (optional)`,
    (testData.licenceBreachExplanation = faker.hacker.phrase())
  )
  cy.fillInput(
    `Tell ${this.offenderName} what you've agreed for the future`,
    (testData.futureActionDetails = faker.hacker.phrase())
  )
  cy.clickButton('Continue')

  cy.selectRadio(
    'How will the appointment happen?',
    (testData.appointmentOptions = faker.helpers.arrayElement(Object.values(ApptOptions)))
  )
  testData.apptDate = faker.date.future(1)
  cy.enterDateTime({
    day: testData.apptDate.getDate().toString(),
    month: (testData.apptDate.getMonth() + 1).toString(),
    year: testData.apptDate.getFullYear().toString(),
    hour: testData.apptDate.getHours().toString(),
    minute: testData.apptDate.getMinutes().toString(),
  })

  cy.fillInput('Probation telephone', (testData.phoneNumber = faker.phone.number('01277 ### ###')))
  cy.clickButton('Continue')
  cy.clickLink('Continue')
}

const recordPoDecision = function (poDecision?: string) {
  this.testData.poDecision = poDecision || faker.helpers.arrayElement(['RECALL', 'NO_RECALL'])
  cy.selectRadioByValue('What do you recommend?', this.testData.poDecision)
  cy.clickButton('Continue')
}

const navigateToLastCompletedDocumentFromDownloadLetterPage = function () {
  cy.clickLink('to overview')
  cy.clickLink('Last completed document')
}
const validateLastCompletedDocumentTabDetails = function (letterType: string) {
  cy.getRowValuesFromTable({
    tableCaption: 'Recommendations',
    rowSelector: `[data-qa]`,
  }).then(rowData => {
    expect(rowData.join('|')).to.contain(formatDateToCompletedDocumentFormat())
    expect(rowData.join('|')).to.contain(letterType)
    expect(rowData.join('|')).to.contain('This is the most recent completed document. It is not a draft.')
  })
}

/* ---- Cucumber glue ---- */

Given('a PO has created a recommendation to/of recall/no-recall with:', (dataTable: DataTable) => {
  const crn = ['DEV', 'PREPROD'].includes(Cypress.env('ENV')?.toString().toUpperCase())
    ? crns[faker.helpers.arrayElement(Object.keys(crns))]
    : crns[1]
  cy.wrap(crn).as('crn')
  cy.log(`Using CRN--> ${crn}`)
  testData = {
    licenceConditions: { standard: [], advanced: [] },
    alternativesTried: [],
    vulnerabilities: [],
  }
  makeRecommendation(crn, dataTable.rowsHash())
})

Given('a PO has created a recommendation', () => {
  const crn = crns[faker.helpers.arrayElement(Object.keys(crns))]
  cy.wrap(crn).as('crn')
  testData = {
    licenceConditions: { standard: [], advanced: [] },
    alternativesTried: [],
    vulnerabilities: [],
  }
  makeRecommendation(crn)
})

Given('a PO has created a recommendation to recall CRN: {word} with:', (crn, dataTable: DataTable) => {
  cy.wrap(crn).as('crn')
  testData = {
    licenceConditions: { standard: [], advanced: [] },
    alternativesTried: [],
    vulnerabilities: [],
  }
  makeRecommendation(crn, dataTable.rowsHash())
})

Given('PO( has) creates/created a Part A form with:', function (dataTable: DataTable) {
  const partADetails = dataTable.rowsHash()
  createPartAOrNoRecallLetter.call(this, partADetails)
})

Given('PO has started creating the Part A form without requesting SPO review', function () {
  cy.clickLink('Continue')
  cy.clickLink('Continue')
  cy.logPageTitle('What do you recommend?')
  cy.selectRadio('What do you recommend', NonIndeterminateRecallType.STANDARD)
  cy.get(
    `#recallTypeDetails${NonIndeterminateRecallType.STANDARD.toString()
      .split('_')
      .map(i => Cypress._.capitalize(i))
      .join('')}`
  ).type(faker.hacker.phrase())
  cy.clickButton('Continue')
  cy.selectRadio('Is this an emergency recall', 'No')
  cy.clickButton('Continue')
  cy.clickLink('Continue')
  currentPage = `Is ${this.offenderName} in custody now`
  cy.logPageTitle(`${currentPage}?`)
  cy.selectRadio(currentPage, CustodyType.NO)
  cy.clickButton('Continue')
})

Given('PO( has) creates/created a Part A form without requesting SPO review with:', function (dataTable: DataTable) {
  const partADetails = dataTable.rowsHash()
  cy.clickLink('Continue')
  cy.clickLink('Continue')
  createPartAOrNoRecallLetter.call(this, partADetails)
})

Given('PO( has) requests/requested an SPO to countersign', () => {
  currentPage = `Request line manager's countersignature`
  cy.clickLink(currentPage)
  cy.logPageTitle(currentPage)
  cy.getText('case-link').then(text => {
    cy.wrap(text).as('spoCounterSignatureLink')
    cy.wrap(text.match('recommendations\\/(\\d*)\\/')[1]).as('recommendationId')
  })
  cy.clickLink('Continue')
})

Given('creates a Part A form', function () {
  createPartAOrNoRecallLetter.call(this)
})

Then('the PO task-list has the following status:', function (dataTable: DataTable) {
  const statuses = dataTable.rowsHash()
  if (statuses.LineManagerSignature)
    cy.get('#task-list-status-lineManagerSignature')
      .invoke('text')
      .then(status => {
        expectSoftly(status).to.contain(statuses.LineManagerSignature)
      })
  if (statuses.SeniorManagerSignature)
    cy.get('#task-list-status-seniorManagerSignature')
      .invoke('text')
      .then(status => {
        expectSoftly(status).to.contain(statuses.SeniorManagerSignature)
      })
  if (statuses.WhoCompletedPartA)
    cy.get('#task-list-status-whoCompletedPartA')
      .invoke('text')
      .then(status => {
        expectSoftly(status).to.contain(statuses.WhoCompletedPartA)
      })
  if (statuses.PractitionerForPartA)
    cy.get('#task-list-status-practitionerForPartA')
      .invoke('text')
      .then(status => {
        expectSoftly(status).to.contain(statuses.PractitionerForPartA)
      })
  if (statuses.RevocationContact)
    cy.get('#task-list-status-revocationContact')
      .invoke('text')
      .then(status => {
        expectSoftly(status).to.contain(statuses.RevocationContact)
      })
  if (statuses.PpcsQueryEmails)
    cy.get('#task-list-status-ppcsQueryEmails')
      .invoke('text')
      .then(status => {
        expectSoftly(status).to.contain(statuses.PpcsQueryEmails)
      })
})

Given('PO( has) requests/requested an SPO to review recommendation', function () {
  cy.getText('case-link').as('spoCounterSignatureLink')
  cy.clickLink('Continue')
  cy.clickLink('Continue')
  cy.log('Logging out as PO!')
  cy.clickLink('Sign out')
})

Then('the previous Recommendation should be marked a complete', function () {
  cy.getRowValuesFromTable({
    tableCaption: 'Recommendations',
    rowSelector: `[data-qa="${this.recommendationId}"]`,
  }).then(rowData => {
    expect(rowData.join('|')).to.contain('Download Part A')
  })
})

Then('PO can create the Decision Not To Recall letter', function (dataTable: DataTable) {
  createDNTRLetter.call(this, dataTable)
})

When('PO confirms the review decision of {managersDecision}', function (decision: string) {
  recordPoDecision.call(this, decision)
})

Then('PO can download the Decision Not To Recall letter', function () {
  cy.clickLink('Create letter')
  cy.downloadDocX('Download the decision not to recall letter (DOCX).').as('DNTRLetter')
})

Then(
  'the Last Completed Document tab has a link to download the latest {word} document',
  function (letterType: string) {
    navigateToLastCompletedDocumentFromDownloadLetterPage()
    validateLastCompletedDocumentTabDetails(letterType.replace('-', ' '))
  }
)

Then('Decision Not To Recall letter details are correct', function () {
  cy.log(`Validating Decision Not To Recall Letter --> ${JSON.stringify(this.testData)}`)
  const contents = this.DNTRLetter.toString()
  letterSubject(contents)
  whyRecall(contents, this.testData.whyRecall)
  licenceBreachDetails(contents, this.testData.licenceBreachDetails)
  noRecallReasonDetails(contents, this.testData.noRecallReasonDetails)
  progressDetails(contents, this.testData.progressDetails)
  licenceBreachExplanation(contents, this.testData.licenceBreachExplanation)
  futureActionDetails(contents, this.testData.futureActionDetails)
  appointmentOptions(contents, this.testData.appointmentOptions)
  offendersPhoneNumber(contents, this.testData.phoneNumber)
  appointmentDate(contents, this.testData.apptDate)
})

When('PO has updated {string} under Contact Information section', function (question: string) {
  currentPage = question
  if (question === 'Who completed this Part A?') {
    cy.clickLink(currentPage)
    cy.logPageTitle(currentPage)
    cy.get(`#name`).type(faker.name.fullName())
    cy.get(`#email`).type(faker.internet.email())
    cy.selectRadio('Is this person the probation practitioner', 'No')
    cy.clickButton('Continue')
    currentPage = `Practitioner for ${this.offenderName}`
    cy.logPageTitle(`${currentPage}?`)
    cy.get(`#name`).type(faker.name.fullName())
    cy.get(`#email`).type(faker.internet.email())
    cy.clickButton('Continue')
  } else {
    cy.clickLink(currentPage)
    cy.logPageTitle(currentPage)
    cy.get(`#email_0`).type(faker.internet.email())
    cy.clickButton('Add another email')
    cy.get(`#email_1`).type(faker.internet.email())
    cy.clickButton('Continue')
  }
})
Given('the probation admin flag is turned on', function () {
  cy.url().then(urValue => cy.visit(`${urValue}?flagProbationAdmin=1`))
})
