import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./components/AdminLayout"
import CaptivePortal from "./pages/CaptivePortal"
import AdminLogin from "./pages/AdminLogin"
import Dashboard from "./pages/admin/Dashboard"
import Plans from "./pages/admin/Plans"
import Payments from "./pages/admin/Payments"
import Users from "./pages/admin/Users"
import Subscriptions from "./pages/admin/Subscriptions"
import Vouchers from "./pages/admin/Vouchers"
import SmsLogs from "./pages/admin/SmsLogs"
import AuditLogs from "./pages/admin/AuditLogs"
import Settings from "./pages/admin/Settings"
import Routers from "./pages/admin/Routers"

function AdminApp({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/" element={<CaptivePortal />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminApp><Dashboard /></AdminApp>} />
          <Route path="/admin/plans" element={<AdminApp><Plans /></AdminApp>} />
          <Route path="/admin/payments" element={<AdminApp><Payments /></AdminApp>} />
          <Route path="/admin/users" element={<AdminApp><Users /></AdminApp>} />
          <Route path="/admin/subscriptions" element={<AdminApp><Subscriptions /></AdminApp>} />
          <Route path="/admin/vouchers" element={<AdminApp><Vouchers /></AdminApp>} />
          <Route path="/admin/routers" element={<AdminApp><Routers /></AdminApp>} />
          <Route path="/admin/sms-logs" element={<AdminApp><SmsLogs /></AdminApp>} />
          <Route path="/admin/audit-logs" element={<AdminApp><AuditLogs /></AdminApp>} />
          <Route path="/admin/settings" element={<AdminApp><Settings /></AdminApp>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
