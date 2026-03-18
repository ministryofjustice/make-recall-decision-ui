import { fakerEN_GB as faker } from '@faker-js/faker'
import { DataGenerator, NoneOrOption } from '../@generators/dataGenerators'
import { UrlInfo } from '../../server/@types/pagesForms'

export type UrlInfoOptions = {
  path?: string
  fromPageId?: NoneOrOption<string>
  fromAnchor?: string
  currentPageId?: string
  basePath?: string
}

export const UrlInfoGenerator: DataGenerator<UrlInfo, UrlInfoOptions> = {
  generate: (options: UrlInfoOptions): UrlInfo => {
    return {
      path: options?.path ?? faker.internet.url(),
      fromPageId: options?.fromPageId === 'none' ? undefined : (options?.fromPageId ?? faker.lorem.slug()),
      fromAnchor: options?.fromAnchor ?? faker.lorem.slug(),
      currentPageId: options?.currentPageId ?? faker.lorem.slug(),
      basePath: options?.basePath ?? faker.internet.url(),
    }
  },
}
