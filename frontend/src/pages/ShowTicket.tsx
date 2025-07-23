/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation } from "react-router-dom";

function ShowTicket() {
  const { state } = useLocation();
  const ticket = state?.ticket;

  if (!ticket) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">No ticket data provided.</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-orange-600 text-white px-6 py-5">
          <h1 className="text-2xl font-bold">Support Ticket Details</h1>
          <p className="text-sm text-orange-100 mt-1">
            Ticket submitted by <strong>{ticket.userName}</strong>
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Ticket Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{ticket.userName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{ticket.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span
                className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                  ticket.status === "Open"
                    ? "bg-green-100 text-green-800"
                    : ticket.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {ticket.status}
              </span>
            </div>
          </div>

          {/* Subject / Description */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Subject / Description</p>
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 text-sm text-gray-800 max-h-64 overflow-y-auto whitespace-pre-wrap">
              {ticket.ticketText}
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
            <strong>Created At:</strong> {ticket.timestamp}
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
          {ticket.teacher && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Concerned Teacher
              </h2>
              <div className="bg-gray-100 border border-gray-200 rounded p-3 text-sm text-gray-700">
                <strong>{ticket.teacher}</strong>{" "}
                <span className="text-gray-500">&lt;{ticket.teacher}&gt;</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {ticket.status?.toLowerCase() === "chat" && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => console.log("Start chat or redirect")}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full px-5 py-3 shadow-lg transition-all duration-200"
            title="Open Chat"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-medium">Open Chat</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default ShowTicket;
