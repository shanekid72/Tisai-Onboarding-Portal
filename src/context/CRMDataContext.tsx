import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import websocketService from '../services/websocketService';
import {
  CRMState,
  Contact,
  Organization,
  Interaction,
  Task,
  Notification,
  CreateContactData,
  CreateOrganizationData,
  CreateInteractionData,
  CreateTaskData,
  CRMMetrics,
  FilterState,
  SearchState
} from '../types/crm';

// Storage keys
const CRM_STORAGE_KEY = 'crm_data_state';

// Context type
interface CRMDataContextType {
  state: CRMState;
  
  // Contact operations
  createContact: (data: CreateContactData) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  getContact: (id: string) => Contact | undefined;
  
  // Organization operations
  createOrganization: (data: CreateOrganizationData) => Promise<Organization>;
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;
  getOrganization: (id: string) => Organization | undefined;
  
  // Interaction operations
  createInteraction: (data: CreateInteractionData) => Promise<Interaction>;
  updateInteraction: (id: string, updates: Partial<Interaction>) => Promise<Interaction>;
  deleteInteraction: (id: string) => Promise<void>;
  getInteraction: (id: string) => Interaction | undefined;
  
  // Task operations
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;
  
  // Notification operations
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadNotificationCount: () => number;
  
  // Search and filter operations
  updateFilters: (entity: keyof FilterState, filters: any) => void;
  updateSearch: (query: string) => void;
  clearSearch: () => void;
  
  // Metrics
  getMetrics: () => CRMMetrics;
  
  // Utility functions
  refreshData: () => Promise<void>;
  exportData: (entity: string, format: 'csv' | 'pdf') => Promise<void>;
}

// Create context
const CRMDataContext = createContext<CRMDataContextType | undefined>(undefined);

// Helper function to generate IDs
const generateId = (prefix: string = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Mock data generators
const generateMockContacts = (): Contact[] => [
  {
    id: generateId('contact'),
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    title: 'CEO',
    company: 'TechCorp Inc.',
    methods: [
      { id: generateId('method'), type: 'email', value: 'john.smith@techcorp.com', isPrimary: true },
      { id: generateId('method'), type: 'phone', value: '+1-555-0123', isPrimary: false },
      { id: generateId('method'), type: 'linkedin', value: 'linkedin.com/in/johnsmith', isPrimary: false }
    ],
    addresses: [
      {
        id: generateId('address'),
        type: 'work',
        street: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
        isPrimary: true
      }
    ],
    customFields: [
      { id: generateId('field'), key: 'Lead Score', value: '85', type: 'number' },
      { id: generateId('field'), key: 'Last Contact', value: '2024-01-15', type: 'date' }
    ],
    source: 'Website',
    acquisitionDate: '2024-01-01',
    ownerId: 'partnership_001',
    organizationIds: [generateId('org')],
    tags: ['hot-lead', 'enterprise'],
    mentions: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: generateId('contact'),
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    title: 'CTO',
    company: 'InnovateLabs',
    methods: [
      { id: generateId('method'), type: 'email', value: 'sarah.johnson@innovatelabs.com', isPrimary: true },
      { id: generateId('method'), type: 'phone', value: '+1-555-0456', isPrimary: false }
    ],
    addresses: [
      {
        id: generateId('address'),
        type: 'work',
        street: '456 Innovation Dr',
        city: 'Austin',
        state: 'TX',
        postalCode: '73301',
        country: 'USA',
        isPrimary: true
      }
    ],
    customFields: [
      { id: generateId('field'), key: 'Lead Score', value: '92', type: 'number' }
    ],
    source: 'Referral',
    acquisitionDate: '2024-01-10',
    ownerId: 'partnership_001',
    organizationIds: [generateId('org')],
    tags: ['warm-lead', 'startup'],
    mentions: [],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

const generateMockOrganizations = (): Organization[] => [
  {
    id: generateId('org'),
    name: 'TechCorp Inc.',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
    description: 'Leading technology solutions provider',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: 500,
    revenue: 50000000,
    contactIds: [],
    ownerId: 'partnership_001',
    sharedWithUserIds: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: generateId('org'),
    name: 'InnovateLabs',
    logoUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150',
    description: 'Innovative startup focused on AI solutions',
    website: 'https://innovatelabs.com',
    industry: 'Artificial Intelligence',
    size: 50,
    revenue: 5000000,
    contactIds: [],
    ownerId: 'partnership_001',
    sharedWithUserIds: [],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

const generateMockTasks = (): Task[] => [
  {
    id: generateId('task'),
    title: 'Follow up with TechCorp CEO',
    description: 'Schedule a demo call to discuss partnership opportunities',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-02-01',
    assigneeId: 'partnership_001',
    mentions: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: generateId('task'),
    title: 'Prepare partnership proposal',
    description: 'Create detailed proposal for InnovateLabs partnership',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2024-01-30',
    assigneeId: 'partnership_001',
    mentions: [],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  }
];

const generateMockInteractions = (): Interaction[] => [
  {
    id: generateId('interaction'),
    contactId: generateId('contact'),
    userId: 'partnership_001',
    type: 'call',
    title: 'Initial partnership discussion',
    description: 'Discussed potential partnership opportunities and next steps',
    date: '2024-01-15T14:00:00Z',
    followUpDate: '2024-02-01T10:00:00Z',
    mentions: [],
    attachments: [],
    taskIds: [],
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  }
];

// Initial state
const initialState: CRMState = {
  contacts: [],
  organizations: [],
  interactions: [],
  tasks: [],
  notifications: [
    {
      id: generateId('notification'),
      type: 'reminder',
      title: 'Follow-up Due',
      message: 'Follow up with TechCorp CEO is due today',
      userId: 'partnership_001',
      isRead: false,
      actionUrl: '/crm/tasks',
      createdAt: new Date().toISOString()
    }
  ],
  filters: {
    contacts: {},
    organizations: {},
    interactions: {},
    tasks: {}
  },
  search: {
    query: '',
    results: {
      contacts: [],
      organizations: [],
      interactions: [],
      tasks: []
    },
    isSearching: false
  },
  loading: {
    contacts: false,
    organizations: false,
    interactions: false,
    tasks: false,
    notifications: false
  }
};

// Provider component
export const CRMDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CRMState>(() => {
    // Try to load from localStorage
    try {
      const savedState = localStorage.getItem(CRM_STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading CRM state:', error);
    }
    
    // Initialize with mock data
    return {
      ...initialState,
      contacts: generateMockContacts(),
      organizations: generateMockOrganizations(),
      tasks: generateMockTasks(),
      interactions: generateMockInteractions()
    };
  });

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving CRM state:', error);
    }
  }, [state]);

  // Contact operations
  const createContact = async (data: CreateContactData): Promise<Contact> => {
    console.log('🔄 CRM createContact called with data:', data);
    
    try {
      const newContact: Contact = {
        id: generateId('contact'),
        ...data,
        displayName: `${data.firstName} ${data.lastName}`,
        methods: data.methods.map(method => ({ ...method, id: generateId('method') })),
        addresses: data.addresses.map(address => ({ ...address, id: generateId('address') })),
        customFields: data.customFields.map(field => ({ ...field, id: generateId('field') })),
        acquisitionDate: new Date().toISOString(),
        ownerId: 'partnership_001', // Current user
        mentions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('📝 Generated new contact object:', newContact);

      setState(prev => {
        const newState = {
          ...prev,
          contacts: [...prev.contacts, newContact]
        };
        console.log('📊 Updated CRM state with new contact. Total contacts:', newState.contacts.length);
        return newState;
      });

      // Send real-time notification for contact creation
      if (websocketService.isSocketConnected()) {
        websocketService.simulateContactCreated(
          newContact.id,
          newContact.displayName,
          newContact.ownerId
        );
      }

      console.log('✅ Contact successfully created and added to state');
      return newContact;
    } catch (error) {
      console.error('❌ Error in createContact function:', error);
      throw error;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact =>
        contact.id === id
          ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
          : contact
      )
    }));

    const updatedContact = state.contacts.find(c => c.id === id);
    if (!updatedContact) throw new Error('Contact not found');
    return { ...updatedContact, ...updates };
  };

  const deleteContact = async (id: string): Promise<void> => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== id)
    }));
  };

  const getContact = (id: string): Contact | undefined => {
    return state.contacts.find(contact => contact.id === id);
  };

  // Organization operations
  const createOrganization = async (data: CreateOrganizationData): Promise<Organization> => {
    const newOrganization: Organization = {
      id: generateId('org'),
      ...data,
      contactIds: [],
      ownerId: 'partnership_001',
      sharedWithUserIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      organizations: [...prev.organizations, newOrganization]
    }));

    return newOrganization;
  };

  const updateOrganization = async (id: string, updates: Partial<Organization>): Promise<Organization> => {
    setState(prev => ({
      ...prev,
      organizations: prev.organizations.map(org =>
        org.id === id
          ? { ...org, ...updates, updatedAt: new Date().toISOString() }
          : org
      )
    }));

    const updatedOrg = state.organizations.find(o => o.id === id);
    if (!updatedOrg) throw new Error('Organization not found');
    return { ...updatedOrg, ...updates };
  };

  const deleteOrganization = async (id: string): Promise<void> => {
    setState(prev => ({
      ...prev,
      organizations: prev.organizations.filter(org => org.id !== id)
    }));
  };

  const getOrganization = (id: string): Organization | undefined => {
    return state.organizations.find(org => org.id === id);
  };

  // Task operations
  const createTask = async (data: CreateTaskData): Promise<Task> => {
    const newTask: Task = {
      id: generateId('task'),
      ...data,
      status: 'todo',
      mentions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));

    // Send real-time notification for task creation
    if (websocketService.isSocketConnected() && data.assigneeId) {
      websocketService.simulateTaskAssignment(
        newTask.id,
        newTask.title,
        data.assigneeId,
        'Partnership Manager' // This would come from current user context
      );
    }

    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    }));

    const updatedTask = state.tasks.find(t => t.id === id);
    if (!updatedTask) throw new Error('Task not found');
    return { ...updatedTask, ...updates };
  };

  const deleteTask = async (id: string): Promise<void> => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id)
    }));
  };

  const getTask = (id: string): Task | undefined => {
    return state.tasks.find(task => task.id === id);
  };

  // Interaction operations
  const createInteraction = async (data: CreateInteractionData): Promise<Interaction> => {
    const newInteraction: Interaction = {
      id: generateId('interaction'),
      ...data,
      userId: 'partnership_001',
      attachments: [],
      taskIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      interactions: [...prev.interactions, newInteraction]
    }));

    return newInteraction;
  };

  const updateInteraction = async (id: string, updates: Partial<Interaction>): Promise<Interaction> => {
    setState(prev => ({
      ...prev,
      interactions: prev.interactions.map(interaction =>
        interaction.id === id
          ? { ...interaction, ...updates, updatedAt: new Date().toISOString() }
          : interaction
      )
    }));

    const updatedInteraction = state.interactions.find(i => i.id === id);
    if (!updatedInteraction) throw new Error('Interaction not found');
    return { ...updatedInteraction, ...updates };
  };

  const deleteInteraction = async (id: string): Promise<void> => {
    setState(prev => ({
      ...prev,
      interactions: prev.interactions.filter(interaction => interaction.id !== id)
    }));
  };

  const getInteraction = (id: string): Interaction | undefined => {
    return state.interactions.find(interaction => interaction.id === id);
  };

  // Notification operations
  const markNotificationRead = (id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => ({
        ...notification,
        isRead: true
      }))
    }));
  };

  const getUnreadNotificationCount = (): number => {
    return state.notifications.filter(n => !n.isRead).length;
  };

  // Search and filter operations
  const updateFilters = (entity: keyof FilterState, filters: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [entity]: filters
      }
    }));
  };

  const updateSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      search: {
        ...prev.search,
        query,
        isSearching: true
      }
    }));

    // Simulate search
    setTimeout(() => {
      const results = {
        contacts: state.contacts.filter(c => 
          c.displayName.toLowerCase().includes(query.toLowerCase()) ||
          c.company?.toLowerCase().includes(query.toLowerCase())
        ),
        organizations: state.organizations.filter(o =>
          o.name.toLowerCase().includes(query.toLowerCase())
        ),
        interactions: state.interactions.filter(i =>
          i.title.toLowerCase().includes(query.toLowerCase())
        ),
        tasks: state.tasks.filter(t =>
          t.title.toLowerCase().includes(query.toLowerCase())
        )
      };

      setState(prev => ({
        ...prev,
        search: {
          ...prev.search,
          results,
          isSearching: false
        }
      }));
    }, 500);
  };

  const clearSearch = () => {
    setState(prev => ({
      ...prev,
      search: {
        query: '',
        results: { contacts: [], organizations: [], interactions: [], tasks: [] },
        isSearching: false
      }
    }));
  };

  // Metrics
  const getMetrics = (): CRMMetrics => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalContacts: state.contacts.length,
      newContactsThisMonth: state.contacts.filter(c => new Date(c.createdAt) >= thisMonth).length,
      totalOrganizations: state.organizations.length,
      openTasks: state.tasks.filter(t => t.status !== 'completed').length,
      completedTasksThisWeek: state.tasks.filter(t => 
        t.status === 'completed' && new Date(t.updatedAt) >= thisWeek
      ).length,
      upcomingFollowUps: state.interactions.filter(i => 
        i.followUpDate && new Date(i.followUpDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      ).length,
      revenueThisQuarter: state.organizations.reduce((sum, org) => sum + (org.revenue || 0), 0),
      conversionRate: 15.2, // Mock data
      averageResponseTime: 2.5, // Mock data in hours
      teamProductivity: 87.5 // Mock data as percentage
    };
  };

  // Utility functions
  const refreshData = async (): Promise<void> => {
    // In a real app, this would fetch fresh data from the API
    console.log('Refreshing CRM data...');
  };

  const exportData = async (entity: string, format: 'csv' | 'pdf'): Promise<void> => {
    // In a real app, this would generate and download the export
    console.log(`Exporting ${entity} as ${format}...`);
  };

  const value = {
    state,
    createContact,
    updateContact,
    deleteContact,
    getContact,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganization,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    getInteraction,
    createTask,
    updateTask,
    deleteTask,
    getTask,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
    updateFilters,
    updateSearch,
    clearSearch,
    getMetrics,
    refreshData,
    exportData
  };

  return (
    <CRMDataContext.Provider value={value}>
      {children}
    </CRMDataContext.Provider>
  );
};

// Custom hook
export function useCRMData(): CRMDataContextType {
  const context = useContext(CRMDataContext);
  if (context === undefined) {
    throw new Error('useCRMData must be used within a CRMDataProvider');
  }
  return context;
} 