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
    cy.visit(`/${ppcsPaths.ppudUserMappings}/add`)

    cy.pageHeading().should('equal', strings.pageHeadings.addPpudUserMapping)

    testFieldset(cy.get('fieldset'), {
      legend: strings.pageHeadings.addPpudUserMapping,
      formGroups: [
        {
          id: 'userName',
          label: 'Username',
          name: 'userName',
          value: '',
        },
        {
          id: 'ppudUserFullName',
          label: 'PPUD user full name',
          name: 'ppudUserFullName',
          value: '',
        },
        {
          id: 'ppudTeamName',
          label: 'PPUD team name',
          name: 'ppudTeamName',
          value: '',
        },
        {
          id: 'ppudUserName',
          label: 'PPUD username',
          name: 'ppudUserName',
          value: '',
        },
      ],
    })

    testContinueButton('Add')
  })

  describe('Error messages', () => {
    it('shows errors when fields are empty', () => {
      const allUserMappings = faker.helpers.multiple(() => PpudUserMappingGenerator.generate())
      cy.task('ppudUserMappings', { statusCode: 200, response: allUserMappings })

      cy.visit(`/${ppcsPaths.ppudUserMappings}/add`)

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
