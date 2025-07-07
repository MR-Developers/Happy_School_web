import { useLocation } from "react-router-dom";

function ShowTicket() {
  const { state } = useLocation();
  const ticket = state?.ticket;

  if (!ticket) {
    return <div className="text-center mt-10">No ticket data provided.</div>;
  }

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="w-full max-w-3xl p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-orange-600 text-center">
          Ticket Details
        </h1>

        {/* Orange Row for Name, Email, Status */}
        <div className="flex justify-between items-center bg-orange-100 border border-orange-400 text-orange-700 rounded-md px-4 py-3 mb-6">
          <div>
            <strong>Name:</strong> {ticket.userName}
          </div>
          <div>
            <strong>Email:</strong> {ticket.email}
          </div>
          <div>
            <strong>Status:</strong> {ticket.status}
          </div>
        </div>

        {/* Subject Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject / Ticket Description:
          </label>
          <textarea
            readOnly
            value={ticket.ticketText}
            className="w-full border-2 border-orange-500 rounded-lg p-3 text-sm resize-y min-h-[120px] focus:outline-none bg-gray-50"
          />
        </div>

        {/* Timestamp and Token */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
          <div>
            <strong>Created At:</strong> {ticket.timestamp}
          </div>
          <div>
            <strong>Token:</strong> {ticket.tocken}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowTicket;
