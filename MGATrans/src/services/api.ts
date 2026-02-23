const isLocal = window.location.hostname === 'localhost' || window.location.hostname === 'dev.local';
export const API_BASE_URL = isLocal ? 'http://dev.local:8888' : 'https://mga.mizara.io';
