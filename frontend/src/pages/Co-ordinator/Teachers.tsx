import { useEffect, useState } from "react";
import { Table, Typography, message, Spin, Tag, Card } from "antd";
import axios from "axios";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

const CoordinatorTeachers = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!email) {
        message.error("No coordinator email found in localStorage");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/co-ordinator/teachers/${email}`
        );
        setTeachers(response.data.teachers || []);
      } catch (err: any) {
        console.error("Error fetching teachers:", err);
        message.error(err.response?.data?.error || "Failed to fetch teachers");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [email]);

  const columns = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) => (
        <Tag color="orange">{index + 1}</Tag>
      ),
      width: 60,
    },
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      render: (name: string) => (
        <span style={{ fontWeight: 500, color: "#ff7a00" }}>
          <UserOutlined style={{ marginRight: 6, color: "#ffa94d" }} />
          {name}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <span style={{ color: "#595959" }}>{email}</span>
      ),
    },
    {
      title: "School",
      dataIndex: "school",
      key: "school",
      render: (school: string) => (
        <Tag color="orange" style={{ borderRadius: 6 }}>
          {school}
        </Tag>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (dept: string) => (
        <span style={{ color: "#ff8c1a", fontWeight: 500 }}>{dept}</span>
      ),
    },
    {
      title: "Coins",
      dataIndex: "coins",
      key: "coins",
      sorter: (a: any, b: any) => a.coins - b.coins,
      render: (coins: number) => (
        <Tag
          color={coins > 100 ? "gold" : "volcano"}
          style={{ fontWeight: 600, borderRadius: 6 }}
        >
          {coins}
        </Tag>
      ),
    },
    {
      title: "Courses",
      dataIndex: "courses",
      key: "courses",
      render: (courses: string[]) =>
        courses && courses.length > 0 ? (
          <ul style={{ paddingLeft: "18px", margin: 0 }}>
            {courses.map((course, i) => (
              <li key={i} style={{ color: "#444" }}>
                {course}
              </li>
            ))}
          </ul>
        ) : (
          <span style={{ color: "#999" }}>—</span>
        ),
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#fffaf5",
        minHeight: "100vh",
      }}
    >
      <Card
        style={{
          border: "1px solid #ffd8b3",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(255, 165, 0, 0.1)",
        }}
      >
        <Title
          level={3}
          style={{
            color: "#ff7a00",
            borderBottom: "2px solid #ffb84d",
            paddingBottom: 8,
            marginBottom: 24,
          }}
        >
          Teachers under Coordinator:{" "}
          <span style={{ color: "#333" }}>{email || "Unknown"}</span>
        </Title>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "50px 0",
            }}
          >
            <Spin size="large" tip="Loading teachers..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={teachers}
            rowKey="id"
            bordered
            pagination={{ pageSize: 5 }}
            style={{
              border: "1px solid #ffe0b3",
              borderRadius: 10,
            }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={6}>
                    <strong style={{ color: "#ff7a00" }}>Total Teachers:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong style={{ color: "#ff7a00" }}>
                      {teachers.length}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default CoordinatorTeachers;
