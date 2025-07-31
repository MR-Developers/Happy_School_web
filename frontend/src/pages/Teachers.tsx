import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Input,
  Typography,
  Avatar,
  Spin,
  Badge,
  Tooltip,
  Tag,
} from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface Teacher {
  id?: string;
  Name?: string;
  email?: string;
  phone?: string;
  role?: string;
  coins?: number;
  profileImage?: string;
}

const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

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
      .finally(() => setLoading(false));
  }, []);

  const filtered = teachers.filter((t) =>
    t.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Rank",
      key: "rank",
      width: 80,
      render: (_: unknown, __: Teacher, index: number) => {
        const absoluteIndex = (currentPage - 1) * pageSize + index;
        return (
          <Tooltip title={`Rank ${absoluteIndex + 1}`}>
            <Badge
              count={absoluteIndex + 1}
              style={{
                backgroundColor: rankColors[absoluteIndex] || "#722ed1",
                color: "#fff",
                fontWeight: "bold",
                boxShadow: "0 0 6px rgba(0,0,0,0.1)",
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      render: (_: unknown, record: Teacher) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.profileImage}
            icon={<UserOutlined />}
            size="large"
            style={{ backgroundColor: "#f0f0f0" }}
          />
          <span className="font-semibold text-gray-800">
            {record.Name || "-"}
          </span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) =>
        text ? (
          <span className="text-gray-700">{text}</span>
        ) : (
          <div className="text-center text-gray-400 font-medium">-</div>
        ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text: string) =>
        text ? (
          <span className="text-gray-600">{text}</span>
        ) : (
          <div className="text-center text-gray-400 font-medium">-</div>
        ),
    },
    {
      title: "Designation",
      dataIndex: "role",
      key: "role",
      render: (text: string) =>
        text ? (
          <Tag color="geekblue" className="capitalize font-medium">
            {text}
          </Tag>
        ) : (
          <div className="text-center text-gray-400 font-medium">-</div>
        ),
    },
    {
      title: "Coins",
      dataIndex: "coins",
      key: "coins",
      render: (coins: number) => (
        <span className="font-semibold text-green-600">{coins ?? "0"}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <Title className="text-orange-600 m-0">
        Teachers{" "}
        <span className="text-gray-500 text-lg">({teachers.length})</span>
      </Title>

      <Input
        placeholder="Search by name..."
        prefix={<SearchOutlined />}
        className="max-w-md mb-6 bg-white shadow-sm rounded-lg"
        size="large"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
      />

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Spin size="large" tip="Loading teachers..." />
        </div>
      ) : (
        <Table
          dataSource={filtered.filter(
            (t) => t.role?.toLowerCase() !== "principal"
          )}
          columns={columns}
          rowKey={(record) =>
            record.email || record.id || Math.random().toString()
          }
          pagination={{
            pageSize,
            current: currentPage,
            onChange: (page) => setCurrentPage(page),
          }}
          bordered
          className="rounded-lg bg-white shadow-md overflow-hidden"
        />
      )}
    </div>
  );
}

export default Teachers;
