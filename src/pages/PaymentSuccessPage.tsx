import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight, Mail, Calendar } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchPaymentDetails();
    }
  }, [sessionId]);

  const fetchPaymentDetails = async () => {
    try {
      // In a real implementation, you would fetch payment details from your backend
      // For demo purposes, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentDetails({
        amount: 2500,
        currency: 'USD',
        serviceName: 'Georgia Company Registration',
        consultantName: 'Nino Kvaratskhelia',
        orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        estimatedDelivery: '5-7 business days'
      });
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. You will receive a confirmation email shortly.
          </p>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{paymentDetails.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultant:</span>
                  <span className="font-medium">{paymentDetails.consultantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium font-mono">{paymentDetails.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-bold text-green-600">
                    ${paymentDetails.amount.toLocaleString()} {paymentDetails.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-medium">{paymentDetails.estimatedDelivery}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">What's Next?</h4>
              </div>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Confirmation email sent to your inbox</li>
                <li>• Your consultant will start working on your order</li>
                <li>• You'll receive regular progress updates</li>
                <li>• Documents will be delivered as promised</li>
              </ul>
            </div>

            <Link
              to="/client-dashboard"
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              to="/client/projects"
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View My Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;