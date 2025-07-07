import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Input, Typography, Avatar, Spin, Badge, Card } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import "./table.css";

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

function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    axios
      .get(`http://localhost:5000/get/teachers/${email}`)
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
      render: (_: unknown, __: Teacher, index: number) => (
        <Badge count={index + 1} style={{ backgroundColor: "#722ed1" }} />
      ),
    },
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      render: (_: unknown, record: Teacher) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.profileImage} icon={<UserOutlined />} />
          <span className="font-medium text-gray-800">
            {record.Name || "NaN"}
          </span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => text || "NaN",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text: string) => text || "NaN",
    },
    {
      title: "Designation",
      dataIndex: "role",
      key: "role",
      render: (text: string) => (
        <span className="capitalize text-blue-600 font-medium">
          {text || "NaN"}
        </span>
      ),
    },
    {
      title: "Coins",
      dataIndex: "coins",
      key: "coins",
      render: (coins: number) => (
        <span className="font-semibold text-green-600">{coins ?? "NaN"}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
      <Card
        bordered={false}
        style={{ background: "linear-gradient(to right, #ffedd5, #fff7ed)" }}
        className="shadow-md mb-6"
      >
        <Title level={2} className="text-orange-600 m-0">
          👩‍🏫 Teachers{" "}
          <span className="text-gray-500 text-lg">({teachers.length})</span>
        </Title>
      </Card>

      <Input
        placeholder="Search by name..."
        prefix={<SearchOutlined />}
        className="max-w-md mb-6"
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
          pagination={{ pageSize: 8 }}
          bordered
          className="rounded-md bg-white shadow-sm"
        />
      )}
    </div>
  );
}

export default Teachers;
