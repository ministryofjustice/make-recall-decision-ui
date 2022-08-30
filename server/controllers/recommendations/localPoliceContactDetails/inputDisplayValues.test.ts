import { inputDisplayValuesLocalPoliceContactDetails } from './inputDisplayValues'

describe('inputDisplayValuesLocalPoliceContactDetails', () => {
  const apiValues = {
    localPoliceContact: {
      contactName: 'Thomas Magnum',
      phoneNumber: '07337838282',
      faxNumber: '02075289289',
      emailAddress: 'thomas.magnum@gmail.com',
    },
  }

  it("should use empty values if there's an error, and no unsaved values", () => {
    const errors = {
      localPoliceContact: {
        errorId: 'noLocalPolicePhone',
        href: '#phoneNumber',
        name: 'phoneNumber',
        text: 'Enter a phone number',
      },
    }
    const inputDisplayValues = inputDisplayValuesLocalPoliceContactDetails({
      errors,
      unsavedValues: {},
      apiValues,
    })
    expect(inputDisplayValues).toEqual({})
  })

  it("should use any unsaved values if there's an error", () => {
    const errors = {
      localPoliceContact: {
        errorId: 'invalidLocalPoliceEmail',
        href: '#emailAddress',
        name: 'emailAddress',
        text: 'Enter a valid email address',
      },
    }
    const unsavedValues = {
      contactName: 'Thomas Magnum',
      faxNumber: '02075289289',
      emailAddress: 'banana',
    }
    const inputDisplayValues = inputDisplayValuesLocalPoliceContactDetails({
      errors,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual(unsavedValues)
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesLocalPoliceContactDetails({
      errors: undefined,
      unsavedValues,
      apiValues,
    })
    expect(inputDisplayValues).toEqual(apiValues.localPoliceContact)
  })
})
