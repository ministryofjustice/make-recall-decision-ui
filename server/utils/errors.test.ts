import { formatValidationErrorMessage, makeErrorObject, renderErrorMessages, transformErrorMessages } from './errors'

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

  describe('formatValidationErrorMessage', () => {
    it('renders "blankDateTime" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'blankDateTime' }, 'date of sentence')
      expect(error).toEqual('Enter the date of sentence')
    })

    it('renders "dateMustBeInPast" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'dateMustBeInPast' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be today or in the past')
    })

    it('renders "dateMustBeInFuture" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'dateMustBeInFuture' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be in the future')
    })

    it('renders "invalidDate" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'invalidDate' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be a real date')
    })

    it('renders "missingDateParts" error', () => {
      const error = formatValidationErrorMessage(
        { errorId: 'missingDateParts', invalidParts: ['month'] },
        'date of sentence'
      )
      expect(error).toEqual('The date of sentence must include a month')
    })

    it('renders "missingDate" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'missingDate' }, 'date and time of email')
      expect(error).toEqual('The date and time of email must include a date')
    })

    it('renders "missingTime" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'missingTime' }, 'date and time of email')
      expect(error).toEqual('The date and time of email must include a time')
    })

    it('renders "minLengthDateTimeParts" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'minLengthDateTimeParts' }, 'date and time of receipt')
      expect(error).toEqual('The date and time of receipt must be in the correct format, like 06 05 2021 09:03')
    })

    it('renders "minLengthDateParts" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'minLengthDateParts' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be in the correct format, like 06 05 2021')
    })

    it('renders "minValueDateYear" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'minValueDateYear' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must include a year after 1900')
    })

    it('renders "outOfRangeValueDateParts" error', () => {
      const error = formatValidationErrorMessage(
        { errorId: 'outOfRangeValueDateParts', invalidParts: ['year'] },
        'date of sentence'
      )
      expect(error).toEqual('The date of sentence must have a real year')
    })

    it('renders "minLengthSearchContactsTerm" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'minLengthSearchContactsTerm' })
      expect(error).toEqual('Search term must be 2 characters or more')
    })
  })

  describe('renderErrorMessages', () => {
    it('returns error messages with placeholders filled with data', () => {
      const errors = [
        {
          href: '#additionalLicenceConditionsDetail',
          name: 'additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        },
        {
          text: 'Enter the NOMIS number {{ fullName }} is being held under',
          href: '#differentNomsNumberDetail',
          name: 'differentNomsNumberDetail',
          values: 'A123',
        },
      ]
      const result = renderErrorMessages(transformErrorMessages(errors), {
        fullName: 'Dave Angel',
      })
      expect(result).toEqual({
        additionalLicenceConditionsDetail: {
          href: '#additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        },
        differentNomsNumberDetail: {
          text: 'Enter the NOMIS number Dave Angel is being held under',
          href: '#differentNomsNumberDetail',
          values: 'A123',
        },
        list: [
          {
            href: '#additionalLicenceConditionsDetail',
            name: 'additionalLicenceConditionsDetail',
            html: 'Provide detail on additional licence conditions',
          },
          {
            href: '#differentNomsNumberDetail',
            name: 'differentNomsNumberDetail',
            html: 'Enter the NOMIS number Dave Angel is being held under',
            values: 'A123',
          },
        ],
      })
    })
  })
})
