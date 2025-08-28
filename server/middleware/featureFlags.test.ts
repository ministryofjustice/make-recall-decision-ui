import { Response } from 'express'
import { faker } from '@faker-js/faker'
import { productionEnvValues } from '../testUtils/testConstants'
import { determineEnvFeatureOverride, readFeatureFlags } from './featureFlags'
import { mockReq, mockRes } from './testutils/mockRequestUtils'

const envKey = (flagKey: string) => `FEATURE_${flagKey.toUpperCase()}`

const invalidFeatureDateValueCases = [
  { name: 'Future date', value: faker.date.future().toISOString() },
  { name: 'Null', value: null },
  { name: 'Undefined', value: undefined },
  { name: 'Invalid value', value: faker.string.alphanumeric({ length: { min: 5, max: 10 } }) },
]

describe('determineEnvFeatureOverride', () => {
  const testFeatureKey = 'DetmineEncTestFeature'
  it('Returns false when the env does not contain the Feature Key', () => {
    expect(Object.keys(process.env)).not.toContain(envKey(testFeatureKey))
    expect(determineEnvFeatureOverride(testFeatureKey)).toBeFalsy()
  })
  describe('Returns false when the env contains Feature Key but the value is not a valid date in the past', () => {
    invalidFeatureDateValueCases.forEach(({ name, value }) => {
      it(`- Invalid value: ${name} - ${value}`, () => {
        process.env[envKey(testFeatureKey)] = value
        expect(Object.keys(process.env)).toContain(envKey(testFeatureKey))
        expect(determineEnvFeatureOverride(testFeatureKey)).toBeFalsy()
      })
    })
  })
  it('Returns true when the env contains Feature Key and it is the past', () => {
    process.env[envKey(testFeatureKey)] = faker.date.past().toISOString()
    expect(Object.keys(process.env)).toContain(envKey(testFeatureKey))
    expect(determineEnvFeatureOverride(testFeatureKey)).toBeTruthy()
  })
})

describe('readFeatureFlags', () => {
  const INITAL_ENV = process.env

  const testFlagKey = 'testFlag'
  function testFlag(def: boolean) {
    return { testFlag: { default: def, description: 'Test  Description', label: 'Test Label' } }
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
    resultRes = mockRes()
  })

  describe('Uses the default if flag not present in request query or cookies', () => {
    ;[true, false].forEach(def => {
      it(`- Default value: ${def}`, () => {
        const req = neitherReq()
        readFeatureFlags(testFlag(def))(req, resultRes, next)
        expect(resultRes.locals.flags).toEqual({
          testFlag: def,
        })
      })
    })
  })

  describe('When environment feature settings override is not enabled', () => {
    invalidFeatureDateValueCases.forEach(({ name, value }) => {
      let featureDisabledProcessEnv: NodeJS.ProcessEnv
      beforeAll(() => {
        process.env[envKey(testFlagKey)] = `${value}`
        featureDisabledProcessEnv = process.env
      })
      afterAll(() => {
        process.env = INITAL_ENV
      })
      describe(`- Not enabled value: ${name} - ${value}`, () => {
        it('Overrides a default of true if flag is "0" in request query', () => {
          readFeatureFlags(testFlag(true))(queryReq(false), resultRes, next)
          expect(resultRes.locals.flags).toEqual({
            testFlag: false,
          })
        })

        it('Overrides a default of true if flag is "0" in request cookies', () => {
          readFeatureFlags(testFlag(true))(cookieReq(false), resultRes, next)
          expect(resultRes.locals.flags).toEqual({
            testFlag: false,
          })
        })

        it('Uses request query over cookies', () => {
          readFeatureFlags(testFlag(true))(cookieAndQueryReq(true, false), resultRes, next)
          expect(resultRes.locals.flags).toEqual({
            testFlag: false,
          })
        })

        it('Overrides a default of false if flag is "1" in request query', () => {
          readFeatureFlags(testFlag(false))(queryReq(true), resultRes, next)
          expect(resultRes.locals.flags).toEqual({
            testFlag: true,
          })
        })

        describe('Returns the default value regardless of other flag values', () => {
          describe('when the environment is a "production" value', () => {
            productionEnvValues.forEach(env => {
              beforeEach(() => {
                process.env = { ...process.env, ENVIRONMENT: env }
              })
              afterAll(() => {
                process.env = featureDisabledProcessEnv
              })
              describe(`- Environment value: ${env}`, () => {
                ;[true, false].forEach(def => {
                  it(`- Default value: ${def}`, () => {
                    readFeatureFlags(testFlag(def))(cookieAndQueryReq(true, true), resultRes, next)
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
  })

  describe('When environment feature settings override is enabled', () => {
    let featureEnabledProcessEnv: NodeJS.ProcessEnv
    beforeAll(() => {
      process.env[envKey(testFlagKey)] = faker.date.past().toISOString()
      featureEnabledProcessEnv = process.env
    })
    afterAll(() => {
      process.env = INITAL_ENV
    })

    it('Returns true when no other flags are set', () => {
      readFeatureFlags(testFlag(false))(neitherReq(), resultRes, next)
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
          afterAll(() => {
            process.env = featureEnabledProcessEnv
          })
          it(`- Environment value: ${env}`, () => {
            readFeatureFlags(testFlag(false))(neitherReq(), resultRes, next)
            expect(resultRes.locals.flags).toEqual({
              testFlag: true,
            })
          })
        })
      })
      it('- flag is "0" in cookie', () => {
        readFeatureFlags(testFlag(false))(cookieReq(false), resultRes, next)
        expect(resultRes.locals.flags).toEqual({
          testFlag: true,
        })
      })
      it('- flag is "0" in query', () => {
        readFeatureFlags(testFlag(false))(queryReq(false), resultRes, next)
        expect(resultRes.locals.flags).toEqual({
          testFlag: true,
        })
      })
      it('- flag is "0" in both cookie and query', () => {
        readFeatureFlags(testFlag(false))(cookieAndQueryReq(false, false), resultRes, next)
        expect(resultRes.locals.flags).toEqual({
          testFlag: true,
        })
      })
    })
  })
})
