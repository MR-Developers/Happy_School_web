import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Challenge = {
  id: string;
  name: string;
  school: string;
};

type SchoolChallenges = {
  school: string;
  challenges: {
    [id: string]: string;
  };
};

type ApiResponse = {
  message: string;
  totalSchoolsRequested: number;
  totalWithChallenges: number;
  failedCount: number;
  failedSchools: Array<{
    school: string;
    reason: string;
  }>;
  data: SchoolChallenges[];
};

const CounselorChallengePage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedSchools, setFailedSchools] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    axios
      .get<ApiResponse>(`http://localhost:5000/counselorchallenges/${email}`)
      .then((res) => {
        const flattenedChallenges: Challenge[] = [];

        // Flatten challenges from all schools
        res.data.data.forEach((schoolData) => {
          Object.entries(schoolData.challenges).forEach(([id, name]) => {
            flattenedChallenges.push({
              id,
              name,
              school: schoolData.school,
            });
          });
        });

        setChallenges(flattenedChallenges);

        // Store failed schools info
        if (res.data.failedSchools && res.data.failedSchools.length > 0) {
          setFailedSchools(res.data.failedSchools.map((f) => f.school));
        }

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
  }, []);

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
          Challenges
        </h1>

        {failedSchools.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Unable to fetch challenges from:{" "}
              {failedSchools.join(", ")}
            </p>
          </div>
        )}

        {challenges.length === 0 ? (
          <div className="text-center text-gray-600 text-lg mt-12">
            No challenges found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() =>
                  navigate(
                    `/counselortasks/${encodeURI(challenge.name)}/${
                      challenge.id
                    }/${challenge.school}`
                  )
                }
                className="p-6 bg-white rounded-xl shadow-md border border-gray-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {challenge.name}
                </h2>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <p>Challenge ID: {challenge.id}</p>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                    {challenge.school}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorChallengePage;
