import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

function Teachers() {
  const [teacherCount, setTeacherCount] = useState(0);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const email = localStorage.getItem("email");

    if (!email) return;

    axios
      .get(`http://localhost:5000/get/teachers/${email}`)
      .then((res) => {
        const teachers = res.data.teachers || [];
        setTeacherCount(teachers.length);
      })
      .catch((err) => {
        console.error("Failed to fetch teachers:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
      <div className="w-full h-px bg-gray-500 mt-10"></div>
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
      <div className="w-full h-px bg-gray-500 mt-8"></div>
    </div>
  );
}

export default Teachers;
