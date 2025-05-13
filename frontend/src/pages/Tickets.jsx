import Divider from "../components/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserCircle } from "@fortawesome/free-solid-svg-icons";
function Tickets() {
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
      <Divider />
      <div className="relative mt-6 ml-7">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          className="bg-white rounded-3xl w-[30%] h-9 pl-10 pr-4 text-sm focus:outline-none border border-gray-500"
          placeholder="Search"
        />
      </div>
      <Divider />
    </div>
  );
}

export default Tickets;
