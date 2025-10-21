import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Typography, Spin, Space, Select, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
const { Title } = Typography;

type Contributor = {
  name: string;
  email: string;
};

type Ticket = {
  school: string;
  id: string;
  ticketText: string;
  status?: string;
  tocken?: number;
  timestamp?: string;
  contributors?: Contributor[];
  userName?: string;
  email?: string;
  category?: string;
  teacher?: string;
};

interface Teacher {
  id?: string;
  Name?: string;
  email?: string;
  phone?: string;
  role?: string;
  coins?: number;
  profileImage?: string;
}

function CounselorTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const [showFilters, setShowFilters] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedTeacherEmail, setSelectedTeacherEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const toggleFilters = () => setShowFilters((prev) => !prev);

  const getTeacherNameByEmail = (teacherEmail: string) => {
    const teacher = teachers.find((t) => t.email === teacherEmail);
    return teacher?.Name || "Teacher";
  };

  const renderTicketSubject = (text: string) => {
    if (text && text.length > 20) {
      return (
        <Tooltip
          title={text}
          overlayStyle={{
            backgroundColor: "#ea580c",
            color: "white",
            fontSize: "14px",
            borderRadius: "8px",
            padding: "8px 12px",
            maxWidth: 400,
          }}
          overlayInnerStyle={{
            backgroundColor: "#ea580c",
            color: "white",
          }}
        >
          <span className="font-semibold text-indigo-600 text-sm sm:text-base cursor-pointer">
            {text.substring(0, 30)}...
          </span>
        </Tooltip>
      );
    }
    return (
      <span className="font-semibold text-indigo-600 text-sm sm:text-base">
        {text}
      </span>
    );
  };

  const formatTimestamp = (time: any) => {
    if (!time) return "N/A";

    if (time._seconds) {
      const date = new Date(time._seconds * 1000);
      return date.toLocaleString();
    }

    if (typeof time === "string") {
      const parsed = dayjs(time, "DD/MM/YYYY hh:mm A");
      if (!parsed.isValid()) {
        return "Invalid Date";
      }
      return parsed.format("DD/MM/YYYY hh:mm A");
    }

    return time.toLocaleString();
  };

  useEffect(() => {
    if (!email) return;

    const fetchFilteredTickets = async () => {
      setLoading(true);
      try {
        const params = {
          status: selectedStatus || undefined,
          teacher: selectedTeacherEmail || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          category: selectedCategory || undefined,
        };

        const response = await axios.get(
          `http://localhost:5000/counselortickets/${email}`,
          { params }
        );
        const fetched = response.data.tickets || [];
        console.log("Fetched tickets:", fetched);
        setTickets(fetched);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredTickets();
  }, [
    email,
    selectedStatus,
    selectedTeacher,
    fromDate,
    toDate,
    selectedCategory,
    selectedTeacherEmail,
  ]);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    axios
      .get(`http://localhost:5000/counselorteachers/${email}`)
      .then((res) => {
        const fetched = res.data.teachers || [];
        const sorted = fetched.sort(
          (a: Teacher, b: Teacher) => (b.coins ?? 0) - (a.coins ?? 0)
        );
        setTeachers(sorted);
      })
      .catch((err) => console.error("Error fetching teachers:", err))
      .finally(() => null);
  }, []);

  const columns = [
    {
      title: "Subject",
      dataIndex: "ticketText",
      key: "ticketText",
      render: (text: string) => renderTicketSubject(text),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Ticket Raised"
            ? "orange"
            : status === "Resolved"
            ? "green"
            : "blue";
        return <Tag color={color}>{status || "Pending"}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (time: any) => {
        const formatted = formatTimestamp(time);
        return (
          <span className="text-gray-600 text-xs sm:text-sm">{formatted}</span>
        );
      },
    },
    {
      title: "School",
      dataIndex: "school",
      key: "school",
      render: (text: string) =>
        text ? (
          <span className="text-gray-700 text-sm">{text}</span>
        ) : (
          <div className="text-center text-gray-400 font-medium">-</div>
        ),
    },

    {
      title: "Raised on",
      key: "raisedOn",
      render: (record: Ticket) => {
        if (record.category === "Teacher" && record.teacher) {
          const teacherName = getTeacherNameByEmail(record.teacher);
          return (
            <Tag color="green" className="font-medium">
              {teacherName}
            </Tag>
          );
        } else if (record.category === "Student") {
          return (
            <Tag color="blue" className="font-medium">
              Student
            </Tag>
          );
        } else if (record.category === "Early Adopter") {
          return (
            <Tag color="purple" className="font-medium">
              Early Adopter
            </Tag>
          );
        } else {
          return (
            <Tag color="default" className="font-medium">
              Student
            </Tag>
          );
        }
      },
    },
    {
      title: "Collaborators",
      dataIndex: "contributors",
      key: "contributors",
      render: (contributors?: Contributor[]) => {
        if (!contributors || contributors.length === 0) {
          return <Tag color="default">None</Tag>;
        }
        return (
          <Space wrap>
            {contributors.map((c) => (
              <Tag key={c.email} color="cyan">
                {c.name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Raised By",
      dataIndex: "userName",
      key: "userName",
      render: (userName: string) => (
        <span className="text-gray-600 text-xs sm:text-sm">
          {userName || "Anonymous"}
        </span>
      ),
    },
  ];

  const TicketCard = ({ ticket }: { ticket: Ticket }) => {
    const getStatusColor = (status?: string) => {
      return status === "Ticket Raised"
        ? "orange"
        : status === "Resolved"
        ? "green"
        : "blue";
    };

    const getRaisedOnTag = () => {
      if (ticket.category === "Teacher" && ticket.teacher) {
        const teacherName = getTeacherNameByEmail(ticket.teacher);
        return (
          <Tag color="green" className="font-medium text-xs">
            {teacherName}
          </Tag>
        );
      } else if (ticket.category === "Student") {
        return (
          <Tag color="blue" className="font-medium text-xs">
            Student
          </Tag>
        );
      } else if (ticket.category === "Early Adopter") {
        return (
          <Tag color="purple" className="font-medium text-xs">
            Early Adopter
          </Tag>
        );
      } else {
        return (
          <Tag color="default" className="font-medium text-xs">
            Student
          </Tag>
        );
      }
    };

    return (
      <div
        onClick={() => navigate("/showticket", { state: { ticket } })}
        className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Subject</div>
          {renderTicketSubject(ticket.ticketText)}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <Tag color={getStatusColor(ticket.status)}>
              {ticket.status || "Pending"}
            </Tag>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Category</div>
            <Tag color="blue">{ticket.category || "Student"}</Tag>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Raised On</div>
          {getRaisedOnTag()}
        </div>

        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Collaborators</div>
          {!ticket.contributors || ticket.contributors.length === 0 ? (
            <Tag color="default" className="text-xs">
              None
            </Tag>
          ) : (
            <Space wrap>
              {ticket.contributors.map((c) => (
                <Tag key={c.email} color="cyan" className="text-xs">
                  {c.name}
                </Tag>
              ))}
            </Space>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500">Created: </span>
            <span className="text-gray-700">
              {formatTimestamp(ticket.timestamp)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-500">By: </span>
            <span className="text-gray-700">
              {ticket.userName || "Anonymous"}
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-gray-500 w-20 flex-shrink-0">School:</span>
            <span className="text-gray-700">{ticket.school || "-"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Title level={2} className="text-orange-600 m-0 text-xl sm:text-2xl">
            School Tickets{" "}
            <span className="text-gray-500 text-base sm:text-lg">
              ({tickets.length})
            </span>
          </Title>
          <div className="flex-1" />
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 bg-white hover:bg-orange-100 text-orange-600 border border-orange-300 px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium text-sm flex-1 sm:flex-initial justify-center"
              onClick={toggleFilters}
            >
              <FilterOutlined />
              <span className="hidden sm:inline">Filter</span>
            </button>

            <button
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white border border-orange-600 px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium text-sm flex-1 sm:flex-initial justify-center"
              onClick={() => (window.location.href = "/counseloraddticket")}
            >
              <PlusOutlined />
              Add Ticket
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="relative sm:absolute sm:top-12 sm:right-0 mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm text-gray-700"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="ticketraised">Ticket Raised</option>
                <option value="reply">Reply</option>
                <option value="chat">Chat</option>
                <option value="meeting">Meeting</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Select Teacher
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Search teachers"
                optionFilterProp="children"
                className="w-full"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                value={selectedTeacher}
                onChange={(value) => {
                  setSelectedTeacher(value);
                  setSelectedTeacherEmail(
                    teachers.find((t) => t.email === value)?.email || ""
                  );
                }}
              >
                {teachers.map((teacher) => (
                  <Select.Option key={teacher.email} value={teacher.email}>
                    {teacher.Name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Date Range
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <input
                  type="date"
                  className="w-full sm:flex-1 border rounded-md px-3 py-2 text-sm text-gray-700"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <span className="text-gray-500 text-sm whitespace-nowrap">
                  to
                </span>
                <input
                  type="date"
                  className="w-full sm:flex-1 border rounded-md px-3 py-2 text-sm text-gray-700"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Category
              </label>
              <div className="flex flex-col gap-2 text-sm text-gray-700">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategory === "Student"}
                    onChange={() =>
                      setSelectedCategory(
                        selectedCategory === "Student" ? "" : "Student"
                      )
                    }
                  />
                  <span className="ml-2">Student</span>
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategory === "Teacher"}
                    onChange={() =>
                      setSelectedCategory(
                        selectedCategory === "Teacher" ? "" : "Teacher"
                      )
                    }
                  />
                  <span className="ml-2">Teacher</span>
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategory === "Early Adopter"}
                    onChange={() =>
                      setSelectedCategory(
                        selectedCategory === "Early Adopter"
                          ? ""
                          : "Early Adopter"
                      )
                    }
                  />
                  <span className="ml-2">Early Adopter</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:underline order-1 sm:order-none"
                onClick={() => setShowFilters(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-red-600 border border-red-400 rounded-md hover:bg-red-100"
                onClick={() => {
                  setSelectedStatus("");
                  setSelectedTeacher("");
                  setSelectedTeacherEmail("");
                  setFromDate("");
                  setToDate("");
                  setSelectedCategory("");
                  setShowFilters(false);
                }}
              >
                Clear Filters
              </button>
              <button
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                onClick={() => {
                  setShowFilters(false);
                  console.log("Apply filters");
                }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spin tip="Loading tickets..." size="large" />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table
              columns={columns}
              dataSource={tickets}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              bordered
              onRow={(record) => ({
                onClick: () => {
                  navigate("/showticket", { state: { ticket: record } });
                },
              })}
              className="cursor-pointer rounded-xl shadow-md bg-white"
            />
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {tickets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No tickets found
              </div>
            ) : (
              tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CounselorTickets;
