const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.host}`;
  }
  
  return 'http://localhost:5001';
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const endpoints = {
  auth: {
    login: `${getBaseUrl()}/api/auth/login`,
    register: `${getBaseUrl()}/api/auth/register`,
  },
  teams: {
    list: `${getBaseUrl()}/api/teams`,
    create: `${getBaseUrl()}/api/teams`,
    get: (teamNumber: string | number) => `${getBaseUrl()}/api/teams/${teamNumber}`,
    getConfig: () => getAuthHeader(),
  },
  uploads: {
    getUrl: (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${getBaseUrl()}/storage${path.replace('/uploads', '')}`;
    },
  },
};

export default endpoints; 
