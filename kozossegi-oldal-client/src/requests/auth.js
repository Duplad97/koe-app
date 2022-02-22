import axios from "axios";
import { BASE_URI, SCHOOLS, LOGIN, AUTH, LOGOUT, REGISTER, CONFIRM_CODE, RESEND_CODE } from "../config/api.config";

/**
 * 
 * Egyetemek listájának kérése. 
 */
export const getSchools = async () => {
    const response = await axios.get(BASE_URI + SCHOOLS);
    const data = response.data;
    return data;
};

/**
 * 
 * Felhasználó tokenjének ellenőrzése.
 */
export const auth = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + AUTH
    }
    const response = await axios(config);
    return response;
};

/**
 * 
 * Bejelentkezés az alkalmazásba, felhasználónév és jelszó megadásával.
 */
export const login = async (data) => {
    const config = {
        method: 'post',
        url: BASE_URI + LOGIN,
        data: data
    }
    const response = await axios(config);
    return response;
};

/**
 * 
 * Kijelentkezés az alkalmazásból, a felhasználóhoz rendelt token
 * érvénytelen lesz.
 */
export const logout = async (token) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + LOGOUT,
    }
    const response = await axios(config);
    return response;
};

/**
 * 
 * Regisztráció az alkalmazásba. Regisztráció után a felhasználó megerősítő
 * emailt kap a megadott címére.
 */
export const register = async (data) => {
    const config = {
        method: 'post',
        url: BASE_URI + REGISTER,
        data: data
    }
    const response = await axios(config);
    return response;
};

/**
 * 
 * Felhasználói fiók aktiválása.
 */
export const verifyEmail = async (code, id) => {
    const config = {
        method: 'get',
        url: BASE_URI + CONFIRM_CODE + `${code}/${id}`
    }
    const response = await axios(config);
    return response;
};

/**
 * 
 * Fiók aktiválásához szükséges email újraküldése.
 */
export const resendEmail = async (token) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + RESEND_CODE
    }
    const response = await axios(config);
    return response;
}