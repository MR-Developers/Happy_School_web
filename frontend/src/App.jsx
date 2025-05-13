import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import SideBar from "./components/SideBar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Teacher from "./pages/Teachers";
import Notification from "./pages/Notification";
import AddTicket from "./pages/AddTicket";

function LayoutWrapper() {
  const location = useLocation();
  const hideNavOnRoutes = ["/", "/addticket"];

  function ProtectedRoute({ element }) {
    const isAuthenticated = localStorage.getItem("authToken");
    return isAuthenticated ? element : <Navigate to="/" />;
  }

  const showSidebar = !hideNavOnRoutes.includes(
    location.pathname.toLowerCase()
  );

  return (
    <div className="flex h-screen">
      {showSidebar && <SideBar />}
      <div className="flex-1 bg-white  overflow-auto">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
          <Route
            path="/tickets"
            element={<ProtectedRoute element={<Tickets />} />}
          />
          <Route
            path="/teacher"
            element={<ProtectedRoute element={<Teacher />} />}
          />
          <Route
            path="/notification"
            element={<ProtectedRoute element={<Notification />} />}
          />
          <Route
            path="/addticket"
            element={<ProtectedRoute element={<AddTicket />} />}
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LayoutWrapper />
    </Router>
  );
}

export default App;
