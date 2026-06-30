import { formOptions, renderFormOptions } from './formOptions'

describe('renderFormOptions', () => {
  it('renders name into recall criteria options', () => {
    const rendered = renderFormOptions({ fullName: 'Barbara' })
    expect(rendered.indeterminateOrExtendedSentenceDetails).toEqual([
      {
        detailsLabel: 'Give details:',
        text: 'Barbara has shown behaviour similar to the circumstances surrounding the <strong>index offence</strong>',
        value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
      },
      {
        detailsLabel: 'Give details:',
        text: 'Barbara has shown behaviour that <strong>has caused, or will cause, a sexual or violent offence</strong>',
        value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
      },
      {
        detailsLabel: 'Give details:',
        text: 'Barbara has shown behaviour <strong>likely to result in a sexual or violent offence</strong>, or that could be associated with committing one',
        value: 'BEHAVIOUR_LIKELY_TO_RESULT_SEXUAL_OR_VIOLENT_OFFENCE',
      },
      {
        detailsLabel:
          'Explain why you think {{ fullName }} will meet any of the above criteria while they’re out of touch or their location is not known:',
        text: 'Barbara is either <strong>out of touch</strong> with probation, or their current location is not known',
        value: 'OUT_OF_TOUCH',
      },
    ])
    // leave the original copy unaltered
    expect(formOptions.indeterminateOrExtendedSentenceDetails).toEqual([
      {
        detailsLabel: 'Give details:',
        text: '{{ fullName }} has shown behaviour similar to the circumstances surrounding the <strong>index offence</strong>',
        value: 'BEHAVIOUR_SIMILAR_TO_INDEX_OFFENCE',
      },
      {
        detailsLabel: 'Give details:',
        text: '{{ fullName }} has shown behaviour that <strong>has caused, or will cause, a sexual or violent offence</strong>',
        value: 'BEHAVIOUR_LEADING_TO_SEXUAL_OR_VIOLENT_OFFENCE',
      },
      {
        detailsLabel: 'Give details:',
        text: '{{ fullName }} has shown behaviour <strong>likely to result in a sexual or violent offence</strong>, or that could be associated with committing one',
        value: 'BEHAVIOUR_LIKELY_TO_RESULT_SEXUAL_OR_VIOLENT_OFFENCE',
      },
      {
        detailsLabel:
          'Explain why you think {{ fullName }} will meet any of the above criteria while they’re out of touch or their location is not known:',
        text: '{{ fullName }} is either <strong>out of touch</strong> with probation, or their current location is not known',
        value: 'OUT_OF_TOUCH',
      },
    ])
  })
})
