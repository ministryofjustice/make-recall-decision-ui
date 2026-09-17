import { faker } from '@faker-js/faker/locale/en_GB'
import { PpudUserMappingGenerator } from '../../../../../data/recommendations/ppcs/ppudUserMappingGenerator'
import validatePpudUserMapping from './ppudUserMappingValidator'
import { makeErrorObject } from '../../../../utils/errors'
import NamedFormErrorGenerator from '../../../../../data/common/errorGenerator'
import { getPpudUserMappings } from '../../../../data/makeDecisionApiClient'
import strings from '../../../../textStrings/en'
import { PpudUserMapping } from '../../../../@types/make-recall-decision-api/models/PpudUserMapping'

jest.mock('../../../../utils/errors')
jest.mock('../../../../data/makeDecisionApiClient')

describe('validate', () => {
  it('valid user mapping returns no errors', async () => {
    const token = faker.string.alpha({ length: 10 })
    const userMapping = PpudUserMappingGenerator.generate({ id: 'none' })
    ;(getPpudUserMappings as jest.Mock).mockResolvedValue([])

    const errors = await validatePpudUserMapping(userMapping, token)

    expect(errors).toEqual([])
    expect(getPpudUserMappings).toHaveBeenCalledWith(token)
  })

  const testCases = [
    {
      fieldName: 'userName',
      errorId: 'missingUserName',
    },
    {
      fieldName: 'ppudUserFullName',
      errorId: 'missingPpudUserFullName',
    },
    {
      fieldName: 'ppudTeamName',
      errorId: 'missingPpudTeamName',
    },
    {
      fieldName: 'ppudUserName',
      errorId: 'missingPpudUserName',
    },
  ]
  testCases.forEach(({ fieldName, errorId }) => {
    it(`user mapping with missing ${fieldName} returns error`, async () => {
      const token = faker.string.alpha({ length: 10 })
      const userMapping = PpudUserMappingGenerator.generate({
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
    fieldName: keyof PpudUserMapping
    errorId: string
  }[] = [
    {
      fieldName: 'userName',
      errorId: 'duplicateUserName',
    },
    {
      fieldName: 'ppudUserName',
      errorId: 'duplicatePpudUserName',
    },
    {
      fieldName: 'ppudUserFullName',
      errorId: 'duplicatePpudUserFullName',
    },
  ]
  duplicationTestCases.forEach(({ fieldName, errorId }) => {
    it(`user mapping with duplicate ${fieldName} returns error`, async () => {
      const token = faker.string.alpha({ length: 10 })
      const userMapping = PpudUserMappingGenerator.generate({ id: 'none' })

      const existingMappings = [PpudUserMappingGenerator.generate({ [fieldName]: userMapping[fieldName] })]
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
      const userMapping = PpudUserMappingGenerator.generate()
      const existingMappings = [userMapping]
      ;(getPpudUserMappings as jest.Mock).mockResolvedValue(existingMappings)

      const errors = await validatePpudUserMapping(userMapping, token)

      expect(errors).toEqual([])
      expect(getPpudUserMappings).toHaveBeenCalledWith(token)
    })
  })
})
