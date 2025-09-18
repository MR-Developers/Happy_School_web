import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faChalkboardTeacher,
  faTicket,
  faSignOutAlt,
  faClipboardList,
  faVideoCamera,
  faChartLine, // 📊 Icon for Report
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SideBar() {
  const username = useState(localStorage.getItem("UserName"))[0];
  const role = useState(localStorage.getItem("role"))[0];
  const school = useState(localStorage.getItem("school"))[0];
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const navigate = useNavigate();

  // ✅ Added "Report" with external link
  const menuItems = [
    { name: "Dashboard", icon: faUser, path: "/dashboard" },
    { name: "Teachers", icon: faChalkboardTeacher, path: "/teacher" },
    { name: "Tickets Raised", icon: faTicket, path: "/yourtickets" },
    { name: "Challenges", icon: faClipboardList, path: "/challenges" },
    {
      name: "One-One Sessions",
      icon: faVideoCamera,
      path: "/one-one-sessions",
    },
    {
      name: "Report",
      icon: faChartLine,
      path: "/reports",
    },
    { name: "Logout", icon: faSignOutAlt, isLogout: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("UserName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("school");
    localStorage.removeItem("firebaseToken");
    navigate("/");
  };

  const handleItemClick = (item) => {
    if (item.isLogout) {
      handleLogout();
    } else if (item.externalLink) {
      // 🌍 Open external link in a new tab
      window.open(item.externalLink, "_blank", "noopener,noreferrer");
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="w-full sm:w-[250px] h-screen bg-[#454545] flex flex-col p-4 overflow-hidden">
      {/* Header (Profile) */}
      <div className="flex flex-row items-center shrink-0">
        <div className="bg-orange-200 rounded-full p-4 inline-block">
          <FontAwesomeIcon icon={faUser} className="text-4xl text-white" />
        </div>
        <div className="ml-3">
          <h1 className="text-white text-xl font-bold break-all">{username}</h1>
          <p className="text-white text-sm">{role}</p>
          {school && (
            <p className="text-gray-300 text-xs mt-1 break-all">{school}</p>
          )}
        </div>
      </div>

      {/* Menu List (Scrollable) */}
      <ul className="mt-6 space-y-2 flex-1 overflow-y-auto pr-2">
        {menuItems.map((item) => (
          <li
            key={item.name}
            onClick={() => handleItemClick(item)}
            className={`flex items-center h-10 pl-4 pr-2 rounded-xl cursor-pointer ${
              pathname === item.path ? "bg-black" : "bg-[#454545]"
            } text-white hover:bg-black transition-all duration-150`}
          >
            <FontAwesomeIcon icon={item.icon} className="mr-3" />
            <span className="whitespace-nowrap">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
