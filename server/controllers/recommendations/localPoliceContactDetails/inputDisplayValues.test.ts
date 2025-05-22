import { inputDisplayValuesLocalPoliceContactDetails } from './inputDisplayValues'

describe('inputDisplayValuesLocalPoliceContactDetails', () => {
  const apiValues = {
    localPoliceContact: {
      contactName: 'Joe Bloggs',
      phoneNumber: '01234567890',
      faxNumber: '09876543210',
      emailAddress: 'joe.bloggs@gmail.com',
    },
  }

  it("should use empty values if there's an error, and no unsaved values", () => {
    const errors = {
      localPoliceContact: {
        errorId: 'noLocalPoliceName',
        href: '#contactName',
        name: 'contactName',
        text: 'Enter the police contact name',
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
      contactName: 'Joe Bloggs',
      faxNumber: '09876543210',
      emailAddress: 'invalid',
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
