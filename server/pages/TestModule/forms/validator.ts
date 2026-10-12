import * as z from 'zod'
import strings from '../strings'
import TestFormOptions from '../types'

const { errors: errorStrings } = strings

const validator = z.object({
  whatLedToRecall: z
    .string(errorStrings.freetextMissing)
    .nonempty(errorStrings.freetextMissing)
    .startsWith('hello', errorStrings.freetextDoesNotStartWithHello)
    .max(100, errorStrings.freeTextTooLong),
  radioFormField: z.enum(TestFormOptions, errorStrings.radioFormFieldMissing),
})

export type FormSchema = z.output<typeof validator>

export default validator
