import PrivataAudit, * as index from './index'
import { Query, Table } from './util/query'
import * as dotenv from 'dotenv'

dotenv.config()

describe('Authenticate', () => {
  let privataAudit: PrivataAudit

  beforeAll(() => {
    privataAudit = new PrivataAudit(true, process.env.APIURL)
  })
  it('should return status 200 on success', async () => {
    let result = await privataAudit.initialize(process.env.DBID, process.env.DBSECRET)
    expect(result).toBe(200)
  })
})

describe('Send Queries', () => {
  let privataAudit: PrivataAudit

  beforeAll(async () => {
    privataAudit = new PrivataAudit(true, process.env.APIURL)
    await privataAudit.initialize(process.env.DBID, process.env.DBSECRET)
  })

  it('should submit queries [Tables]', async () => {
    let table: Table = { table: 'personName', columns: ['familyName', 'givenName'] }
    let query: Query = {
      action: 'Read',
      group: 'physicians',
      returnedRows: 4,
      tables: [table],
      user: 'user2',
      timestamp: 2222222,
    }
    let queries: Array<Query> = [query]
    let result = await privataAudit.sendQueries(queries)
    expect(result).toBe(201)
  })

  it('should submit queries [SQL Query]', async () => {
    const sqlQuery = `SELECT familyName FROM personName`
    let query: Query = {
      sql: sqlQuery,
      timestamp: 1571178690,
      user: '2d4da3f1-6bd3-494f-ba08-eda4fe88f9e9',
      group: 'Admins',
      returnedRows: 6,
    }
    let queries: Array<Query> = [query]
    let result = await privataAudit.sendQueries(queries)
    expect(result).toBe(201)
  })

  it('should not send non-Pii data', async () => {
    let table: Table = { table: 'personName', columns: ['address', 'dateOfBirth'] }
    let query: Query = {
      action: 'IncorrectAction',
      group: 'physicians',
      returnedRows: 4,
      tables: [table],
      user: 'user4',
      timestamp: 2222222,
    }
    let queries: Array<Query> = [query]
    let result = await privataAudit.sendQueries(queries)
    expect(result).toBe(201)
  })
})

describe('Production environment should fail', () => {
  let privataAudit: PrivataAudit

  it('should throw an error when initializing in production env', async () => {
    expect.assertions(1)
    try {
      privataAudit = new PrivataAudit(false, process.env.APIURL)
    } catch (e) {
      expect(e.message).toBe('Production environment not available. Please use the sandbox environment.')
    }
  })
})
