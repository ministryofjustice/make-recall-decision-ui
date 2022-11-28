import { routeUrls } from '../../server/routes/routeUrls'
import getCaseVulnerabilitiesResponse from '../../api/responses/get-case-vulnerabilities.json'

context('Vulnerabilities page', () => {
  const crn = 'X34983'

  beforeEach(() => {
    cy.signIn()
  })

  it('shows current & past vulnerability', () => {
    cy.task('getCase', {
      sectionId: 'vulnerabilities',
      statusCode: 200,
      response: getCaseVulnerabilitiesResponse,
    })

    cy.visit(`${routeUrls.cases}/${crn}/vulnerabilities?flagVulnerabilities=1`)
    cy.pageHeading().should('equal', 'Vulnerabilities for Paula Smith')
    cy.getElement({ qaAttr: 'banner-vulnerabilities' }).should(
      'contain',
      'This information is from OASys. Check the contact history for vulnerability information from NDelius.'
    )
    cy.getElement({ qaAttr: 'banner-vulnerabilities-no-data' }).should('not.exist')

    // Concerns about vulnerability
    cy.getElement('Last updated: 5 October 2022', { parent: '[data-qa="concernsAboutVulnerability"]' }).should('exist')
    cy.viewDetails('View more detail on Concerns about vulnerability').then(text => {
      expect(text).to.contain('Current concerns: Yes')
      expect(text).to.contain("Previous concerns: Don't know")
      const { vulnerability } = getCaseVulnerabilitiesResponse.vulnerabilities
      expect(text).to.contain(vulnerability.currentConcernsText)
      expect(text).to.contain(vulnerability.previousConcernsText)
    })

    // Suicide / self-harm
    cy.getElement('Last updated: 5 October 2022', { parent: '[data-qa="concernsAboutVulnerability"]' }).should('exist')
    cy.viewDetails('View more detail on Suicide and/or self-harm').then(text => {
      expect(text).to.contain('Current concerns (suicide): Yes')
      expect(text).to.contain('Current concerns (self-harm): Yes')
      const { suicide } = getCaseVulnerabilitiesResponse.vulnerabilities
      expect(text).to.contain(suicide.currentConcernsText)
      expect(text).to.contain(suicide.previousConcernsText)
    })

    // Coping in custody / hostel
    cy.getElement('Last updated: 5 October 2022', { parent: '[data-qa="copingCustodyHostel"]' }).should('exist')
    cy.viewDetails('View more detail on Coping in custody or a hostel').then(text => {
      expect(text).to.contain('Current concerns (custody): Yes')
      expect(text).to.contain('Current concerns (hostel): Yes')
      const { custody } = getCaseVulnerabilitiesResponse.vulnerabilities
      expect(text).to.contain(custody.currentConcernsText)
      expect(text).to.contain(custody.previousConcernsText)
    })
  })

  it('shows banner if no data', () => {
    const vulnerabilitiesNoData = ['suicide', 'selfHarm', 'vulnerability', 'custody', 'hostelSetting'].reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: { current: null, previous: null },
      }),
      {}
    )
    cy.task('getCase', {
      sectionId: 'vulnerabilities',
      statusCode: 200,
      response: {
        ...getCaseVulnerabilitiesResponse,
        vulnerabilities: {
          lastUpdatedDate: '2022-10-05',
          ...vulnerabilitiesNoData,
        },
      },
    })

    cy.visit(`${routeUrls.cases}/${crn}/vulnerabilities?flagVulnerabilities=1`)
    cy.getElement({ qaAttr: 'banner-vulnerabilities-no-data' }).should('exist')
  })

  it('shows banner if error fetching data', () => {
    cy.task('getCase', {
      sectionId: 'vulnerabilities',
      statusCode: 200,
      response: {
        ...getCaseVulnerabilitiesResponse,
        vulnerabilities: {
          error: 'SERVER_ERROR',
        },
      },
    })

    cy.visit(`${routeUrls.cases}/${crn}/vulnerabilities?flagVulnerabilities=1`)
    cy.getElement({ qaAttr: 'banner-vulnerabilities-SERVER_ERROR' }).should('exist')
  })

  it('shows banner if data not found', () => {
    cy.task('getCase', {
      sectionId: 'vulnerabilities',
      statusCode: 200,
      response: {
        ...getCaseVulnerabilitiesResponse,
        vulnerabilities: {
          error: 'NOT_FOUND',
        },
      },
    })

    cy.visit(`${routeUrls.cases}/${crn}/vulnerabilities?flagVulnerabilities=1`)
    cy.getElement({ qaAttr: 'banner-vulnerabilities-NOT_FOUND' }).should('exist')
  })

  it('shows banner if data out of date', () => {
    cy.task('getCase', {
      sectionId: 'vulnerabilities',
      statusCode: 200,
      response: {
        ...getCaseVulnerabilitiesResponse,
        vulnerabilities: {
          error: 'NOT_FOUND_LATEST_COMPLETE',
        },
      },
    })

    cy.visit(`${routeUrls.cases}/${crn}/vulnerabilities?flagVulnerabilities=1`)
    cy.getElement({ qaAttr: 'banner-vulnerabilities-NOT_FOUND_LATEST_COMPLETE' }).should('exist')
  })
})
