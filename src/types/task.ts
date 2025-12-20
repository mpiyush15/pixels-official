export interface Task {
  _id?: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  clientId: string;
  clientName: string;
  assignedTo: string; // Staff ID
  assignedToName: string;
  assignedToRole: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'submitted' | 'approved' | 'revision-needed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  startDate?: string;
  completedDate?: string;
  submittedDate?: string;
  approvedDate?: string;
  files: Array<{
    name: string;
    url: string;
    key: string;
    size: number;
    uploadedAt: Date;
  }>;
  submissionNotes?: string;
  adminNotes?: string;
  revisionReason?: string;
  createdBy: string; // Admin ID
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskSubmission {
  taskId: string;
  notes: string;
  files: Array<{
    name: string;
    url: string;
    key: string;
    size: number;
  }>;
}
