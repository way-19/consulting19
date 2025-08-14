import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SupportedLanguage = 'en' | 'tr' | 'ka' | 'ru' | 'es' | 'fr' | 'de' | 'ar';

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
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true }
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
    
    // Business
    'business.companyFormation': 'Şirket Kuruluşu',
    'business.bankAccount': 'Banka Hesabı Açma',
    'business.taxResidency': 'Vergi Mukimliği',
    'business.accounting': 'Muhasebe Hizmetleri',
    'business.legal': 'Hukuki Danışmanlık',
    'business.visa': 'Vize ve İkamet',
  },
  
  ka: {
    // Navigation
    'nav.countries': 'ქვეყნები',
    'nav.services': 'სერვისები',
    'nav.about': 'ჩვენს შესახებ',
    'nav.contact': 'კონტაქტი',
    'nav.blog': 'ბლოგი',
    'nav.getStarted': 'დაიწყეთ',
    'nav.signIn': 'შესვლა',
    'nav.signOut': 'გასვლა',
    
    // Dashboard
    'dashboard.welcome': 'კეთილი იყოს თქვენი დაბრუნება',
    'dashboard.overview': 'მიმოხილვა',
    'dashboard.projects': 'პროექტები',
    'dashboard.documents': 'დოკუმენტები',
    'dashboard.messages': 'შეტყობინებები',
    'dashboard.settings': 'პარამეტრები',
    
    // Common
    'common.loading': 'იტვირთება...',
    'common.save': 'შენახვა',
    'common.cancel': 'გაუქმება',
    'common.delete': 'წაშლა',
    'common.edit': 'რედაქტირება',
    'common.view': 'ნახვა',
    'common.search': 'ძიება',
    'common.filter': 'ფილტრი',
    'common.refresh': 'განახლება',
    'common.download': 'ჩამოტვირთვა',
    'common.upload': 'ატვირთვა',
    'common.send': 'გაგზავნა',
    'common.back': 'უკან',
    'common.next': 'შემდეგი',
    'common.previous': 'წინა',
    'common.close': 'დახურვა',
    'common.confirm': 'დადასტურება',
    'common.yes': 'კი',
    'common.no': 'არა',
    
    // Status
    'status.active': 'აქტიური',
    'status.inactive': 'არააქტიური',
    'status.pending': 'მოლოდინში',
    'status.completed': 'დასრულებული',
    'status.approved': 'დამტკიცებული',
    'status.rejected': 'უარყოფილი',
    'status.inProgress': 'მიმდინარე',
    'status.onHold': 'შეჩერებული',
    'status.cancelled': 'გაუქმებული',
    
    // Priority
    'priority.low': 'დაბალი',
    'priority.medium': 'საშუალო',
    'priority.high': 'მაღალი',
    'priority.urgent': 'გადაუდებელი',
    
    // Business
    'business.companyFormation': 'კომპანიის რეგისტრაცია',
    'business.bankAccount': 'ბანკის ანგარიშის გახსნა',
    'business.taxResidency': 'საგადასახადო რეზიდენტობა',
    'business.accounting': 'საბუღალტრო სერვისები',
    'business.legal': 'იურიდიული კონსულტაცია',
    'business.visa': 'ვიზა და რეზიდენტობა',
  },
  
  ru: {
    // Navigation
    'nav.countries': 'Страны',
    'nav.services': 'Услуги',
    'nav.about': 'О нас',
    'nav.contact': 'Контакты',
    'nav.blog': 'Блог',
    'nav.getStarted': 'Начать',
    'nav.signIn': 'Войти',
    'nav.signOut': 'Выйти',
    
    // Dashboard
    'dashboard.welcome': 'Добро пожаловать',
    'dashboard.overview': 'Обзор',
    'dashboard.projects': 'Проекты',
    'dashboard.documents': 'Документы',
    'dashboard.messages': 'Сообщения',
    'dashboard.settings': 'Настройки',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.view': 'Просмотр',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.refresh': 'Обновить',
    'common.download': 'Скачать',
    'common.upload': 'Загрузить',
    'common.send': 'Отправить',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.previous': 'Предыдущий',
    'common.close': 'Закрыть',
    'common.confirm': 'Подтвердить',
    'common.yes': 'Да',
    'common.no': 'Нет',
    
    // Business
    'business.companyFormation': 'Регистрация компании',
    'business.bankAccount': 'Открытие банковского счета',
    'business.taxResidency': 'Налоговое резидентство',
    'business.accounting': 'Бухгалтерские услуги',
    'business.legal': 'Юридическое консультирование',
    'business.visa': 'Виза и резидентство',
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
  
  ar: {
    // Navigation
    'nav.countries': 'البلدان',
    'nav.services': 'الخدمات',
    'nav.about': 'معلومات عنا',
    'nav.contact': 'اتصل بنا',
    'nav.blog': 'المدونة',
    'nav.getStarted': 'ابدأ',
    'nav.signIn': 'تسجيل الدخول',
    'nav.signOut': 'تسجيل الخروج',
    
    // Business
    'business.companyFormation': 'تأسيس الشركة',
    'business.bankAccount': 'فتح حساب مصرفي',
    'business.taxResidency': 'الإقامة الضريبية',
    'business.accounting': 'خدمات المحاسبة',
    'business.legal': 'الاستشارة القانونية',
    'business.visa': 'التأشيرة والإقامة',
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