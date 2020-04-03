import * as auth from './auth'
import PII from './util'
import Axios from 'axios'
import { Query } from './util/query'

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
  initialize = async (apiUrl: string, dbId: string, dbSecret: string, sandbox = false) => {
    if(!sandbox) throw new Error('Production environment not available. Please use the sandbox environment.')

    this.apiUrl = apiUrl
    this.dbId = dbId
    // log in as user
    await auth.initializeApp(dbId, dbSecret, sandbox)
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
  sendQuery = async (queries: Array<Query>, sandbox = false) => {
    if(!sandbox) throw new Error('Production environment not available. Please use the sandbox environment.')

    const idToken = await auth.getIdToken(sandbox)
    
    let resultDatabase = await Axios.get(this.apiUrl + '/databases/' + this.dbId, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    if(resultDatabase.status === 200) {
      this.PII.setTablesWithPersonalData(resultDatabase.data)
    }

    let filteredQueries: Array<Query> = this.PII.getQueriesWithPersonalData(queries)

    let resultQueries = await Axios.post(this.apiUrl + '/databases/' + this.dbId + '/queries', filteredQueries, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    return resultQueries.status
  }
}
