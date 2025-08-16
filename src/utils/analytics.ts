// Google Analytics 4 utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initializeGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId || measurementId === 'GA_MEASUREMENT_ID') {
    console.warn('Google Analytics Measurement ID not configured');
    return false;
  }

  // Update the script src with actual measurement ID
  const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (existingScript) {
    existingScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
  }

  // Initialize gtag if not already done
  if (typeof window.gtag === 'function') {
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  return true;
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!measurementId || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('config', measurementId, {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href
  });
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, {
    event_category: 'engagement',
    event_label: parameters?.label,
    value: parameters?.value,
    ...parameters
  });
};

// Track business events
export const trackBusinessEvent = {
  // User registration
  userRegistration: (method: string, role: string) => {
    trackEvent('sign_up', {
      method,
      event_category: 'user_lifecycle',
      custom_parameter_role: role
    });
  },

  // Service inquiry
  serviceInquiry: (serviceName: string, country: string) => {
    trackEvent('service_inquiry', {
      event_category: 'business',
      service_name: serviceName,
      country,
      currency: 'USD'
    });
  },

  // Contact form submission
  contactFormSubmission: (formType: string) => {
    trackEvent('form_submit', {
      event_category: 'lead_generation',
      form_type: formType
    });
  },

  // AI Assistant interaction
  aiAssistantInteraction: (query: string, responseTime: number) => {
    trackEvent('ai_interaction', {
      event_category: 'ai_assistant',
      query_length: query.length,
      response_time: responseTime
    });
  },

  // Document upload
  documentUpload: (documentType: string, fileSize: number) => {
    trackEvent('document_upload', {
      event_category: 'document_management',
      document_type: documentType,
      file_size: fileSize
    });
  },

  // Payment events
  paymentInitiated: (amount: number, currency: string, service: string) => {
    trackEvent('begin_checkout', {
      event_category: 'ecommerce',
      currency,
      value: amount,
      items: [{
        item_id: service,
        item_name: service,
        category: 'business_service',
        quantity: 1,
        price: amount
      }]
    });
  },

  paymentCompleted: (amount: number, currency: string, service: string, transactionId: string) => {
    trackEvent('purchase', {
      event_category: 'ecommerce',
      transaction_id: transactionId,
      currency,
      value: amount,
      items: [{
        item_id: service,
        item_name: service,
        category: 'business_service',
        quantity: 1,
        price: amount
      }]
    });
  }
};

// Track user engagement
export const trackUserEngagement = {
  // Time spent on page
  timeOnPage: (pageName: string, timeSpent: number) => {
    trackEvent('page_engagement', {
      event_category: 'engagement',
      page_name: pageName,
      engagement_time_msec: timeSpent
    });
  },

  // Feature usage
  featureUsage: (featureName: string, action: string) => {
    trackEvent('feature_usage', {
      event_category: 'product',
      feature_name: featureName,
      action
    });
  },

  // Search queries
  searchQuery: (query: string, resultsCount: number) => {
    trackEvent('search', {
      event_category: 'site_search',
      search_term: query,
      results_count: resultsCount
    });
  }
};