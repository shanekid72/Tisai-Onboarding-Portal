// CRM Type Definitions
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoUrl?: string;
  title?: string;
  company?: string;
  methods: ContactMethod[];
  addresses: Address[];
  customFields: CustomField[];
  source: string;
  acquisitionDate: string;
  ownerId: string;
  organizationIds: string[];
  tags: string[];
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactMethod {
  id: string;
  type: 'email' | 'phone' | 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'other';
  value: string;
  label?: string;
  isPrimary: boolean;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface CustomField {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'url';
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: number;
  revenue?: number;
  parentId?: string;
  contactIds: string[];
  ownerId: string;
  sharedWithUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  contactId?: string;
  organizationId?: string;
  userId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'custom';
  title: string;
  description: string;
  date: string;
  followUpDate?: string;
  mentions: string[];
  attachments: Attachment[];
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assigneeId: string;
  mentions: string[];
  contactId?: string;
  organizationId?: string;
  interactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  settings: UserSettings;
  jwtToken?: string;
  refreshToken?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: NotificationSettings;
  timezone: string;
  language: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  mentions: boolean;
  assignments: boolean;
  reminders: boolean;
}

export interface Notification {
  id: string;
  type: 'mention' | 'assignment' | 'reminder' | 'update';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface CRMState {
  contacts: Contact[];
  organizations: Organization[];
  interactions: Interaction[];
  tasks: Task[];
  notifications: Notification[];
  filters: FilterState;
  search: SearchState;
  loading: LoadingState;
}

export interface FilterState {
  contacts: ContactFilters;
  organizations: OrganizationFilters;
  interactions: InteractionFilters;
  tasks: TaskFilters;
}

export interface ContactFilters {
  tags?: string[];
  organizations?: string[];
  owners?: string[];
  sources?: string[];
  dateRange?: DateRange;
}

export interface OrganizationFilters {
  industries?: string[];
  sizes?: string[];
  owners?: string[];
  dateRange?: DateRange;
}

export interface InteractionFilters {
  types?: string[];
  users?: string[];
  dateRange?: DateRange;
}

export interface TaskFilters {
  statuses?: string[];
  priorities?: string[];
  assignees?: string[];
  dateRange?: DateRange;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SearchState {
  query: string;
  results: SearchResults;
  isSearching: boolean;
}

export interface SearchResults {
  contacts: Contact[];
  organizations: Organization[];
  interactions: Interaction[];
  tasks: Task[];
}

export interface LoadingState {
  contacts: boolean;
  organizations: boolean;
  interactions: boolean;
  tasks: boolean;
  notifications: boolean;
}

export interface CRMMetrics {
  totalContacts: number;
  newContactsThisMonth: number;
  totalOrganizations: number;
  openTasks: number;
  completedTasksThisWeek: number;
  upcomingFollowUps: number;
  revenueThisQuarter: number;
  conversionRate: number;
  averageResponseTime: number;
  teamProductivity: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateContactData {
  firstName: string;
  lastName: string;
  title?: string;
  company?: string;
  methods: Omit<ContactMethod, 'id'>[];
  addresses: Omit<Address, 'id'>[];
  customFields: Omit<CustomField, 'id'>[];
  source: string;
  organizationIds: string[];
  tags: string[];
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: number;
  revenue?: number;
  parentId?: string;
}

export interface CreateInteractionData {
  contactId?: string;
  organizationId?: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'custom';
  title: string;
  description: string;
  date: string;
  followUpDate?: string;
  mentions: string[];
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assigneeId: string;
  contactId?: string;
  organizationId?: string;
  interactionId?: string;
} 