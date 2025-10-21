import axios from 'axios';
import { SendMessagePayload, JoinGroupPayload } from '../types';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export const n8nService = {
  async sendMessages(payload: SendMessagePayload): Promise<any> {
    try {
      const response = await axios.post(N8N_WEBHOOK_URL, payload, {
        timeout: 300000,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar mensajes');
    }
  },

  async joinGroups(payload: JoinGroupPayload): Promise<any> {
    try {
      const response = await axios.post(N8N_WEBHOOK_URL, {
        ...payload,
        isGroupInvites: true,
      }, {
        timeout: 60000,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al unirse a grupos');
    }
  },
};
