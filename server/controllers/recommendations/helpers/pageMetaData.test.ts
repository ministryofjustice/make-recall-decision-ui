import { pageMetaData } from './pageMetaData'

describe('pageMetaData', () => {
  it('refreshes index offence details', () => {
    const metadata = pageMetaData('offence-analysis')
    expect(metadata.propertyToRefresh).toEqual('indexOffenceDetails')
  })

  it('refreshes previous releases', () => {
    const metadata = pageMetaData('previous-releases')
    expect(metadata.propertyToRefresh).toEqual('previousReleases')
  })
})
