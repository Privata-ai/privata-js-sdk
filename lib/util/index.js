"use strict";
exports.__esModule = true;
var _ = require("lodash");
var node_sql_parser_1 = require("node-sql-parser");
var query_1 = require("./query");
/**
 * Contains the list of tables and columns that contain PII (Personally identifiable information)
 */
var PII = /** @class */ (function () {
    function PII() {
        var _this = this;
        this.getAction = function (type) {
            var action = '';
            switch (type) {
                case query_1.SELECT:
                    action = 'Read';
                    break;
                case query_1.INSERT:
                    action = 'Create';
                    break;
                case query_1.UPDATE:
                    action = 'Update';
                    break;
                case query_1.DELETE:
                    action = 'Delete';
                    break;
                default:
                    action = query_1.NOT_RELEVANT;
                    break;
            }
            return action;
        };
        this.parseAction = function (sqlQuery) {
            var parser = new node_sql_parser_1.Parser();
            var ast = parser.astify(sqlQuery);
            var action = '';
            if (Array.isArray(ast)) {
                for (var _i = 0, ast_1 = ast; _i < ast_1.length; _i++) {
                    var elem = ast_1[_i];
                    action = _this.getAction(elem.type);
                }
            }
            else {
                action = _this.getAction(ast.type);
            }
            return action;
        };
        this.parseColumns = function (sqlQuery, database) {
            var parser = new node_sql_parser_1.Parser();
            var columnList = parser.columnList(sqlQuery);
            var columns = [];
            var _loop_1 = function (columnParsed) {
                var columnSplitted = columnParsed.split('::');
                var tableName = '';
                if (columnSplitted[1] === 'null') {
                    var ast = parser.astify(sqlQuery);
                    if (Array.isArray(ast)) {
                        ast = ast[0];
                    }
                    // when for some reason the table comes as null, we need to look for the table
                    // we need to figure out a way to associate columns to their table when there are several tables
                    // for now we assume the first slot
                    if ('from' in ast && ast.from != undefined) {
                        // dirty fix to cast to type From
                        var from = ast.from[0];
                        if (from.table)
                            tableName = from.table;
                        else
                            return "continue";
                    }
                    // if ast as "table" field, we try to get the tableName from it
                    else if ('table' in ast && ast.table != undefined) {
                        if (ast.table[0])
                            tableName = ast.table[0].table;
                        else
                            return "continue";
                    }
                }
                else {
                    tableName = columnSplitted[1];
                }
                if (columnSplitted[2] === '(.*)') {
                    // get all columns of the table
                    var columnNames = database.tables
                        .filter(function (table) { return table.name === tableName; })
                        .map(function (table) { return table.columns.map(function (column) { return column.name; }); });
                    if (columnNames.length === 0)
                        return "continue";
                    columnNames[0].forEach(function (columnName) {
                        columns.push({ table: tableName, column: columnName });
                    });
                }
                else {
                    columns.push({ table: tableName, column: columnSplitted[2] });
                }
            };
            for (var _i = 0, columnList_1 = columnList; _i < columnList_1.length; _i++) {
                var columnParsed = columnList_1[_i];
                _loop_1(columnParsed);
            }
            return columns;
        };
        this.parseSql = function (sqlQuery) {
            var columns = _this.parseColumns(sqlQuery, _this.database);
            var action = _this.parseAction(sqlQuery);
            if (action === query_1.NOT_RELEVANT)
                return { tables: [], action: action };
            var tables = [];
            var _loop_2 = function (column) {
                var columnsInTable = columns
                    .filter(function (table) { return table.table === column.table && !tables.some(function (table) { return table.table === column.table; }); })
                    .map(function (column) { return column.column; });
                if (columnsInTable.length === 0)
                    return "continue";
                tables.push({ table: column.table, columns: columnsInTable });
            };
            // assign columns to each table
            for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
                var column = columns_1[_i];
                _loop_2(column);
            }
            return { tables: tables, action: action };
        };
        this.setTablesWithPersonalData = function (database) {
            _this.database = database;
            database.tables.forEach(function (table) {
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
            // parse sql query if provided
            for (var _i = 0, queries_1 = queries; _i < queries_1.length; _i++) {
                var query = queries_1[_i];
                if (query.sql) {
                    try {
                        var parsed = _this.parseSql(query.sql);
                        query.tables = parsed.tables;
                        query.action = parsed.action;
                    }
                    catch (error) {
                        console.error("ERROR: could not parse query \"" + query.sql + "\"", error);
                        query.tables = [];
                        query.action = query_1.NOT_RELEVANT;
                        continue;
                    }
                }
            }
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
                        returnedRows: query.returnedRows,
                        userIP: query.userIP ? query.userIP : null
                    });
                }
            });
            return queriesWithPersonalData;
        };
        this.tablesWithPersonalData = [];
    }
    return PII;
}());
exports["default"] = PII;
