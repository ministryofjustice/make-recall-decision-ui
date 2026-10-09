import { faker } from '@faker-js/faker/locale/en_GB'
import { setUpSessionForPpcsAdmin } from '../util'
import { PpudUserMappingGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingGenerator'
import ppcsPaths from '../../../../../server/routes/paths/ppcs.paths'
import strings from '../../../../../server/textStrings/en'
import { testFieldset } from '../../../../componentTests/fieldset.tests'
import testContinueButton from '../../../../componentTests/continueButton.tests'
import { testForErrorPageTitle, testForErrorSummary } from '../../../../componentTests/errors.tests'

context('Edit PPUD Mapping', () => {
  beforeEach(() => {
    setUpSessionForPpcsAdmin()
  })

  it('Load page', () => {
    const ppudUserMapping = PpudUserMappingGenerator.generate()
    cy.task('ppudUserMappingById', { statusCode: 200, response: ppudUserMapping })

    cy.visit(`/${ppcsPaths.ppudUserMappings}/${ppudUserMapping.id}`)

    cy.pageHeading().should('equal', strings.pageHeadings.editPpudUserMapping)

    testFieldset(cy.get('fieldset'), {
      legend: strings.pageHeadings.editPpudUserMapping,
      formGroups: [
        {
          id: 'userName',
          label: 'Username',
          name: 'userName',
          value: ppudUserMapping.userName,
        },
        {
          id: 'ppudUserFullName',
          label: 'PPUD user full name',
          name: 'ppudUserFullName',
          value: ppudUserMapping.ppudUserFullName,
        },
        {
          id: 'ppudTeamName',
          label: 'PPUD team name',
          name: 'ppudTeamName',
          value: ppudUserMapping.ppudTeamName,
        },
        {
          id: 'ppudUserName',
          label: 'PPUD username',
          name: 'ppudUserName',
          value: ppudUserMapping.ppudUserName,
        },
      ],
    })

    testContinueButton('Update')
  })

  describe('Error messages', () => {
    it('shows errors when fields are empty', () => {
      const ppudUserMappingId = faker.number.int()
      cy.task('ppudUserMappingById', { statusCode: 200, response: { id: ppudUserMappingId } })

      const allUserMappings = faker.helpers.multiple(() => PpudUserMappingGenerator.generate())
      cy.task('ppudUserMappings', { statusCode: 200, response: allUserMappings })

      cy.visit(`/${ppcsPaths.ppudUserMappings}/${ppudUserMappingId}`)

      cy.get('.govuk-button').click()

      testForErrorPageTitle()
      testForErrorSummary([
        {
          href: 'userName',
          message: strings.errors.missingUserName,
        },
        {
          href: 'ppudUserFullName',
          message: strings.errors.missingPpudUserFullName,
        },
        {
          href: 'ppudTeamName',
          message: strings.errors.missingPpudTeamName,
        },
        {
          href: 'ppudUserName',
          message: strings.errors.missingPpudUserName,
        },
      ])
    })
  })
})
