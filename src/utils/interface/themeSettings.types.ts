export interface themeSettingsFields {
    theme_id?: number;
    theme_name?: string;
    theme_url?: string;
    file?: File;
    start_date?: Date | string | null;
    end_date?: Date | string | null;
    is_default?: boolean;
    status?: string;
    flag_valid?: boolean;
    offset?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    total_count?: number;
    
    keyword?: string;
}