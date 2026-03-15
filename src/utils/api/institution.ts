import { fetchDataApi } from "@/utils/callAPI"
import { institutionFields } from "@/utils/interface/institution.types"

// GET /institution/:id - ดึงข้อมูลตาม ID
export const getInstitutionById = async (id: number) => {
    const data = await fetchDataApi(`GET`, `institution/${id}`, {});
    return data;
};

// GET /institution - ค้นหาสถาบัน
export const getInstitution = async (input: institutionFields) => {
    const {
        inst_id,
        inst_email,
        inst_name_th,
        inst_abbr_th,
        inst_type,
        province,
        approve_status,
        keyword,
        offset,
        limit,
        sort_by,
        sort_order,
        from,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`GET`, "institution", {
        inst_id,
        inst_email,
        inst_name_th,
        inst_abbr_th,
        inst_type,
        province,
        approve_status,
        keyword,
        offset,
        limit,
        sort_by,
        sort_order,
        from,
        flag_valid,
    });

    return data;
};

// POST /institution - สร้างสถาบันใหม่
export const createInstitution = async (input: institutionFields) => {
    const {
        inst_email,
        inst_password,
        inst_type,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`POST`, "institution", {
        inst_email,
        inst_password,
        inst_type,
        flag_valid,
    });

    return data;
};

// PUT /institution/:id - อัปเดตสถาบัน
export const updateInstitution = async (input: institutionFields) => {
    const {
        inst_id,
        inst_email,
        inst_password,
        inst_name_th,
        inst_name_en,
        inst_abbr_th,
        inst_abbr_en,
        inst_type,
        inst_phone,
        website,
        address,
        subdistrict,
        district,
        province,
        postal_code,
        logo_url,
        docs_url,
        approve_status,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`PUT`, `institution/${inst_id}`, {
        inst_email,
        inst_password,
        inst_name_th,
        inst_name_en,
        inst_abbr_th,
        inst_abbr_en,
        inst_type,
        inst_phone,
        website,
        address,
        subdistrict,
        district,
        province,
        postal_code,
        logo_url,
        docs_url,
        approve_status,
        flag_valid,
    });

    return data;
};

// DELETE /institution/:id - ลบสถาบัน
export const deleteInstitution = async (id: number) => {
    const data = await fetchDataApi(`DELETE`, `institution/${id}`, {});
    return data;
};