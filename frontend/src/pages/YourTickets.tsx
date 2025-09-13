import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Table, Tag, Typography, Spin, Space, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;

type Contributor = {
  name: string;
  email: string;
};

type Ticket = {
  id: string;
  ticketText: string;
  status?: string;
  tocken?: number;
  timestamp?: string;
  contributors?: Contributor[];
  userName?: string;
  email?: string;
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
function YourTickets() {
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
          `https://api-rim6ljimuq-uc.a.run.app/sesson/all-tickets/${email}`,
          { params }
        );
        const fetched = response.data.tickets || [];
        console.log("Fetched tickets:", fetched);
        setTickets(fetched); // ✅ Correct
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
      .get(`https://api-rim6ljimuq-uc.a.run.app/teachers/${email}`)
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
      render: (text: string) => (
        <span className="font-semibold text-indigo-600 text-base">{text}</span>
      ),
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
        if (!time) return <span className="text-gray-600">N/A</span>;

        // Firestore timestamp
        if (time._seconds) {
          const date = new Date(time._seconds * 1000);
          return <span className="text-gray-600">{date.toLocaleString()}</span>;
        }

        // If it's a string in DD/MM/YYYY hh:mm A
        if (typeof time === "string") {
          const parsed = dayjs(time, "DD/MM/YYYY hh:mm A");
          if (!parsed.isValid()) {
            return <span className="text-red-600">Invalid Date</span>;
          }
          return (
            <span className="text-gray-600">
              {parsed.format("DD/MM/YYYY hh:mm A")}
            </span>
          );
        }

        // If it's already a Date
        return <span className="text-gray-600">{time.toLocaleString()}</span>;
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => (
        <Tag color="blue">{category || "Student"}</Tag>
      ),
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
        <span className="text-gray-600">{userName || "Anonymous"}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Title + Filter Row */}
      <div className="flex items-center mb-4">
        <Title level={2} className="text-orange-600 m-0">
          School Tickets{" "}
          <span className="text-gray-500 text-lg">({tickets.length})</span>
        </Title>
        <div className="flex-1" />
        <button
          className="flex items-center gap-2 bg-white hover:bg-orange-100 text-orange-600 border border-orange-300 px-4 mr-2 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium"
          onClick={toggleFilters}
        >
          <FilterOutlined />
          Filter
        </button>

        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white border border-orange-600 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium"
          onClick={() => (window.location.href = "/addticket")}
        >
          <PlusOutlined />
          Add Ticket
        </button>

        {showFilters && (
          <div className="absolute top-12 right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
            {/* Filters go here */}
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
                className="w-full border rounded-md px-3 py-2 text-sm text-gray-700"
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
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="flex-1 min-w-0 border rounded-md px-3 py-2 text-sm text-gray-700"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <span className="text-gray-500 whitespace-nowrap">to</span>
                <input
                  type="date"
                  className="flex-1 min-w-0 border rounded-md px-3 py-2 text-sm text-gray-700"
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

                {/* ✅ New Early Adopter category */}
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

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm text-gray-600 hover:underline"
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
      )}
    </div>
  );
}

export default YourTickets;
