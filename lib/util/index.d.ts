import { Query, Database } from './query';
/**
 * Contains the list of tables and columns that contain PII (Personally identifiable information)
 */
export default class PII {
    private tablesWithPersonalData;
    private database;
    constructor();
    private getAction;
    private parseAction;
    private parseColumns;
    private parseSql;
    setTablesWithPersonalData: (database: Database) => void;
    getQueriesWithPersonalData: (queries: Query[]) => Query[];
}
