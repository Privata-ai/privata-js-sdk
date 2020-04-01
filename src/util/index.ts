import * as _ from 'lodash'
import { Query, Table } from './query'

/**
 * Contains the list of tables and columns that contain Pii
 */
export default class PiiTablesColumns {
  private tablesWithPersonalData: Array<Table>

  constructor() {
    this.tablesWithPersonalData = []
  }

  getTablesWithPersonalData = (allTables) => {
    allTables.tables.forEach((table) => {
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
        })
      }
    })
    return queriesWithPersonalData
  }
}
