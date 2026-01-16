import React from "react";

const ProtectedRoute = ({ children }) => {
  // Accès libre TEMPORAIRE (avant Supabase)
  return <>{children}</>;
};

export default ProtectedRoute;
