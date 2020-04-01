import * as auth from './auth'
import PiiTablesColumns from './util'
import Axios from 'axios'
import { Query } from './util/query'
/**
 * NPM Module for sending data queries to blockbird.data
 */
export default class BbAudit {
  private piiTablesColums = new PiiTablesColumns()
  private apiUrl: string
  private dbId: string

  /**
   * Initialize
   */
  initialize = async (apiUrl: string, dbId: string, dbSecret: string) => {
    this.apiUrl = apiUrl
    this.dbId = dbId
    // log in as user
    await auth.initialize(dbId, dbSecret)
    const idToken = await auth.getIdToken()
    // connect to API
    let result = await Axios.get(this.apiUrl + '/databases/' + this.dbId, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })
    this.piiTablesColums.getTablesWithPersonalData(result.data)

    return result.status
  }

  /**
   * Send queries
   */

  sendquery = async (queries: Array<Query>) => {
    let filteredQueries: Array<Query> = this.piiTablesColums.getQueriesWithPersonalData(queries)
    const idToken = await auth.getIdToken()

    let result = await Axios.post(this.apiUrl + '/databases/' + this.dbId + '/queries', filteredQueries, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    return result.status
  }
}
