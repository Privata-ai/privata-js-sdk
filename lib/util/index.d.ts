import { Query } from './query';
/**
 * Contains the list of tables and columns that contain Pii
 */
export default class PiiTablesColumns {
    private tablesWithPersonalData;
    constructor();
    getTablesWithPersonalData: (allTables: any) => void;
    getQueriesWithPersonalData: (queries: Query[]) => Query[];
}
