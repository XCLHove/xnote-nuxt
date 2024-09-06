import axios from 'axios'
import type { Config } from '~/types/Config'

export const getConfigApi = (() => {
  let cache: Config
  return () => {
    return new Promise<Config>((resolve, reject) => {
      if (cache) {
        resolve(cache)
        return
      }

      axios
        .get('/api/config')
        .then((res: { data: Config }) => {
          cache = res.data
          resolve(res.data)
        })
        .catch(reject)
    })
  }
})()
