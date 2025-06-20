// WebSocket event types
export interface WebSocketEvents {
  // Connection events
  connect: () => void;
  disconnect: () => void;
  
  // Notification events
  notification: (data: RealTimeNotification) => void;
  document_approved: (data: DocumentStatusUpdate) => void;
  document_rejected: (data: DocumentStatusUpdate) => void;
  onboarding_status_update: (data: OnboardingStatusUpdate) => void;
  
  // Chat events
  new_message: (data: ChatMessage) => void;
  user_typing: (data: TypingIndicator) => void;
  user_stopped_typing: (data: TypingIndicator) => void;
  
  // CRM events
  contact_created: (data: ContactUpdate) => void;
  contact_updated: (data: ContactUpdate) => void;
  task_assigned: (data: TaskUpdate) => void;
  interaction_logged: (data: InteractionUpdate) => void;
}

// Data types for real-time events
export interface RealTimeNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId: string;
  timestamp: string;
  actionUrl?: string;
  autoHide?: boolean;
  duration?: number;
  isRead?: boolean;
}

export interface DocumentStatusUpdate {
  documentId: string;
  partnerId: string;
  status: 'approved' | 'rejected';
  reviewedBy: string;
  reason?: string;
  timestamp: string;
}

export interface OnboardingStatusUpdate {
  partnerId: string;
  currentStage: string;
  previousStage: string;
  progress: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ContactUpdate {
  contactId: string;
  action: 'created' | 'updated' | 'deleted';
  data: any;
  updatedBy: string;
  timestamp: string;
}

export interface TaskUpdate {
  taskId: string;
  assignedTo: string;
  assignedBy: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  timestamp: string;
}

export interface InteractionUpdate {
  interactionId: string;
  contactId: string;
  type: string;
  title: string;
  loggedBy: string;
  timestamp: string;
}

// WebSocket Service Class
class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventListeners: Map<string, Function[]> = new Map();
  private userId: string = '';
  private userRole: string = '';

  // Initialize connection
  connect(userId: string, userRole: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        this.userRole = userRole;
        
        // For demo purposes, we'll simulate a WebSocket connection
        // In production, this would connect to your actual WebSocket server
        console.log('🔌 Initializing WebSocket connection...');
        
        // Simulate connection delay
        setTimeout(() => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          console.log('✅ WebSocket connected successfully');
          console.log(`👤 User: ${userId} (${userRole})`);
          
          // Simulate initial connection notification
          this.emitEvent('notification', {
            id: `notification_${Date.now()}`,
            type: 'success',
            title: 'Connected',
            message: 'Real-time notifications are now active',
            userId: userId,
            timestamp: new Date().toISOString(),
            autoHide: true,
            duration: 3000
          });
          
          resolve();
        }, 1000);
        
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        reject(error);
      }
    });
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
    this.isConnected = false;
    this.eventListeners.clear();
    console.log('🔌 WebSocket disconnected');
  }

  // Check connection status
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Event listener management
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Emit events to listeners
  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send message to chat room
  sendChatMessage(roomId: string, message: string, senderId: string, senderName: string): void {
    if (!this.isConnected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      roomId,
      senderId,
      senderName,
      senderRole: this.userRole,
      message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    // Simulate sending message and receiving it back
    setTimeout(() => {
      this.emitEvent('new_message', chatMessage);
    }, 100);

    console.log('💬 Message sent:', chatMessage);
  }

  // Send typing indicator
  sendTypingIndicator(roomId: string, userId: string, userName: string, isTyping: boolean): void {
    if (!this.isConnected) return;

    const typingData: TypingIndicator = {
      roomId,
      userId,
      userName,
      isTyping
    };

    // Simulate typing indicator
    setTimeout(() => {
      this.emitEvent(isTyping ? 'user_typing' : 'user_stopped_typing', typingData);
    }, 50);
  }

  // Simulate document approval notification
  simulateDocumentApproval(documentId: string, partnerId: string, reviewedBy: string): void {
    const notification: DocumentStatusUpdate = {
      documentId,
      partnerId,
      status: 'approved',
      reviewedBy,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      this.emitEvent('document_approved', notification);
      this.emitEvent('notification', {
        id: `notification_${Date.now()}`,
        type: 'success',
        title: 'Document Approved',
        message: `Document ${documentId} has been approved by ${reviewedBy}`,
        userId: partnerId,
        timestamp: new Date().toISOString(),
        autoHide: true,
        duration: 5000
      });
    }, 500);
  }

  // Simulate document rejection notification
  simulateDocumentRejection(documentId: string, partnerId: string, reviewedBy: string, reason: string): void {
    const notification: DocumentStatusUpdate = {
      documentId,
      partnerId,
      status: 'rejected',
      reviewedBy,
      reason,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      this.emitEvent('document_rejected', notification);
      this.emitEvent('notification', {
        id: `notification_${Date.now()}`,
        type: 'error',
        title: 'Document Rejected',
        message: `Document ${documentId} was rejected: ${reason}`,
        userId: partnerId,
        timestamp: new Date().toISOString(),
        autoHide: false
      });
    }, 500);
  }

  // Simulate onboarding status update
  simulateOnboardingStatusUpdate(partnerId: string, currentStage: string, previousStage: string, progress: number): void {
    const update: OnboardingStatusUpdate = {
      partnerId,
      currentStage,
      previousStage,
      progress,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      this.emitEvent('onboarding_status_update', update);
      this.emitEvent('notification', {
        id: `notification_${Date.now()}`,
        type: 'info',
        title: 'Onboarding Progress',
        message: `Moved to ${currentStage} stage (${progress}% complete)`,
        userId: partnerId,
        timestamp: new Date().toISOString(),
        autoHide: true,
        duration: 4000
      });
    }, 500);
  }

  // Simulate CRM notifications
  simulateContactCreated(contactId: string, contactName: string, createdBy: string): void {
    const update: ContactUpdate = {
      contactId,
      action: 'created',
      data: { name: contactName },
      updatedBy: createdBy,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      this.emitEvent('contact_created', update);
      this.emitEvent('notification', {
        id: `notification_${Date.now()}`,
        type: 'success',
        title: 'New Contact',
        message: `${contactName} has been added to CRM`,
        userId: createdBy,
        timestamp: new Date().toISOString(),
        actionUrl: '/crm/contacts',
        autoHide: true,
        duration: 4000
      });
    }, 300);
  }

  // Simulate task assignment
  simulateTaskAssignment(taskId: string, title: string, assignedTo: string, assignedBy: string): void {
    const update: TaskUpdate = {
      taskId,
      assignedTo,
      assignedBy,
      title,
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      this.emitEvent('task_assigned', update);
      this.emitEvent('notification', {
        id: `notification_${Date.now()}`,
        type: 'info',
        title: 'New Task Assigned',
        message: `You have been assigned: ${title}`,
        userId: assignedTo,
        timestamp: new Date().toISOString(),
        actionUrl: '/crm/tasks',
        autoHide: false
      });
    }, 300);
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// Export service for use in components
export default websocketService; 