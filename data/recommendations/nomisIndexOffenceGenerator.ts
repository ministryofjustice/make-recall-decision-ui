import { NomisIndexOffence } from '../../server/@types/make-recall-decision-api/models/RecommendationResponse'
import { DataGenerator, NoneOrOption } from '../@generators/dataGenerators'
import { OfferedOffenceOptions, OfferenceOffenceGenerator } from './offeredOffenceGenerator'

export type NomisIndexOffenceOptions = {
  selectedIndex?: NoneOrOption<number>
  offeredOffenceOptions?: OfferedOffenceOptions[]
}

export const NomisIndexGenerator: DataGenerator<NomisIndexOffence, NomisIndexOffenceOptions> = {
  generate: (options?) => {
    const offences = OfferenceOffenceGenerator.generateSeries(options?.offeredOffenceOptions ?? [{}, {}, {}])
    if (options?.selectedIndex === 'none') {
      return {
        allOptions: offences,
      }
    }
    if (options?.selectedIndex && options.selectedIndex <= offences.length) {
      return {
        selected: offences.at(options.selectedIndex).offenderChargeId,
        allOptions: offences,
      }
    }
    return {
      selected: offences.at(0).offenderChargeId,
      allOptions: offences,
    }
  },
}
