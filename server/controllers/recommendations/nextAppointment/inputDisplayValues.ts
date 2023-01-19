import { getProperty, isDefined } from '../../../utils/utils'
import { splitIsoDateToParts } from '../../../utils/dates/convert'
import { RecommendationResponse } from '../../../@types/make-recall-decision-api'
import { NextAppointment } from '../../../@types/make-recall-decision-api/models/NextAppointment'
import { InputDisplayValuesArgs } from '../../../@types/pagesForms'

export const inputDisplayValuesNextAppointment = ({ errors, unsavedValues, apiValues }: InputDisplayValuesArgs) => {
  if (isDefined(errors)) {
    return {
      howWillAppointmentHappen: unsavedValues?.howWillAppointmentHappen,
      probationPhoneNumber: unsavedValues?.probationPhoneNumber,
      dateTimeOfAppointment: {
        values: unsavedValues?.dateTimeOfAppointment,
        invalidParts: errors.dateTimeOfAppointment?.invalidParts,
      },
    }
  }
  const nextAppointment = getProperty<RecommendationResponse, NextAppointment>(apiValues, 'nextAppointment')
  return {
    dateTimeOfAppointment: {
      values: splitIsoDateToParts(nextAppointment?.dateTimeOfAppointment),
    },
    howWillAppointmentHappen: nextAppointment?.howWillAppointmentHappen?.selected,
    probationPhoneNumber: nextAppointment?.probationPhoneNumber,
  }
}
