import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

interface Teacher {
  Name: string;
  email: string;
  coins?: number;
  role?: string; // Added role property
}

const COLORS = ["#22c55e", "#ef4444"]; // green for answered, red for unanswered

const UserAnswersPage: React.FC = () => {
  const { challengeId, taskName } = useParams<{
    challengeId: string;
    taskName: string;
  }>();
  const decodedTaskName = decodeURIComponent(taskName || "");
  const [answeredTeachers, setAnsweredTeachers] = useState<Teacher[]>([]);
  const [unansweredTeachers, setUnansweredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email || !challengeId || !decodedTaskName) return;

    const trimmedTaskName = decodedTaskName;
    debugger;
    const fetchData = async () => {
      try {
        debugger;
        const teacherRes = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/teachers/${email}`
        );
        const allTeachers: Teacher[] = teacherRes.data.teachers || [];
        console.log("teachers fetched:", allTeachers);

        // Filter out principals
        const filteredTeachers = allTeachers.filter(
          (teacher) => teacher.role?.toLowerCase() !== "principal"
        );

        const docRes = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/task-ans/${challengeId}/${encodeURIComponent(
            trimmedTaskName
          )}`
        );
        const answeredEmails: string[] = docRes.data.documentNames || [];

        const answered: Teacher[] = [];
        const unanswered: Teacher[] = [];

        filteredTeachers.forEach((teacher) => {
          const email = teacher.email?.trim()?.toLowerCase();
          if (answeredEmails.includes(email)) {
            answered.push(teacher);
          } else {
            unanswered.push(teacher);
          }
        });

        setAnsweredTeachers(
          answered.sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0))
        );
        setUnansweredTeachers(
          unanswered.sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0))
        );
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [challengeId, decodedTaskName]);

  //PDF DOWNLOAD FUNCTION
  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();

  //   doc.setFontSize(18);
  //   doc.text(`Task Report: ${taskName}`, 14, 20);

  //   // Title for answered section
  //   doc.setFontSize(14);
  //   doc.text("Answered Teachers", 14, 30);

  //   // Answered teachers table
  //   autoTable(doc, {
  //     startY: 35,
  //     head: [["Name", "Email", "Coins"]],
  //     body: answeredTeachers.map((t) => [t.Name, t.email, t.coins ?? "-"]),
  //     headStyles: { fillColor: [34, 197, 94] }, // green
  //     styles: { halign: "left" },
  //   });

  //   // Title for unanswered section
  //   const nextY = (doc as any).lastAutoTable.finalY + 10;
  //   doc.setFontSize(14);
  //   doc.text("Unanswered Teachers", 14, nextY);

  //   // Unanswered teachers table
  //   autoTable(doc, {
  //     startY: nextY + 5,
  //     head: [["Name", "Email", "Coins"]],
  //     body: unansweredTeachers.map((t) => [t.Name, t.email, t.coins ?? "-"]),
  //     headStyles: { fillColor: [239, 68, 68] }, // red
  //     styles: { halign: "left" },
  //   });

  //   doc.save(`Task_Report_${taskName}.pdf`);
  // };

  const handleDownloadExcel = () => {
    // Prepare worksheet for Answered Teachers
    const answeredData = [
      ["Name", "Email", "Coins"], // Header row
      ...answeredTeachers.map((t) => [t.Name, t.email, t.coins ?? "-"]),
    ];
    const answeredSheet = XLSX.utils.aoa_to_sheet(answeredData);

    // Prepare worksheet for Unanswered Teachers
    const unansweredData = [
      ["Name", "Email", "Coins"],
      ...unansweredTeachers.map((t) => [t.Name, t.email, t.coins ?? "-"]),
    ];
    const unansweredSheet = XLSX.utils.aoa_to_sheet(unansweredData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, answeredSheet, "Answered Teachers");
    XLSX.utils.book_append_sheet(
      workbook,
      unansweredSheet,
      "Unanswered Teachers"
    );

    // Download Excel file
    XLSX.writeFile(workbook, `Task_Report_${decodedTaskName}.xlsx`);
  };

  const renderTeacherList = (teachers: Teacher[]) => (
    <ul className="space-y-3">
      {teachers.map((teacher, index) => (
        <li
          key={index}
          className="bg-gray-100 hover:bg-gray-200 transition p-3 rounded-md text-gray-800 shadow-sm"
        >
          <div className="font-semibold">{teacher.Name}</div>
          <div className="text-sm text-gray-600">{teacher.email}</div>
          {teacher.coins !== undefined && (
            <div className="text-xs text-gray-500">Coins: {teacher.coins}</div>
          )}
        </li>
      ))}
    </ul>
  );

  const chartData = [
    { name: "Complete", value: answeredTeachers.length },
    { name: "In Complete", value: unansweredTeachers.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Task: {decodedTaskName}
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : (
        <>
          {/* Pie Chart Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-4">
              Completion Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: ${(
                      ((value ?? 0) /
                        (answeredTeachers.length + unansweredTeachers.length)) *
                      100
                    ).toFixed(1)}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end mb-6">
            <button
              onClick={handleDownloadExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              Download Report
            </button>
          </div>

          {/* Answered and Unanswered Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
              <h3 className="text-xl font-semibold text-green-700 mb-4 border-b pb-2">
                Teachers Who Completed The Task ({answeredTeachers.length})
              </h3>
              <div className="flex-1 overflow-y-auto max-h-96 pr-2">
                {answeredTeachers.length > 0 ? (
                  renderTeacherList(answeredTeachers)
                ) : (
                  <p className="text-gray-500 italic">
                    No teachers have answered yet.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
              <h3 className="text-xl font-semibold text-red-700 mb-4 border-b pb-2">
                Teachers Who did not Completed The Task (
                {unansweredTeachers.length})
              </h3>
              <div className="flex-1 overflow-y-auto max-h-96 pr-2">
                {unansweredTeachers.length > 0 ? (
                  renderTeacherList(unansweredTeachers)
                ) : (
                  <p className="text-gray-500 italic">
                    All teachers have answered.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserAnswersPage;
