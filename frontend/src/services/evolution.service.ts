import axios from 'axios';

const EVOLUTION_API_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const API_KEY = 'B6D711FCDE4D4FD5936544120E713976';

const evolutionApi = axios.create({
  baseURL: EVOLUTION_API_URL,
  headers: {
    'apikey': API_KEY,
    'Content-Type': 'application/json',
  },
});

export const evolutionService = {
  async checkStatus(): Promise<boolean> {
    try {
      const response = await evolutionApi.get('/');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  async createInstance(name: string): Promise<any> {
    try {
      const response = await evolutionApi.post('/instance/create', {
        instanceName: name,
        qrcode: true,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear instancia');
    }
  },

  async getInstanceQR(instanceName: string): Promise<string> {
    try {
      const response = await evolutionApi.get(`/instance/connect/${instanceName}`);
      return response.data.qrcode?.base64 || '';
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener QR');
    }
  },

  async getInstanceStatus(instanceName: string): Promise<any> {
    try {
      const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estado');
    }
  },

  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await evolutionApi.delete(`/instance/delete/${instanceName}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar instancia');
    }
  },

  async fetchGroupInfo(instanceName: string, groupId: string): Promise<any> {
    try {
      const response = await evolutionApi.get(`/group/participants/${instanceName}`, {
        params: { groupJid: groupId },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener info del grupo');
    }
  },
};
