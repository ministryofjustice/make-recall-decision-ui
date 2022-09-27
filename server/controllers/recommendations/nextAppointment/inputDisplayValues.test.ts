import { inputDisplayValuesNextAppointment } from './inputDisplayValues'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'

describe('inputDisplayValuesNextAppointment', () => {
  const apiValues = {
    nextAppointment: {
      dateTimeOfAppointment: '2022-05-13T12:35:53.000Z',
      howWillAppointmentHappen: {
        selected: 'VIDEO_CALL',
      },
      probationPhoneNumber: '01277345263',
    },
  } as RecommendationResponse

  it("should use empty strings and unsaved values for value if there's an error for value", () => {
    const errors = {
      dateTimeOfAppointment: {
        errorId: 'missingDateParts',
        href: '#dateTimeOfAppointment-month',
        invalidParts: ['month'],
        name: 'dateTimeOfAppointment',
        text: 'The date and time of the appointment must include a month',
      },
      howWillAppointmentHappen: {
        errorId: 'noAppointmentTypeSelected',
        href: '#howWillAppointmentHappen',
        name: 'howWillAppointmentHappen',
        text: 'None selected',
      },
      probationPhoneNumber: {
        errorId: 'invalidPhoneNumber',
        href: '#probationPhoneNumber',
        name: 'probationPhoneNumber',
        text: 'Invalid',
      },
    }
    const unsavedValues = {
      dateTimeOfAppointment: {
        day: '12',
        hour: '12',
        minute: '53',
        month: '',
        year: '2022',
      },
      probationPhoneNumber: '123',
    }
    const inputDisplayValues = inputDisplayValuesNextAppointment({ errors, unsavedValues, apiValues })
    expect(inputDisplayValues).toEqual({
      dateTimeOfAppointment: {
        invalidParts: ['month'],
        values: {
          day: '12',
          hour: '12',
          minute: '53',
          month: '',
          year: '2022',
        },
      },
      probationPhoneNumber: '123',
    })
  })

  it('should use apiValues for value, if no error or unsaved values', () => {
    const inputDisplayValues = inputDisplayValuesNextAppointment({
      errors: undefined,
      unsavedValues: undefined,
      apiValues,
    })
    expect(inputDisplayValues).toEqual({
      dateTimeOfAppointment: {
        values: {
          day: '13',
          hour: '13',
          minute: '35',
          month: '05',
          year: '2022',
        },
      },
      howWillAppointmentHappen: 'VIDEO_CALL',
      probationPhoneNumber: '01277345263',
    })
  })
})
