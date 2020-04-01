import { Query } from './util/query';
/**
 * NPM Module for sending data queries to blockbird.data
 */
export default class BbAudit {
    private piiTablesColums;
    private apiUrl;
    private dbId;
    /**
     * Initialize
     */
    initialize: (apiUrl: string, dbId: string, dbSecret: string) => Promise<number>;
    /**
     * Send queries
     */
    sendquery: (queries: Query[]) => Promise<number>;
}
