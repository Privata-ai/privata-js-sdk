import { Query } from './util/query';
/**
 * NPM Module for sending data queries to blockbird.data
 */
export default class BbAudit {
    private PII;
    private apiUrl;
    private dbId;
    /**
     * Initialize
     */
    initialize: (apiUrl: string, dbId: string, dbSecret: string, sandbox?: boolean) => Promise<number>;
    /**
     * Send queries
     */
    sendQuery: (queries: Query[], sandbox?: boolean) => Promise<number>;
}
