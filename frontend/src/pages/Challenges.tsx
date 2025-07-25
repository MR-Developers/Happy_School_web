import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ⬅️ Import this

type ChallengeMap = {
  [id: string]: string;
};

const ChallengePage: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // ⬅️ Initialize the hook

  const school = localStorage.getItem("school");

  useEffect(() => {
    if (!school) {
      setError("School not found in local storage.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/challenges/${school}`)
      .then((res) => {
        setChallenges(res.data.challenges || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching challenges:", err);
        setError("Failed to fetch challenges.");
        setLoading(false);
      });
  }, [school]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Challenges for {school}</h1>
      {Object.keys(challenges).length === 0 ? (
        <p>No challenges found.</p>
      ) : (
        <ul className="space-y-2">
          {Object.entries(challenges).map(([id, name]) => (
            <li
              key={id}
              className="bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-200 transition-all"
              onClick={() => navigate(`/tasks/${encodeURI(name)}/${id}`)}
            >
              <p className="text-lg font-semibold">{name}</p>
              <p className="text-sm text-gray-500">ID: {id}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChallengePage;
