import { useEffect, useState } from "react";
import axios from "axios";
import Divider from "../components/Divider";

function YourTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/yourtickets/${email}`
        );
        setTickets(response.data.tickets || []);
      } catch (err) {
        console.error("Error fetching your tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [email]);

  return (
    <div>
      <h1 className="text-5xl text-black mt-4 ml-7">Tickets</h1>
      <Divider />
      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center text-gray-600">No tickets found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-orange-300 shadow-md rounded-lg p-4 bg-white"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Subject: {ticket.ticketText}
                </h2>
                <p>
                  <strong>Status:</strong> {ticket.status || "Pending"}
                </p>
                <p>
                  <strong>Token:</strong> {ticket.tocken}
                </p>
                <p>
                  <strong>Created:</strong> {ticket.timestamp}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default YourTickets;
