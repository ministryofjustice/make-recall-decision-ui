import { When } from '@badeball/cypress-cucumber-preprocessor'
import {
  q12MappaDetails,
  q16IndexOffenceDetails,
  q1EmergencyRecall,
  q22RecallType,
  q25ProbationDetails,
  q2IndeterminateSentenceType,
  q3ExtendedSentence,
  q4OffenderDetails,
  q5SentenceDetails,
  q6CustodyStatus,
  q7Addresses,
  q8ArrestIssues,
} from './assertionsPartA'

When('Maria confirms the person is on a IPP sentence', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectRadio(`What type of sentence is ${offenderName} on?`, 'Imprisonment for Public Protection (IPP) sentence')
  )
  cy.clickButton('Continue')
})

When('Maria confirms the person is on a life sentence', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectRadio(`What type of sentence is ${offenderName} on?`, 'Life sentence')
  )
  cy.clickButton('Continue')
})

When('Maria confirms the existing indeterminate and extended sentence criteria', () => {
  cy.clickButton('Continue')
})

When('Maria enters indeterminate and extended sentence criteria', () => {
  cy.get('@offenderName').then(offenderName =>
    cy.selectCheckboxes('Indeterminate and extended sentences', [
      `${offenderName} has shown behaviour similar to the index offence`,
      `${offenderName} has shown behaviour that could lead to a sexual or violent offence`,
      `${offenderName} is out of touch`,
    ])
  )
  cy.fillInput('Give details', 'Details on behaviour similar to index offence', {
    parent: '#conditional-BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
  })
  cy.fillInput('Give details', 'Details on behaviour that could lead to a sexual or violent offence', {
    parent: '#conditional-BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
  })
  cy.fillInput('Give details', 'Details on out of touch', { parent: '#conditional-OUT_OF_TOUCH' })
  cy.clickButton('Continue')
})

When('Maria downloads the Part A and confirms the indeterminate recall', () => {
  cy.downloadDocX('Download the Part A').then(contents => {
    q1EmergencyRecall(contents, 'Yes')
    q2IndeterminateSentenceType(contents, 'Yes - IPP')
    q3ExtendedSentence(contents, 'Yes')
    q4OffenderDetails(contents)
    cy.log('Q5')
    q5SentenceDetails(contents)
    q6CustodyStatus(contents, 'No')
    cy.log('Q7')
    expect(contents).to.contain(
      'Provide any other possible addresses: Police can find this person at: 123 Acacia Avenue, Birmingham B23 1AV'
    )
    q8ArrestIssues(contents, 'Yes', 'Arrest issues details...')
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
    expect(contents).to.contain(
      'Do you have any suspicions that the offender is using recall to bring contraband into the prison estate? Yes'
    )
    expect(contents).to.contain(
      'If yes, provide details and contact your local police SPOC to share information or concerns: Contraband details...'
    )
    cy.log('Q12')
    q12MappaDetails(contents)
    cy.log('Q13')
    expect(contents).to.contain('Registered PPO/IOM: Yes')
    cy.log('Q14')
    expect(contents).to.contain(
      'Is there a victim(s) involved in the victim contact scheme (contact must be made with the VLO if there is victim involvement)? Yes'
    )
    expect(contents).to.contain('Confirm the date the VLO was informed of the above: 14 April 2022')
    cy.log('Q16')
    q16IndexOffenceDetails(contents)
    // TODO - Q18 - additional licence conditions
    cy.log('Q19')
    expect(contents).to.contain('Increasingly violent behaviour')
    cy.log('Q20')
    expect(contents).to.contain('Re-offending has occurred')
    cy.log('Q21')
    expect(contents).to.contain('Details on reporting')
    expect(contents).to.contain('Details on drug testing')

    q22RecallType(contents, 'N/A', 'N/A')
    cy.log('Q23')
    expect(contents).to.contain(
      'Has the offender exhibited behaviour similar to the circumstances surrounding the index offence; is there a causal link? Yes'
    )
    expect(contents).to.contain('Please Comment: Details on behaviour similar to index offence')
    expect(contents).to.contain(
      'Has the offender exhibited behaviour likely to give rise, or does give rise to the commission of a sexual or violent offence? Yes'
    )
    expect(contents).to.contain('Please Comment: Details on behaviour that could lead to a sexual or violent offence')
    expect(contents).to.contain(
      'Is the offender out of touch with probation/YOT and the assumption can be made that any of (i) to (ii) may arise? Yes'
    )
    expect(contents).to.contain('Please Comment: Details on out of touch')
    cy.log('Q25')
    q25ProbationDetails(contents)
  })
})

When('Maria downloads the Part A and confirms the indeterminate recall with details', () => {
  return cy.downloadDocX('Download the Part A').then(contents => {
    q4OffenderDetails(contents)
    q5SentenceDetails(contents)
    q12MappaDetails(contents)
    q16IndexOffenceDetails(contents)
  })
})

When('Maria downloads an updated Part A and confirms the changes to the indeterminate recall', () => {
  cy.clickLink('Create Part A')
  cy.downloadDocX('Download the Part A').then(contents => {
    q3ExtendedSentence(contents, 'No')
    q6CustodyStatus(contents, 'Police Custody')
    q7Addresses(contents, 'West Ham Lane Police Station, 18 West Ham Lane, Stratford, E15 4SG')
  })
})

When('Maria confirms answers were saved', () => {
  cy.log('========= Response to probation')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`How has ${offenderName} responded to probation so far?`)
    cy.getTextInputValue(`How has ${offenderName} responded to probation so far?`).should(
      'equal',
      'Re-offending has occurred'
    )
  })
  cy.clickLink('Back')

  cy.log('========= Licence conditions')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`What licence conditions has ${offenderName} breached?`)
    cy.getRadioOptionByLabel(
      `What licence conditions has ${offenderName} breached?`,
      'Receive visits from the supervising officer in accordance with instructions given by the supervising officer'
    ).should('be.checked')
  })
  cy.clickLink('Back')

  cy.log('========= Alternatives to recall')
  cy.clickLink('What alternatives to recall have been tried already?')
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
  cy.clickLink('Back')

  cy.log('========= Recommendation')
  cy.clickLink('What you recommend')
  cy.getRadioOptionByLabel('What do you recommend?', 'Emergency recall').should('be.checked')
  cy.clickLink('Back')

  cy.log('========= Custody')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} in custody now?`)
    cy.getRadioOptionByLabel(`Is ${offenderName} in custody now?`, 'No').should('be.checked')
  })
  cy.clickLink('Back')

  cy.log('========= IOM')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Is ${offenderName} under Integrated Offender Management (IOM)?`)
    cy.getRadioOptionByLabel(`Is ${offenderName} under Integrated Offender Management (IOM)?`, 'Yes').should(
      'be.checked'
    )
  })
  cy.clickLink('Back')

  cy.log('========= Local police contact')
  cy.clickLink('Local police contact details')
  cy.getTextInputValue('Police contact name').should('equal', 'Bob Wiggins')
  cy.getTextInputValue('Telephone number').should('equal', '07936 737 387')
  cy.getTextInputValue('Fax number (optional)').should('equal', '0208 737 3838')
  cy.getTextInputValue('Email address').should('equal', 'bob.wiggins@met.gov.uk')
  cy.clickLink('Back')

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
    cy.getRadioOptionByLabel(
      `Is there anything the police should know before they arrest ${offenderName}?`,
      'Yes'
    ).should('be.checked')
  })
  cy.getTextInputValue('Give details. Include information about any vulnerable children and adults').should(
    'equal',
    'Arrest issues details...'
  )
  cy.clickLink('Back')

  cy.log('========= Contraband')
  cy.get('@offenderName').then(offenderName => {
    cy.clickLink(`Do you think ${offenderName} is using recall to bring contraband into prison?`)
    cy.getRadioOptionByLabel(
      `Do you think ${offenderName} is using recall to bring contraband into prison?`,
      'Yes'
    ).should('be.checked')
  })
  cy.getTextInputValue('Give details. Also tell your local police contact about your concerns.').should(
    'equal',
    'Contraband details...'
  )
  cy.clickLink('Back')

  cy.log('========= Indeterminate or extended sentence details')
  cy.clickLink('Confirm the recall criteria - indeterminate and extended sentences')
  cy.get('@offenderName').then(offenderName => {
    cy.getRadioOptionByLabel(
      'Indeterminate and extended sentences',
      `${offenderName} has shown behaviour similar to the index offence`
    ).should('be.checked')
    cy.getRadioOptionByLabel(
      'Indeterminate and extended sentences',
      `${offenderName} has shown behaviour that could lead to a sexual or violent offence`
    ).should('be.checked')
    cy.getRadioOptionByLabel('Indeterminate and extended sentences', `${offenderName} is out of touch`).should(
      'be.checked'
    )
  })
  cy.getTextInputValue('Give details', { parent: '#conditional-BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE' }).should(
    'equal',
    'Details on behaviour similar to index offence'
  )
  cy.getTextInputValue('Give details', {
    parent: '#conditional-BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
  }).should('equal', 'Details on behaviour that could lead to a sexual or violent offence')
  cy.getTextInputValue('Give details', { parent: '#conditional-OUT_OF_TOUCH' }).should(
    'equal',
    'Details on out of touch'
  )
  cy.clickLink('Back')

  cy.pageHeading().should('equal', 'Create a Part A form')
})
