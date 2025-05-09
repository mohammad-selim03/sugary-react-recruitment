import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./auth/AuthProvider";
import PrivateRoute from "./routes/PrivateRoute";
import { Toaster } from "react-hot-toast";
import MaterialDetailsPage from "./pages/MaterialDetails";
import DashboardPage from "./pages/DashboardPages";
import CartPage from "./pages/CartPage";
import Layout from "./layout/Layout";
import Favourite from "./pages/Favourite";
import Materials from "./pages/Materials";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route
              path="/materials"
              element={
                <PrivateRoute>
                  <Materials />
                </PrivateRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <CartPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/favourite"
              element={
                <PrivateRoute>
                  <Favourite />
                </PrivateRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/material/:id"
              element={
                <PrivateRoute>
                  <MaterialDetailsPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </AuthProvider>
      <Toaster />
    </Router>
  );
}

export default App;
