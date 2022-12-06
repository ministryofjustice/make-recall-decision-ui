import { pageMetaData } from './pageMetaData'

describe('pageMetaData', () => {
  it('refreshes person details', () => {
    const metadata = pageMetaData('personal-details')
    expect(metadata.propertyToRefresh).toEqual('personOnProbation')
  })

  it('refreshes offence details', () => {
    const metadata = pageMetaData('offence-details')
    expect(metadata.propertyToRefresh).toEqual('convictionDetail')
  })

  it('refreshes index offence details', () => {
    const metadata = pageMetaData('offence-analysis')
    expect(metadata.propertyToRefresh).toEqual('indexOffenceDetails')
  })

  it('refreshes previous releases', () => {
    const metadata = pageMetaData('previous-releases')
    expect(metadata.propertyToRefresh).toEqual('previousReleases')
  })
})
