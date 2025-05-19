import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSearch,
  faChalkboardTeacher,
  faBell,
  faTicketAlt,
  faSignOutAlt, // ✅ Logout icon
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SideBar() {
  const username = useState(localStorage.getItem("UserName"))[0];
  const role = useState(localStorage.getItem("role"))[0];
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: faUser, path: "/dashboard" },
    { name: "Tickets", icon: faTicketAlt, path: "/tickets" },
    { name: "Teachers", icon: faChalkboardTeacher, path: "/teacher" },
    { name: "Your Tickets", icon: faTicketAlt, path: "/yourtickets" },
    { name: "Notifications", icon: faBell, path: "/notification" },
    { name: "Logout", icon: faSignOutAlt, isLogout: true }, // ✅ use flag
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("UserName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("firebaseToken");
    navigate("/");
  };

  return (
    <div className="w-[20%] h-screen bg-[#454545] p-4">
      <div className="flex flex-row items-center mt-4">
        <div className="bg-orange-200 rounded-full p-4 inline-block">
          <FontAwesomeIcon icon={faUser} className="text-4xl text-white" />
        </div>
        <div className="ml-3">
          <h1 className="text-white text-xl font-bold">{username}</h1>
          <p className="text-white text-sm">{role}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          className="bg-white rounded-3xl w-full h-9 pl-10 pr-4 text-sm focus:outline-none"
          placeholder="Search"
        />
      </div>

      {/* Menu */}
      <ul className="mt-6 space-y-2">
        {menuItems.map((item) => (
          <li
            key={item.name}
            onClick={() =>
              item.isLogout ? handleLogout() : navigate(item.path)
            }
            className={`flex items-center h-10 pl-4 pr-2 rounded-2xl cursor-pointer ${
              pathname === item.path ? "bg-black" : "bg-[#454545]"
            } text-white hover:bg-black transition-all duration-150`}
          >
            <FontAwesomeIcon icon={item.icon} className="mr-3" />
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
