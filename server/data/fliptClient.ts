import { FliptClient } from '@flipt-io/flipt-client-js'
import config from '../config'

const createClient = async (): Promise<FliptClient> => {
  const client = await FliptClient.init({
    url: config.apis.fliptClient.url,
    namespace: config.apis.fliptClient.namespace,
    updateInterval: 120, // in seconds
  })

  return client
}

export default createClient
