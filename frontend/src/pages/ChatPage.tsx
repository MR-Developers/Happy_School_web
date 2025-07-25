import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MessageCircle } from "lucide-react";

interface Message {
  sent: boolean;
  sentBy: string;
  text: string;
  timestamp: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface ChatData {
  userName: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  messages: Message[];
}

const TEACHER_ID = "GaD7b2Vj9easeJwbyrRy2CRXPfm1";

function ChatPage() {
  const { ticketId } = useParams();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;

    const fetchChat = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/chat/${ticketId}`);
        setChatData(res.data.data);
      } catch (err) {
        console.error("Error fetching chat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [ticketId]);

  const formatTimestamp = (ts: { _seconds: number; _nanoseconds: number }) => {
    return new Date(ts._seconds * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-6 px-4">
      {loading ? (
        <p>Loading chat...</p>
      ) : !chatData ? (
        <p className="text-red-500">Chat not found or failed to load.</p>
      ) : (
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-orange-400 text-white sticky top-0 z-10">
            <MessageCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">
              Chat with {chatData.userName}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-4 p-4 overflow-y-auto h-[70vh] bg-gray-50">
            {chatData.messages?.map((msg, idx) => {
              const isTeacher = msg.sentBy === TEACHER_ID;

              return (
                <div
                  key={idx}
                  className={`flex ${
                    isTeacher ? "justify-start" : "justify-end"
                  } animate-fade-in`}
                >
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {isTeacher && (
                      <div className="w-8 h-8 bg-orange-300 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        H
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-md ${
                        isTeacher
                          ? "bg-white text-gray-800 border border-gray-200"
                          : "bg-orange-400 text-white"
                      }`}
                    >
                      <p className="text-sm leading-snug whitespace-pre-wrap">
                        {msg.text}
                      </p>
                      <p className="text-[10px] text-right opacity-60 mt-1">
                        {formatTimestamp(msg.timestamp)}
                      </p>
                    </div>
                    {!isTeacher && (
                      <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {chatData.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
