import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Typography, Spin, Space, Select, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
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
  timestamp?: string | { _seconds: number };
  contributors?: Contributor[];
  userName?: string;
  email?: string;
  category?: string;
  oneononesessions?: string;
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

const CoordinatorOneonOne = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedTeacherEmail, setSelectedTeacherEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const toggleFilters = () => setShowFilters((prev) => !prev);

  // ✅ Fetch teachers (excluding coordinators)
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    axios
      .get(`https://api-rim6ljimuq-uc.a.run.app/co-ordinator/teachers/${email}`)
      .then((res) => {
        const fetched = res.data.teachers || [];
        const filtered = fetched.filter(
          (t: Teacher) => t.role?.toLowerCase() !== "co-ordinator"
        );
        const sorted = filtered.sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0));
        setTeachers(sorted);
      })
      .catch((err) => console.error("Error fetching teachers:", err));
  }, []);

  // ✅ Fetch teacher-related tickets
  useEffect(() => {
    if (!email) return;

    const fetchFilteredTickets = async () => {
      setLoading(true);
      try {
        const params = {
          teacher: selectedTeacherEmail || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          category: selectedCategory || undefined,
        };

        const response = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/oneonone/${email}`,
          { params }
        );

        let fetched: Ticket[] = response.data.tickets || [];

        // Filter to show only teacher-related tickets
        const teacherEmails = teachers.map((t) => t.email?.toLowerCase());
        fetched = fetched.filter((ticket) => {
          const ticketEmail = ticket.email?.toLowerCase();
          return ticketEmail && teacherEmails.includes(ticketEmail);
        });

        const sorted = fetched.sort(
          (a, b) =>
            new Date(b.timestamp ?? "").getTime() -
            new Date(a.timestamp ?? "").getTime()
        );
        setTickets(sorted);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredTickets();
  }, [email, teachers, selectedTeacherEmail, fromDate, toDate, selectedCategory]);

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
    if (time._seconds) return new Date(time._seconds * 1000).toLocaleString();
    if (typeof time === "string") {
      const parsed = dayjs(time, "DD/MM/YYYY hh:mm A");
      return parsed.isValid() ? parsed.format("DD/MM/YYYY hh:mm A") : "Invalid";
    }
    return time.toLocaleString();
  };

  const columns = [
    {
      title: "Subject",
      dataIndex: "ticketText",
      key: "ticketText",
      render: (text: string) => renderTicketSubject(text),
    },
    {
      title: "Created At",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (time: any) => (
        <span className="text-gray-600 text-xs sm:text-sm">
          {formatTimestamp(time)}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => (
        <Tag color="blue">{category || "Teacher"}</Tag>
      ),
    },
    {
      title: "Sessions",
      dataIndex: "oneononesessions",
      key: "oneononesessions",
      render: (sessions: string) => (
        <Tag color="orange">
          <span className="text-black">{sessions || 0}</span>
        </Tag>
      ),
    },
    {
      title: "Collaborators",
      dataIndex: "contributors",
      key: "contributors",
      render: (contributors?: Contributor[]) =>
        contributors?.length ? (
          <Space wrap>
            {contributors.map((c) => (
              <Tag key={c.email} color="cyan">
                {c.name}
              </Tag>
            ))}
          </Space>
        ) : (
          <Tag color="default">None</Tag>
        ),
    },
    {
      title: "Started By",
      dataIndex: "userName",
      key: "userName",
      render: (userName: string) => (
        <span className="text-gray-600 text-xs sm:text-sm">
          {userName || "Anonymous"}
        </span>
      ),
    },
  ];

  // ✅ Mobile Card Layout
  const MobileTicketCard = ({ ticket }: { ticket: Ticket }) => (
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
          <div className="text-xs text-gray-500 mb-1">Category</div>
          <Tag color="blue">{ticket.category || "Teacher"}</Tag>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Sessions</div>
          <Tag color="orange">
            <span className="text-black">{ticket.oneononesessions || 0}</span>
          </Tag>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Collaborators</div>
        {!ticket.contributors?.length ? (
          <Tag color="default">None</Tag>
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
          <span className="text-gray-700">{formatTimestamp(ticket.timestamp)}</span>
        </div>
        <div className="text-right">
          <span className="text-gray-500">By: </span>
          <span className="text-gray-700">{ticket.userName || "Anonymous"}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      {/* Title + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Title level={2} className="text-orange-600 m-0 text-xl sm:text-2xl">
          Coordinator One-on-One Sessions{" "}
          <span className="text-gray-500 text-base sm:text-lg">
            ({tickets.length})
          </span>
        </Title>
        <div className="flex-1" />
        <div className="relative">
          <button
            className="flex items-center gap-2 bg-white hover:bg-orange-100 text-orange-600 border border-orange-300 px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium text-sm"
            onClick={toggleFilters}
          >
            <FilterOutlined />
            Filter
          </button>

          {showFilters && (
            <div className="absolute top-12 right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
              {/* Teacher Filter */}
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

              {/* Date Range */}
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

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Category
                </label>
                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  {["Student", "Teacher", "Early Adopter"].map((cat) => (
                    <label
                      key={cat}
                      className="inline-flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat}
                        onChange={() =>
                          setSelectedCategory(selectedCategory === cat ? "" : cat)
                        }
                      />
                      <span className="ml-2">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm text-gray-600 hover:underline"
                  onClick={() => setShowFilters(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm text-red-600 border border-red-400 rounded-md hover:bg-red-100"
                  onClick={() => {
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
                  onClick={() => setShowFilters(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table / Mobile View */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin tip="Loading tickets..." size="large" />
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <Table
              columns={columns}
              dataSource={tickets}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              bordered
              onRow={(record) => ({
                onClick: () => navigate("/showticket", { state: { ticket: record } }),
              })}
              className="cursor-pointer rounded-xl shadow-md bg-white"
            />
          </div>

          <div className="lg:hidden">
            {tickets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No tickets found
              </div>
            ) : (
              tickets.map((ticket) => (
                <MobileTicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CoordinatorOneonOne;
