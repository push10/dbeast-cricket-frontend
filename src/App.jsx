import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState } from "react";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import MatchCenter from "./components/MatchCenter.jsx";

function App() {
  const [user, setUser] = useState(() => {

    const token = localStorage.getItem("token");

    return token ? { token } : null;

  });

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/matches" /> : <Login onLoginSuccess={setUser} />} />
        <Route path="/login" element={user ? <Navigate to="/matches" /> : <Login onLoginSuccess={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/matches" element={user ? <MatchCenter /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;