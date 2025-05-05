import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./auth/AuthProvider";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
