import TestFormOptions from '../types'
import { FormOption } from '../../../@types/FormOptions'

const testFormOptions: Record<string, FormOption[]> = {
  radioFormField: [
    {
      value: TestFormOptions.OPTION_ONE,
      text: 'Option One {{ fullName }}',
    },
    {
      value: TestFormOptions.OPTION_TWO,
      text: 'Option Two {{ fullName }}',
    },
  ],
}

export default testFormOptions
