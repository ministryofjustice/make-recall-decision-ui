import { defineStep, When } from '@badeball/cypress-cucumber-preprocessor'
import { getTestDataPerEnvironment } from '../../utils'
import { longDateMatchPattern } from '../../../cypress_shared/utils'

const apiDataForCrn = getTestDataPerEnvironment()

export const crns = {
  1: Cypress.env('CRN') || 'X098092',
  2: Cypress.env('CRN2') || 'X514364',
  3: Cypress.env('CRN3') || 'X252642',
  4: Cypress.env('CRN4') || 'X487027',
  5: Cypress.env('CRN5') || 'X476202',
}

// ==================================== Recall

const defaultStartPath = (crnNum: string) => {
  const crnToUse = crns[crnNum]
  return `/cases/${crnToUse}/overview?flagRecommendationsPage=1&flagDeleteRecommendation=1`
}

const deleteOldRecommendation = () => {
  cy.clickLink('Recommendations')
  cy.get('body').then($body => {
    if ($body.find('[data-qa="delete-recommendation"]').length) {
      cy.clickButton('Delete')
    }
  })
}

When('Maria signs in to the case overview for CRN {string}', (crnNum: string) => {
  cy.visitPage(defaultStartPath(crnNum))
  cy.get(`[data-qa="sectionHeading"]`).invoke('text').as('offenderName')
  deleteOldRecommendation()
})

When(
  'Maria signs in to the case overview for CRN {string} with feature flag {string} enabled',
  (crnNum: string, featureFlag: string) => {
    const flags = featureFlag ? `&${featureFlag}=1` : ''
    cy.visitPage(`${defaultStartPath(crnNum)}${flags}`)
    cy.get(`[data-qa="sectionHeading"]`).invoke('text').as('offenderName')
    deleteOldRecommendation()
  }
)

When('Maria considers a new recall', () => {
  const detail = 'Risk has increased. Considering a recall.'
  cy.clickLink('Consider a recall')
  cy.fillInput('Consider a recall', detail)
  cy.clickButton('Continue')
  cy.getText('recallConsideredDetail').should('equal', detail)
})

When('Maria starts a new recommendation', () => {
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
  cy.fillInput('Give details on Increased frequency of reporting', 'Details on reporting', {
    parent: '#conditional-INCREASED_FREQUENCY',
  })
  cy.fillInput('Give details on Drug testing', 'Details on drug testing', { parent: '#conditional-DRUG_TESTING' })
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
  cy.fillInput('Give details on Relationship breakdown', 'Details on relationship breakdown', {
    parent: '#conditional-RELATIONSHIP_BREAKDOWN',
  })
  cy.fillInput('Give details on Physical disabilities', 'Details on physical disabilities', {
    parent: '#conditional-PHYSICAL_DISABILITIES',
  })
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

When('Maria confirms the personal details', () => {
  cy.getElement('Personal details To review').should('exist')
  cy.clickLink('Personal details')
  cy.clickLink('Continue')
  cy.getElement('Personal details Reviewed').should('exist')
})

When('Maria reviews the personal details', () => {
  cy.getElement('Personal details To review').should('exist')
  cy.clickLink('Personal details')
  cy.getText('fullName').as('fullName')
  cy.getDefinitionListValue('Name').should('match', apiDataForCrn.fullName)
  cy.getText('gender').as('gender')
  cy.getDefinitionListValue('Gender').should('match', apiDataForCrn.gender)
  cy.getDateAttribute('dateOfBirth').as('dateOfBirth')
  cy.getDefinitionListValue('Date of birth').should('match', longDateMatchPattern(apiDataForCrn.dateOfBirth))
  cy.clickLink('Continue')
  cy.getElement('Personal details Reviewed').should('exist')
})

When('Maria confirms the offence details', () => {
  cy.getElement('Offence details To review').should('exist')
  cy.clickLink('Offence details')
  cy.clickLink('Continue')
  cy.getElement('Offence details Reviewed').should('exist')
})

When('Maria reviews the offence details', () => {
  cy.getElement('Offence details To review').should('exist')
  cy.clickLink('Offence details')
  cy.getText('indexOffenceDescription').as('indexOffenceDescription')
  cy.getDefinitionListValue('Main offence').should('match', apiDataForCrn.indexOffenceDescription)
  cy.clickLink('Continue')
  cy.getElement('Offence details Reviewed').should('exist')
})

When('Maria enters the offence analysis', () => {
  cy.getElement('Offence analysis To do').should('exist')
  cy.clickLink('Offence analysis')
  cy.fillInput('Write the offence analysis', apiDataForCrn.offenceAnalysis)
  cy.clickButton('Continue')
  cy.getElement('Offence analysis Completed').should('exist')
})

When('Maria enters the previous releases', () => {
  cy.getElement('Previous releases To do').should('exist')
  cy.clickLink('Previous releases')
  cy.getDateAttribute('lastReleaseDate').as('lastReleaseDate')
  cy.get('@offenderName').then(offenderName => {
    cy.selectRadio(`Has ${offenderName} been released previously?`, 'Yes')
  })
  cy.clickButton('Continue')
  cy.enterDateTime(apiDataForCrn.previousReleaseDate)
  cy.clickButton('Continue')
  cy.getElement('Previous releases Completed').should('exist')
})

When('Maria reviews the MAPPA details', () => {
  cy.get('@offenderName').then(offenderName => {
    cy.getElement(`MAPPA for ${offenderName} To review`).should('exist')
    cy.clickLink(`MAPPA for ${offenderName}`)
    cy.clickLink('Continue')
    cy.getElement(`MAPPA for ${offenderName} Reviewed`).should('exist')
  })
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
    cy.getSelectableOptionByLabel(`Is ${offenderName} on an extended sentence?`, 'Yes').should('be.checked')
    cy.selectRadio(`Is ${offenderName} on an extended sentence?`, 'No')
  })
  cy.clickButton('Continue')
})

When('Maria confirms the person is in prison custody', () => {
  cy.get('@offenderName').then(offenderName => {
    cy.selectRadio(`Is ${offenderName} in custody now?`, 'Yes, prison custody')
  })
  cy.clickButton('Continue')
})

When('Maria confirms the person is in police custody', () => {
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

When('Maria signs out', () => {
  cy.clickLink('Sign out')
})

When('Henry signs in to the case overview for CRN {string}', (crnNum: string) => {
  cy.visitPage(defaultStartPath(crnNum), true)
})
