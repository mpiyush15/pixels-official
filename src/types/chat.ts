export interface ChatMessage {
  _id?: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  sender: 'client' | 'admin';
  senderName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatConversation {
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  lastSender: 'client' | 'admin';
}
