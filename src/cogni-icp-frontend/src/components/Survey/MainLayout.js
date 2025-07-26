import React, { useState, useEffect } from "react";
import { FaTachometerAlt, FaComments, FaPodcast, FaFilm, FaSignOutAlt, FaBars } from "react-icons/fa";
import { MdGroup, MdAccountCircle, MdAttachMoney, MdDescription, MdOutlineQuiz, MdSmartToy  } from "react-icons/md";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../../cognilogo.png"; 

function MainLayout() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token"); 
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });
      if (response.ok) {
        alert("Logout successful."); 
        localStorage.removeItem("access_token"); 
        navigate("/login"); 
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#000053] text-gray-800">
      {/* Sidebar */}
      {/* Added responsive classes: hidden on small screens by default, block on md and larger. 
           For mobile, it becomes an absolute positioned drawer. */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#000053] text-white flex flex-col items-start p-6 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex`}>
        <div className="flex items-center mb-4 w-full">
          <img src={logo} alt="Logo" className="w-12 h-12 md:w-16 md:h-16" />
          <div className="text-xl md:text-2xl font-bold ml-2">CogniEdufy</div>
        </div>
        <div className="flex-grow">
          <nav className="space-y-4">
            <SidebarItem icon={FaTachometerAlt} label="Dashboard" onClick={() => navigate("/dashboard")} />
            <SidebarItem icon={MdSmartToy} label="AI Tutor" onClick={() => navigate("/chat")} />
            <SidebarItem icon={MdOutlineQuiz} label="Quiz" onClick={() => navigate("/quiz")} />
            <SidebarItem icon={FaPodcast} label="Podcast Learning" onClick={() => navigate("/podcast")} />
            <SidebarItem icon={FaFilm} label="Animation" onClick={() => navigate("/anima")} />
            <SidebarItem icon={MdGroup} label="Collaborate" onClick={() => navigate("/collaborate")} />
          </nav>
        </div>
        <div className="mt-8">
          <SidebarItem icon={MdAccountCircle} label="My Profile" />
          <SidebarItem icon={MdAttachMoney} label="Billing & Usage" />
          <SidebarItem icon={MdDescription} label="Docs" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:ml-0"> {/* Removed md:ml-64 as sidebar is part of flex flow on md+ */}
        <header className="px-4 md:px-8 py-4 bg-[#000053] text-white flex justify-between items-center">
          {/* Toggler for mobile */}
          <div className="md:hidden">
            <button onClick={toggleSidebar} className="text-white focus:outline-none">
              <FaBars size={24} />
            </button>
          </div>
          <h1 className="text-lg md:text-xl font-semibold ml-4 md:ml-0">{greeting}</h1> {/* Adjusted margin for mobile */}
          <div className="cursor-pointer" onClick={() => setShowLogoutConfirm(true)}>
            <FaSignOutAlt size={20} />
          </div>
        </header>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {showLogoutConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md">
              <p>Are you sure you want to log out?</p>
              <div className="flex justify-end mt-4">
                <button 
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={handleLogout}
                >
                  Yes
                </button>
                <button 
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8 bg-white flex"> {/* Adjusted padding for mobile */}
          <div className="flex-1">
            <Outlet /> {/* This renders the current route's component */}
          </div>
        </main>
      </div>
    </div>
  );
}

const SidebarItem = ({ icon: Icon, label, onClick }) => (
  <div className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={onClick}>
    <Icon size={20} />
    <span>{label}</span>
  </div>
);

export default MainLayout;
