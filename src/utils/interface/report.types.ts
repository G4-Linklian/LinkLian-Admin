export interface reportAdminFields {
    admin_report_id?: number;
    inst_id?: number;
    title?: string;
    detail?: string;
    report_file?: object;
    flag_valid?: boolean;
    report_date?: string;
    mark_resolved?: boolean;
    offset?: number;
    limit?: number;
}