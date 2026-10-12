import routes from './routes'
import strings from './strings'
import formOptions from './forms/options'
import formValidation from './forms/validator'

export default {
  id: 'testModule',
  path: __dirname,
  routes,
  strings,
  formOptions,
  formValidation,
  autoValidate: true,
}
