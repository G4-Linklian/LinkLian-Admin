import { fetchDataApi } from "../callAPI"
import { AdminFields } from "../interface/admin.types";

export const loginAdmin = async (input: AdminFields) => {

    const {
        username = "",
        password = ""
    } = input;

    const data = await fetchDataApi(`POST`, "admin/login", {
        username: username,
        password: password
    });

    return data;
};

