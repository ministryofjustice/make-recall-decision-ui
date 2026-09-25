import { setUpSessionForPpcsAdmin } from '../util'
import ppcsPaths from '../../../../../server/routes/paths/ppcs.paths'
import strings from '../../../../../server/textStrings/en'
import testContinueButton from '../../../../componentTests/continueButton.tests'
import { testSummaryList } from '../../../../componentTests/summaryList.tests'
import { PpudUserMappingGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingGenerator'

context('Delete PPUD Mapping', () => {
  beforeEach(() => {
    setUpSessionForPpcsAdmin()
  })

  it('Load page', () => {
    const ppudUserMapping = PpudUserMappingGenerator.generate()
    cy.task('ppudUserMappingById', { statusCode: 200, response: ppudUserMapping })

    cy.visit(`/${ppcsPaths.ppudUserMappings}/${ppudUserMapping.id}/delete`)

    cy.pageHeading().should('equal', strings.pageHeadings.deletePpudUserMapping)

    testSummaryList(cy.get('.govuk-summary-list'), {
      rows: [
        {
          key: 'Username',
          value: ppudUserMapping.userName,
        },
        {
          key: 'PPUD user full name',
          value: ppudUserMapping.ppudUserFullName,
        },
        {
          key: 'PPUD team name',
          value: ppudUserMapping.ppudTeamName,
        },
        {
          key: 'PPUD username',
          value: ppudUserMapping.ppudUserName,
        },
      ],
    })

    testContinueButton('Delete')
  })
})
