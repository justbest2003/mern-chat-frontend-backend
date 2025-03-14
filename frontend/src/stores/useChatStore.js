import { create } from "zustand";
import api from "../services/api.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isMessageLoading: false,
  isUserLoading: false,
  isFriend: false,
  friendRequestSent: false,
  friendRequestReceived: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await api.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message || "Error while fetching users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessage: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await api.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(
        error.response.data.message || "Error while fetching messages"
      );
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    set({ isSendingMessage: true });
    try {
      const res = await api.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      console.log(res.data);

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message || "Error while sending message");
    } finally {
      set({ isSendingMessage: false });
    }
  },

  subscribeToMessage: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      const isMessageSendFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSendFromSelectedUser) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessage: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  addFriend: async (friendId) => {
    try {
      const res = await api.post("/friend/add", { friendId });
      toast.success(res.data.message);
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("friendRequestSent", friendId);
      }
      set({ friendRequestSent: true });
    } catch (error) {
      toast.error(error.response.data.message || "Error while adding friend");
    }
  },

  acceptFriendRequest: async (friendId) => {
    try {
      const res = await api.post("/friend/accept", { friendId });
      toast.success(res.data.message);
      useAuthStore.getState().socket.emit("friendRequestAccepted", friendId);

      set({ isFriend: true, friendRequestReceived: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setIsFriend: (isFriend) => set({ isFriend }),
  setFriendRequestSent: (sent) => set({ friendRequestSent: sent }),
  setFriendRequestReceived: (received) =>
    set({ friendRequestReceived: received }),
}));
