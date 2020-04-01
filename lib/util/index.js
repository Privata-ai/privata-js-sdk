"use strict";
exports.__esModule = true;
var _ = require("lodash");
/**
 * Contains the list of tables and columns that contain Pii
 */
var PiiTablesColumns = /** @class */ (function () {
    function PiiTablesColumns() {
        var _this = this;
        this.getTablesWithPersonalData = function (allTables) {
            allTables.tables.forEach(function (table) {
                if (table.hasPersonalData) {
                    var columnsWithPersonalData_1 = [];
                    table.columns.forEach(function (column) {
                        if (column.isPersonalData) {
                            columnsWithPersonalData_1.push(column.name);
                        }
                    });
                    _this.tablesWithPersonalData.push({ table: table.name, columns: columnsWithPersonalData_1 });
                }
            });
            return;
        };
        this.getQueriesWithPersonalData = function (queries) {
            var queriesWithPersonalData = [];
            queries.forEach(function (query) {
                var tablesWithPersonalDataInQuery = [];
                var isPersonalData = false;
                query.tables.forEach(function (table) {
                    if (_this.tablesWithPersonalData.some(function (tableWithPersonalData) { return _.camelCase(tableWithPersonalData.table) === _.camelCase(table.table); })) {
                        var columnsWithPersonalDataInQuery_1 = [];
                        _this.tablesWithPersonalData.forEach(function (tableWithPersonalData) {
                            table.columns.forEach(function (column) {
                                if (tableWithPersonalData.columns.some(function (columnWithPersonalData) { return _.camelCase(columnWithPersonalData) === _.camelCase(column); }) &&
                                    _.camelCase(tableWithPersonalData.table) === _.camelCase(table.table)) {
                                    columnsWithPersonalDataInQuery_1.push(_.camelCase(column));
                                    isPersonalData = true;
                                }
                            });
                        });
                        tablesWithPersonalDataInQuery.push({
                            table: _.camelCase(table.table),
                            columns: columnsWithPersonalDataInQuery_1
                        });
                    }
                });
                if (isPersonalData) {
                    queriesWithPersonalData.push({
                        tables: tablesWithPersonalDataInQuery,
                        action: query.action,
                        timestamp: query.timestamp,
                        user: query.user,
                        group: query.group,
                        returnedRows: query.returnedRows
                    });
                }
            });
            return queriesWithPersonalData;
        };
        this.tablesWithPersonalData = [];
    }
    return PiiTablesColumns;
}());
exports["default"] = PiiTablesColumns;
