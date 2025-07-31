import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BookOpen } from "lucide-react"; // Optional: install lucide-react or use any icon lib

const TaskPage: React.FC = () => {
  const { challengeName } = useParams<{ challengeName: string }>();
  const { challengeId } = useParams<{ challengeId: string }>();
  const [tasks, setTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const decodedChallengeName = decodeURIComponent(challengeName || "");
  const school = localStorage.getItem("school");
  const navigate = useNavigate();

  useEffect(() => {
    if (!school || !challengeName) {
      setError("School or challenge name is missing.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/tasks/${school}/${decodedChallengeName}`)
      .then((res) => {
        setTasks(res.data.tasks || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks.");
        setLoading(false);
      });
  }, [school, decodedChallengeName, challengeName]);

  if (loading) return <div className="p-6 text-gray-500">Loading tasks...</div>;
  if (error)
    return <div className="p-6 text-red-500 font-semibold">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
        Tasks in <span className="text-orange-600">{decodedChallengeName}</span>
      </h1>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No tasks found for this challenge.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          {tasks.map((taskName) => (
            <div
              key={taskName}
              onClick={() =>
                navigate(`/useranswers/${challengeId}/${taskName}`)
              }
              className="cursor-pointer bg-white hover:bg-orange-50 border border-gray-200 rounded-xl p-5 shadow-md transition-all duration-200 flex items-start gap-4"
            >
              <div className="bg-orange-600 text-white p-3 rounded-full">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {taskName}
                </p>
                <p className="text-sm text-gray-500">Click to view answers</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskPage;
