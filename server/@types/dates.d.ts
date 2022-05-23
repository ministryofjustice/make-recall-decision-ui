export interface DatePartsParsed {
  year: string
  month: string
  day: string
  hour?: string
  minute?: string
}

export type ValidationErrorType =
  | 'dateMustBeInPast'
  | 'dateMustBeInFuture'
  | 'blankDateTime'
  | 'invalidDate'
  | 'missingDate'
  | 'invalidTime'
  | 'missingTime'
  | 'missingDateParts'
  | 'minLengthDateParts'
  | 'minValueDateYear'
  | 'minLengthDateTimeParts'
  | 'minValueDateTimeParts'
  | 'noSelectionFromList'
  | 'invalidSelectionFromList'
  | 'fromDateAfterToDate'

export type DatePartNames = 'year' | 'month' | 'day' | 'hour' | 'minute'

export interface DateTimePart {
  name: DatePartNames
  value: string
}

export interface ValidationError {
  errorId: ValidationErrorType
  invalidParts?: DatePartNames[]
}
