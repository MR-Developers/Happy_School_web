import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
      console.log("Challenge name:", challengeName);
      console.log("Decoded:", decodedChallengeName);
      console.log("School:", school);

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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Tasks for Challenge: {challengeName}
      </h1>
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((taskName) => (
            <li
              key={taskName}
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition"
              onClick={() =>
                navigate(`/useranswers/${challengeId}/${taskName}`)
              }
            >
              <p className="text-lg font-semibold">{taskName}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskPage;
