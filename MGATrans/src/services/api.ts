const isLocal = window.location.hostname === 'localhost' || window.location.hostname === 'dev.local' || window.location.hostname === 'mga.local';
export const API_BASE_URL = isLocal ? 'http://mga.local' : 'https://mga.mizara.io';
