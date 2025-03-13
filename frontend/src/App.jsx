import "./App.css";
import { Route, Routes, Navigate } from "react-router";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import SignUp from "./pages/SignUp";
import Setting from "./pages/Setting";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import { useThemeStore } from "./stores/useThemeStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUp /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />
        <Route path="/setting" element={<Setting />} />
        <Route
          path="/profile"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
