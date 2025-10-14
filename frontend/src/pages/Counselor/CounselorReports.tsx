import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, School } from "lucide-react";
import axios from "axios";
import { message, Spin, Select } from "antd";

interface SchoolReport {
  schoolId: string;
  schoolName: string;
  studentRefReport: string | null;
  teacherRefReport: string | null;
}

interface ApiResponse {
  message: string;
  totalSchools: number;
  totalWithReports: number;
  data: SchoolReport[];
}

export default function CounselorReports() {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolReport[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolReport | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    const fetchReports = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `http://localhost:5000/counselorreports/${email}`
        );
        setSchools(response.data.data);

        // Auto-select first school if available
        if (response.data.data.length > 0) {
          setSelectedSchool(response.data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Handle opening a report
  const handleOpenReport = (link?: string | null) => {
    if (!link) {
      message.error("Report link not available for this school.");
      return;
    }
    window.open(link, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading reports..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        No reports available
      </div>
    );
  }

  const schoolOptions = schools.map((school) => ({
    label: school.schoolName,
    value: school.schoolId,
  }));

  const options = [
    {
      title: "Student Report",
      description: "View detailed performance and attendance reports.",
      icon: GraduationCap,
      link: selectedSchool?.studentRefReport,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Teacher Report",
      description: "Access teaching insights and feedback reports.",
      icon: Users,
      link: selectedSchool?.teacherRefReport,
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* School Selector */}
      <div className="mb-8 w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <School className="text-orange-500" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Select School</h2>
          </div>
          <Select
            showSearch
            placeholder="Choose a school"
            optionFilterProp="children"
            className="w-full"
            size="large"
            value={selectedSchool?.schoolId}
            onChange={(value) => {
              const school = schools.find((s) => s.schoolId === value);
              setSelectedSchool(school || null);
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={schoolOptions}
          />
          {selectedSchool && (
            <div className="mt-3 text-sm text-gray-600">
              Selected:{" "}
              <span className="font-semibold">{selectedSchool.schoolName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Report Cards */}
      {selectedSchool ? (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {options.map((opt, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenReport(opt.link)}
              className={`bg-gradient-to-br ${opt.color} rounded-2xl shadow-lg p-8 text-white flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 relative`}
            >
              {!opt.link && (
                <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                  Not Available
                </div>
              )}
              <opt.icon size={48} className="mb-4" />
              <h2 className="text-2xl font-bold mb-2">{opt.title}</h2>
              <p className="text-sm opacity-90 text-center">
                {opt.description}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Please select a school to view reports
        </div>
      )}
    </div>
  );
}
