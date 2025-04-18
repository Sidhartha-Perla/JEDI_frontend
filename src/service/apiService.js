import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
});

export async function get({ url, params }) {
    const response = await api.get(url, { params });
    console.log(`URL: ${url}, response: `, response);
    return response.data;
}

export async function post({ url, params, data }) {
    console.log(data);
    const response = await api.post(url, data, { params });
    console.log(`URL: ${url}, response: `, response);
    return response.data;
}