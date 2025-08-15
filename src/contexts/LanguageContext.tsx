import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SupportedLanguage = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'pt';

interface Language {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  languages: Language[];
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
];

// Translation keys and values
const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation
    'nav.countries': 'Countries',
    'nav.services': 'Services',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',
    'nav.getStarted': 'Get Started',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Overview',
    'dashboard.projects': 'Projects',
    'dashboard.documents': 'Documents',
    'dashboard.messages': 'Messages',
    'dashboard.settings': 'Settings',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.refresh': 'Refresh',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.send': 'Send',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Status
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.inProgress': 'In Progress',
    'status.onHold': 'On Hold',
    'status.cancelled': 'Cancelled',
    
    // Priority
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.urgent': 'Urgent',
    
    // Forms
    'form.email': 'Email Address',
    'form.password': 'Password',
    'form.fullName': 'Full Name',
    'form.phone': 'Phone Number',
    'form.country': 'Country',
    'form.company': 'Company Name',
    'form.description': 'Description',
    'form.title': 'Title',
    'form.message': 'Message',
    'form.subject': 'Subject',
    'form.required': 'Required',
    'form.optional': 'Optional',
    
    // Messages
    'message.success': 'Success',
    'message.error': 'Error',
    'message.warning': 'Warning',
    'message.info': 'Information',
    'message.saveSuccess': 'Saved successfully',
    'message.deleteSuccess': 'Deleted successfully',
    'message.updateSuccess': 'Updated successfully',
    'message.uploadSuccess': 'Uploaded successfully',
    
    // Errors
    'error.general': 'An error occurred',
    'error.network': 'Network error',
    'error.unauthorized': 'Unauthorized access',
    'error.notFound': 'Not found',
    'error.validation': 'Validation error',
    'error.fileSize': 'File size too large',
    'error.fileType': 'Invalid file type',
    
    // Time
    'time.now': 'Now',
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.thisWeek': 'This Week',
    'time.lastWeek': 'Last Week',
    'time.thisMonth': 'This Month',
    'time.lastMonth': 'Last Month',
    'time.ago': 'ago',
    'time.minutes': 'minutes',
    'time.hours': 'hours',
    'time.days': 'days',
    'time.weeks': 'weeks',
    'time.months': 'months',
    
    // Recommendations
    'recommendations.noRecommendations': 'No Recommendations Yet',
    'recommendations.noRecommendationsDesc': 'Personalized recommendations will appear here as your business process progresses.',
    'recommendations.newCount': 'new',
    'recommendations.forYou': 'Recommendations for You',
    'recommendations.tailored': 'Recommendations tailored to your industry and needs',
    'recommendations.viewAll': 'View All Recommendations',
    'recommendations.expires': 'Expires',
    
    // Payments
    'payments.upcomingPayments': 'Upcoming Payments',
    'payments.monitorSchedule': 'Monitor your payment schedule and avoid late fees',
    'payments.allUpToDate': 'All Payments Up to Date',
    'payments.noUpcomingDeadlines': 'You have no upcoming payment deadlines at this time.',
    'payments.urgentUpcoming': 'Urgent: Upcoming Payments',
    'payments.paymentsDue': 'payment',
    'payments.paymentsDuePlural': 'payments',
    'payments.due': 'due',
    'payments.importantDeadlines': 'Important payment deadlines requiring your immediate attention',
    'payments.viewAllPayments': 'View All Payments',
    'payments.amount': 'Amount',
    'payments.dueDate': 'Due Date',
    'payments.status': 'Status',
    'payments.period': 'Period',
    'payments.overdue': 'OVERDUE',
    'payments.paymentDue': 'PAYMENT DUE',
    'payments.view': 'View',
    'payments.payNow': 'Pay Now',
    'payments.paymentReminder': 'Payment Reminder',
    'payments.payOnTime': 'Make payments on time to avoid service interruptions.',
    'payments.contactConsultant': 'Contact your consultant if you have any questions.',
    'payments.daysOverdue': 'days overdue',
    'payments.dueToday': 'Due today',
    'payments.dueTomorrow': 'Due tomorrow',
    'payments.daysRemaining': 'days remaining',
    
    // Business
    'business.companyFormation': 'Company Formation',
    'business.bankAccount': 'Bank Account Opening',
    'business.taxResidency': 'Tax Residency',
    'business.accounting': 'Accounting Services',
    'business.legal': 'Legal Consulting',
    'business.visa': 'Visa & Residence',
  },
  
  tr: {
    // Navigation
    'nav.countries': 'Ülkeler',
    'nav.services': 'Hizmetler',
    'nav.about': 'Hakkımızda',
    'nav.contact': 'İletişim',
    'nav.blog': 'Blog',
    'nav.getStarted': 'Başlayın',
    'nav.signIn': 'Giriş Yap',
    'nav.signOut': 'Çıkış Yap',
    
    // Dashboard
    'dashboard.welcome': 'Tekrar hoş geldiniz',
    'dashboard.overview': 'Genel Bakış',
    'dashboard.projects': 'Projeler',
    'dashboard.documents': 'Belgeler',
    'dashboard.messages': 'Mesajlar',
    'dashboard.settings': 'Ayarlar',
    
    // Common
    'common.loading': 'Yükleniyor...',
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.view': 'Görüntüle',
    'common.search': 'Ara',
    'common.filter': 'Filtrele',
    'common.refresh': 'Yenile',
    'common.download': 'İndir',
    'common.upload': 'Yükle',
    'common.send': 'Gönder',
    'common.back': 'Geri',
    'common.next': 'İleri',
    'common.previous': 'Önceki',
    'common.close': 'Kapat',
    'common.confirm': 'Onayla',
    'common.yes': 'Evet',
    'common.no': 'Hayır',
    
    // Status
    'status.active': 'Aktif',
    'status.inactive': 'Pasif',
    'status.pending': 'Beklemede',
    'status.completed': 'Tamamlandı',
    'status.approved': 'Onaylandı',
    'status.rejected': 'Reddedildi',
    'status.inProgress': 'Devam Ediyor',
    'status.onHold': 'Beklemede',
    'status.cancelled': 'İptal Edildi',
    
    // Priority
    'priority.low': 'Düşük',
    'priority.medium': 'Orta',
    'priority.high': 'Yüksek',
    'priority.urgent': 'Acil',
    
    // Forms
    'form.email': 'E-posta Adresi',
    'form.password': 'Şifre',
    'form.fullName': 'Ad Soyad',
    'form.phone': 'Telefon Numarası',
    'form.country': 'Ülke',
    'form.company': 'Şirket Adı',
    'form.description': 'Açıklama',
    'form.title': 'Başlık',
    'form.message': 'Mesaj',
    'form.subject': 'Konu',
    'form.required': 'Zorunlu',
    'form.optional': 'İsteğe Bağlı',
    
    // Messages
    'message.success': 'Başarılı',
    'message.error': 'Hata',
    'message.warning': 'Uyarı',
    'message.info': 'Bilgi',
    'message.saveSuccess': 'Başarıyla kaydedildi',
    'message.deleteSuccess': 'Başarıyla silindi',
    'message.updateSuccess': 'Başarıyla güncellendi',
    'message.uploadSuccess': 'Başarıyla yüklendi',
    
    // Errors
    'error.general': 'Bir hata oluştu',
    'error.network': 'Ağ hatası',
    'error.unauthorized': 'Yetkisiz erişim',
    'error.notFound': 'Bulunamadı',
    'error.validation': 'Doğrulama hatası',
    'error.fileSize': 'Dosya boyutu çok büyük',
    'error.fileType': 'Geçersiz dosya türü',
    
    // Time
    'time.now': 'Şimdi',
    'time.today': 'Bugün',
    'time.yesterday': 'Dün',
    'time.thisWeek': 'Bu Hafta',
    'time.lastWeek': 'Geçen Hafta',
    'time.thisMonth': 'Bu Ay',
    'time.lastMonth': 'Geçen Ay',
    'time.ago': 'önce',
    'time.minutes': 'dakika',
    'time.hours': 'saat',
    'time.days': 'gün',
    'time.weeks': 'hafta',
    'time.months': 'ay',
    
    // Recommendations
    'recommendations.noRecommendations': 'Henüz Öneri Yok',
    'recommendations.noRecommendationsDesc': 'İş süreciniz ilerledikçe size özel öneriler burada görünecektir.',
    'recommendations.newCount': 'yeni',
    'recommendations.forYou': 'Sizin İçin Öneriler',
    'recommendations.tailored': 'Sektörünüze ve ihtiyaçlarınıza özel öneriler',
    'recommendations.viewAll': 'Tüm Önerileri Görüntüle',
    'recommendations.expires': 'Sona eriyor',
    
    // Payments
    'payments.upcomingPayments': 'Yaklaşan Ödemeler',
    'payments.monitorSchedule': 'Ödeme programınızı takip edin ve gecikme ücretlerinden kaçının',
    'payments.allUpToDate': 'Tüm Ödemeler Güncel',
    'payments.noUpcomingDeadlines': 'Şu anda yaklaşan ödeme son tarihiniz bulunmamaktadır.',
    'payments.urgentUpcoming': 'Acil: Yaklaşan Ödemeler',
    'payments.paymentsDue': 'ödeme',
    'payments.paymentsDuePlural': 'ödeme',
    'payments.due': 'vadesi geldi',
    'payments.importantDeadlines': 'Acil dikkatinizi gerektiren önemli ödeme son tarihleri',
    'payments.viewAllPayments': 'Tüm Ödemeleri Görüntüle',
    'payments.amount': 'Tutar',
    'payments.dueDate': 'Son Tarih',
    'payments.status': 'Durum',
    'payments.period': 'Dönem',
    'payments.overdue': 'VADESİ GEÇTİ',
    'payments.paymentDue': 'ÖDEME VADESİ',
    'payments.view': 'Görüntüle',
    'payments.payNow': 'Şimdi Öde',
    'payments.paymentReminder': 'Ödeme Hatırlatıcısı',
    'payments.payOnTime': 'Hizmet kesintilerini önlemek için ödemelerinizi zamanında yapın.',
    'payments.contactConsultant': 'Sorularınız varsa danışmanınızla iletişime geçin.',
    'payments.daysOverdue': 'gün gecikti',
    'payments.dueToday': 'Bugün vadesi doluyor',
    'payments.dueTomorrow': 'Yarın vadesi doluyor',
    'payments.daysRemaining': 'gün kaldı',
    
    // Business
    'business.companyFormation': 'Şirket Kuruluşu',
    'business.bankAccount': 'Banka Hesabı Açma',
    'business.taxResidency': 'Vergi Mukimliği',
    'business.accounting': 'Muhasebe Hizmetleri',
    'business.legal': 'Hukuki Danışmanlık',
    'business.visa': 'Vize ve İkamet',
  },
  
  es: {
    // Navigation
    'nav.countries': 'Países',
    'nav.services': 'Servicios',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    'nav.blog': 'Blog',
    'nav.getStarted': 'Comenzar',
    'nav.signIn': 'Iniciar Sesión',
    'nav.signOut': 'Cerrar Sesión',
    
    // Business
    'business.companyFormation': 'Formación de Empresa',
    'business.bankAccount': 'Apertura de Cuenta Bancaria',
    'business.taxResidency': 'Residencia Fiscal',
    'business.accounting': 'Servicios de Contabilidad',
    'business.legal': 'Consultoría Legal',
    'business.visa': 'Visa y Residencia',
  },
  
  fr: {
    // Navigation
    'nav.countries': 'Pays',
    'nav.services': 'Services',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',
    'nav.getStarted': 'Commencer',
    'nav.signIn': 'Se connecter',
    'nav.signOut': 'Se déconnecter',
    
    // Business
    'business.companyFormation': 'Formation d\'Entreprise',
    'business.bankAccount': 'Ouverture de Compte Bancaire',
    'business.taxResidency': 'Résidence Fiscale',
    'business.accounting': 'Services Comptables',
    'business.legal': 'Conseil Juridique',
    'business.visa': 'Visa et Résidence',
  },
  
  de: {
    // Navigation
    'nav.countries': 'Länder',
    'nav.services': 'Dienstleistungen',
    'nav.about': 'Über uns',
    'nav.contact': 'Kontakt',
    'nav.blog': 'Blog',
    'nav.getStarted': 'Loslegen',
    'nav.signIn': 'Anmelden',
    'nav.signOut': 'Abmelden',
    
    // Business
    'business.companyFormation': 'Unternehmensgründung',
    'business.bankAccount': 'Bankkonto Eröffnung',
    'business.taxResidency': 'Steuerlicher Wohnsitz',
    'business.accounting': 'Buchhaltungsdienstleistungen',
    'business.legal': 'Rechtsberatung',
    'business.visa': 'Visa und Aufenthalt',
  },
  
  pt: {
    // Navigation
    'nav.countries': 'Países',
    'nav.services': 'Serviços',
    'nav.about': 'Sobre Nós',
    'nav.contact': 'Contato',
    'nav.blog': 'Blog',
    'nav.getStarted': 'Começar',
    'nav.signIn': 'Entrar',
    'nav.signOut': 'Sair',
    
    // Dashboard
    'dashboard.welcome': 'Bem-vindo de volta',
    'dashboard.overview': 'Visão Geral',
    'dashboard.projects': 'Projetos',
    'dashboard.documents': 'Documentos',
    'dashboard.messages': 'Mensagens',
    'dashboard.settings': 'Configurações',
    
    // Common
    'common.loading': 'Carregando...',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.view': 'Visualizar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.refresh': 'Atualizar',
    'common.download': 'Baixar',
    'common.upload': 'Carregar',
    'common.send': 'Enviar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.previous': 'Anterior',
    'common.close': 'Fechar',
    'common.confirm': 'Confirmar',
    'common.yes': 'Sim',
    'common.no': 'Não',
    
    // Status
    'status.active': 'Ativo',
    'status.inactive': 'Inativo',
    'status.pending': 'Pendente',
    'status.completed': 'Concluído',
    'status.approved': 'Aprovado',
    'status.rejected': 'Rejeitado',
    'status.inProgress': 'Em Andamento',
    'status.onHold': 'Em Espera',
    'status.cancelled': 'Cancelado',
    
    // Priority
    'priority.low': 'Baixa',
    'priority.medium': 'Média',
    'priority.high': 'Alta',
    'priority.urgent': 'Urgente',
    
    // Forms
    'form.email': 'Endereço de E-mail',
    'form.password': 'Senha',
    'form.fullName': 'Nome Completo',
    'form.phone': 'Número de Telefone',
    'form.country': 'País',
    'form.company': 'Nome da Empresa',
    'form.description': 'Descrição',
    'form.title': 'Título',
    'form.message': 'Mensagem',
    'form.subject': 'Assunto',
    'form.required': 'Obrigatório',
    'form.optional': 'Opcional',
    
    // Messages
    'message.success': 'Sucesso',
    'message.error': 'Erro',
    'message.warning': 'Aviso',
    'message.info': 'Informação',
    'message.saveSuccess': 'Salvo com sucesso',
    'message.deleteSuccess': 'Excluído com sucesso',
    'message.updateSuccess': 'Atualizado com sucesso',
    'message.uploadSuccess': 'Carregado com sucesso',
    
    // Errors
    'error.general': 'Ocorreu um erro',
    'error.network': 'Erro de rede',
    'error.unauthorized': 'Acesso não autorizado',
    'error.notFound': 'Não encontrado',
    'error.validation': 'Erro de validação',
    'error.fileSize': 'Tamanho do arquivo muito grande',
    'error.fileType': 'Tipo de arquivo inválido',
    
    // Business
    'business.companyFormation': 'Formação de Empresa',
    'business.bankAccount': 'Abertura de Conta Bancária',
    'business.taxResidency': 'Residência Fiscal',
    'business.accounting': 'Serviços de Contabilidade',
    'business.legal': 'Consultoria Jurídica',
    'business.visa': 'Visto e Residência',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('consulting19_language') as SupportedLanguage;
    if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
      if (SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang)) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  useEffect(() => {
    // Update document direction for RTL languages
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
    document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    localStorage.setItem('consulting19_language', language);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[currentLanguage]?.[key] || translations.en[key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  };

  const isRTL = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.rtl || false;

  const value = {
    currentLanguage,
    languages: SUPPORTED_LANGUAGES,
    setLanguage,
    t,
    isRTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation hook for components
export const useTranslation = () => {
  const { t, currentLanguage } = useLanguage();
  return { t, currentLanguage };
};