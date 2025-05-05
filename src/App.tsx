import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./auth/AuthProvider";
import PrivateRoute from "./routes/PrivateRoute";
import { Toaster } from "react-hot-toast";
import MaterialDetailsPage from "./pages/MaterialDetails";
import DashboardPage from "./pages/DashboardPages";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
               <CartPage />
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
        </Routes>
      </AuthProvider>
      <Toaster />
    </Router>
  );
}

export default App;
