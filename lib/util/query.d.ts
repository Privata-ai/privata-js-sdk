export interface Query {
    sql?: string;
    userIP?: string | null;
    tables?: Array<Table>;
    action?: string;
    timestamp: number;
    user: string;
    group: string;
    returnedRows: number;
}
export interface Table {
    table: string;
    columns: Array<string>;
}
export interface From {
    type?: string;
    table?: string;
}
export interface Database {
    id: string;
    type: string;
    host: string;
    port: string;
    organizationId: string;
    database: string;
    tables: DatabaseTable[];
    applications?: Application[];
}
interface Application {
    id: string;
    name: string;
    language: string;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
    databases?: Database[];
}
interface DatabaseTable {
    id: string;
    name: string;
    customName: string;
    databaseId: string;
    schema: string;
    hasPersonalData: boolean;
    columns: DatabaseColumn[];
}
interface DatabaseColumn {
    id: string;
    name: string;
    tableId: string;
    isPersonalData?: boolean;
    tag?: string;
}
export declare const NOT_RELEVANT = "NOT_RELEVANT";
export declare const SELECT = "select";
export declare const INSERT = "insert";
export declare const UPDATE = "update";
export declare const DELETE = "delete";
export {};
