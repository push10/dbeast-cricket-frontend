import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState } from "react";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import MatchCenter from "./components/MatchCenter/MatchCenter.jsx";
import CreateMatch from "./components/MatchCenter/CreateMatch.jsx";

import Layout from "./components/layout/Layout";

function App() {

  const [user, setUser] = useState(() => {

    const token = localStorage.getItem("token");

    return token ? { token } : null;

  });

  return (

    <Router>

      <Routes>

        {/* Public Routes */}

        <Route
          path="/"
          element={
            user
              ? <Navigate to="/matches" />
              : <Login onLoginSuccess={setUser} />
          }
        />

        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/matches" />
              : <Login onLoginSuccess={setUser} />
          }
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected Routes with Layout */}

        <Route
          path="/matches"
          element={
            user ? (
              <Layout user={user} setUser={setUser}>
                <MatchCenter currentUser={user} setUser={setUser}/>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/create-match"
          element={
            user ? (
              <Layout user={user} setUser={setUser}>
                <CreateMatch currentUser={user} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>

    </Router>

  );

}

export default App;