import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Serviços de Conteúdo
export const contentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/content', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },

  create: async (contentData) => {
    const formData = new FormData();
    Object.keys(contentData).forEach(key => {
      if (key === 'file' && contentData.file) {
        formData.append('file', contentData.file);
      } else {
        formData.append(key, contentData[key]);
      }
    });

    const response = await api.post('/content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  update: async (id, contentData) => {
    const response = await api.put(`/content/${id}`, contentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  }
};

// Serviços de Telas
export const screenService = {
  getAll: async (params = {}) => {
    const response = await api.get('/screens', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/screens/${id}`);
    return response.data;
  },

  create: async (screenData) => {
    const response = await api.post('/screens', screenData);
    return response.data;
  },

  update: async (id, screenData) => {
    const response = await api.put(`/screens/${id}`, screenData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/screens/${id}`);
    return response.data;
  },

  deviceHeartbeat: async (deviceData) => {
    const response = await api.post('/screens/device/heartbeat', deviceData);
    return response.data;
  }
};

// Serviços de Playlists
export const playlistService = {
  getAll: async (params = {}) => {
    const response = await api.get('/playlists', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  create: async (playlistData) => {
    const response = await api.post('/playlists', playlistData);
    return response.data;
  },

  update: async (id, playlistData) => {
    const response = await api.put(`/playlists/${id}`, playlistData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  }
};

export default api;
