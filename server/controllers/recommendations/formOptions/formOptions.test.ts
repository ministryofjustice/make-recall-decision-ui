import { formOptions, renderFormOptions } from './formOptions'

describe('renderFormOptions', () => {
  it('renders name into recall criteria options', () => {
    const rendered = renderFormOptions({ fullName: 'Barbara' })
    expect(rendered.indeterminateOrExtendedSentenceDetails).toEqual([
      {
        detailsLabel: 'Give details',
        text: 'Barbara has shown behaviour similar to the index offence',
        value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
      },
      {
        detailsLabel: 'Give details',
        text: 'Barbara has shown behaviour that could lead to a sexual or violent offence',
        value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
      },
      {
        detailsLabel: 'Give details',
        text: 'Barbara is out of touch',
        value: 'OUT_OF_TOUCH',
      },
    ])
    // leave the original copy unaltered
    expect(formOptions.indeterminateOrExtendedSentenceDetails).toEqual([
      {
        detailsLabel: 'Give details',
        text: '{{ fullName }} has shown behaviour similar to the index offence',
        value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
      },
      {
        detailsLabel: 'Give details',
        text: '{{ fullName }} has shown behaviour that could lead to a sexual or violent offence',
        value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
      },
      {
        detailsLabel: 'Give details',
        text: '{{ fullName }} is out of touch',
        value: 'OUT_OF_TOUCH',
      },
    ])
  })
})
