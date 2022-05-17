import getCaseOverviewResponse from '../../api/responses/get-case-overview.json'
import getCasePersonalDetailsResponse from '../../api/responses/get-case-personal-details.json'
import getCaseRiskResponse from '../../api/responses/get-case-risk.json'
import getCaseLicenceHistoryResponse from '../../api/responses/get-case-licence-history.json'
import { formatDateFromIsoString, sortListByDateField } from '../../server/utils/dates'
import { routeUrls } from '../../server/routes/routeUrls'

context('Case summary', () => {
  beforeEach(() => {
    cy.signIn()
    cy.task('getCase', { sectionId: 'risk', statusCode: 200, response: getCaseRiskResponse })
    cy.task('getCase', { sectionId: 'personal-details', statusCode: 200, response: getCasePersonalDetailsResponse })
    cy.task('getCase', { sectionId: 'all-licence-history', statusCode: 200, response: getCaseLicenceHistoryResponse })
  })

  it('can view the overview page with a list of offences', () => {
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.pageHeading().should('equal', 'Overview')
    // offence overview
    cy.getDefinitionListValue('Offences').should('contain', 'Robbery (other than armed robbery)')
    cy.getDefinitionListValue('Offences').should('contain', 'Shoplifting')
  })

  it('changes label to Offence if there is only one', () => {
    cy.task('getCase', {
      sectionId: 'overview',
      statusCode: 200,
      response: {
        ...getCaseOverviewResponse,
        offences: [
          {
            mainOffence: true,
            description: 'Robbery (other than armed robbery)',
          },
        ],
      },
    })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    cy.getDefinitionListValue('Offence').should('contain', 'Robbery (other than armed robbery)')
  })

  it('can view the personal details page', () => {
    const crn = 'X34983'
    const { personalDetailsOverview } = getCaseOverviewResponse
    cy.visit(`${routeUrls.cases}/${crn}/personal-details`)
    cy.pageHeading().should('equal', 'Personal details')

    cy.getText('personalDetailsOverview-crn').should('equal', personalDetailsOverview.crn)
    cy.getText('personalDetailsOverview-dateOfBirth').should(
      'equal',
      formatDateFromIsoString(personalDetailsOverview.dateOfBirth)
    )
    cy.getText('personalDetailsOverview-age').should('equal', personalDetailsOverview.age.toString())
    cy.getText('personalDetailsOverview-gender').should(
      'equal',
      formatDateFromIsoString(personalDetailsOverview.gender)
    )
    // personal details
    cy.getDefinitionListValue('Current address').should('equal', '5 Anderton Road, Newham, London E15 1UJ')
    cy.getDefinitionListValue('Offender manager').should('contain', 'Jenny Eclair - N07, NPS London')
    cy.getDefinitionListValue('Offender manager').should('contain', 'Telephone: 07824637629')
    cy.getDefinitionListValue('Offender manager').should('contain', 'Email: jenny@probation.com')
    cy.getLinkHref('jenny@probation.com').should('equal', 'mailto:jenny@probation.com')
    // risk flags
    cy.getElement('Victim contact', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('Mental health issues', { parent: '[data-qa="riskFlags"]' }).should('exist')
    cy.getElement('MAPPA', { parent: '[data-qa="riskFlags"]' }).should('exist')
  })

  it('can view the risk page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/risk`)
    cy.pageHeading().should('equal', 'Risk')

    // Content panels
    cy.viewDetails('View more detail on Details of the risk').should(
      'contain',
      getCaseRiskResponse.natureOfRisk.description
    )
    cy.viewDetails('View more detail on Who is at risk').should('contain', getCaseRiskResponse.whoIsAtRisk.description)
    cy.viewDetails('View more detail on Circumstances that will increase the risk').should(
      'contain',
      getCaseRiskResponse.circumstancesIncreaseRisk.description
    )

    // RoSH table
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Children' }).then(rowValues => {
      expect(rowValues[0]).to.equal('Low')
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Public' }).then(rowValues => {
      expect(rowValues[0]).to.equal('Very high')
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Known adult' }).then(rowValues => {
      expect(rowValues[0]).to.equal('Medium')
    })
    cy.getRowValuesFromTable({ tableCaption: 'Risk of serious harm', firstColValue: 'Staff' }).then(rowValues => {
      expect(rowValues[0]).to.equal('High')
    })

    // MAPPA level
    cy.getElement('CAT 2/LEVEL 1').should('exist')

    // predictor graphs
    cy.getElement('Risk of serious recidivism (RSR) score - 23').should('exist')
    cy.getElement('OSP/C score').should('exist')
    cy.getElement('OSP/I score').should('exist')
    cy.getElement('OGRS score - 12').should('exist')

    // score history
    cy.getElement('14 May 2019 at 12:00').should('exist')
    cy.getElement('12 September 2018 at 12:00').should('exist')
    cy.getElement('RSR HIGH 18').should('not.be.visible')
    cy.clickLink('Open all')
    cy.getElement('RSR HIGH 18').should('be.visible')
    cy.getElement('RSR MEDIUM 12').should('be.visible')
  })

  it('can view the licence history page', () => {
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/licence-history`)
    cy.pageHeading().should('equal', 'Licence history')

    // contacts
    const systemGeneratedRemoved = getCaseLicenceHistoryResponse.contactSummary.filter(
      contact => contact.systemGenerated === false
    )
    const sortedByDate = sortListByDateField({
      list: systemGeneratedRemoved,
      dateKey: 'contactStartDate',
      newestFirst: true,
    })
    sortedByDate.forEach((contact, index) => {
      const opts = { parent: `[data-qa="contact-${index}"]` }
      cy.getText('date', opts).should('equal', formatDateFromIsoString(contact.contactStartDate))
      cy.getText('heading', opts).should('equal', contact.descriptionType)
      cy.getText('notes', opts).should('equal', contact.notes)
    })
  })

  it('can switch between case summary pages', () => {
    cy.task('getCase', { sectionId: 'overview', statusCode: 200, response: getCaseOverviewResponse })
    const crn = 'X34983'
    cy.visit(`${routeUrls.cases}/${crn}/overview`)
    // tabs
    cy.clickLink('Risk')
    cy.pageHeading().should('equal', 'Risk')
    cy.clickLink('Personal details')
    cy.pageHeading().should('equal', 'Personal details')
    cy.clickLink('Licence history')
    cy.pageHeading().should('equal', 'Licence history')
    cy.clickLink('Overview')
    cy.pageHeading().should('equal', 'Overview')
  })
})
