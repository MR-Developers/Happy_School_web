import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users } from "lucide-react";
import axios from "axios";
import { message, Spin } from "antd";

export default function ReportSelectionPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<{
    studentRefReport?: string;
    teacherRefReport?: string;
    schoolName?: string;
  } | null>(null);
  const [error, setError] = useState("");

  // Base API URL
  const baseURL = "http://localhost:5000";

  const schoolName = localStorage.getItem("school");

  // Fetch reports when component mounts
  useEffect(() => {
    if (!schoolName) {
      setError("School name not found in local storage");
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/reports/getSchoolReports/${encodeURIComponent(
            schoolName
          )}`
        );
        setReports(response.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    console.log("data ", reports);
  }, [schoolName]);

  // Handle opening a report
  const handleOpenReport = (link?: string) => {
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

  // Prepare options dynamically
  const options = [
    {
      title: "Student Report",
      description: "View detailed performance and attendance reports.",
      icon: GraduationCap,
      link: reports?.studentRefReport,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Teacher Report",
      description: "Access teaching insights and feedback reports.",
      icon: Users,
      link: reports?.teacherRefReport,
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {options.map((opt, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenReport(opt.link)}
            className={`bg-gradient-to-br ${opt.color} rounded-2xl shadow-lg p-8 text-white flex flex-col items-center justify-center cursor-pointer transition-transform duration-300`}
          >
            <opt.icon size={48} className="mb-4" />
            <h2 className="text-2xl font-bold mb-2">{opt.title}</h2>
            <p className="text-sm opacity-90 text-center">{opt.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
