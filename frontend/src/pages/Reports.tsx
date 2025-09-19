import { motion } from "framer-motion";
import { GraduationCap, Users } from "lucide-react";

export default function ReportSelectionPage() {
  const school = localStorage.getItem("school"); // read school from localStorage

  // Map links per school
  const schoolLinks: Record<string, { student: string; teacher: string }> = {
    "Johnson Grammar School - Mallapur": {
      student:
        "https://lookerstudio.google.com/reporting/866b05d1-ac15-4e39-b43a-f290375a24c1",
      teacher:
        "https://lookerstudio.google.com/reporting/91b64ad6-164a-460c-b185-67bb6411de4f",
    },
    "Johnson Grammar School - Habsiguda": {
      student:
        "https://lookerstudio.google.com/reporting/51bd87fe-b531-4283-adbd-7bbedc5da1c6",
      teacher:
        "https://lookerstudio.google.com/reporting/ddaa686d-c232-4fe4-8601-5ff18005dac3",
    },
    // add more schools as needed
  };

  const defaultLinks = {
    student:
      "https://lookerstudio.google.com/reporting/51bd87fe-b531-4283-adbd-asdgsdagsa",
    teacher:
      "https://lookerstudio.google.com/reporting/91b64ad6-164a-460c-b185-sdghadsfgh",
  };

  const links = schoolLinks[school ?? ""] || defaultLinks;

  const options = [
    {
      title: "Student Report",
      description: "View detailed performance and attendance reports.",
      icon: GraduationCap,
      link: links.student,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Teacher Report",
      description: "Access teaching insights and feedback reports.",
      icon: Users,
      link: links.teacher,
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {options.map((opt, i) => (
          <motion.a
            key={i}
            href={opt.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-br ${opt.color} rounded-2xl shadow-lg p-8 text-white flex flex-col items-center justify-center cursor-pointer transition-transform duration-300`}
          >
            <opt.icon size={48} className="mb-4" />
            <h2 className="text-2xl font-bold mb-2">{opt.title}</h2>
            <p className="text-sm opacity-90 text-center">{opt.description}</p>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
