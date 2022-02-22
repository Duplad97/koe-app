import axios from "axios";
import { BASE_URI, DELETE_NOTE, GET_ALL_NOTES, GET_OWN_NOTES, UPLOAD_NOTE, UPDATE_NOTE, GET_NOTE, LIKE_NOTE, DISLIKE_NOTE, COMMENT_NOTE, DELETE_COMMENT } from "../config/api.config";

/**
 * 
 * Összes, felhasználó által látható jegyzet kérése.
 */
export const getAllNotes = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_ALL_NOTES
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Felhasználó saját jegyzeteinek kérése.
 */
export const getOwnNotes = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_OWN_NOTES
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Jegyzet adatainak kérése azonosító alapján.
 */
export const getNoteById = async (token, id) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_NOTE + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Új jegyzet feltöltése.
 */
export const uploadNote = async (token, data) => {
    const url = BASE_URI + UPLOAD_NOTE;

    const response = await axios.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-access-token': token
        }
    });
    return response;
}

/**
 * 
 * Jegyzet törlése azonosító alapján.
 */
export const deleteNote = async (token, id) => {
    const config = {
        method: 'delete',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + DELETE_NOTE + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Jegyzet adatainak módosítása, azonosító alapján. 
 */
export const updateNote = async (token, id, data) => {
    const url = BASE_URI + UPDATE_NOTE + id;

    const response = await axios.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-access-token': token
        }
    });
    return response;
}

/**
 * 
 * Jegyzet kedvelése. 
 */
export const likeNote = async (token, id) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + LIKE_NOTE + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Jegyzet kedvelésének visszavonása.
 */
export const dislikeNote = async (token, id) => {
    const config = {
        method: 'delete',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + DISLIKE_NOTE + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Komment fűzése egy jegyzethez.
 */
export const commentOnNote = async (token, id, data) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        data: data,
        url: BASE_URI + COMMENT_NOTE + id
    }
    const response = await axios(config);
    return response;
}

/**
 * 
 * Komment törlése.
 */
export const deleteComment = async (token, id) => {
    const config = {
        method: 'delete',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + DELETE_COMMENT + id
    }
    const response = await axios(config);
    return response;
}