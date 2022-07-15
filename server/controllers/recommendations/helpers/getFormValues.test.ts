import { getFormValues } from './getFormValues'

describe('getFormValues', () => {
  it("should not mark an option as checked if there's an error", () => {
    const errors = {
      recallType: {
        text: 'Select an option',
        href: '#recallType',
      },
    }
    const apiValues = {
      recallType: 'STANDARD',
    }
    const formValues = getFormValues({ errors, apiValues })
    expect(formValues).toEqual({
      recallType: [
        {
          checked: false,
          text: 'Fixed term',
          value: 'FIXED_TERM',
        },
        {
          checked: false,
          text: 'Standard',
          value: 'STANDARD',
        },
        {
          checked: false,
          text: 'No recall',
          value: 'NO_RECALL',
        },
      ],
    })
  })

  it('should use the API value if there is no error or unsaved value', () => {
    const errors = {}
    const apiValues = {
      recallType: 'STANDARD',
    }
    const formValues = getFormValues({ errors, apiValues })
    expect(formValues).toEqual({
      recallType: [
        {
          checked: false,
          text: 'Fixed term',
          value: 'FIXED_TERM',
        },
        {
          checked: true,
          text: 'Standard',
          value: 'STANDARD',
        },
        {
          checked: false,
          text: 'No recall',
          value: 'NO_RECALL',
        },
      ],
    })
  })
})
