export interface Staff {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'content-creator' | 'video-editor' | 'graphic-designer' | 'manager' | 'social-media-manager' | 'admin';
  assignedClients: string[]; // Array of client IDs
  isActive: boolean;
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyContent {
  _id?: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other';
  clientId: string;
  clientName: string;
  createdBy: string; // Staff ID
  createdByName: string; // Staff name
  driveFileId: string;
  driveFileUrl: string;
  description?: string;
  createdAt: Date;
}

export interface StaffSession {
  staffId: string;
  email: string;
  name: string;
  role: string;
}

export interface Payment {
  _id?: string;
  staffId: string;
  staffName: string;
  month: string;
  amount: number;
  tasksCompleted: number;
  status: 'pending' | 'processing' | 'paid';
  transactionId?: string;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}
