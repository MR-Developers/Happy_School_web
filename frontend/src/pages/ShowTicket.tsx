/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation } from "react-router-dom";

function ShowTicket() {
  const { state } = useLocation();
  const ticket = state?.ticket;

  if (!ticket) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">No ticket data provided.</p>
      </div>
    );
  }

  return (
    <section className="flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6 space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-center text-orange-600">
          Ticket Details
        </h1>

        {/* Ticket Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-orange-50 border border-orange-300 text-orange-800 rounded-md p-4">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-base font-semibold">{ticket.userName}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-base font-semibold">{ticket.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium ml-7">Status</p>
            <p className="text-base font-semibold ml-7">{ticket.status}</p>
          </div>
        </div>

        {/* Ticket Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject / Description
          </label>
          <textarea
            readOnly
            value={ticket.ticketText}
            className="w-full border border-orange-400 bg-orange-50 rounded-md p-3 text-sm resize-none"
            rows={4}
          />
        </div>

        {/* Reply Section */}
        {ticket.reply && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reply
            </label>
            <textarea
              readOnly
              value={ticket.reply}
              className="w-full border border-green-400 bg-green-50 rounded-md p-3 text-sm resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Timestamp & Token */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <strong>Created At:</strong> {ticket.timestamp}
          </div>
        </div>

        {/* Contributors */}
        <div>
          <h2 className="text-lg font-semibold text-orange-600 mb-2">
            Collaborators
          </h2>
          {ticket.contributors && ticket.contributors.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
              {ticket.contributors.map((contributor: any, index: number) => (
                <li key={index}>
                  <strong>{contributor.name}</strong>{" "}
                  <span className="text-gray-500">
                    &lt;{contributor.email}&gt;
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No Collaborators Listed.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ShowTicket;
