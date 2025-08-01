import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type ChallengeMap = {
  [id: string]: string;
};

const ChallengePage: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const school = localStorage.getItem("school");

  useEffect(() => {
    if (!school) {
      setError("School not found in local storage.");
      setLoading(false);
      return;
    }

    axios
      .get(`https://api-rim6ljimuq-uc.a.run.app/get/challenges/${school}`)
      .then((res) => {
        setChallenges(res.data.challenges || {});
        setLoading(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setError("No challenges found for this school.");
        } else {
          console.error("Error fetching challenges:", err);
          setError("Failed to fetch challenges.");
        }
        setLoading(false);
      });
  }, [school]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-medium text-gray-700">
        Loading challenges...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-orange-400 mb-6">
          Challenges for{" "}
          <span className="text-gray-800 underline decoration-orange-400">
            {school}
          </span>
        </h1>

        {Object.keys(challenges).length === 0 ? (
          <div className="text-center text-gray-600 text-lg mt-12">
            No challenges found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            {Object.entries(challenges).map(([id, name]) => (
              <div
                key={id}
                onClick={() => navigate(`/tasks/${encodeURI(name)}/${id}`)}
                className="p-6 bg-white rounded-xl shadow-md border border-gray-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {name}
                </h2>
                <p className="text-sm text-gray-500">Challenge ID: {id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengePage;
