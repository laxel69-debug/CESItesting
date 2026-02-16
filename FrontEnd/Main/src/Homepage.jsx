import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/IndexWebsite/Home";


import SetPassword from "./components/Auth/SetPassword";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

import AdminDashboard from "./components/AdminWebsite/AdminDashboard";
import TeacherDashboard from "./components/TeacherWebsite/TeacherIndex";
 import Profmain from "./components/ParentWebsite/Profmain";

import { useAuth } from "./components/Auth/useAuth";

export default function Homepage() {
  const { user, loading, login } = useAuth();

  // 🔹 SESSION SYNC ON REFRESH
  useEffect(() => {
    if (user) return; // already have local user

    const syncSession = async () => {
      try {
        const res = await fetch(
          "/api/accounts/me/",
          { credentials: "include" }
        );

        if (res.ok) {
          const data = await res.json();
          login({ user: data }); // sync context + localStorage
        }
        // ❗ DO NOT logout on 401 here
      } catch {
        // server/network issue → keep local user
      }
    };

    syncSession();
  }, [user, login]);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />


      <Route path="/set-password/:uidb64/:token" element={<SetPassword />} />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="TEACHER">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      /> 
      

       <Route
        path="/parent"
        element={
          <ProtectedRoute role="PARENT_STUDENT">
            <Profmain />
          </ProtectedRoute>
        }
      />  

      <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
