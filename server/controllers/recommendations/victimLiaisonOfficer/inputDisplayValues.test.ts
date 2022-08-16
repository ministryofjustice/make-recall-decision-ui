import { inputDisplayValuesVictimLiaisonOfficer } from './inputDisplayValues'

describe('inputDisplayValuesVictimLiaisonOfficer', () => {
  const apiValues = {
    dateVloInformed: '2022-05-13',
  }

  it("should use empty strings for value if there's an error for value", () => {
    const errors = {
      dateVloInformed: {
        text: 'The date you told the VLO must have a real day and month',
        href: '#dateVloInformed',
        values: {
          day: '42',
          month: '23',
          year: '2022',
        },
      },
    }
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesVictimLiaisonOfficer({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: {
        day: '42',
        month: '23',
        year: '2022',
      },
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const errors = {}
    const unsavedValues = {}
    const inputDisplayValues = inputDisplayValuesVictimLiaisonOfficer({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      value: {
        day: '13',
        month: '05',
        year: '2022',
      },
    })
  })
})
