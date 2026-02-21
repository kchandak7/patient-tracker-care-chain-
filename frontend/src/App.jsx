import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/dashboard"
        element={authUser ? <Dashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;