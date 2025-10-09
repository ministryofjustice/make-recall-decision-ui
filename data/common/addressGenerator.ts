import { fakerEN_GB as faker } from '@faker-js/faker'
import { AnyNoneOrOption, DataGeneratorWithSeries } from '../@generators/dataGenerators'
import { Address } from '../../server/@types/make-recall-decision-api'

export type AddressOptions = {
  line1?: string
  line2?: string
  town?: string
  postcode?: string
  noFixedAbode: boolean
}

const generateInternal: (options?: AnyNoneOrOption<AddressOptions>) => Address = (options?) => {
  if (options === 'any') {
    return {
      line1: faker.location.streetAddress(),
      town: faker.location.city(),
      postcode: faker.location.zipCode(),
      noFixedAbode: faker.datatype.boolean(),
    }
  }

  if (!options || options === 'none') {
    return undefined
  }

  return {
    line1: options.line1,
    line2: options.line2,
    town: options.town,
    postcode: options.postcode,
    noFixedAbode: options.noFixedAbode,
  }
}

export const addressGenerator: DataGeneratorWithSeries<Address, AnyNoneOrOption<AddressOptions>> = {
  generate: generateInternal,
  generateSeries: optionSeries => optionSeries.map(options => generateInternal(options)),
}
