import generateId from './generateId'

describe('generate ids', () => {
  it('generate', async () => {
    const id = generateId()

    expect(id).toBeDefined()
    expect(id.length).toEqual(10)
  })
})
