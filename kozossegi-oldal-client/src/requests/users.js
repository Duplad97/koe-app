import axios from "axios";
import { BASE_URI, GET_FRIENDS, GET_SENT_REQUESTS, GET_INC_REQUESTS, PROFILE, DELETE_FRIEND, ACCEPT_REQUEST, DECLINE_REQUEST, CANCEL_REQUEST, SEND_REQUEST, UPLOAD_AVATAR, UPDATE_PROFILE, GET_EXPLORABLE } from "../config/api.config";

/**
 * 
 * Felhasználói profil kérése azonosító alapján, ha az azonosító
 * helyére "own"-t írunk, akkor a saját profilunkat kapjuk meg.
 */
export const getProfile = async (token, id) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + PROFILE + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Felhasználó barátainak kérése azonosító alapján, ha az azonosító
 * helyére "own"-t írunk, akkor a saját barátainkat kapjuk meg.
 */
export const getFriends = async (token, id) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_FRIENDS + id
    }
    const response = await axios(config);
    return response;
}

/**
 * Elküldött barátfelkérések kérése.
 */
export const getSentRequests = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_SENT_REQUESTS
    }
    const response = axios(config);
    return response;
}

/**
 * 
 * Bejövő barátfelkérések kérése.
 */
export const getIncRequests = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_INC_REQUESTS
    }
    const response = axios(config);
    return response;
}

/**
 * 
 * Egy barát törlése.
 */
export const deleteFriend = async (token, friendId) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        data: {
            friendId: friendId
        },
        url: BASE_URI + DELETE_FRIEND
    }
    const response = axios(config);
    return response;
}

/**
 * 
 * Bejövő, függőben lévő barátfelkérés elfogadása.
 */
export const acceptRequest = async (token, userId) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        data: {
            requesterId: userId
        },
        url: BASE_URI + ACCEPT_REQUEST
    }
    const response = axios(config);
    return response;
}

/**
 * 
 * Bejövő, függőben lévő barátfelkérés elutasítása.
 */
export const declineRequest = async (token, userId) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        data: {
            requesterId: userId
        },
        url: BASE_URI + DECLINE_REQUEST
    }
    const response = axios(config);
    return response;
}

/**
 * 
 * Elküldött, függőben lévő barátfelkérés visszavonása.
 */
export const cancelRequest = async (token, userId) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        data: {
            requestedId: userId
        },
        url: BASE_URI + CANCEL_REQUEST
    }
    const response = axios(config);
    return response;
}

/**
 * 
 * Barátfelkérés küldése.
 */
export const sendRequest = async (token, userId) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        data: {
            requestedId: userId
        },
        url: BASE_URI + SEND_REQUEST
    }
    const response = axios(config);
    return response;
}

/**
 * 
 * Profilkép feltöltése, ha a fájl null, akkor a profilkép törlése. 
 */
export const uploadAvatar = async (token, file) => {
    let formData = new FormData();
    formData.append("avatar", file);
    const url = BASE_URI + UPLOAD_AVATAR;

    const response = await axios.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-access-token': token
        }
    });
    return response;
}

/**
 * 
 * Felhasználói profil adatainak módosítása.
 */
export const updateProfile = async (token, data) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        data: data,
        url: BASE_URI + UPDATE_PROFILE
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Felhasználók listájának kérése, akik nem a barátaink, és nincs
 * velük függőben lévő barátfelkérésünk.
 */
export const getExplorable = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_EXPLORABLE
    }
    const response = await axios(config);
    return response;
}