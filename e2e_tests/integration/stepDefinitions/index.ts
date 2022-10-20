import { defineStep, When } from 'cypress-cucumber-preprocessor/steps'
import { DateTime } from 'luxon'
import { getTestDataPerEnvironment } from '../../utils'

export const crn = Cypress.env('CRN') || 'X098092'

// ==================================== Recall

When('Maria signs in to the case overview', () => {
  cy.visitPage(`/cases/${crn}/overview?flagRecommendationProd=1&flagRecommendationsPageProd=1`)
  cy.get(`[data-qa="sectionHeading"]`).invoke('text').as('offenderName')
})

When('Maria starts a new recommendation', () => {
  cy.clickLink('Recommendations')
  cy.get('body').then($body => {
    if ($body.find('[data-qa="delete-recommendation"]').length) {
      cy.clickButton('Delete')
    }
  })
  cy.clickButton('Make a recommendation')
})

When('Maria recommends an emergency recall', () => {
  cy.selectRadio('What do you recommend?', 'Emergency recall')
  cy.clickButton('Continue')
})

When('Maria explains how the person has responded to probation so far', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.fillInput(`How has ${offenderName} responded to probation so far?`, 'Re-offending has occurred')
  )
  cy.clickButton('Continue')
})

When('Maria states what has led to the recall', () => {
  cy.clickLink('What has led to this recall?')
  cy.fillInput('What has led to this recall?', 'Increasingly violent behaviour')
  cy.getText('previous-answer').should('equal', 'Re-offending has occurred')
  cy.clickButton('Continue')
})

When('Maria selects the licence conditions that have been breached', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectCheckboxes(`What licence conditions has ${offenderName} breached?`, [
      'Receive visits from the supervising officer in accordance with instructions given by the supervising officer',
    ])
  )
  cy.clickButton('Continue')
})

When('Maria selects the alternatives to recall that have been tried', () => {
  cy.selectCheckboxes('What alternatives to recall have been tried already?', [
    'Increased frequency of reporting',
    'Drug testing',
  ])
  cy.fillInput('Give details', 'Details on reporting', { parent: '#conditional-INCREASED_FREQUENCY' })
  cy.fillInput('Give details', 'Details on drug testing', { parent: '#conditional-DRUG_TESTING' })
  cy.clickButton('Continue')
})

When('Maria continues from the Stop and Think page', () => {
  cy.clickLink('Continue')
})

When('Maria reads the guidance on sensitive information', () => {
  cy.pageHeading().should('contain', 'Sensitive information')
  cy.clickLink('Continue')
})

defineStep('Maria confirms {string} for indeterminate sentence', (answer: string) => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectRadio(`Is ${offenderName} on an indeterminate sentence?`, answer)
  )
  cy.clickButton('Continue')
})

defineStep('Maria confirms {string} for extended sentence', (answer: string) => {
  cy.get('@offenderName').then(offenderName => cy.selectRadio(`Is ${offenderName} on an extended sentence?`, answer))
  cy.clickButton('Continue')
})

defineStep('Maria recommends a {string} recall', (recallType: string) => {
  cy.selectRadio('What do you recommend?', `${recallType} recall`)
  if (recallType !== 'No') {
    const parent = recallType === 'Standard' ? '#conditional-recallType' : '#conditional-recallType-2'
    cy.fillInput('Why do you recommend this recall type?', `${recallType} details...`, { parent })
  }
  cy.clickButton('Continue')
})

When('Maria changes the recall type', () => {
  cy.clickLink('What you recommend')
})

When('Maria indicates the person is not in custody', () => {
  cy.get('@offenderName').then(offenderName => cy.selectRadio(`Is ${offenderName} in custody now?`, 'No'))
  cy.clickButton('Continue')
})

When('Maria selects the vulnerabilities that recall would affect', () => {
  cy.clickLink('Would recall affect vulnerability or additional needs?')
  cy.selectCheckboxes('Consider vulnerability and additional needs. Which of these would recall affect?', [
    'Relationship breakdown',
    'Physical disabilities',
  ])
  cy.fillInput('Give details', 'Details on relationship breakdown', { parent: '#conditional-RELATIONSHIP_BREAKDOWN' })
  cy.fillInput('Give details', 'Details on physical disabilities', { parent: '#conditional-PHYSICAL_DISABILITIES' })
  cy.clickButton('Continue')
})

When('Maria views the page Create a Part A form', () => {
  cy.pageHeading().should('contain', 'Create a Part A form')
})

defineStep('Maria confirms {string} to integrated offender management', (answer: string) => {
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} under Integrated Offender Management (IOM)?`)
    cy.selectRadio(`Is ${offenderName} under Integrated Offender Management (IOM)?`, answer)
  })
  cy.clickButton('Continue')
})

When('Maria completes local police contact details', () => {
  cy.clickLink('Local police contact details')
  cy.fillInput('Police contact name', 'Bob Wiggins')
  cy.fillInput('Telephone number', '07936 737 387')
  cy.fillInput('Fax number (optional)', '0208 737 3838')
  cy.fillInput('Email address', 'bob.wiggins@met.gov.uk')
  cy.clickButton('Continue')
})

defineStep('Maria confirms {string} to victim contact scheme', (answer: string) => {
  cy.clickLink('Are there any victims in the victim contact scheme?')
  cy.selectRadio('Are there any victims in the victim contact scheme?', answer)
  cy.clickButton('Continue')
})

When('Maria enters the date the VLO was informed', () => {
  cy.enterDateTime({ year: '2022', month: '04', day: '14' }, { parent: '#dateVloInformed' })
  cy.clickButton('Continue')
})

When('Maria enters any arrest issues', () => {
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is there anything the police should know before they arrest ${offenderName}?`)
    cy.selectRadio(`Is there anything the police should know before they arrest ${offenderName}?`, 'Yes')
  })
  cy.fillInput('Give details. Include information about any vulnerable children and adults', 'Arrest issues details...')
  cy.clickButton('Continue')
})

When('Maria enters an address where the person can be found', () => {
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink('Address')
    cy.selectRadio(`Is this where the police can find ${offenderName}?`, 'No')
  })
  cy.fillInput('Give the correct location', '123 Acacia Avenue, Birmingham B23 1AV')
  cy.clickButton('Continue')
})

defineStep('Maria confirms {string} to a risk of contraband', (answer: string) => {
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Do you think ${offenderName} is using recall to bring contraband into prison?`)
    cy.selectRadio(`Do you think ${offenderName} is using recall to bring contraband into prison?`, answer)
  })
  if (answer === 'Yes') {
    cy.fillInput('Give details. Also tell your local police contact about your concerns.', 'Contraband details...')
  }
  cy.clickButton('Continue')
})

When('Maria clicks Create Part A', () => {
  cy.clickLink('Create Part A')
  cy.pageHeading().should('contain', 'Part A created')
})

When('Maria starts to update the recall', () => {
  cy.log('========== Confirm recommendation saved"')
  cy.clickLink('Back to case overview')
  // check saved values
  cy.pageHeading().should('contain', 'Overview')
  cy.clickLink('Update recommendation')

  cy.pageHeading().should('equal', 'Create a Part A form')
})

When('Maria confirms a not extended sentence', () => {
  cy.log('========= Extended sentence')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} on an extended sentence?`)
    // this answer will have been reset to null
    cy.getRadioOptionByLabel(`Is ${offenderName} on an extended sentence?`, 'Yes').should('be.checked')
    cy.selectRadio(`Is ${offenderName} on an extended sentence?`, 'No')
  })
  cy.clickButton('Continue')
})

When('Maria changes custody status to "In police custody"', () => {
  cy.log('========== Change to "In police custody"')
  cy.get('@offenderName').then(offenderName => {
    cy.selectRadio(`Is ${offenderName} in custody now?`, 'Yes, police custody')
  })
  cy.fillInput('Custody address', 'West Ham Lane Police Station\n18 West Ham Lane\nStratford\nE15 4SG')
  cy.clickButton('Continue')

  // Local police contact / arrest issues links should be hidden, because person is in custody now
  cy.getElement('Local police contact details').should('not.exist')
  cy.get('@offenderName').then(offenderName => {
    cy.getElement(`Is there anything the police should know before they arrest ${offenderName}?`).should('not.exist')
  })
})

When('Maria confirms the person is in prison custody', () => {
  cy.get('@offenderName').then(offenderName => {
    cy.selectRadio(`Is ${offenderName} in custody now?`, 'Yes, prison custody')
  })
  cy.clickButton('Continue')
})

When('Maria confirms the existing custody status', () => {
  cy.clickButton('Continue')
})

const data = getTestDataPerEnvironment()

export const q1EmergencyRecall = (contents: string, answer: string) =>
  expect(contents).to.contain(`until PPCS has issued the revocation order.  ${answer}`)
export const q2IndeterminateSentenceType = (contents: string, answer: string) =>
  expect(contents).to.contain(`Is the offender serving a life or IPP/DPP sentence? ${answer}`)
export const q3ExtendedSentence = (contents: string, answer: string) =>
  expect(contents).to.contain(`Is the offender serving one of the following:  ${answer}`)
export const q4OffenderDetails = (contents: string) => {
  expect(contents).to.match(data.fullName as RegExp)
  expect(contents).to.match(data.dateOfBirth as RegExp)
  expect(contents).to.match(data.ethnicity as RegExp)
  expect(contents).to.match(data.gender as RegExp)
  expect(contents).to.match(data.cro as RegExp)
  expect(contents).to.match(data.pnc as RegExp)
  expect(contents).to.match(data.prisonNo as RegExp)
  expect(contents).to.match(data.noms as RegExp)
}
export const q5SentenceDetails = (contents: string) => {
  expect(contents).to.match(data.indexOffence as RegExp)
  expect(contents).to.match(data.dateOfOriginalOffence as RegExp)
  expect(contents).to.match(data.dateOfSentence as RegExp)
  expect(contents).to.match(data.lengthOfSentence as RegExp)
  expect(contents).to.match(data.licenceExpiryDate as RegExp)
  expect(contents).to.match(data.sentenceExpiryDate as RegExp)
  expect(contents).to.match(data.custodialTerm as RegExp)
  expect(contents).to.match(data.extendedTerm as RegExp)
}
export const q6CustodyStatus = (contents: string, answer: string) =>
  expect(contents).to.contain(`Is the offender currently in police custody or prison custody? ${answer}`)
export const q7Addresses = (contents: string, answer: string) =>
  expect(contents).to.contain(`If the offender is in police custody, state where: ${answer}`)
export const q8ArrestIssues = (contents: string, answer: string, details: string) => {
  expect(contents).to.contain(`Are there any arrest issues of which police should be aware?  ${answer}`)
  expect(contents).to.contain(
    `If yes, provide details below, including information about any children or vulnerable adults linked to any of the above addresses: ${details}`
  )
}
export const q12MappaDetails = (contents: string) => {
  expect(contents).to.match(data.mappaCategory as RegExp)
  expect(contents).to.match(data.mappaLevel as RegExp)
}
export const q16IndexOffenceDetails = (contents: string) => {
  // FIXME: For this to work on dev and preprod, we need a corresponding record in OASys for our CRN
  expect(contents).to.match(data.indexOffenceDetails as RegExp)
}
export const q22RecallType = (contents: string, answer: string, details: string) => {
  expect(contents).to.contain(`Select the proposed recall type, having considered the information above: ${answer}`)
  expect(contents).to.contain(`Explain your reasons for the above recall type recommendation: ${details}`)
}
export const q25ProbationDetails = (contents: string) => {
  // FIXME: Name of our user not getting pulled through
  expect(contents).to.match(data.nameOfPersonCompletingForm as RegExp)
  expect(contents).to.match(data.emailAddressOfPersonCompletingForm as RegExp)
  expect(contents).to.match(data.region as RegExp)
  expect(contents).to.match(data.ldu as RegExp)
  expect(contents).to.contain(`${data.dateOfDecision} ${DateTime.now().toFormat('dd/MM/y')}`)
  expect(contents).to.match(data.timeOfDecision as RegExp)
}
