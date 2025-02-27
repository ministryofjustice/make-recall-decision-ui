import { randomUUID } from 'node:crypto'
import { mapEstablishment, NOMIS_ESTABLISHMENT_OUT, PPUD_ESTABLISHMENT_NOT_APPLICABLE } from './establishmentMapping'

describe('mapEstablisment', () => {
  it('maps OUT to Not Applicable', () => {
    const ppudEstablishment = mapEstablishment(NOMIS_ESTABLISHMENT_OUT)

    expect(ppudEstablishment).toEqual(PPUD_ESTABLISHMENT_NOT_APPLICABLE)
  })

  it('maps values other than OUT to blank', () => {
    const ppudEstablishment = mapEstablishment(randomUUID())

    expect(ppudEstablishment).toEqual('')
  })
})
