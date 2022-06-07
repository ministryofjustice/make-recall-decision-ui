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
  | 'outOfRangeValueDateParts'
  | 'noSelectionFromList'
  | 'invalidSelectionFromList'
  | 'fromDateAfterToDate'
  | 'minLengthSearchContactsTerm'

export type DatePartNames = 'year' | 'month' | 'day' | 'hour' | 'minute'

export interface DateTimePart {
  name: DatePartNames
  value: string
  numberValue?: number
  minValue: number
  maxValue: number
  minLength: number
}

export interface ValidationError {
  errorId: ValidationErrorType
  invalidParts?: DatePartNames[]
}
