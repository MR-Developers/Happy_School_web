
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import SideBar from "./components/SideBar";
import CounselorSideBar from "./components/CounselorSideBar";
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
import CounselorDashboard from "./pages/Counselor/CounselorDashboard";
import CounselorTeachers from "./pages/Counselor/CounselorTeachers";
import CounselorTickets from "./pages/Counselor/CounselorTickets";
import CounselorChallengePage from "./pages/Counselor/CounselorChallenges";
import CounselorTaskPage from "./pages/Counselor/CounselorTasks";
import CounselorOneOnOneSessions from "./pages/Counselor/CounselorOneOnOneSessions";
import CounselorAddTicket from "./pages/Counselor/CounselorAddTicket";
import CoordinatorHome from "./pages/Co-ordinator/CoordinatorHome";
import CoordinatorTeachers from "./pages/Co-ordinator/Teachers";
import CoordinatorTickets from "./pages/Co-ordinator/CoordinatorTickets";
import CoordinatorChallges from "./pages/Co-ordinator/CoordinatorChallges";
import CoordinatorTasks from "./pages/Co-ordinator/Tasks";
import CoordinatorUnanswered from "./pages/Co-ordinator/CoordinatorUnanswered";
import CoordinatorOneonOne from "./pages/Co-ordinator/CoordinatorOneonOne";

function LayoutWrapper() {
  const location = useLocation();
  const hideNavOnRoutes = ["/", "/addticket", "/showticket"];
  const counselorRoutes = [
    "/counselordashboard",
    "/counselorteachers",
    "/counselortickets",
    "/counselorchallenges",
    "/tasks/:challengeName/:challengeId/:school",
    "/counseloroneonone",
    "/counseloraddticket",
  ];

  function ProtectedRoute({ element }: { element: JSX.Element }) {
    const isAuthenticated = localStorage.getItem("authToken");
    return isAuthenticated ? element : <Navigate to="/" />;
  }

  let sidebarToShow: JSX.Element | null = null;
  if (!hideNavOnRoutes.includes(location.pathname.toLowerCase())) {
    if (counselorRoutes.includes(location.pathname.toLowerCase())) {
      sidebarToShow = <CounselorSideBar />;
    } else {
      sidebarToShow = <SideBar />;
    }
  }
  return (
    <div className="flex h-screen relative">
      {sidebarToShow}
      <div className="flex-1 bg-white overflow-auto w-full lg:w-auto">
        {/* Spacer for mobile app bar - only on pages with sidebar */}
        {sidebarToShow && <div className="h-14 lg:hidden" />}
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
        <Routes>
          <Route
            path="/counselordashboard"
            element={<ProtectedRoute element={<CounselorDashboard />} />}
          />
          <Route
            path="/counselorteachers"
            element={<ProtectedRoute element={<CounselorTeachers />} />}
          />
          <Route
            path="/counselortickets"
            element={<ProtectedRoute element={<CounselorTickets />} />}
          />
          <Route
            path="/counselorchallenges"
            element={<ProtectedRoute element={<CounselorChallengePage />} />}
          />
          <Route
            path="/counselortasks/:challengeName/:challengeId/:school"
            element={<ProtectedRoute element={<CounselorTaskPage />} />}
          />
          <Route
            path="/counseloroneonone"
            element={<ProtectedRoute element={<CounselorOneOnOneSessions />} />}
          />
          <Route
            path="/counseloraddticket"
            element={<ProtectedRoute element={<CounselorAddTicket />} />}
          />

          <Route path="/co-ordinator" element={<ProtectedRoute
             element={ <CoordinatorHome/>}/>}/>
          <Route path="/co-ordinator/teachers" element={<ProtectedRoute
             element={ <CoordinatorTeachers/>}/>}/>

            <Route path="/co-ordinator/tickets" element={<ProtectedRoute element={<CoordinatorTickets/>} />}/>
            <Route path = "/co-ordinator/challenges" element= {<ProtectedRoute element= {<CoordinatorChallges/>}/>}/>
              <Route
            path="/co-ordinator/tasks/:challengeName/:challengeId"
            element={<ProtectedRoute element={<CoordinatorTasks/>} />}
          />
           <Route
            path="/co-ordinator/useranswers/:challengeId/:taskName"
            element={<CoordinatorUnanswered/>}
          />
          <Route path="/co-ordinator/one-on-one" element={<ProtectedRoute element={<CoordinatorOneonOne />} />} />
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
