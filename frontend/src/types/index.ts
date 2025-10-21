export interface Instance {
  $id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'qr_needed' | 'error' | 'connecting';
  qrCode?: string;
  phoneNumber?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastConnectedAt?: string;
}

export interface Group {
  $id: string;
  groupId: string;
  name: string;
  inviteCode: string;
  isMember: boolean;
  instanceId: string;
  userId: string;
  joinedAt?: string;
  createdAt: string;
}

export interface Message {
  $id: string;
  text: string;
  target: string;
  isGroup: boolean;
  instanceId: string;
  userId: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: string;
  createdAt: string;
  error?: string;
}

export interface SystemLog {
  $id: string;
  type: 'info' | 'error' | 'warning' | 'success';
  message: string;
  details?: string;
  userId?: string;
  instanceId?: string;
  createdAt: string;
}

export interface UserFeedback {
  $id: string;
  userId: string;
  message: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  status: 'new' | 'reviewing' | 'resolved';
  createdAt: string;
}

export interface SendMessagePayload {
  instance: string;
  messages: string[];
  targets: string[];
  isGroup: boolean;
  delayMin?: number;
  delayMax?: number;
}

export interface JoinGroupPayload {
  instance: string;
  inviteCodes: string[];
}

export interface DashboardStats {
  totalInstances: number;
  connectedInstances: number;
  totalGroups: number;
  totalMessages: number;
  messagesLastHour: number;
  evolutionApiStatus: 'online' | 'offline';
}
