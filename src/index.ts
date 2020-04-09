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
  private sandbox: boolean

  constructor(sandbox = false, apiUrl = 'https://api-staging.blockbird.ventures'){
    if(!sandbox) throw new Error('Production environment not available. Please use the sandbox environment.')

    this.sandbox = sandbox
    this.apiUrl = apiUrl
  }

  /**
   * Initialize
   * 
   * Asynchronously signs in using an dbId and dbSecret.
   *
   * Fails with an error if the dbId and dbSecret do not match.
   */
  initialize = async (dbId: string, dbSecret: string) => {
    try {
      // log in as user
      this.dbId = dbId
      await auth.initializeApp(dbId, dbSecret, this.sandbox)
      return 200
    } catch (error) {
      throw error
    }
  }

  /**
   * Send Queries
   * 
   * Asynchronously gets the database and submit queries related to personal data.
   *
   * Fails with an error if the requests fails.
   */
  sendQueries = async (queries: Array<Query>) => {
    try{
      const idToken = await auth.getIdToken(this.sandbox)
      
      let resultDatabase = await Axios.get(this.apiUrl + '/databases/' + this.dbId, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      })

      if(resultDatabase.status !== 200) {
        throw new Error('Could not get database specified')
      }

      this.PII.setTablesWithPersonalData(resultDatabase.data)

      let filteredQueries: Array<Query> = this.PII.getQueriesWithPersonalData(queries)

      let resultQueries = await Axios.post(this.apiUrl + '/databases/' + this.dbId + '/queries', filteredQueries, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      })

      if(resultQueries.status !== 201) {
        throw new Error('Could not submit queries')
      }

      return resultQueries.status
    } catch (error) {
      throw error
    }
  }
}
