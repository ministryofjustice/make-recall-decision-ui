import { getFormValues } from './getFormValues'
import { RecallType } from '../../../@types/make-recall-decision-api'

describe('getFormValues', () => {
  const apiValues = {
    recallType: {
      value: 'STANDARD' as RecallType.value.STANDARD,
      options: [
        {
          text: 'Fixed term',
          value: 'FIXED_TERM',
        },
        {
          text: 'Standard',
          value: 'STANDARD',
        },
        {
          text: 'No recall',
          value: 'NO_RECALL',
        },
      ],
    },
  }
  it("should not mark an option as checked if there's an error", () => {
    const errors = {
      recallType: {
        text: 'Select an option',
        href: '#recallType',
      },
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
