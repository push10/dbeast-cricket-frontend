import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import MatchCenter from "./components/MatchCenter/MatchCenter.jsx";
import CreateMatch from "./components/MatchCenter/CreateMatch.jsx";
import Profile from "./components/Profile.jsx";
import Teams from "./components/Teams.jsx";
import Layout from "./components/layout/Layout";
import { getCurrentUser, getToken, clearAuth, setCurrentUser } from "./api/auth";
import { getMyProfile } from "./api/authApi";

function ProtectedLayout({ user, setUser, children }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout user={user} setUser={setUser}>
      {children}
    </Layout>
  );
}

function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    async function hydrateUser() {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getMyProfile();
        const nextUser = { ...profile, token };
        setCurrentUser(nextUser);
        setUser(nextUser);
      } catch (err) {
        console.error("Failed to restore session", err);
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    hydrateUser();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/matches" /> : <Login onLoginSuccess={setUser} />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/matches" /> : <Login onLoginSuccess={setUser} />}
        />
        <Route path="/register" element={<Register />} />

        <Route
          path="/matches"
          element={
            <ProtectedLayout user={user} setUser={setUser}>
              <MatchCenter currentUser={user} setUser={setUser} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/create-match"
          element={
            <ProtectedLayout user={user} setUser={setUser}>
              <CreateMatch currentUser={user} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedLayout user={user} setUser={setUser}>
              <Profile currentUser={user} setUser={setUser} />
            </ProtectedLayout>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedLayout user={user} setUser={setUser}>
              <Teams currentUser={user} setUser={setUser} />
            </ProtectedLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
