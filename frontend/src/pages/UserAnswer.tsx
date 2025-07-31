import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Teacher {
  Name: string;
  email: string;
  coins?: number;
}

const UserAnswersPage: React.FC = () => {
  const { challengeId, taskName } = useParams<{
    challengeId: string;
    taskName: string;
  }>();

  const [answeredTeachers, setAnsweredTeachers] = useState<Teacher[]>([]);
  const [unansweredTeachers, setUnansweredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email || !challengeId || !taskName) return;

    const trimmedTaskName = taskName.trim();

    const fetchData = async () => {
      try {
        // Fetch all teachers
        const teacherRes = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/teachers/${email}`
        );
        const allTeachers: Teacher[] = teacherRes.data.teachers || [];

        // Fetch document names (emails who answered)
        const docRes = await axios.get(
          `http://localhost:5000/answers/${challengeId}/${trimmedTaskName}`
        );
        const answeredEmails: string[] = docRes.data.documentNames || [];

        const answered: Teacher[] = [];
        const unanswered: Teacher[] = [];

        allTeachers.forEach((teacher) => {
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
  }, [challengeId, taskName]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Task: {taskName}
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Answered */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-green-700 mb-4 border-b pb-2">
              Teachers Who Completed The Task ({answeredTeachers.length})
            </h3>
            {answeredTeachers.length > 0 ? (
              renderTeacherList(answeredTeachers)
            ) : (
              <p className="text-gray-500 italic">
                No teachers have answered yet.
              </p>
            )}
          </div>

          {/* Not Answered */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-red-700 mb-4 border-b pb-2">
              Teachers Who Haven't Completed The Task (
              {unansweredTeachers.length})
            </h3>
            {unansweredTeachers.length > 0 ? (
              renderTeacherList(unansweredTeachers)
            ) : (
              <p className="text-gray-500 italic">
                All teachers have answered.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnswersPage;
