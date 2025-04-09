import { useEffect, useRef } from "react";
import { useChatStore } from "../stores/useChatStore";
import { useAuthStore } from "../stores/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../libs/utils";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    isMessageLoading,
    subscribeToMessage,
    unsubscribeFromMessage,
    getMessage,
    isFriend,
    friendRequestSent,
    friendRequestReceived,
    addFriend,
    setIsFriend,
    setFriendRequestReceived,
    setFriendRequestSent,
    acceptFriendRequest,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  //get chat messages
  useEffect(() => {
    //get history messages
    getMessage(selectedUser._id);
    //listen to socket
    subscribeToMessage();
    return () => {
      unsubscribeFromMessage();
    };
  }, [
    selectedUser._id,
    getMessage,
    subscribeToMessage,
    unsubscribeFromMessage,
  ]);

  useEffect(() => {
    if (authUser && selectedUser) {
      setIsFriend(authUser?.friends?.includes(selectedUser._id));
      setFriendRequestSent(
        selectedUser?.friendRequests?.includes(authUser._id)
      );
      setFriendRequestReceived(
        authUser?.friendRequests?.includes(selectedUser._id)
      );
    }
  }, [
    setIsFriend,
    setFriendRequestReceived,
    setFriendRequestSent,
    authUser,
    selectedUser,
  ]);

  

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleAddFriend = () => {
    addFriend(selectedUser._id);
    setFriendRequestSent(true);
  };

  const handleAcceptFriendRequest = () => {
    acceptFriendRequest(selectedUser._id);
    setIsFriend(true);
    setFriendRequestReceived(false);
    getMessage(selectedUser._id);
  };

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.webp"
                      : selectedUser.profilePic || "/avatar.webp"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      {!isFriend && !friendRequestSent && !friendRequestReceived && (
        <div className="p-4 text-center text-red-500">
          You must be friend with {selectedUser.fullName} to send messages.
          <button className="btn btn-sm ml-2" onClick={handleAddFriend}>
            Add Friend!
          </button>
        </div>
      )}
      {!isFriend && friendRequestSent && !friendRequestReceived && (
        <div className="p-4 text-center text-yellow-500">
          Friend request sent. Waiting for acceptance.
        </div>
      )}
      {!isFriend && !friendRequestSent && friendRequestReceived && (
        <div className="p-4 text-center text-green-500">
          {selectedUser.fullName} sent you a friend request.
          <button
            className="btn btn-sm ml-2"
            onClick={handleAcceptFriendRequest}
          >
            Accept!
          </button>
        </div>
      )}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
