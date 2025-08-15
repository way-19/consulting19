import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import { 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CreditCard, 
  Clock,
  CheckCircle,
  Eye,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UpcomingInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  due_date: string;
  status: 'sent' | 'overdue';
  period_start?: string;
  period_end?: string;
  created_at: string;
}

interface UpcomingPaymentsProps {
  clientId?: string;
}

const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ clientId }) => {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [upcomingInvoices, setUpcomingInvoices] = useState<UpcomingInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id || clientId) {
      fetchUpcomingPayments();
    }
  }, [profile, clientId]);

  const fetchUpcomingPayments = async () => {
    try {
      let accountingClientId = clientId;

      if (!accountingClientId) {
        // Get client record first
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('profile_id', profile?.id)
          .single();

        if (!clientData) return;

        // Get accounting client record
        const { data: accountingClientData } = await supabase
          .from('accounting_clients')
          .select('id')
          .eq('client_id', clientData.id)
          .single();

        if (!accountingClientData) return;
        accountingClientId = accountingClientData.id;
      }

      // Get upcoming invoices (due within next 30 days or overdue)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data, error } = await supabase
        .from('accounting_invoices')
        .select('id, invoice_number, amount, currency, due_date, status, created_at')
        .eq('client_id', accountingClientId)
        .in('status', ['sent', 'overdue'])
        .lte('due_date', thirtyDaysFromNow.toISOString())
        .order('due_date', { ascending: true });

      if (error) throw error;
      setUpcomingInvoices(data || []);
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'border-l-red-500 bg-red-50';
    if (daysUntilDue <= 3) return 'border-l-orange-500 bg-orange-50';
    if (daysUntilDue <= 7) return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const getUrgencyText = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} ${t('payments.daysOverdue')}`;
    if (daysUntilDue === 0) return t('payments.dueToday');
    if (daysUntilDue === 1) return t('payments.dueTomorrow');
    return `${daysUntilDue} ${t('payments.daysRemaining')}`;
  };

  const getUrgencyIcon = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (daysUntilDue <= 3) return <Bell className="h-5 w-5 text-orange-600" />;
    return <Clock className="h-5 w-5 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (upcomingInvoices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">{t('payments.upcomingPayments')}</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {t('payments.monitorSchedule')}
          </p>
        </div>
        <div className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('payments.allUpToDate')}</h3>
          <p className="text-gray-600">{t('payments.noUpcomingDeadlines')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t('payments.urgentUpcoming')}</h2>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              {upcomingInvoices.length} {upcomingInvoices.length > 1 ? t('payments.paymentsDuePlural') : t('payments.paymentsDue')} {t('payments.due')}
            </span>
          </div>
          <Link
            to="/client-accounting"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            {t('payments.viewAllPayments')} →
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {t('payments.importantDeadlines')}
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {upcomingInvoices.map((invoice) => {
            const daysUntilDue = getDaysUntilDue(invoice.due_date);
            
            return (
              <div
                key={invoice.id}
                className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                  getUrgencyColor(daysUntilDue)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getUrgencyIcon(daysUntilDue)}
                      <h4 className="font-semibold text-gray-900">{invoice.invoice_number}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {invoice.status === 'overdue' ? 'OVERDUE' : 'PAYMENT DUE'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">{t('payments.amount')}:</span> ${invoice.amount.toLocaleString()} {invoice.currency}
                      </div>
                      <div>
                        <span className="font-medium">{t('payments.dueDate')}:</span> {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">{t('payments.status')}:</span> 
                        <span className={`ml-1 font-medium ${
                          daysUntilDue < 0 ? 'text-red-600' : 
                          daysUntilDue <= 3 ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                          {getUrgencyText(daysUntilDue)}
                        </span>
                      </div>
                    </div>

                    {invoice.period_start && invoice.period_end && (
                      <div className="text-xs text-gray-500 mb-3">
                        {t('payments.period')}: {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      to="/client-accounting"
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>{t('payments.view')}</span>
                    </Link>
                    <Link
                      to="/client-accounting"
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                        daysUntilDue < 0 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>{t('payments.payNow')}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {upcomingInvoices.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">{t('payments.paymentReminder')}</h4>
              </div>
              <p className="text-sm text-yellow-800">
                {t('payments.payOnTime')} {t('payments.contactConsultant')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingPayments;