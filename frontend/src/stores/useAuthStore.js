import { create } from "zustand";
import api from "../services/api.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await api.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error while checking auth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await api.post("/auth/signup", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response.data.message || "Error while signing up");
    } finally {
      set({ isSigningUp: false });
    }
  },
  signIn: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await api.post("/auth/signin", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error(error.response.data.message || "Error while logging in");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error(error.response.data.message || "Error while logging out");
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await api.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error.response.data.message || "Error while updating profile"
      );
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;
    const socketURL = import.meta.env.VITE_SOCKET_URL;
    const newSocket = io(socketURL, { query: { userId: authUser._id } });
    newSocket.connect();
    set({ socket: newSocket });
    //listen for online users
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
      console.log("Online users", userIds);
    });
  },
  disconnectSocket: () => {
    if (!get().socket?.connected) return;
    get().socket.disconnect();
  },
}));
