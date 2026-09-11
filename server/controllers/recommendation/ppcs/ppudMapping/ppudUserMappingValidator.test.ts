import { faker } from '@faker-js/faker/locale/en_GB'
import { PpudUserMappingFullGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingFullGenerator'
import validatePpudUserMapping from './ppudUserMappingValidator'
import { makeErrorObject } from '../../../../utils/errors'
import NamedFormErrorGenerator from '../../../../../data/common/errorGenerator'
import { getPpudUserMappings } from '../../../../data/makeDecisionApiClient'
import strings from '../../../../textStrings/en'
import { PpudUserMappingFull } from '../../../../@types/make-recall-decision-api/models/PpudUserMappingFull'

jest.mock('../../../../utils/errors')
jest.mock('../../../../data/makeDecisionApiClient')

describe('validate', () => {
  it('valid user mapping returns no errors', async () => {
    const token = faker.string.alpha({ length: 10 })
    const userMapping = PpudUserMappingFullGenerator.generate({ id: 'none' })
    ;(getPpudUserMappings as jest.Mock).mockResolvedValue([])

    const errors = await validatePpudUserMapping(userMapping, token)

    expect(errors).toEqual([])
    expect(getPpudUserMappings).toHaveBeenCalledWith(token)
  })

  const testCases = [
    {
      fieldName: 'userName',
      errorId: 'missingUsername',
    },
    {
      fieldName: 'ppudUserFullName',
      errorId: 'missingPpudFullName',
    },
    {
      fieldName: 'ppudTeamName',
      errorId: 'missingPpudTeamName',
    },
    {
      fieldName: 'ppudUserName',
      errorId: 'missingPpudUsername',
    },
  ]
  testCases.forEach(({ fieldName, errorId }) => {
    it(`user mapping with missing ${fieldName} returns error`, async () => {
      const token = faker.string.alpha({ length: 10 })
      const userMapping = PpudUserMappingFullGenerator.generate({
        id: 'none',
        [fieldName]: 'none',
      })

      ;(getPpudUserMappings as jest.Mock).mockResolvedValue([])

      const expectedError = NamedFormErrorGenerator.generate()
      ;(makeErrorObject as jest.Mock).mockReturnValue(expectedError)

      const errors = await validatePpudUserMapping(userMapping, token)

      expect(errors).toEqual([expectedError])
      expect(getPpudUserMappings).toHaveBeenCalledWith(token)
      expect(makeErrorObject).toHaveBeenCalledWith({
        id: fieldName,
        text: strings.errors[errorId],
        errorId,
      })
    })
  })

  const duplicationTestCases: {
    fieldName: keyof PpudUserMappingFull
    errorId: string
  }[] = [
    {
      fieldName: 'userName',
      errorId: 'duplicateUsername',
    },
    {
      fieldName: 'ppudUserName',
      errorId: 'duplicatePpudUsername',
    },
    {
      fieldName: 'ppudUserFullName',
      errorId: 'duplicatePpudUserFullName',
    },
  ]
  duplicationTestCases.forEach(({ fieldName, errorId }) => {
    it(`user mapping with duplicate ${fieldName} returns error`, async () => {
      const token = faker.string.alpha({ length: 10 })
      const userMapping = PpudUserMappingFullGenerator.generate({ id: 'none' })

      const existingMappings = [PpudUserMappingFullGenerator.generate({ [fieldName]: userMapping[fieldName] })]
      ;(getPpudUserMappings as jest.Mock).mockResolvedValue(existingMappings)

      const expectedError = NamedFormErrorGenerator.generate()
      ;(makeErrorObject as jest.Mock).mockReturnValue(expectedError)

      const errors = await validatePpudUserMapping(userMapping, token)

      expect(errors).toEqual([expectedError])
      expect(getPpudUserMappings).toHaveBeenCalledWith(token)
      expect(makeErrorObject).toHaveBeenCalledWith({
        id: fieldName,
        text: strings.errors[errorId],
        errorId,
      })
    })

    it(`existing user mapping does not clash with itself on ${fieldName} duplicate check`, async () => {
      const token = faker.string.alpha({ length: 10 })
      const userMapping = PpudUserMappingFullGenerator.generate()
      const existingMappings = [userMapping]
      ;(getPpudUserMappings as jest.Mock).mockResolvedValue(existingMappings)

      const errors = await validatePpudUserMapping(userMapping, token)

      expect(errors).toEqual([])
      expect(getPpudUserMappings).toHaveBeenCalledWith(token)
    })
  })
})
