import { useEffect, useState } from "react";
// import Divider from "../components/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Ticket = {
  id: string;
  userName?: string;
  email?: string;
  ticketText?: string;
  status?: string;
  timestamp?: string;
  tocken?: string;
};

function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const email = localStorage.getItem("email");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/tickets/${email}`
        );
        setTickets(response.data.tickets || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [email]);

  const filteredTickets = tickets.filter((ticket) =>
    ticket.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/showticket/${ticket.id}?school=${typeof ticket.school === 'object' ? ticket.school.SchoolName : ticket.school}`, { state: { ticket } });
  };

  return (
    <div>
      <div className="flex flex-row">
        <h1 className="text-5xl text-black mt-4 ml-7">Tickets</h1>
        <button
          className="fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg w-40 h-15 text-xl"
          onClick={() => (window.location.href = "/addticket")}
        >
          Add Tickets +
        </button>
      </div>

      <div className="w-full h-px bg-gray-500 my-8" />

      <div className="relative mt-6 ml-7">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          className="bg-white rounded-3xl w-[30%] h-9 pl-10 pr-4 text-sm focus:outline-none border border-gray-500"
          placeholder="Search by teacher name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="w-full h-px bg-gray-500 my-8" />

      {loading ? (
        <div className="text-center text-gray-500 mt-10 text-lg">
          Loading tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 text-lg">
          No data found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-6 gap-10 font-semibold px-4 mb-4">
            <div>Teacher Name</div>
            <div>Email</div>
            <div>Subject</div>
            <div>Status</div>
            <div>Created At</div>
            <div>Token</div>
          </div>

          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => handleTicketClick(ticket)}
              className="cursor-pointer grid grid-cols-6 gap-10 bg-gray-100 px-4 py-3 items-start rounded-md mb-2 hover:bg-gray-200"
            >
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="text-3xl text-gray-400"
                />
                <span className="text-sm">{ticket.userName || "NaN"}</span>
              </div>
              <div className="text-sm break-words">{ticket.email || "NaN"}</div>
              <div className="text-sm break-words">
                {ticket.ticketText && ticket.ticketText.length > 20
                  ? `${ticket.ticketText.slice(0, 10)}...`
                  : ticket.ticketText || "NaN"}
              </div>

              <div className="text-sm">{ticket.status || "Pending"}</div>
              <div className="text-sm">{ticket.timestamp || "Unknown"}</div>
              <div className="text-sm">{ticket.tocken ?? "NaN"}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Tickets;
