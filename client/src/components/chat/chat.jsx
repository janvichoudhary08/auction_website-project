import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room, contactName, product }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  // Join room on component mount
  useEffect(() => {
    if (room) {
      socket.emit("join_room", room);
    }

    // Cleanup function to prevent duplicate joins
    return () => {
      socket.off("join_room");
    };
  }, [room]);

  // Listen for incoming messages & chat history
  useEffect(() => {
    socket.on("history", (messages) => {
      setMessageList(messages);  // Directly set messages
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    // Cleanup event listeners when component unmounts
    return () => {
      socket.off("history");
      socket.off("receive_message");
    };
  }, [socket]);

  // Send message function
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        roomId: room,
        from: username,
        to: contactName,
        messageBody: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          String(new Date(Date.now()).getMinutes()).padStart(2, "0"),
      };

      setMessageList((list) => [...list, messageData]);
      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Name : {contactName} </p>
        <p>Product : {product}</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => (
            <div
              key={index}
              className="message"
              id={username === messageContent.from ? "other" : "you"}
            >
              <div>
                <div className="message-content">
                  <p>{messageContent.messageBody}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.from}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyUp={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
