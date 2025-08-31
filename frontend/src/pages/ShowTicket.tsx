/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

function ShowTicket() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(state?.ticket || null);
  const [loading, setLoading] = useState(!state?.ticket);
  const [error, setError] = useState("");

  // Helper function to get teacher display info
  const getTeacherInfo = () => {
    if (!ticket?.teacher) return null;

    // If teacher is an object with name and email
    if (typeof ticket.teacher === "object" && ticket.teacher.name) {
      return {
        name: ticket.teacher.name,
        email: ticket.teacher.email,
      };
    }

    // If teacher is just a string (backward compatibility)
    if (typeof ticket.teacher === "string") {
      return {
        name: ticket.teacher,
        email: "",
      };
    }

    return null;
  };

  // Fetch ticket if not in state but ID is available
  useEffect(() => {
    if (!state?.ticket) {
      console.log("No ticket found in navigation state");
      // Option 1: Redirect back to tickets list
      // navigate("/one-on-one-sessions", { replace: true });

      // Option 2: Show error and let user navigate back manually
      setLoading(false);
    } else {
      setTicket(state.ticket);
      setLoading(false);
    }
  }, [state, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {error || "Ticket Not Found"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The ticket data is not available. This might happen if you accessed this page directly or refreshed the browser."}
            </p>
            <button
              onClick={() => navigate("/one-on-one-sessions")}
              className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-lg transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-orange-400 text-white px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/one-on-one-sessions")}
              className="hover:bg-orange-500 p-2 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Support Ticket Details</h1>
              <p className="text-sm text-orange-100 mt-1">
                Ticket submitted by <strong>{ticket.userName}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">
                {ticket.userName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">
                {ticket.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                  ticket.status === "Open"
                    ? "bg-green-100 text-green-800"
                    : ticket.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : ticket.status === "Meeting"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {ticket.status || "Unknown"}
              </span>
            </div>
          </div>

          {/* Subject / Description */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Subject / Description</p>
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 text-sm text-gray-800 max-h-64 overflow-y-auto whitespace-pre-wrap">
              {ticket.ticketText || "No description provided"}
            </div>
          </div>

          {/* Reply Section */}
          {ticket.reply && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Admin Reply</p>
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-sm text-gray-800">
                {ticket.reply}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-sm text-gray-500">
            <strong>Created At:</strong>{" "}
            {ticket.timestamp
              ? ticket.timestamp._seconds
                ? new Date(ticket.timestamp._seconds * 1000).toLocaleString()
                : new Date(ticket.timestamp).toLocaleString()
              : "N/A"}
          </div>

          {/* Collaborators */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Collaborators
            </h2>
            {ticket.contributors && ticket.contributors.length > 0 ? (
              <ul className="space-y-1">
                {ticket.contributors.map((contributor: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-4 py-2"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {contributor.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      &lt;{contributor.email}&gt;
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No collaborators listed.</p>
            )}
          </div>

          {/* Teacher Section */}
          {ticket.teacher && ticket.category === "Teacher" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Teacher
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {(() => {
                  const teacherInfo = getTeacherInfo();
                  if (!teacherInfo) return null;

                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                            {teacherInfo.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">
                              {teacherInfo.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {teacherInfo.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                        Teacher Issue
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Show teacher info for Early Adopter category as well */}
          {ticket.teacher && ticket.category === "Early Adopter" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Mentoring Teacher
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                {(() => {
                  const teacherInfo = getTeacherInfo();
                  if (!teacherInfo) return null;

                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">
                            {teacherInfo.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">
                              {teacherInfo.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {teacherInfo.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                        Early Adopter
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Category Display */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Ticket Information
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full font-medium mt-1 ${
                      ticket.category === "Student"
                        ? "bg-green-100 text-green-800"
                        : ticket.category === "Teacher"
                        ? "bg-blue-100 text-blue-800"
                        : ticket.category === "Early Adopter"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ticket.category || "General"}
                  </span>
                </div>
                {(ticket.category === "Teacher" ||
                  ticket.category === "Early Adopter") &&
                  ticket.teacher && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500"> teacher</p>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {getTeacherInfo()?.name || "N/A"}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      {["chat", "meeting", "resolved"].includes(
        ticket.status?.toLowerCase() || ""
      ) && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => navigate(`/chat/${ticket.id}`)}
            className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white rounded-full px-5 py-3 shadow-lg transition-all duration-200"
            title="Open Chat"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Open Chat</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default ShowTicket;
