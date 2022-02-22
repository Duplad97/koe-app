import axios from "axios";
import { BASE_URI, GET_UNREAD, READ_NOTIFICATION } from "../config/api.config";

/**
 * 
 * Olvasatlan értesítések kérése.
 */
export const getUnreadNotifications = async (token) => {
    const config = {
        method: 'get',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + GET_UNREAD
    }
    const response = axios(config);
    return response;
}

/**
 * 
 * Értesítés olvasottnak jelölése, azonosító alapján.
 */
export const readNotification = async (token, id) => {
    const config = {
        method: 'post',
        headers: {
            'x-access-token': token
        },
        url: BASE_URI + READ_NOTIFICATION + id
    }
    const response = axios(config);
    return response;
}