import { Account, Appwrite, Databases, Storage } from '@refinedev/appwrite';

const APPWRITE_URL = import.meta.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT = import.meta.env.VITE_APPWRITE_PROJECT_ID;

const appwriteClient = new Appwrite();

appwriteClient.setEndpoint(APPWRITE_URL).setProject(APPWRITE_PROJECT);

const account = new Account(appwriteClient);
const databases = new Databases(appwriteClient);
const storage = new Storage(appwriteClient);

export { appwriteClient, account, databases, storage };

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

export const COLLECTIONS = {
  INSTANCES: 'instances',
  GROUPS: 'groups',
  MESSAGES: 'messages',
  SYSTEM_LOGS: 'system_logs',
  USER_FEEDBACK: 'user_feedback',
};
