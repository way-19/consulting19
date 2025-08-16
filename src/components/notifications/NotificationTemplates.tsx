import React from 'react';
import { 
  Bell, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  MessageSquare,
  User,
  Building,
  Globe,
  Mail,
  Clock,
  Star,
  Shield,
  Zap,
  Settings
} from 'lucide-react';

export interface NotificationTemplate {
  type: string;
  icon: React.ComponentType<any>;
  color: string;
  title: (data: any) => string;
  message: (data: any) => string;
  actionText?: (data: any) => string;
  actionUrl?: (data: any) => string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  emailTemplate?: (data: any) => {
    subject: string;
    html: string;
    text: string;
  };
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Document Related
  document_uploaded: {
    type: 'document_uploaded',
    icon: FileText,
    color: 'text-blue-600',
    title: (data) => 'New Document Uploaded',
    message: (data) => `${data.document_name} has been uploaded by ${data.client_name}`,
    actionText: () => 'Review Document',
    actionUrl: () => '/consultant/documents',
    priority: 'normal',
    emailTemplate: (data) => ({
      subject: `New Document: ${data.document_name}`,
      html: `
        <h2>New Document Uploaded</h2>
        <p>A new document has been uploaded by your client:</p>
        <ul>
          <li><strong>Document:</strong> ${data.document_name}</li>
          <li><strong>Client:</strong> ${data.client_name}</li>
          <li><strong>Type:</strong> ${data.document_type}</li>
        </ul>
        <p>Please review the document in your consultant dashboard.</p>
      `,
      text: `New document uploaded: ${data.document_name} by ${data.client_name}`
    })
  },

  document_approved: {
    type: 'document_approved',
    icon: CheckCircle,
    color: 'text-green-600',
    title: (data) => 'Document Approved',
    message: (data) => `Your document "${data.document_name}" has been approved`,
    actionText: () => 'View Documents',
    actionUrl: () => '/client/documents',
    priority: 'normal',
    emailTemplate: (data) => ({
      subject: `Document Approved: ${data.document_name}`,
      html: `
        <h2>Document Approved ✅</h2>
        <p>Great news! Your document has been approved:</p>
        <ul>
          <li><strong>Document:</strong> ${data.document_name}</li>
          <li><strong>Reviewed by:</strong> ${data.consultant_name}</li>
          <li><strong>Status:</strong> Approved</li>
        </ul>
        <p>You can now proceed with the next steps in your business process.</p>
      `,
      text: `Your document "${data.document_name}" has been approved by ${data.consultant_name}`
    })
  },

  document_rejected: {
    type: 'document_rejected',
    icon: AlertTriangle,
    color: 'text-red-600',
    title: (data) => 'Document Requires Attention',
    message: (data) => `Your document "${data.document_name}" needs revision`,
    actionText: () => 'View Details',
    actionUrl: () => '/client/documents',
    priority: 'high',
    emailTemplate: (data) => ({
      subject: `Document Revision Required: ${data.document_name}`,
      html: `
        <h2>Document Revision Required ⚠️</h2>
        <p>Your document needs some adjustments:</p>
        <ul>
          <li><strong>Document:</strong> ${data.document_name}</li>
          <li><strong>Reviewed by:</strong> ${data.consultant_name}</li>
          <li><strong>Notes:</strong> ${data.notes || 'Please contact your consultant for details'}</li>
        </ul>
        <p>Please upload a revised version or contact your consultant for guidance.</p>
      `,
      text: `Your document "${data.document_name}" requires revision. Notes: ${data.notes || 'Contact consultant for details'}`
    })
  },

  // Task Related
  task_assigned: {
    type: 'task_assigned',
    icon: CheckCircle,
    color: 'text-purple-600',
    title: (data) => 'New Task Assigned',
    message: (data) => `Task "${data.task_title}" has been assigned to you`,
    actionText: () => 'View Task',
    actionUrl: (data) => data.user_role === 'consultant' ? '/consultant/tasks' : '/client/projects',
    priority: 'normal',
    emailTemplate: (data) => ({
      subject: `New Task: ${data.task_title}`,
      html: `
        <h2>New Task Assigned</h2>
        <p>A new task has been assigned to you:</p>
        <ul>
          <li><strong>Task:</strong> ${data.task_title}</li>
          <li><strong>Description:</strong> ${data.task_description || 'No description provided'}</li>
          <li><strong>Due Date:</strong> ${data.due_date ? new Date(data.due_date).toLocaleDateString() : 'No deadline'}</li>
          <li><strong>Priority:</strong> ${data.priority}</li>
        </ul>
        <p>Please check your dashboard for more details.</p>
      `,
      text: `New task assigned: ${data.task_title}. Due: ${data.due_date || 'No deadline'}`
    })
  },

  task_completed: {
    type: 'task_completed',
    icon: CheckCircle,
    color: 'text-green-600',
    title: (data) => 'Task Completed',
    message: (data) => `Task "${data.task_title}" has been completed`,
    actionText: () => 'View Progress',
    actionUrl: () => '/client/projects',
    priority: 'normal'
  },

  // Payment Related
  payment_received: {
    type: 'payment_received',
    icon: DollarSign,
    color: 'text-green-600',
    title: (data) => 'Payment Received',
    message: (data) => `Payment of ${data.amount} ${data.currency} received from ${data.client_name}`,
    actionText: () => 'View Payments',
    actionUrl: () => '/consultant/payments',
    priority: 'normal',
    emailTemplate: (data) => ({
      subject: `Payment Received: ${data.amount} ${data.currency}`,
      html: `
        <h2>Payment Received 💰</h2>
        <p>You have received a payment:</p>
        <ul>
          <li><strong>Amount:</strong> ${data.amount} ${data.currency}</li>
          <li><strong>Client:</strong> ${data.client_name}</li>
          <li><strong>Service:</strong> ${data.service_name}</li>
          <li><strong>Commission:</strong> ${data.commission_amount} ${data.currency}</li>
        </ul>
        <p>The payment has been processed and will be reflected in your next payout.</p>
      `,
      text: `Payment received: ${data.amount} ${data.currency} from ${data.client_name}`
    })
  },

  payment_confirmed: {
    type: 'payment_confirmed',
    icon: CheckCircle,
    color: 'text-green-600',
    title: (data) => 'Payment Confirmed',
    message: (data) => `Your payment for ${data.service_name} has been confirmed`,
    actionText: () => 'View Receipt',
    actionUrl: () => '/client-accounting',
    priority: 'normal'
  },

  // Message Related
  new_message: {
    type: 'new_message',
    icon: MessageSquare,
    color: 'text-blue-600',
    title: (data) => 'New Message',
    message: (data) => `${data.sender_name}: ${data.message_preview}`,
    actionText: () => 'Reply',
    actionUrl: (data) => data.chat_type === 'consultant-client' ? '/client-accounting' : '/consultant-dashboard',
    priority: 'normal'
  },

  // System Related
  system_maintenance: {
    type: 'system_maintenance',
    icon: Settings,
    color: 'text-orange-600',
    title: (data) => 'Scheduled Maintenance',
    message: (data) => `System maintenance scheduled for ${data.maintenance_date}`,
    priority: 'high'
  },

  security_alert: {
    type: 'security_alert',
    icon: Shield,
    color: 'text-red-600',
    title: (data) => 'Security Alert',
    message: (data) => data.alert_message,
    priority: 'urgent'
  },

  // Client Onboarding
  welcome_client: {
    type: 'welcome_client',
    icon: User,
    color: 'text-purple-600',
    title: (data) => 'Welcome to Consulting19!',
    message: (data) => `Welcome ${data.client_name}! Your consultant ${data.consultant_name} will contact you soon.`,
    actionText: () => 'Get Started',
    actionUrl: () => '/client-accounting',
    priority: 'normal',
    emailTemplate: (data) => ({
      subject: 'Welcome to Consulting19 - Your Business Journey Begins!',
      html: `
        <h1>Welcome to Consulting19! 🎉</h1>
        <p>Dear ${data.client_name},</p>
        <p>Welcome to the world's first AI-enhanced business consulting platform!</p>
        
        <h3>Your Assigned Consultant</h3>
        <p><strong>${data.consultant_name}</strong> has been assigned as your dedicated consultant.</p>
        <p>Email: ${data.consultant_email}</p>
        <p>Specialization: ${data.consultant_country}</p>
        
        <h3>What's Next?</h3>
        <ul>
          <li>Your consultant will contact you within 24 hours</li>
          <li>Complete your business profile in the dashboard</li>
          <li>Upload any required documents</li>
          <li>Start your business formation journey</li>
        </ul>
        
        <p>If you have any questions, don't hesitate to reach out through our platform.</p>
        <p>Best regards,<br>The Consulting19 Team</p>
      `,
      text: `Welcome to Consulting19! Your consultant ${data.consultant_name} will contact you soon.`
    })
  },

  // Consultant Assignment
  consultant_assigned: {
    type: 'consultant_assigned',
    icon: Users,
    color: 'text-blue-600',
    title: (data) => 'New Client Assigned',
    message: (data) => `New client ${data.client_name} has been assigned to you`,
    actionText: () => 'View Client',
    actionUrl: () => '/customers-management',
    priority: 'normal'
  },

  // Deadline Reminders
  deadline_reminder: {
    type: 'deadline_reminder',
    icon: Clock,
    color: 'text-orange-600',
    title: (data) => 'Deadline Reminder',
    message: (data) => `${data.item_name} is due in ${data.days_remaining} days`,
    actionText: () => 'View Details',
    actionUrl: (data) => data.action_url,
    priority: 'high'
  },

  // Service Request
  service_request: {
    type: 'service_request',
    icon: Building,
    color: 'text-indigo-600',
    title: (data) => 'New Service Request',
    message: (data) => `${data.client_name} has requested: ${data.service_title}`,
    actionText: () => 'Review Request',
    actionUrl: () => '/consultant-dashboard',
    priority: 'normal'
  },

  // Virtual Mailbox
  mailbox_document_ready: {
    type: 'mailbox_document_ready',
    icon: Mail,
    color: 'text-purple-600',
    title: (data) => 'Document Ready for Delivery',
    message: (data) => `${data.document_name} is ready in your virtual mailbox`,
    actionText: () => 'View Mailbox',
    actionUrl: () => '/client/documents',
    priority: 'normal'
  },

  // AI Assistant
  ai_recommendation: {
    type: 'ai_recommendation',
    icon: Zap,
    color: 'text-yellow-600',
    title: (data) => 'AI Recommendation',
    message: (data) => data.recommendation_text,
    actionText: () => 'View Recommendation',
    actionUrl: (data) => data.action_url,
    priority: 'low'
  }
};

// Multi-language support for notifications
export const NOTIFICATION_TRANSLATIONS = {
  en: {
    'document_uploaded': 'New Document Uploaded',
    'document_approved': 'Document Approved',
    'document_rejected': 'Document Requires Attention',
    'task_assigned': 'New Task Assigned',
    'payment_received': 'Payment Received',
    'new_message': 'New Message',
    'deadline_reminder': 'Deadline Reminder'
  },
  tr: {
    'document_uploaded': 'Yeni Belge Yüklendi',
    'document_approved': 'Belge Onaylandı',
    'document_rejected': 'Belge Dikkat Gerektiriyor',
    'task_assigned': 'Yeni Görev Atandı',
    'payment_received': 'Ödeme Alındı',
    'new_message': 'Yeni Mesaj',
    'deadline_reminder': 'Son Tarih Hatırlatıcısı'
  }
};

export const getNotificationTemplate = (type: string): NotificationTemplate | null => {
  return NOTIFICATION_TEMPLATES[type] || null;
};

export const formatNotificationContent = (
  type: string, 
  data: any, 
  language: string = 'en'
): {
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  icon: React.ComponentType<any>;
  color: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
} | null => {
  const template = getNotificationTemplate(type);
  if (!template) return null;

  return {
    title: template.title(data),
    message: template.message(data),
    actionText: template.actionText?.(data),
    actionUrl: template.actionUrl?.(data),
    icon: template.icon,
    color: template.color,
    priority: template.priority
  };
};

export const generateEmailContent = (type: string, data: any, language: string = 'en') => {
  const template = getNotificationTemplate(type);
  if (!template?.emailTemplate) return null;

  return template.emailTemplate(data);
};

// Notification priority scoring for sorting
export const getNotificationPriorityScore = (priority: string): number => {
  switch (priority) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'normal': return 2;
    case 'low': return 1;
    default: return 2;
  }
};

// Smart notification grouping
export const groupNotificationsByType = (notifications: any[]) => {
  return notifications.reduce((groups, notification) => {
    const type = notification.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(notification);
    return groups;
  }, {} as Record<string, any[]>);
};

// Notification frequency management
export const shouldSendNotification = (
  userId: string,
  type: string,
  userPreferences: any
): boolean => {
  // Check if user has disabled this notification type
  if (userPreferences?.disabled_types?.includes(type)) {
    return false;
  }

  // Check quiet hours
  if (userPreferences?.quiet_hours?.enabled) {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = userPreferences.quiet_hours.start || 22;
    const endHour = userPreferences.quiet_hours.end || 8;
    
    if (startHour > endHour) {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      if (currentHour >= startHour || currentHour < endHour) {
        return false;
      }
    } else {
      // Same day quiet hours (e.g., 12:00 to 14:00)
      if (currentHour >= startHour && currentHour < endHour) {
        return false;
      }
    }
  }

  // Check frequency limits
  const template = getNotificationTemplate(type);
  if (template?.priority === 'low' && userPreferences?.frequency === 'minimal') {
    return false;
  }

  return true;
};

export { formatNotificationContent }