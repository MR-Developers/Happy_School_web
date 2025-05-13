import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserCircle } from "@fortawesome/free-solid-svg-icons";

function Divider() {
  return <div className="w-full h-px bg-gray-500 my-8" />;
}

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [teacherCount, setTeacherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    axios
      .get(`http://localhost:5000/get/teachers/${email}`)
      .then((res) => {
        const fetchedTeachers = res.data.teachers || [];
        // Sort by descending coins
        const sortedTeachers = fetchedTeachers.sort(
          (a, b) => (b.coins || 0) - (a.coins || 0)
        );
        setTeachers(sortedTeachers);
        setTeacherCount(res.data.noOfTechers || sortedTeachers.length);
      })
      .catch((err) => {
        console.error("Failed to fetch teachers:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-5xl text-black mt-4 ml-7">
        Teachers ({teacherCount})
      </h1>
      <Divider />

      {/* Search Input */}
      <div className="relative mt-6 ml-7">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          className="bg-white rounded-3xl w-[30%] h-9 pl-10 pr-4 text-sm focus:outline-none border border-gray-500"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Divider />

      {/* Column Headings */}
      <div className="grid grid-cols-6 gap-10 font-semibold px-4 mb-4">
        <div>Name</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Designation</div>
        <div>Coins</div>
        <div>Rank</div>
      </div>

      {/* Teacher Rows */}
      {filteredTeachers.map((teacher, index) => (
        <div
          key={teacher.id}
          className="grid grid-cols-6 gap-10 bg-gray-200 px-4 py-3 items-start rounded-md mb-2"
        >
          {/* Name + Profile */}
          <div className="flex items-center space-x-3">
            {teacher.profileImage ? (
              <img
                src={teacher.profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <FontAwesomeIcon
                icon={faUserCircle}
                className="text-3xl text-gray-400"
              />
            )}
            <span className="text-sm">{teacher.Name || "NaN"}</span>
          </div>

          {/* Email */}
          <div className="text-sm break-words">{teacher.email || "NaN"}</div>

          {/* Phone */}
          <div className="text-sm break-words">{teacher.phone || "NaN"}</div>

          {/* Designation */}
          <div className="text-sm">{teacher.role || "NaN"}</div>

          {/* Coins */}
          <div className="text-sm">{teacher.coins ?? "NaN"}</div>

          {/* Rank */}
          <div className="text-sm">{index + 1}</div>
        </div>
      ))}
    </div>
  );
}

export default Teachers;
