import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUpload, FaPaperPlane, FaSpinner, FaBars, FaComments } from "react-icons/fa"; // Added FaComments
import axios from "axios";
import Cookies from "js-cookie";
const Chat = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatName, setChatName] = useState("");
    const [chatObjective, setChatObjective] = useState("");
    const [userMessage, setUserMessage] = useState("");
    const [editingMessage, setEditingMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState({});
    const [confirmDelete, setConfirmDelete] = useState({ visible: false, chatId: null });
    const [deleting, setDeleting] = useState(false); // New state for deletion loading
    const [showChatList, setShowChatList] = useState(false); // State for showing/hiding chat list, default to false on mobile
    useEffect(() => {
        // Automatically show chat list on larger screens
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handleResize = () => setShowChatList(mediaQuery.matches);
        handleResize(); // Initial check
        mediaQuery.addEventListener('change', handleResize);
        return () => mediaQuery.removeEventListener('change', handleResize);
    }, []);
    useEffect(() => {
        const fetchChats = async () => {
            setLoading(true);
            try {
                const token = Cookies.get("access_token");
                const response = await axios.get("api/topics", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const formattedTopics = response.data.topics.map(topic => ({
                    id: topic.id,
                    name: topic.title,
                    objective: topic.objectives,
                    messages: []
                }));
                setChats(formattedTopics);
                const initialProgress = response.data.topics.reduce((acc, chat) => {
                    acc[chat.id] = chat.progress || 0;
                    return acc;
                }, {});
                setProgress(initialProgress);
            }
            catch (error) {
                console.error("Error fetching topics:", error);
                alert("Failed to load topics. Please try again.");
            }
            finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);
    const openModal = () => {
        setChatName("");
        setChatObjective("");
        setIsModalOpen(true);
    };
    const addChat = async () => {
        if (chatName.trim() === "" || chatObjective.trim() === "")
            return;
        try {
            const token = Cookies.get("access_token");
            const response = await axios.post("api/topics", { title: chatName, objectives: chatObjective }, { headers: { Authorization: `Bearer ${token}` } });
            const newChat = {
                id: response.data.topic_id,
                name: chatName,
                objective: chatObjective,
                messages: []
            };
            setChats([...chats, newChat]);
            setIsModalOpen(false);
        }
        catch (error) {
            console.error("Error creating topic:", error);
            alert("Failed to create topic. Please try again.");
        }
    };
    const editChat = (chatId) => {
        const chat = chats.find((c) => c.id === chatId);
        setChatName(chat.name);
        setChatObjective(chat.objective);
        setSelectedChat(chat);
        setIsModalOpen(true);
    };
    const saveEdit = async () => {
        try {
            const token = Cookies.get("access_token");
            await axios.put(`api/topics/${selectedChat.id}`, { title: chatName, objectives: chatObjective }, { headers: { Authorization: `Bearer ${token}` } });
            setChats(chats.map((chat) => chat.id === selectedChat.id
                ? { ...chat, name: chatName, objective: chatObjective }
                : chat));
            setIsModalOpen(false);
            setSelectedChat(null);
        }
        catch (error) {
            console.error("Error updating topic:", error);
            alert("Failed to update topic. Please try again.");
        }
    };
    const confirmDeleteChat = (chatId) => {
        setConfirmDelete({ visible: true, chatId });
    };
    const deleteChat = async (chatId) => {
        setDeleting(true); // Set loading state
        try {
            const token = Cookies.get("access_token");
            await axios.delete(`api/topics/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(chats.filter((chat) => chat.id !== chatId));
            if (selectedChat && selectedChat.id === chatId)
                setSelectedChat(null);
            setConfirmDelete({ visible: false, chatId: null }); // Close the confirmation dialog
        }
        catch (error) {
            console.error("Error deleting topic:", error);
            alert("Failed to delete topic. Please try again.");
        }
        finally {
            setDeleting(false); // Reset loading state
        }
    };
    const handleSelectChat = (chat) => setSelectedChat(chat);
    const handleSendMessage = async () => {
        if (userMessage.trim() === "" || !selectedChat)
            return;
        try {
            const token = Cookies.get("access_token");
            const response = await axios.post("api/interact", { topic_id: selectedChat.id, message: userMessage }, { headers: { Authorization: `Bearer ${token}` } });
            const aiResponse = response.data.response;
            const updatedChats = chats.map((chat) => chat.id === selectedChat.id
                ? { ...chat, messages: [...chat.messages, { userMessage, aiResponse }] }
                : chat);
            setChats(updatedChats);
            setUserMessage("");
        }
        catch (error) {
            console.error("Error sending message:", error);
        }
    };
    const handleEditMessage = (chatId, messageIndex) => {
        const chat = chats.find((c) => c.id === chatId);
        const messageToEdit = chat.messages[messageIndex].userMessage;
        setUserMessage(messageToEdit);
        setEditingMessage({ chatId, messageIndex });
    };
    const saveEditedMessage = () => {
        const updatedChats = chats.map((chat) => chat.id === editingMessage.chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg, index) => index === editingMessage.messageIndex
                    ? { ...msg, userMessage }
                    : msg)
            }
            : chat);
        setChats(updatedChats);
        setUserMessage("");
        setEditingMessage(null);
    };
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file)
            return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            const token = Cookies.get("access_token");
            await axios.post("api/upload_file", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            alert("File uploaded successfully!");
        }
        catch (error) {
            console.error("Error uploading file:", error);
        }
    };
    return (<div className="flex h-full md:p-6 md:space-x-4 relative"> {/* Added relative, adjusted padding for mobile */}
      {/* Overlay for mobile when chat list is open */}
      {showChatList && !window.matchMedia("(min-width: 768px)").matches && (<div className="fixed inset-0 z-30 bg-black opacity-50 md:hidden" onClick={() => setShowChatList(false)}></div>)}

      {/* Chat List Section - Drawer on mobile, static on desktop */}
      {showChatList && ( // Restored conditional rendering
        <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 bg-gray-100 p-4 rounded-r-lg md:rounded-lg shadow-lg md:shadow-none
                        w-3/4 sm:w-80 md:w-1/4 
                        ${showChatList && !window.matchMedia("(min-width: 768px)").matches ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}> {/* Refined class for mobile toggle */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Topics</h3>
          <button className="md:hidden text-gray-600 hover:text-gray-800" onClick={() => setShowChatList(false)}>
            <FaPlus className="transform rotate-45 w-6 h-6"/> {/* Using FaPlus as X icon */}
          </button>
        </div>
        <button className="bg-[#000053] text-white px-4 py-2 rounded mb-4 flex items-center space-x-2 w-full justify-center" onClick={openModal}>
            <FaPlus />
            <span>Create AI Tutor</span>
          </button>
          <ul className="space-y-2">
            {loading ? (<li className="p-2 text-gray-500">Loading...</li>) : (chats.map((chat) => (<li key={chat.id} onClick={() => handleSelectChat(chat)} className={`p-2 rounded-lg cursor-pointer ${selectedChat?.id === chat.id ? "bg-blue-200" : "bg-gray-200"}`}>
                  <div className="flex justify-between items-center">
                    <span>{chat.name}</span>
                    <div className="flex space-x-2">
                      <FaEdit className="text-gray-500 cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    editChat(chat.id);
                }}/>
                      <FaTrash className="text-red-500 cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteChat(chat.id);
                }}/>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="bg-gray-300 rounded-full h-2">
                      <div className="bg-[#000053] h-2 rounded-full" style={{ width: `${progress[chat.id] || 0}%`
                }}/>
                    </div>
                  </div>
                </li>)))}
          </ul>
        </div>)}
    {/* Chat Interaction Section */}
    {/* Adjusted padding for mobile, ensure it takes full width */}
    <div className="flex-1 bg-white p-4 md:p-6 rounded-lg shadow-lg md:ml-0 w-full"> 
  {selectedChat ? (<div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex justify-between items-center mb-4 md:mb-6 pb-4 border-b">
        <div className="flex items-center"> {/* Wrapper for toggler and title/objective */}
          <button className="md:hidden text-gray-700 mr-3 p-2 -ml-2" onClick={() => setShowChatList(true)}>
            <FaBars className="text-xl"/>
          </button>
          <div> {/* Wrapper for title and objective */}
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {selectedChat.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{selectedChat.objective}</p>
          </div>
        </div>
        <div className="flex space-x-3"> {/* This div contains upload button */}
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center transition-colors duration-200">
            <FaUpload className="mr-2"/>
            <span>Upload File</span>
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt"/>
          </label>
        </div>
      </div>

      {/* Messages Container */}
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 md:mb-6 space-y-4 pr-1"> {/* Added pr-1 for scrollbar */}
        {selectedChat.messages.map((msg, index) => (<div key={index} className="space-y-3">
            {/* User Message */}
            <div className="flex items-start justify-end">
              <div className="bg-blue-500 text-white rounded-lg px-3 py-2 md:px-4 md:py-3 max-w-[85%] sm:max-w-[80%]"> {/* Adjusted padding and max-width */}
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-blue-100">You</span>
                  <div className="flex space-x-2 ml-3 md:ml-4">
                    <button onClick={() => handleEditMessage(selectedChat.id, index)} className="text-blue-200 hover:text-white">
                      <FaEdit size={12}/>
                    </button>
                  </div>
                </div>
                <p className="text-sm md:text-base">{msg.userMessage}</p> {/* Adjusted text size */}
              </div>
            </div>

            {/* AI Response */}
            <div className="flex items-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2 md:px-4 md:py-3 max-w-[85%] sm:max-w-[80%]"> {/* Adjusted padding and max-width */}
                <div className="flex items-center mb-1">
                  <span className="text-xs text-gray-500">AI Tutor</span>
                </div>
                <p className="text-sm md:text-base whitespace-pre-wrap">{msg.aiResponse}</p> {/* Adjusted text size */}
              </div>
            </div>
          </div>))}
      </div>

      {/* Input Area */}
      <div className="border-t pt-3 md:pt-4">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="flex-1 relative">
            <textarea className="w-full border rounded-lg px-3 py-2 md:px-4 md:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} placeholder="Type your message..." rows="1" // Start with 1 row, auto-expand
         style={{ minHeight: '44px', maxHeight: '120px' }} // Adjusted min/max height
        />
          </div>
          <button className="bg-[#000053] hover:bg-[#000075] text-white px-4 py-3 md:px-6 rounded-lg flex items-center transition-colors duration-200" // Adjusted padding
         onClick={editingMessage ? saveEditedMessage : handleSendMessage} // Corrected onClick for edit
         disabled={!userMessage.trim()}>
            {editingMessage ? (<>
                <FaEdit className="mr-2"/>
                Update
              </>) : (<>
                <FaPaperPlane className="mr-2"/>
                Send
              </>)}
          </button>
        </div>
      </div>
    </div>) : (<div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
       {/* Hamburger Menu for Mobile - Also show when no chat selected */}
      <button className="md:hidden text-gray-700 absolute top-5 left-5 p-2" onClick={() => setShowChatList(true)}>
        <FaBars className="text-2xl"/>
      </button>
      <div className="text-gray-400 mb-4">
        <FaComments size={48}/> {/* Changed icon for variety */}
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
        Select or Create an AI Tutor
      </h3>
      <p className="text-gray-500 max-w-sm md:max-w-md text-sm md:text-base">
        Choose a topic from the sidebar or create a new one to begin your personalized learning experience.
      </p>
    </div>)}
    </div>
    {/* Chat Creation Modal */}
        {isModalOpen && (<div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"> {/* Ensure modal is on top and has padding */}
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"> {/* Increased padding and max-width */}
              <h2 className="text-xl font-semibold mb-4"> {/* Adjusted margin and size */}
                {selectedChat ? "Edit AI Tutor Topic" : "Create New AI Tutor Topic"}
              </h2>
              <input type="text" className="border rounded p-3 w-full mb-3 text-sm md:text-base" /* Adjusted padding and margin */ placeholder="Tutor Name" value={chatName} onChange={(e) => setChatName(e.target.value)}/>
              <textarea className="border rounded p-2 w-full mb-2" placeholder="Objectives" value={chatObjective} onChange={(e) => setChatObjective(e.target.value)}/>
              <div className="flex justify-between">
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={selectedChat ? saveEdit : addChat}>
                  {selectedChat ? "Save Changes" : "Create Topic"}
                </button>
                <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>)}
      </div>);
};
export default Chat;
