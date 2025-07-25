import React from "react";
import { useParams } from "react-router-dom";

const UserAnswersPage: React.FC = () => {
  const { challengeId, taskName } = useParams<{
    challengeId: string;
    taskName: string;
  }>();
  const decodedTaskName = decodeURIComponent(taskName || "");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Task Detail</h1>
      <p>
        <strong>Challenge ID:</strong> {challengeId}
      </p>
      <p>
        <strong>Task Name:</strong> {decodedTaskName}
      </p>
      {/* You can fetch task data here if needed */}
    </div>
  );
};

export default UserAnswersPage;
