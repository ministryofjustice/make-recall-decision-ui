import { StringsDefinition } from '../../@types/strings'

const strings: StringsDefinition = {
  pageHeadings: {
    testPage: 'Test Page Heading {{ fullName }}',
  },
  errors: {
    freetextMissing: 'You must enter a value for freetext field',
    freetextDoesNotStartWithHello: 'Must start with "hello"',
    freeTextTooLong: 'Must be less than 100 characters',
    radioFormFieldMissing: 'Please select an option for {{ fullName }}',
  },
}

export default strings
