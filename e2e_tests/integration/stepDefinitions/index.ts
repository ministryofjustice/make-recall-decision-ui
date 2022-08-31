import { When } from 'cypress-cucumber-preprocessor/steps'

export const crn = Cypress.env('CRN') || 'X098092'

When('Maria signs in', () => {
  cy.visitPage('/?flagRecommendationProd=1&flagRecommendationsPageProd=1')
})

When('Maria searches for a case', () => {
  cy.clickLink('Start now')
  cy.pageHeading().should('equal', 'Search for a person on probation')
  cy.fillInput('Search', crn)
  cy.clickButton('Search')
  cy.get(`[data-qa="row-${crn}"] [data-qa="name"]`).first().click().invoke('text').as('offenderName')
})

When('Maria views the overview page', () => {
  cy.get('@offenderName').then(offenderName => cy.getText('sectionHeading').should('equal', offenderName))
  cy.getText('lastReleaseDate').should('not.be.empty')
  cy.getText('licenceExpiryDate').should('not.be.empty')
})

When('Maria views the risk page', () => {
  cy.clickLink('Risk')
  cy.pageHeading().should('contain', 'Risk')
})

When('Maria views the personal details page', () => {
  cy.clickLink('Personal details')
  cy.pageHeading().should('contain', 'Personal details')
})

When('Maria views the licence conditions page', () => {
  cy.clickLink('Licence conditions')
  cy.pageHeading().should('contain', 'Licence conditions')
})

When('Maria views the Contact history page', () => {
  cy.clickLink('Contact history')
  cy.pageHeading().should('contain', 'Contact history')
})

When('Maria filters contacts by date range', () => {
  cy.get('.app-summary-card')
    .its('length')
    .then(numberOfContacts => {
      cy.getElement(`${numberOfContacts} contacts`).should('exist')
    })
  cy.enterDateTime('2022-03-13', { parent: '#dateFrom' })
  cy.enterDateTime('2022-04-13', { parent: '#dateTo' })
  cy.clickButton('Apply filters')
  cy.getLinkHref('13 Mar 2022 to 13 Apr 2022').should('equal', `/cases/${crn}/contact-history`)
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

When('Maria recommends a fixed term recall', () => {
  cy.selectRadio('What do you recommend?', 'Fixed term recall')
  cy.fillInput('Why do you recommend this recall type?', 'Details...')
  cy.clickButton('Continue')
})

When('Maria explains how the person has responded to probation so far', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.fillInput(`How has ${offenderName} responded to probation so far?`, 'Re-offending has occurred')
  )
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

When("Maria states that it's not an emergency recall", () => {
  cy.selectRadio('Is this an emergency recall?', 'No')
  cy.clickButton('Continue')
})

When('Maria selects a custody status', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectRadio(`Is ${offenderName} in custody now?`, 'Yes, police custody')
  )
  cy.clickButton('Continue')
})

When('Maria selects the vulnerabilities that recall would affect', () => {
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

When('Maria states that the person is not under integrated offender management', () => {
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} under Integrated Offender Management (IOM)?`)
    cy.selectRadio(`Is ${offenderName} under Integrated Offender Management (IOM)?`, 'Not applicable')
  })
  cy.clickButton('Continue')
})

When('Maria completes local police contact details', () => {
  cy.clickLink('Local police contact details')
  cy.fillInput('Police contact name', 'Bob Wiggins')
  cy.fillInput('Telephone number (optional)', '07936 737 387')
  cy.fillInput('Fax number (optional)', '0208 737 3838')
  cy.fillInput('Email address (optional)', 'bob.wiggins@met.gov.uk')
  cy.clickButton('Continue')
})

When('Maria states there are victims in the victim contact scheme', () => {
  cy.clickLink('Are there any victims in the victim contact scheme?')
  cy.selectRadio('Are there any victims in the victim contact scheme?', 'Yes')
  cy.clickButton('Continue')
})

When('Maria enters the date the VLO was informed', () => {
  cy.enterDateTime('2022-04-14', { parent: '#dateVloInformed' })
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

When('Maria sees a confirmation page', () => {
  cy.pageHeading().should('contain', 'Part A created')
})

When('Maria downloads the Part A', () => {
  cy.downloadDocX('Download the Part A').then(contents => {
    cy.log('Q6')
    expect(contents).to.contain('Is the offender currently in police custody or prison custody? Police Custody')
    cy.log('Q8')
    expect(contents).to.contain('Are there any arrest issues of which police should be aware?  Yes')
    expect(contents).to.contain('Arrest issues details...')
    cy.log('Q9')
    expect(contents).to.contain('Police single point of contact name: Bob Wiggins')
    expect(contents).to.contain('Current contact telephone number: 07936 737 387')
    expect(contents).to.contain('Fax number:  0208 737 3838')
    expect(contents).to.contain('Email address: bob.wiggins@met.gov.uk')

    cy.log('Q10')
    expect(contents).to.contain('Relationship breakdown')
    expect(contents).to.contain('Details on relationship breakdown')
    expect(contents).to.contain('Physical disabilities')
    expect(contents).to.contain('Details on physical disabilities')

    cy.log('Q13')
    expect(contents).to.contain('Registered PPO/IOM: N/A')
    cy.log('Q14')
    expect(contents).to.contain(
      'Is there a victim(s) involved in the victim contact scheme (contact must be made with the VLO if there is victim involvement)? Yes'
    )
    expect(contents).to.contain('Confirm the date the VLO was informed of the above: 14 April 2022')
    // TODO - Q18 - additional licence conditions
    cy.log('Q20')
    expect(contents).to.contain('Re-offending has occurred')
    cy.log('Q21')
    expect(contents).to.contain('Details on reporting')
    expect(contents).to.contain('Details on drug testing')
    cy.log('Q22')
    expect(contents).to.contain('Select the proposed recall type, having considered the information above: Fixed')
    expect(contents).to.contain('Explain your reasons for the above recall type recommendation: Details...')
  })
})

When('Maria updates the recommendation', () => {
  cy.clickLink('Back to case overview')
  // check saved values
  cy.pageHeading().should('contain', 'Overview')
  cy.clickLink('Update recommendation')
  // responded to probation
  cy.get('@offenderName').then(offenderName =>
    cy
      .getTextInputValue(`How has ${offenderName} responded to probation so far?`)
      .should('equal', 'Re-offending has occurred')
  )
  cy.clickButton('Continue')

  // licence conditions
  cy.get('@offenderName').then(offenderName =>
    cy
      .getRadioOptionByLabel(
        `What licence conditions has ${offenderName} breached?`,
        'Receive visits from the supervising officer in accordance with instructions given by the supervising officer'
      )
      .should('be.checked')
  )
  cy.clickButton('Continue')

  // alternatives to recall
  cy.getRadioOptionByLabel(
    'What alternatives to recall have been tried already?',
    'Increased frequency of reporting'
  ).should('be.checked')
  cy.getRadioOptionByLabel('What alternatives to recall have been tried already?', 'Drug testing').should('be.checked')
  cy.getTextInputValue('Give details', { parent: '#conditional-INCREASED_FREQUENCY' }).should(
    'equal',
    'Details on reporting'
  )
  cy.getTextInputValue('Give details', { parent: '#conditional-DRUG_TESTING' }).should(
    'equal',
    'Details on drug testing'
  )
  cy.clickButton('Continue')

  cy.clickLink('Continue') // stop and think page
  cy.getRadioOptionByLabel('What do you recommend?', 'Fixed term recall').should('be.checked')
  cy.clickButton('Continue')
  cy.getRadioOptionByLabel('Is this an emergency recall?', 'No').should('be.checked')
  cy.clickButton('Continue')
  cy.get('@offenderName').then(offenderName =>
    cy.getRadioOptionByLabel(`Is ${offenderName} in custody now?`, 'Yes, police custody').should('be.checked')
  )
  cy.clickButton('Continue')

  // vulnerabilities
  cy.getRadioOptionByLabel('Consider vulnerability and additional needs. Which of these would recall affect?','Relationship breakdown',).should('be.checked')
  cy.getRadioOptionByLabel('Consider vulnerability and additional needs. Which of these would recall affect?','Physical disabilities',).should('be.checked')
  cy.getTextInputValue('Give details', { parent: '#conditional-RELATIONSHIP_BREAKDOWN' }).should(
    'equal',
    'Details on relationship breakdown'
  )
  cy.getTextInputValue('Give details', { parent: '#conditional-PHYSICAL_DISABILITIES' }).should(
    'equal',
    'Details on physical disabilities'
  )
  cy.clickButton('Continue')

  // IOM
  cy.get('@offenderName').then(offenderName =>
    cy.getRadioOptionByLabel(`Is ${offenderName} under Integrated Offender Management (IOM)?`, 'Not applicable').should('be.checked')
  )
  cy.clickButton('Continue')

  cy.getTextInputValue('Police contact name').should('equal', 'Bob Wiggins')
  cy.getTextInputValue('Telephone number (optional)').should('equal', '07936 737 387')
  cy.getTextInputValue('Fax number (optional)').should('equal', '0208 737 3838')
  cy.getTextInputValue('Email address (optional)').should('equal', 'bob.wiggins@met.gov.uk')
  cy.clickButton('Continue')

  cy.getRadioOptionByLabel('Are there any victims in the victim contact scheme?', 'Yes').should('be.checked')
  cy.clickButton('Continue')
  cy.getTextInputValue('Day').should('equal', '14')
  cy.getTextInputValue('Month').should('equal', '04')
  cy.getTextInputValue('Year').should('equal', '2022')
  cy.clickButton('Continue')
  cy.get('@offenderName').then(offenderName =>
    cy
      .getRadioOptionByLabel(`Is there anything the police should know before they arrest ${offenderName}?`, 'Yes')
      .should('be.checked')
  )
  cy.getTextInputValue('Give details. Include information about any vulnerable children and adults').should(
    'equal',
    'Arrest issues details...'
  )
})
