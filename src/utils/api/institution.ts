import { fetchDataApi } from "@/utils/callAPI"
import  { institutionFields } from "@/utils/interface/institution.types"

export const getInstitution = async (input: institutionFields) => {
    const {
        inst_id,
        inst_email,
        inst_name_th,
        inst_name_en,
        inst_abbr_th,
        inst_abbr_en,
        inst_type,
        approve_status,
        flag_valid,
        offset,
        limit,
        sort_by,
        sort_order,
        from
    } = input;

    const data = await fetchDataApi(`POST`, "institution.get", {
        inst_id: inst_id,
        inst_email: inst_email,
        inst_name_th: inst_name_th,
        inst_name_en: inst_name_en,
        inst_abbr_th: inst_abbr_th,
        inst_abbr_en: inst_abbr_en,
        inst_type: inst_type,
        approve_status: approve_status,
        flag_valid: flag_valid,
        offset: offset,
        limit: limit,
        sort_by: sort_by,
        sort_order: sort_order,
        from: from
    });

    return data;
}

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
        from
    } = input;

    const data = await fetchDataApi(`POST`, "institution.update", {
        inst_id: inst_id,
        inst_email: inst_email,
        inst_password: inst_password,
        inst_name_th: inst_name_th,
        inst_name_en: inst_name_en,
        inst_abbr_th: inst_abbr_th,
        inst_abbr_en: inst_abbr_en,
        inst_type: inst_type,
        inst_phone: inst_phone,
        website: website,
        address: address,
        subdistrict: subdistrict,
        district: district,
        province: province,
        postal_code: postal_code,
        logo_url: logo_url,
        docs_url: docs_url,
        approve_status: approve_status,
        flag_valid: flag_valid,
        from: from
    });

    return data;
}