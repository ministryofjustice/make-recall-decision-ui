import { faker } from '@faker-js/faker/locale/en_GB'
import { SentenceGroup } from './formOptions'
import inputDisplayValuesSentenceInformation from './inputDisplayValues'

describe('inputDisplayValuesSentenceInformation', () => {
  const apiValues = {
    sentenceGroup: faker.helpers.enumValue(SentenceGroup),
  }
  it('should have no value set if there is an error for value', () => {
    const errors = {
      sentenceGroup: {
        text: 'Select the sentence group',
        href: '#sentenceGroup',
      },
    }
    const unsavedValues = {
      sentenceGroup: faker.helpers.enumValue(SentenceGroup),
    }
    const inputDisplayValues = inputDisplayValuesSentenceInformation({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: undefined,
    })
  })

  it('should use apiValues for value, if no error', () => {
    const errors = {}
    const unsavedValues = {
      sentenceGroup: faker.helpers.enumValue(SentenceGroup),
    }
    const inputDisplayValues = inputDisplayValuesSentenceInformation({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: apiValues.sentenceGroup,
    })
  })
})
