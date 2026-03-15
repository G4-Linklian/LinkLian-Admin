import { fetchDataApi } from "@/utils/callAPI"
import { themeSettingsFields } from "@/utils/interface/themeSettings.types"

export const getTheme = async (input: themeSettingsFields) => {
    const {
        theme_id,
        theme_name,
        theme_url,
        start_date,
        end_date,
        is_default,
        status,
        flag_valid,
    } = input;

    const data = await fetchDataApi(`GET`, "assets", {
        theme_id,
        theme_name,
        theme_url,
        start_date,
        end_date,
        is_default,
        status,
        flag_valid,
    });

    return data;
}

export const createTheme = async (input: themeSettingsFields) => {
  const {
    theme_name,
    start_date,
    end_date,
    is_default,
    status,
    flag_valid,
    file,
  } = input;

  if (!file) {
    throw new Error("กรุณาเลือกไฟล์รูปก่อนสร้างธีม");
  }

  if (!theme_name?.trim()) {
    throw new Error("กรุณากรอกชื่อธีม");
  }

  const formData = new FormData();
  formData.append("file", file); // ใช้ key นี้ให้ตรง backend
  formData.append("theme_name", theme_name);
  if (start_date) {
    formData.append(
      "start_date",
      start_date instanceof Date ? start_date.toISOString() : start_date,
    );
  }
  if (end_date) {
    formData.append(
      "end_date",
      end_date instanceof Date ? end_date.toISOString() : end_date,
    );
  }
  formData.append("is_default", String(is_default));
  if (status) formData.append("status", status);
  formData.append("flag_valid", String(flag_valid));

  return fetchDataApi("POST", "assets", formData);
};

export const updateTheme = async (input: themeSettingsFields) => {
  const {
    theme_id,
    theme_name,
    start_date,
    end_date,
    is_default,
    status,
    flag_valid,
    file,
  } = input;

  if (!theme_id) {
    throw new Error("ไม่พบรหัสธีมที่ต้องการแก้ไข");
  }

  const formData = new FormData();
  if (file) formData.append("file", file);
  if (theme_name !== undefined) formData.append("theme_name", theme_name);
  if (start_date !== undefined && start_date !== null) {
    formData.append(
      "start_date",
      start_date instanceof Date ? start_date.toISOString() : start_date,
    );
  }
  if (end_date !== undefined && end_date !== null) {
    formData.append(
      "end_date",
      end_date instanceof Date ? end_date.toISOString() : end_date,
    );
  }
  if (is_default !== undefined) formData.append("is_default", String(is_default));
  if (status !== undefined) formData.append("status", status);
  if (flag_valid !== undefined) formData.append("flag_valid", String(flag_valid));

  return fetchDataApi("PUT", `assets/${theme_id}`, formData);
};

export const deleteTheme = async (theme_id: number) => {
    const data = await fetchDataApi(`DELETE`, `assets/${theme_id}`);
    return data;
};

