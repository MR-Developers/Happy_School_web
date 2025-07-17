import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Tag,
  Typography,
  Spin,
  Space,
  Badge,
  Card,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

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

function YourTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/tickets/${email}`
        );
        setTickets(response.data.tickets || []);
      } catch (err) {
        console.error("Error fetching your tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [email]);

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
      render: (time: string) => (
        <span className="text-gray-600">{time || "N/A"}</span>
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
  ];

  return (
    <div className="min-h-screen p-6">
      <Tooltip title="Add Ticket" placement="left">
        <button
          className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white px-5 py-4 rounded-full shadow-lg text-xl transition-transform hover:scale-105 flex items-center gap-2"
          onClick={() => (window.location.href = "/addticket")}
        >
          <PlusOutlined />
          Add Ticket
        </button>
      </Tooltip>

      <Title level={2} className="text-orange-600 m-0 text-center">
        School Tickets{" "}
        <span className="text-gray-500 text-lg">({tickets.length})</span>
      </Title>

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
