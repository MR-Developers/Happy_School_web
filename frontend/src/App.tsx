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

import AddTicket from "./pages/AddTicket";
import ShowTicket from "./pages/ShowTicket";
import YourTickets from "./pages/YourTickets";
import type { JSX } from "react";
import ChatPage from "./pages/ChatPage";
import ChallengePage from "./pages/Challenges";
import TaskPage from "./pages/Tasks";
import UserAnswersPage from "./pages/UserAnswer";
import OneOnOneSessions from "./pages/OneOnOneSessions";
import ReportSelectionPage from "./pages/Reports";

function LayoutWrapper() {
  const location = useLocation();
  const hideNavOnRoutes = ["/", "/addticket", "/showticket"];

  function ProtectedRoute({ element }: { element: JSX.Element }) {
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
          {/* <Route
            path="/notification"
            element={<ProtectedRoute element={<Notification />} />}
          /> */}
          <Route
            path="/addticket"
            element={<ProtectedRoute element={<AddTicket />} />}
          />

          <Route
            path="/showticket"
            element={<ProtectedRoute element={<ShowTicket />} />}
          />

          <Route
            path="/yourtickets"
            element={<ProtectedRoute element={<YourTickets />} />}
          />
          <Route path="/chat/:ticketId" element={<ChatPage />} />
          <Route
            path="/challenges"
            element={<ProtectedRoute element={<ChallengePage />} />}
          />
          <Route
            path="/tasks/:challengeName/:challengeId"
            element={<ProtectedRoute element={<TaskPage />} />}
          />
          <Route
            path="/useranswers/:challengeId/:taskName"
            element={<UserAnswersPage />}
          />
          <Route
            path="/one-one-sessions"
            element={<ProtectedRoute element={<OneOnOneSessions />} />}
          />
          <Route
            path="/reports"
            element={<ProtectedRoute element={<ReportSelectionPage />} />}
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
