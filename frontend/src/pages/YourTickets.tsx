import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag, Typography, Spin, Space, Badge } from "antd";

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
};

function YourTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
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
        <span className="font-semibold text-blue-600">{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Ticket Raised" ? "orange" : "green"}>
          {status || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Token",
      dataIndex: "tocken",
      key: "tocken",
      render: (token: number) => (
        <Badge count={token} style={{ backgroundColor: "#722ed1" }} />
      ),
    },
    {
      title: "Created At",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (time: string) => <span className="text-gray-600">{time}</span>,
    },
    {
      title: "Contributors",
      dataIndex: "contributors",
      key: "contributors",
      render: (contributors?: Contributor[]) => {
        if (!contributors || contributors.length === 0) {
          return <Tag color="default">NaN</Tag>;
        }
        return (
          <Space direction="vertical">
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
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-orange-100 via-yellow-50 to-white rounded-xl shadow-md">
      <div className="flex flex-row">
        <button
          className="fixed top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg w-40 h-15 text-xl"
          onClick={() => (window.location.href = "/addticket")}
        >
          Add Tickets +
        </button>
      </div>
      <Title level={2} className="text-center text-orange-600 mb-6">
        🎫 Your Tickets
      </Title>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin tip="Loading tickets..." size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}
    </div>
  );
}

export default YourTickets;
