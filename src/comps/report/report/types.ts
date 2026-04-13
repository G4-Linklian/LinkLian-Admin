export interface ReportFileItem {
    url?: string;
    type?: string;
    original_name?: string;
}

export interface ReportRow {
    admin_report_id?: number;
    title?: string;
    detail?: string;
    inst_name_th?: string;
    inst_type?: string;
    report_date?: string;
    report_file?: unknown;
    mark_resolved?: boolean;
}

export const parseReportFiles = (reportFile: unknown): ReportFileItem[] => {
    if (!reportFile) return [];

    const parseAny = (value: unknown): ReportFileItem[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value as ReportFileItem[];

        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                return parseAny(parsed);
            } catch {
                return [];
            }
        }

        if (typeof value === "object") {
            const candidate = value as { files?: ReportFileItem[]; reportFilePayload?: ReportFileItem[] };
            if (Array.isArray(candidate.files)) return candidate.files;
            if (Array.isArray(candidate.reportFilePayload)) return candidate.reportFilePayload;
        }

        return [];
    };

    return parseAny(reportFile);
};
