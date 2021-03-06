import getCaseLicenceConditionsResponse from '../../api/responses/get-case-licence-conditions.json'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'

context('Licence conditions', () => {
  beforeEach(() => {
    cy.signIn()
  })

  it('can view the licence conditions page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions for Charles Edwin')
    cy.getElement('Release from custody date', { parent: `[data-qa="summary-1"]` }).should('exist')
    cy.getElement('Licence expiry date', { parent: `[data-qa="summary-1"]` }).should('exist')
    cy.getElement('Last recall date', { parent: `[data-qa="summary-1"]` }).should('exist')
    cy.getElement('Post-sentence supervision end date', { parent: `[data-qa="summary-1"]` }).should('exist')
    cy.getElement('Release from custody date', { parent: `[data-qa="summary-2"]` }).should('not.exist')
    cy.getElement('Licence expiry date', { parent: `[data-qa="summary-2"]` }).should('not.exist')
    cy.getElement('Last recall date', { parent: `[data-qa="summary-2"]` }).should('not.exist')
    cy.getElement('Post-sentence supervision end date', { parent: `[data-qa="summary-2"]` }).should('not.exist')
    getCaseLicenceConditionsResponse.convictions.forEach((offence, offenceIndex) => {
      cy.getDefinitionListValue('Main offence', { parent: `[data-qa="summary-${offenceIndex + 1}"]` }).should(
        'contain',
        offence.offences[0].description
      )
      cy.getDefinitionListValue('Additional offences', { parent: `[data-qa="summary-${offenceIndex + 1}"]` }).should(
        'contain',
        offence.offences[1] ? offence.offences[1].description : 'None'
      )
      offence.licenceConditions.forEach((condition, conditionIndex) => {
        cy.getRowValuesFromTable({
          tableCaption: `Licence conditions for offence ${offenceIndex + 1}`,
          rowQaAttr: `row-${conditionIndex}`,
        }).then(([type, description, notes, active, startDate, terminationDate]) => {
          expect(type).to.equal(
            `${condition.licenceConditionTypeMainCat.code} - ${condition.licenceConditionTypeMainCat.description}`
          )
          expect(description).to.equal(
            `${condition.licenceConditionTypeSubCat.code} - ${condition.licenceConditionTypeSubCat.description}`
          )
          expect(notes).to.equal(condition.licenceConditionNotes || '')
          expect(active).to.equal(condition.active ? 'Yes' : 'No')
          expect(startDate).to.equal(formatDateTimeFromIsoString({ isoDate: condition.startDate }))
          expect(terminationDate).to.equal(formatDateTimeFromIsoString({ isoDate: condition.terminationDate }) || '')
        })
      })
    })
  })

  it('shows a message instead of a table if there are no licence conditions', () => {
    cy.task('getCase', {
      sectionId: 'licence-conditions',
      statusCode: 200,
      response: {
        convictions: [
          {
            offences: [],
            licenceConditions: [],
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.getElement('There are no licence conditions attached to this event in NDelius.').should('exist')
  })
})
