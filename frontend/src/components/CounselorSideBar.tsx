import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faChalkboardTeacher,
  faTicket,
  faSignOutAlt,
  faClipboardList,
  faVideoCamera,
  faBars,
  faTimes,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function CounselorSideBar() {
  const username = useState(localStorage.getItem("UserName"))[0];
  const role = useState(localStorage.getItem("role"))[0];
  const school = useState(localStorage.getItem("school"))[0];
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: faUser, path: "/counselordashboard" },
    { name: "Teachers", icon: faChalkboardTeacher, path: "/counselorteachers" },
    { name: "Tickets Raised", icon: faTicket, path: "/counselortickets" },
    { name: "Challenges", icon: faClipboardList, path: "/counselorchallenges" },
    {
      name: "One-One Sessions",
      icon: faVideoCamera,
      path: "/counseloroneonone",
    },
    { name: "Password Reset", icon: faChartLine, path: "/auth/password-reset" },
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
      window.open(item.externalLink, "_blank", "noopener,noreferrer");
    } else if (item.path) {
      navigate(item.path);
      setIsSidebarOpen(false); // Close sidebar on mobile after navigation
    }
  };

  return (
    <>
      {/* Mobile Top App Bar - Only visible on mobile/tablet */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white shadow-md z-40 lg:hidden flex items-center px-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-orange-500 p-2 hover:bg-orange-50 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon
            icon={isSidebarOpen ? faTimes : faBars}
            className="text-2xl"
          />
        </button>
        <h1 className="ml-4 text-lg font-semibold text-gray-800">
          Happy School Culture
        </h1>
      </div>

      {/* Note: Spacer is now handled in the main content wrapper */}

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-[280px] lg:w-[250px] h-screen bg-[#454545] flex flex-col p-4 overflow-hidden transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header (Profile) */}
        <div className="flex flex-row items-center shrink-0 mt-2 lg:mt-0">
          <div className="bg-orange-200 rounded-full p-4 inline-block">
            <FontAwesomeIcon icon={faUser} className="text-4xl text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-white text-xl font-bold break-all">
              {username}
            </h1>
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
              className={`flex items-center h-10 pl-4 pr-2 rounded-xl cursor-pointer ${pathname === item.path ? "bg-black" : "bg-[#454545]"
                } text-white hover:bg-black transition-all duration-150`}
            >
              <FontAwesomeIcon icon={item.icon} className="mr-3" />
              <span className="whitespace-nowrap">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default CounselorSideBar;
