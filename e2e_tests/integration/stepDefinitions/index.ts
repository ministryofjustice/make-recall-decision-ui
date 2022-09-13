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

When('Maria recommends a standard recall', () => {
  cy.selectRadio('What do you recommend?', 'Standard recall')
  cy.fillInput('Why do you recommend this recall type?', 'Details...', { parent: '#conditional-recallType-2' })
  cy.clickButton('Continue')
})

When('Maria reads the guidance on sensitive information', () => {
  cy.pageHeading().should('contain', 'Sensitive information')
  cy.clickLink('Continue')
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

When('Maria confirms the person is on an indeterminate sentence', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectRadio(`Is ${offenderName} on an indeterminate sentence?`, 'Yes')
  )
  cy.clickButton('Continue')
})

When('Maria confirms the person is on a IPP sentence', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectRadio(`What type of sentence is ${offenderName} on?`, 'Imprisonment for Public Protection (IPP) sentence')
  )
  cy.clickButton('Continue')
})

When("Maria states that it's not an emergency recall", () => {
  cy.selectRadio('Is this an emergency recall?', 'No')
  cy.clickButton('Continue')
})

When('Maria indicates the person is not in custody', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectRadio(`Is ${offenderName} in custody now?`, 'No')
  )
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
  cy.fillInput('Telephone number', '07936 737 387')
  cy.fillInput('Fax number (optional)', '0208 737 3838')
  cy.fillInput('Email address', 'bob.wiggins@met.gov.uk')
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

When('Maria indicates there is a risk of contraband', () => {
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Do you think ${offenderName} is using recall to bring contraband into prison?`)
    cy.selectRadio(`Do you think ${offenderName} is using recall to bring contraband into prison?`, 'Yes')
  })
  cy.fillInput('Give details. Also tell your local police contact about your concerns.', 'Contraband details...')
  cy.clickButton('Continue')
})

When('Maria sees a confirmation page', () => {
  cy.clickLink('Create Part A')
  cy.pageHeading().should('contain', 'Part A created')
})

When('Maria downloads the Part A', () => {
  cy.downloadDocX('Download the Part A').then(contents => {
    cy.log('Q2')
    expect(contents).to.contain('Is the offender serving a life or IPP/DPP sentence? Yes - IPP')
    cy.log('Q6')
    expect(contents).to.contain('Is the offender currently in police custody or prison custody? No')

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

    cy.log('Q11')
    expect(contents).to.contain('Do you have any suspicions that the offender is using recall to bring contraband into the prison estate? Yes')
    expect(contents).to.contain('If yes, provide details and contact your local police SPOC to share information or concerns: Contraband details...')
    cy.log('Q13')
    expect(contents).to.contain('Registered PPO/IOM: N/A')
    cy.log('Q14')
    expect(contents).to.contain(
      'Is there a victim(s) involved in the victim contact scheme (contact must be made with the VLO if there is victim involvement)? Yes'
    )
    expect(contents).to.contain('Confirm the date the VLO was informed of the above: 14 April 2022')
    // TODO - Q18 - additional licence conditions
    cy.log('Q19')
    expect(contents).to.contain('Increasingly violent behaviour')
    cy.log('Q20')
    expect(contents).to.contain('Re-offending has occurred')
    cy.log('Q21')
    expect(contents).to.contain('Details on reporting')
    expect(contents).to.contain('Details on drug testing')
    cy.log('Q22')
    expect(contents).to.contain('Select the proposed recall type, having considered the information above: Standard')
    expect(contents).to.contain('Explain your reasons for the above recall type recommendation: Details...')
  })
})

When('Maria confirms the recommendation was saved', () => {
  cy.log('========== Confirm recommendation saved"')
  cy.clickLink('Back to case overview')
  // check saved values
  cy.pageHeading().should('contain', 'Overview')
  cy.clickLink('Update recommendation')

  cy.pageHeading().should('equal', 'Create a Part A form')

  cy.log('========= Response to probation')
  cy.clickLink('Response to probation so far')
  cy.get('@offenderName').then(offenderName => {
    cy
      .getTextInputValue(`How has ${offenderName} responded to probation so far?`)
      .should('equal', 'Re-offending has occurred')
  })
  cy.clickButton('Continue')

  cy.log('========= Licence conditions')
  cy.clickLink('Breached licence condition(s)')
  cy.get('@offenderName').then(offenderName =>
    cy
      .getRadioOptionByLabel(
        `What licence conditions has ${offenderName} breached?`,
        'Receive visits from the supervising officer in accordance with instructions given by the supervising officer'
      )
      .should('be.checked')
  )
  cy.clickButton('Continue')

  cy.log('========= Alternatives to recall')
  cy.clickLink('Alternatives tried already')
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


  cy.log('========= Indeterminate sentence')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} on an indeterminate sentence?`)
    cy.getRadioOptionByLabel(`Is ${offenderName} on an indeterminate sentence?`, 'Yes').should('be.checked')
  })
  cy.clickButton('Continue')

  cy.log('========= Type of indeterminate sentence')
  cy.clickLink('Type of indeterminate sentence')
  cy.get('@offenderName').then(offenderName => {
    cy.getRadioOptionByLabel(`What type of sentence is ${offenderName} on?`, 'Imprisonment for Public Protection (IPP) sentence').should('be.checked')
  })
  cy.clickButton('Continue')

  cy.log('========= Recommendation')
  cy.clickLink('What you recommend')
  cy.getRadioOptionByLabel('What do you recommend?', 'Standard recall').should('be.checked')
  cy.clickButton('Continue')

  cy.log('========= Emergency recall')
  cy.clickLink('Emergency recall')
  cy.getRadioOptionByLabel('Is this an emergency recall?', 'No').should('be.checked')
  cy.clickButton('Continue')

  cy.log('========= Custody')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} in custody now?`)
    cy.getRadioOptionByLabel(`Is ${offenderName} in custody now?`, 'No').should('be.checked')
  })
  cy.clickButton('Continue')

  cy.log('========= What led to recall')
  cy.clickLink('What has led to this recall?')
  cy.getTextInputValue('What has led to this recall?').should('equal', 'Increasingly violent behaviour')
  cy.clickButton('Continue')

  cy.log('========= Vulnerability')
  cy.clickLink('Would recall affect vulnerability or additional needs?')
  cy.getRadioOptionByLabel('Consider vulnerability and additional needs. Which of these would recall affect?', 'Relationship breakdown',).should('be.checked')
  cy.getRadioOptionByLabel('Consider vulnerability and additional needs. Which of these would recall affect?', 'Physical disabilities',).should('be.checked')
  cy.getTextInputValue('Give details', { parent: '#conditional-RELATIONSHIP_BREAKDOWN' }).should(
    'equal',
    'Details on relationship breakdown'
  )
  cy.getTextInputValue('Give details', { parent: '#conditional-PHYSICAL_DISABILITIES' }).should(
    'equal',
    'Details on physical disabilities'
  )
  cy.clickButton('Continue')

  cy.log('========= IOM')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} under Integrated Offender Management (IOM)?`)
    cy.getRadioOptionByLabel(`Is ${offenderName} under Integrated Offender Management (IOM)?`, 'Not applicable').should('be.checked')
  })
  cy.clickButton('Continue')

  cy.log('========= Local police contact')
  cy.clickLink('Local police contact details')
  cy.getTextInputValue('Police contact name').should('equal', 'Bob Wiggins')
  cy.getTextInputValue('Telephone number').should('equal', '07936 737 387')
  cy.getTextInputValue('Fax number (optional)').should('equal', '0208 737 3838')
  cy.getTextInputValue('Email address').should('equal', 'bob.wiggins@met.gov.uk')
  cy.clickButton('Continue')

  cy.log('========= Victim contact scheme')
  cy.clickLink('Are there any victims in the victim contact scheme?')
  cy.getRadioOptionByLabel('Are there any victims in the victim contact scheme?', 'Yes').should('be.checked')
  cy.clickButton('Continue')
  cy.getTextInputValue('Day').should('equal', '14')
  cy.getTextInputValue('Month').should('equal', '04')
  cy.getTextInputValue('Year').should('equal', '2022')
  cy.clickButton('Continue')

  cy.log('========= Arrest issues')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is there anything the police should know before they arrest ${offenderName}?`)
    cy
      .getRadioOptionByLabel(`Is there anything the police should know before they arrest ${offenderName}?`, 'Yes')
      .should('be.checked')
  })
  cy.getTextInputValue('Give details. Include information about any vulnerable children and adults').should(
    'equal',
    'Arrest issues details...'
  )
  cy.clickButton('Continue')

  cy.log('========= Contraband')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Do you think ${offenderName} is using recall to bring contraband into prison?`)
    cy.getRadioOptionByLabel(`Do you think ${offenderName} is using recall to bring contraband into prison?`, 'Yes').should('be.checked')
  })
  cy.getTextInputValue('Give details. Also tell your local police contact about your concerns.').should('equal', 'Contraband details...')
  cy.clickButton('Continue')

  cy.pageHeading().should('equal', 'Create a Part A form')
})

When('Maria changes custody status to "In police custody"', () => {
  cy.log('========== Change to "In police custody"')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} in custody now?`)
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

When('Maria generates an updated Part A', () => {
  cy.clickLink('Create Part A')
  cy.downloadDocX('Download the Part A').then(contents => {
    cy.log('Q6')
    expect(contents).to.contain('Is the offender currently in police custody or prison custody? Police Custody')

    cy.log('Q7')
    expect(contents).to.contain('If the offender is in police custody, state where: West Ham Lane Police Station, 18 West Ham Lane, Stratford, E15 4SG')

  })
})
