export interface Query {
    sql?: string;
    tables: Array<Table>;
    action: string;
    timestamp: number;
    user: string;
    group: string;
    returnedRows: number;
}
export interface Table {
    table: string;
    columns: Array<string>;
}
