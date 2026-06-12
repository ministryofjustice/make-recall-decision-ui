import { Response } from 'express'
import { faker } from '@faker-js/faker'
import productionEnvValues from '../testUtils/testConstants'
import { determineEnvFeatureOverride, readFeatureFlags } from './featureFlags'
import { mockReq, mockRes } from './testutils/mockRequestUtils'
import FeatureFlagService from '../services/featureFlagService'

const mockFFServiceGetAll = jest.spyOn(FeatureFlagService.prototype, 'getAll')
const featureKey = (flagKey: string) => `FEATURE_${flagKey.toUpperCase()}`
const flagQueriesEnabedKey = 'FEATURE_FLAG_QUERY_PARAMETERS_ENABLED'

const invalidFeatureDateValueCases = [
  { name: 'Future date', value: faker.date.future().toISOString() },
  { name: 'Null', value: null },
  { name: 'Undefined', value: undefined },
  { name: 'Invalid value', value: faker.string.alphanumeric({ length: { min: 5, max: 10 } }) },
]

describe('determineEnvFeatureOverride', () => {
  const testFeatureKey = 'DetmineEncTestFeature'
  it('Returns false when the env does not contain the Feature Key', () => {
    expect(Object.keys(process.env)).not.toContain(featureKey(testFeatureKey))
    expect(determineEnvFeatureOverride(testFeatureKey)).toBeFalsy()
  })
  describe('Returns false when the env contains Feature Key but the value is not a valid date in the past', () => {
    invalidFeatureDateValueCases.forEach(({ name, value }) => {
      it(`- Invalid value: ${name} - ${value}`, () => {
        process.env[featureKey(testFeatureKey)] = value
        expect(Object.keys(process.env)).toContain(featureKey(testFeatureKey))
        expect(determineEnvFeatureOverride(testFeatureKey)).toBeFalsy()
      })
    })
  })
  it('Returns true when the env contains Feature Key and it is the past', () => {
    process.env[featureKey(testFeatureKey)] = faker.date.past().toISOString()
    expect(Object.keys(process.env)).toContain(featureKey(testFeatureKey))
    expect(determineEnvFeatureOverride(testFeatureKey)).toBeTruthy()
  })
})

describe('readFeatureFlags', () => {
  const INITAL_ENV = process.env

  const testFlagKey = 'ui-testFlag'
  function testFlag(def: boolean) {
    return { enabled: def, description: 'Test  Description', label: 'Test Label', key: testFlagKey }
  }

  const neitherReq = () => mockReq()
  const queryReq = (enabled: boolean) => mockReq({ query: { testFlag: enabled ? '1' : '0' } })
  const cookieReq = (enabled: boolean) => mockReq({ cookies: { testFlag: enabled ? '1' : '0' } })
  const cookieAndQueryReq = (cookieEnabled: boolean, queryEnabled: boolean) =>
    mockReq({
      cookies: { testFlag: cookieEnabled ? '1' : '0' },
      query: { testFlag: queryEnabled ? '1' : '0' },
    })

  let resultRes: Response
  const next = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    resultRes = mockRes()
  })

  describe('Uses the default if flag not present in request query or cookies', () => {
    ;[true, false].forEach(def => {
      it(`- Default value: ${def}`, async () => {
        const req = neitherReq()
        mockFFServiceGetAll.mockResolvedValueOnce([{ ...testFlag(def) }])

        await readFeatureFlags()(req, resultRes, next)

        expect(resultRes.locals.flags).toEqual({
          testFlag: def,
        })
      })
    })
  })

  describe('When environment feature settings override is not enabled', () => {
    invalidFeatureDateValueCases.forEach(({ name, value }) => {
      let featureDisabledProcessEnv: NodeJS.ProcessEnv
      beforeEach(() => {
        jest.clearAllMocks()
        process.env[featureKey('testFlag')] = `${value}`
        process.env[flagQueriesEnabedKey] = `${true}`
        featureDisabledProcessEnv = process.env
        mockFFServiceGetAll.mockResolvedValueOnce([{ ...testFlag(true) }])
      })
      afterEach(() => {
        process.env = INITAL_ENV
      })
      describe(`- Not enabled value: ${name} - ${value}`, () => {
        it('Overrides a default of true if flag is "0" in request query', async () => {
          await readFeatureFlags()(queryReq(false), resultRes, next)
          expect(resultRes.locals.flags).toEqual({
            testFlag: false,
          })
        })

        it('Overrides a default of true if flag is "0" in request cookies', async () => {
          await readFeatureFlags()(cookieReq(false), resultRes, next)
          expect(resultRes.locals.flags).toEqual({
            testFlag: false,
          })
        })

        it('Uses request query over cookies', async () => {
          await readFeatureFlags()(cookieAndQueryReq(true, false), resultRes, next)
          expect(resultRes.locals.flags).toEqual({
            testFlag: false,
          })
        })

        it('Still allows query parameter to override a default of false to true', async () => {
          await readFeatureFlags()(queryReq(true), resultRes, next)
          expect(resultRes.locals.flags).toEqual({
            testFlag: true,
          })
        })

        describe('Returns the default value regardless of other cookie/query values when the environment is a "production" value', () => {
          productionEnvValues.forEach(env => {
            beforeEach(() => {
              jest.clearAllMocks()
              process.env.ENVIRONMENT = env
            })
            afterEach(() => {
              process.env = featureDisabledProcessEnv
            })
            describe(`- Environment value: ${env}`, () => {
              beforeEach(() => {
                process.env[flagQueriesEnabedKey] = `${false}`
              })
              ;[true, false].forEach(def => {
                it(`- Default value: ${def}`, async () => {
                  mockFFServiceGetAll.mockReset()
                  mockFFServiceGetAll.mockResolvedValueOnce([{ ...testFlag(def) }])
                  const cookieQueryValue = !def
                  await readFeatureFlags()(cookieAndQueryReq(cookieQueryValue, cookieQueryValue), resultRes, next)
                  expect(resultRes.locals.flags).toEqual({
                    testFlag: def,
                  })
                })
              })
            })
          })
        })
      })
    })
  })

  describe('When environment feature settings override is enabled', () => {
    let featureEnabledProcessEnv: NodeJS.ProcessEnv
    beforeEach(() => {
      process.env[featureKey('testFlag')] = faker.date.past().toISOString()
      featureEnabledProcessEnv = process.env
      mockFFServiceGetAll.mockResolvedValueOnce([{ ...testFlag(false) }])
    })
    afterEach(() => {
      process.env = INITAL_ENV
    })

    it('Returns true when no other flags are set', async () => {
      await readFeatureFlags()(neitherReq(), resultRes, next)
      expect(resultRes.locals.flags).toEqual({
        testFlag: true,
      })
    })

    describe('Returns true regardless of other flag values', () => {
      describe('even when the environment is a "production" value', () => {
        productionEnvValues.forEach(env => {
          beforeEach(() => {
            process.env = { ...process.env, ENVIRONMENT: env }
          })
          afterEach(() => {
            process.env = featureEnabledProcessEnv
          })
          it(`- Environment value: ${env}`, async () => {
            await readFeatureFlags()(neitherReq(), resultRes, next)
            expect(resultRes.locals.flags).toEqual({
              testFlag: true,
            })
          })
        })
      })
      it('- flag is "0" in cookie', async () => {
        await readFeatureFlags()(cookieReq(false), resultRes, next)
        expect(resultRes.locals.flags).toEqual({
          testFlag: true,
        })
      })
      it('- flag is "0" in query', async () => {
        await readFeatureFlags()(queryReq(false), resultRes, next)
        expect(resultRes.locals.flags).toEqual({
          testFlag: true,
        })
      })
      it('- flag is "0" in both cookie and query', async () => {
        await readFeatureFlags()(cookieAndQueryReq(false, false), resultRes, next)
        expect(resultRes.locals.flags).toEqual({
          testFlag: true,
        })
      })
    })
  })
})
