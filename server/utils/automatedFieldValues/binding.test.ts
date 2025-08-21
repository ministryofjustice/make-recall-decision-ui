import { bindPlaceholderValues } from './binding'

describe('Bind placeholder values', () => {
  it('string with no placeholders is left untouched', () => {
    const automatedField = 'test'
    const bindingValues = {
      one: '1',
      two: '2',
    }

    const actualResult = bindPlaceholderValues(automatedField, bindingValues)

    expect(actualResult).toEqual(automatedField)
  })

  it('string with unmatched placeholders is left untouched', () => {
    const automatedField = 'test {{ three }} test'
    const bindingValues = {
      one: '1',
      two: '2',
    }

    const actualResult = bindPlaceholderValues(automatedField, bindingValues)

    expect(actualResult).toEqual(automatedField)
  })

  it('string with empty binding values object is left untouched', () => {
    const automatedField = 'test {{ three }} test'
    const bindingValues = {}

    const actualResult = bindPlaceholderValues(automatedField, bindingValues)

    expect(actualResult).toEqual(automatedField)
  })

  it('string with single placeholder appearing once is correctly bound', () => {
    const automatedField = 'test {{ one }} test'
    const bindingValues = {
      one: '1',
      two: '2',
    }

    const actualResult = bindPlaceholderValues(automatedField, bindingValues)

    expect(actualResult).toEqual('test 1 test')
  })

  it('string with single placeholders appearing multiple times is correctly bound', () => {
    const automatedField = 'test {{ one }} test {{ one }} test {{ one }} test'
    const bindingValues = {
      one: '1',
      two: '2',
    }

    const actualResult = bindPlaceholderValues(automatedField, bindingValues)

    expect(actualResult).toEqual('test 1 test 1 test 1 test')
  })

  it('string with multiple placeholders and all provided is correctly bound', () => {
    const automatedField = 'test {{ one }} test {{ two }} test {{ one }} test'
    const bindingValues = {
      one: '1',
      two: '2',
    }

    const actualResult = bindPlaceholderValues(automatedField, bindingValues)

    expect(actualResult).toEqual('test 1 test 2 test 1 test')
  })

  it('string with multiple placeholders and some provided is bound where possible', () => {
    const automatedField = 'test {{ one }} test {{ two }} test {{ three }} test'
    const bindingValues = {
      one: '1',
      two: '2',
    }

    const actualResult = bindPlaceholderValues(automatedField, bindingValues)

    expect(actualResult).toEqual('test 1 test 2 test {{ three }} test')
  })
})
