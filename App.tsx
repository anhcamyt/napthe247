import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ToastProvider } from './components/UIComponents';

// Pages
import { Home, Login, Register } from './pages/PublicPages';
import { Dashboard, Exchange, Wallet, Shop, PricingPage, UserApiIntegrationPage } from './pages/UserPages';
import { UserProfile } from './pages/UserProfile';
import { SupportDashboard, CreateTicket, TicketDetail } from './pages/SupportPages';
import { 
  AdminDashboard, 
  AdminUsersPage,
  AdminApiConnectionsPage,
  AdminUserApiKeysPage,
  AdminFeeConfigPage,
  AdminSupportInbox,
  AdminSupportSettings,
  AdminBroadcastPage,
  AdminGenericList,
  AdminFaqManagement,
  AdminPaymentConfigPage,
  AdminUserGroupsPage, 
  AdminTransactionsPage,
  AdminProductsPage,
  AdminWithdrawalsPage,
  AdminTicketInbox,
  AdminSecurityPage,
  AdminRouteConfigPage, // NEW IMPORT
  AdminDocumentationPage // NEW IMPORT
} from './pages/AdminPages';
import { TransactionHistoryPage, TransactionDetailPage, GuestLookupPage } from './pages/TransactionPages';

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
  </div>
);

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/lookup" element={<GuestLookupPage />} />
            
            {/* User App Routes */}
            <Route path="/app">
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Transactions */}
              <Route path="transactions" element={<TransactionHistoryPage />} />
              <Route path="transaction/:id" element={<TransactionDetailPage />} />
              <Route path="exchange/history" element={<Navigate to="/app/transactions" replace />} />
              <Route path="orders" element={<Navigate to="/app/transactions" replace />} />
              
              <Route path="exchange" element={<Exchange />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="shop" element={<Shop />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="developer" element={<UserApiIntegrationPage />} />
              <Route path="profile" element={<UserProfile />} />
              
              {/* Redirects for legacy routes */}
              <Route path="deposit" element={<Navigate to="/app/wallet" replace />} />
              <Route path="withdraw" element={<Navigate to="/app/wallet" replace />} />
              
              {/* Support Routes */}
              <Route path="support" element={<SupportDashboard />} />
              <Route path="support/create" element={<CreateTicket />} />
              <Route path="support/tickets" element={<AdminGenericList title="Danh sách khiếu nại" />} /> 
              <Route path="support/ticket/:id" element={<TicketDetail />} />
              <Route path="complaints" element={<Navigate to="/app/support" replace />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin">
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="groups" element={<AdminUserGroupsPage />} />
              <Route path="security" element={<AdminSecurityPage />} />
              <Route path="api-connections" element={<AdminApiConnectionsPage />} />
              <Route path="routes" element={<AdminRouteConfigPage />} /> {/* NEW ROUTE */}
              <Route path="payment-gateways" element={<AdminPaymentConfigPage />} />
              <Route path="user-apis" element={<AdminUserApiKeysPage />} />
              <Route path="transactions" element={<AdminTransactionsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="fees" element={<AdminFeeConfigPage />} />
              <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
              
              {/* New Support Center Routes */}
              <Route path="complaints" element={<Navigate to="/admin/support/inbox" replace />} />
              <Route path="support/inbox" element={<AdminSupportInbox />} />
              <Route path="support/settings" element={<AdminSupportSettings />} />
              <Route path="support/broadcast" element={<AdminBroadcastPage />} />
              <Route path="support/faq" element={<AdminFaqManagement />} />
              
              {/* Documentation Route */}
              <Route path="documentation" element={<AdminDocumentationPage />} />

              <Route path="settings" element={<AdminGenericList title="Cài đặt hệ thống" />} />
              <Route path="*" element={<AdminGenericList title="Đang phát triển" />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </ToastProvider>
  );
};

export default App;