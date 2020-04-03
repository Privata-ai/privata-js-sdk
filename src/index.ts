import * as auth from './auth'
import PII from './util'
import Axios from 'axios'
import { Query, NOT_RELEVANT } from './util/query'

/**
 * NPM Module for sending data queries to blockbird.data
 */

 export default class BbAudit {
  private PII = new PII()
  private apiUrl: string
  private dbId: string

  /**
   * Initialize
   */
  initialize = async (apiUrl: string, dbId: string, dbSecret: string, sandbox = true) => {
    this.apiUrl = apiUrl
    this.dbId = dbId
    // log in as user
    await auth.initialize(dbId, dbSecret, sandbox)
    const idToken = await auth.getIdToken(sandbox)
    // connect to API
    let result = await Axios.get(this.apiUrl + '/databases/' + this.dbId, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })
    this.PII.setTablesWithPersonalData(result.data)

    return result.status
  }

  /**
   * Send queries
   */

  sendQuery = async (queries: Array<Query>, sandbox = true) => {

    let filteredQueries: Array<Query> = this.PII.getQueriesWithPersonalData(queries)
    const idToken = await auth.getIdToken(sandbox)

    let result = await Axios.post(this.apiUrl + '/databases/' + this.dbId + '/queries', filteredQueries, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    return result.status
  }
}
