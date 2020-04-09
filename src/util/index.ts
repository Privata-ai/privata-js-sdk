import * as _ from 'lodash'
import { Parser } from 'node-sql-parser'
import { Query, Table, Database, From, NOT_RELEVANT, SELECT, INSERT, UPDATE, DELETE } from './query'

/**
 * Contains the list of tables and columns that contain PII (Personally identifiable information)
 */

export default class PII {
  private tablesWithPersonalData: Array<Table>
  private database: Database

  constructor() {
    this.tablesWithPersonalData = []
  }
  
  private getAction = (type: string) => {
    let action = ''
    switch (type) {
      case SELECT:
        action = 'Read'
        break
      case INSERT:
        action = 'Create'
        break
      case UPDATE:
        action = 'Update'
        break
      case DELETE:
        action = 'Delete'
        break
      default:
        action = NOT_RELEVANT
        break
    }
    return action
  }
  
  private parseAction = (sqlQuery: string) => {
    const parser = new Parser()
    const ast = parser.astify(sqlQuery)
  
    let action = ''
    if (Array.isArray(ast)) {
      for (const elem of ast) {
        action = this.getAction(elem.type)
      }
    } else {
      action = this.getAction(ast.type)
    }
  
    return action
  }
  
  private parseColumns = (sqlQuery: string, database: Database) => {
    const parser = new Parser()
    const columnList = parser.columnList(sqlQuery)
  
    const columns = []
    for (const columnParsed of columnList) {
      const columnSplitted = columnParsed.split('::')
      let tableName = ''
  
      if (columnSplitted[1] === 'null') {
        let ast = parser.astify(sqlQuery)
  
        if (Array.isArray(ast)) {
          ast = ast[0]
        }
  
        // when for some reason the table comes as null, we need to look for the table
        // we need to figure out a way to associate columns to their table when there are several tables
        // for now we assume the first slot
        if ('from' in ast && ast.from != undefined) {
          // dirty fix to cast to type From
          const from: From = ast.from[0]
          if (from.table) tableName = from.table
          else continue
        }
  
        // if ast as "table" field, we try to get the tableName from it
        else if ('table' in ast && ast.table != undefined) {
          if (ast.table[0]) tableName = ast.table[0].table
          else continue
        }
      } else {
        tableName = columnSplitted[1]
      }
  
      if (columnSplitted[2] === '(.*)') {
        // get all columns of the table
        const columnNames = database.tables
          .filter(table => table.name === tableName)
          .map(table => table.columns.map(column => column.name))
  
        if (columnNames.length === 0) continue
  
        columnNames[0].forEach(columnName => {
          columns.push({ table: tableName, column: columnName })
        })
      } else {
        columns.push({ table: tableName, column: columnSplitted[2] })
      }
    }
    return columns
  }
  
  private parseSql = (sqlQuery: string) => {
    const columns = this.parseColumns(sqlQuery, this.database)
    const action = this.parseAction(sqlQuery)
  
    if (action === NOT_RELEVANT) return { tables: [], action: action }
  
    const tables: Array<Table> = []
  
    // assign columns to each table
    for (const column of columns) {
      const columnsInTable: any = columns
        .filter(table => table.table === column.table && !tables.some(table => table.table === column.table))
        .map(column => column.column)
  
      if (columnsInTable.length === 0) continue
      tables.push({ table: column.table, columns: columnsInTable })
    }
    return { tables: tables, action: action }
  }

  setTablesWithPersonalData = (database: Database) => {
    this.database = database
    this.tablesWithPersonalData = []
    database.tables.forEach((table) => {
      if (table.hasPersonalData) {
        const columnsWithPersonalData: Array<string> = []
        table.columns.forEach((column) => {
          if (column.isPersonalData) {
            columnsWithPersonalData.push(column.name)
          }
        })
        this.tablesWithPersonalData.push({ table: table.name, columns: columnsWithPersonalData })
      }
    })
    return
  }

  getQueriesWithPersonalData = (queries: Array<Query>) => {

    // parse sql query if provided
		for (const query of queries) {
			if (query.sql) {
				try {
					const parsed = this.parseSql(query.sql)
					query.tables = parsed.tables
					query.action = parsed.action
				} catch (error) {
					console.error(`ERROR: could not parse query "${query.sql}"`, error)
					query.tables = []
					query.action = NOT_RELEVANT
					continue
				}
			}
    }
    
    const queriesWithPersonalData: Array<Query> = []
    queries.forEach((query) => {
      const tablesWithPersonalDataInQuery: Array<Table> = []
      let isPersonalData = false
      query.tables.forEach((table) => {
        if (
          this.tablesWithPersonalData.some(
            (tableWithPersonalData) => _.camelCase(tableWithPersonalData.table) === _.camelCase(table.table),
          )
        ) {
          const columnsWithPersonalDataInQuery: Array<string> = []
          this.tablesWithPersonalData.forEach((tableWithPersonalData) => {
            table.columns.forEach((column) => {
              if (
                tableWithPersonalData.columns.some(
                  (columnWithPersonalData) => _.camelCase(columnWithPersonalData) === _.camelCase(column),
                ) &&
                _.camelCase(tableWithPersonalData.table) === _.camelCase(table.table)
              ) {
                columnsWithPersonalDataInQuery.push(_.camelCase(column))
                isPersonalData = true
              }
            })
          })
          tablesWithPersonalDataInQuery.push({
            table: _.camelCase(table.table),
            columns: columnsWithPersonalDataInQuery,
          })
        }
      })
      if (isPersonalData) {
        queriesWithPersonalData.push({
          tables: tablesWithPersonalDataInQuery,
          action: query.action,
          timestamp: query.timestamp,
          user: query.user,
          group: query.group,
          returnedRows: query.returnedRows,
          userIP: query.userIP ? query.userIP : null,
        })
      }
    })
    return queriesWithPersonalData
  }
}
