import { makeErrorObject, transformErrorMessages } from './errors'

describe('Error messages', () => {
  describe('makeErrorObject', () => {
    it('returns an error object', () => {
      const error = makeErrorObject({
        id: 'recallEmailReceivedDateTime',
        text: 'Date and time you received the recall email',
        values: { year: '2021', month: '10', day: '3', hour: '', minute: '' },
      })
      expect(error).toEqual({
        href: '#recallEmailReceivedDateTime',
        name: 'recallEmailReceivedDateTime',
        text: 'Date and time you received the recall email',
        values: {
          day: '3',
          hour: '',
          minute: '',
          month: '10',
          year: '2021',
        },
      })
    })
  })

  describe('transformErrorMessages', () => {
    it('returns error messages with placeholders filled with data', () => {
      const errors = [
        {
          href: '#additionalLicenceConditionsDetail',
          name: 'additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        },
        {
          text: 'Enter the code for {{ recall.fullName }}',
          href: '#code',
          name: 'code',
          values: 'A123',
        },
      ]
      const result = transformErrorMessages(errors)
      expect(result).toEqual({
        additionalLicenceConditionsDetail: {
          href: '#additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        },
        code: {
          href: '#code',
          text: 'Enter the code for {{ recall.fullName }}',
          values: 'A123',
        },
        list: [
          {
            href: '#additionalLicenceConditionsDetail',
            name: 'additionalLicenceConditionsDetail',
            text: 'Provide detail on additional licence conditions',
          },
          {
            href: '#code',
            name: 'code',
            text: 'Enter the code for {{ recall.fullName }}',
            values: 'A123',
          },
        ],
      })
    })
  })
})
