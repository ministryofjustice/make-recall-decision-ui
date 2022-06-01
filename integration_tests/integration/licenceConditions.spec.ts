import getCaseLicenceConditionsResponse from '../../api/responses/get-case-licence-conditions.json'
import { routeUrls } from '../../server/routes/routeUrls'
import { formatDateTimeFromIsoString } from '../../server/utils/dates/format'

context('Licence conditions', () => {
  beforeEach(() => {
    cy.signIn()
    cy.mockCaseSummaryData()
  })

  it('can view the licence conditions page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-conditions`)
    cy.pageHeading().should('equal', 'Licence conditions')
    cy.getElement('Release from custody date', { parent: `[data-qa="summary-1"]` }).should('exist')
    cy.getElement('Licence expiry date', { parent: `[data-qa="summary-1"]` }).should('exist')
    cy.getElement('Last recall date', { parent: `[data-qa="summary-1"]` }).should('exist')
    cy.getElement('Post-sentence supervision end date', { parent: `[data-qa="summary-1"]` }).should('exist')
    cy.getElement('Release from custody date', { parent: `[data-qa="summary-2"]` }).should('not.exist')
    cy.getElement('Licence expiry date', { parent: `[data-qa="summary-2"]` }).should('not.exist')
    cy.getElement('Last recall date', { parent: `[data-qa="summary-2"]` }).should('not.exist')
    cy.getElement('Post-sentence supervision end date', { parent: `[data-qa="summary-2"]` }).should('not.exist')
    getCaseLicenceConditionsResponse.offences.forEach((offence, offenceIndex) => {
      cy.getDefinitionListValue('Offence', { parent: `[data-qa="summary-${offenceIndex + 1}"]` }).should(
        'contain',
        offence.offences[0].description
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
})
