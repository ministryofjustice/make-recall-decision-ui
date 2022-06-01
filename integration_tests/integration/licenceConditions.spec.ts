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
    getCaseLicenceConditionsResponse.offences.forEach((offence, offenceIndex) => {
      cy.getDefinitionListValue('Offence').should(
        'contain',
        '(Criminal damage endangering life (excluding arson) - aircraft - 05713)'
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
