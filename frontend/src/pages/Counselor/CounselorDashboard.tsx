/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Updated Dashboard.tsx to handle both string and Firestore Timestamp formats

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button, Card, Typography, Skeleton, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import domtoimage from "dom-to-image";

const { Title, Text } = Typography;

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function CounselorDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [summary, setSummary] = useState<{
    post: number;
    meetingTicketCount: number;
    earlyAdopterCount: number;
    taskscount?: number;
  } | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);

  const cardStyle = { borderColor: "gray" };
  const dashboardRef = useRef<HTMLDivElement>(null);

  const donutData = summary
    ? [
        { name: "Posts", value: summary.post || 0, color: "#6366f1" },
        {
          name: "One on One Sessions",
          value: summary.meetingTicketCount,
          color: "#ffbb33",
        },
        {
          name: "Early Adopters",
          value: summary.earlyAdopterCount,
          color: "#ff0000ff",
        },
        { name: "Tasks", value: summary.taskscount || 0, color: "#f97316" },
      ]
    : [];

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    setLoadingTickets(true);
    axios
      .get(`http://localhost:5000/counselortickets/${email}`)
      .then((res) => {
        console.log("Fetched tickets:", res.data.tickets);
        setTickets(res.data.tickets || []);
      })
      .catch((err) => console.error("Error fetching tickets:", err))
      .finally(() => setLoadingTickets(false));
  }, []);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    setLoadingSummary(true);
    axios
      .get(`http://localhost:5000/counselordashboard/${email}`)
      .then((res) => {
        const { postCount, challengeCount } = res.data;
        setSummary({
          post: postCount,
          meetingTicketCount: res.data.meetingTicketCount,
          earlyAdopterCount: res.data.earlyAdopterCount,
          taskscount: res.data.taskscount,
        });
        console.log(postCount);
      })
      .catch((err) => {
        console.error("Error fetching dashboard summary:", err);
      })
      .finally(() => setLoadingSummary(false));
  }, []);

  const createdTickets = tickets.length;
  const solvedTickets = tickets.filter(
    (t) => t.status?.toLowerCase() === "resolved"
  ).length;
  const unsolvedTickets = createdTickets - solvedTickets;

  const currentMonthIndex = new Date().getMonth();

  const getMonthFromTimestamp = (t: any): number | null => {
    try {
      if (!t.timestamp) return null;

      let parsed;

      if (typeof t.timestamp === "string") {
        parsed = dayjs(t.timestamp, "DD/MM/YYYY, hh:mm A");
      } else if (typeof t.timestamp.toDate === "function") {
        parsed = dayjs(t.timestamp.toDate());
      } else if (t.timestamp._seconds) {
        parsed = dayjs.unix(t.timestamp._seconds);
      } else if (t.timestamp.seconds) {
        parsed = dayjs.unix(t.timestamp.seconds);
      } else {
        parsed = dayjs(t.timestamp);
      }

      return parsed.isValid() ? parsed.month() : null;
    } catch (err) {
      console.error("Invalid timestamp format:", t.timestamp, err);
      return null;
    }
  };

  const monthData = Array.from({ length: currentMonthIndex + 1 }, (_, i) => {
    const monthName = months[i];

    const created = tickets.filter(
      (t) => getMonthFromTimestamp(t) === i
    ).length;

    const solved = tickets.filter(
      (t) =>
        getMonthFromTimestamp(t) === i && t.status?.toLowerCase() === "resolved"
    ).length;

    return created > 0
      ? { name: monthName, Created: created, Solved: solved }
      : null;
  }).filter(Boolean);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;

    setExportingPDF(true);
    try {
      const blob = await domtoimage.toBlob(dashboardRef.current);
      const reader = new FileReader();

      reader.onloadend = () => {
        const pdf = new jsPDF("p", "mm", "a4");
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          const width = pdf.internal.pageSize.getWidth();
          const height = (img.height * width) / img.width;
          pdf.addImage(img, "PNG", 0, 0, width, height);
          pdf.save("dashboard-report.pdf");
          setExportingPDF(false);
        };
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setExportingPDF(false);
    }
  };

  const handleRedirect = () => {
    window.open("https://example.com", "_blank");
  };

  const LoadingCard = () => (
    <Card style={cardStyle}>
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  );

  return (
    <div className="p-6" ref={dashboardRef}>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Dashboard</Title>
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            onClick={handleExportPDF}
            loading={exportingPDF}
            disabled={loadingTickets || loadingSummary}
            style={{ backgroundColor: "#f97316", borderColor: "#f97316" }}
            className="hover:!bg-orange-600 hover:!border-orange-600"
          >
            {exportingPDF ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </div>

      {/* Tickets Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {loadingTickets ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : (
          <>
            <Card style={cardStyle}>
              <Text className="text-gray-500 font-bold !text-xl">
                Created Tickets
              </Text>
              <Title level={2}>{createdTickets?.toLocaleString()}</Title>
            </Card>

            <Card style={cardStyle}>
              <Text className="text-gray-500 font-bold !text-xl">
                Resolved Tickets
              </Text>
              <Title level={2}>{solvedTickets?.toLocaleString()}</Title>
              <Text type="success" style={{ fontSize: 16 }}>
                {createdTickets > 0
                  ? ((solvedTickets / createdTickets) * 100).toFixed(0)
                  : 0}
                %
              </Text>
              <p className="text-gray-400 font-semibold">
                Tickets Have Been Resolved
              </p>
            </Card>

            <Card style={cardStyle}>
              <Text className="text-gray-500 font-bold !text-xl">
                Unresolved Tickets
              </Text>
              <Title level={2} className="text-red-500">
                {unsolvedTickets?.toLocaleString()}
              </Title>
              <Text type="danger">
                {createdTickets > 0
                  ? ((unsolvedTickets / createdTickets) * 100).toFixed(0)
                  : 0}
                %
              </Text>
              <p className="text-gray-400 font-semibold">
                Tickets Have Not Been Resolved
              </p>
            </Card>
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {loadingSummary ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : (
          <>
            <Card style={cardStyle}>
              <Text className="text-gray-500 font-bold !text-xl">
                One On One Sessions
              </Text>
              <Title level={2}>
                {summary?.meetingTicketCount?.toLocaleString() || 0}
              </Title>
              <p className="text-gray-400 font-semibold">
                One On One Sessions Have Been Conducted
              </p>
            </Card>

            <Card style={cardStyle}>
              <Text className="text-gray-500 font-bold !text-xl">Tasks</Text>
              <Title level={2}>
                {summary?.taskscount?.toLocaleString() || 0}
              </Title>
              <p className="text-gray-400 font-semibold">
                Tasks Have Been Created
              </p>
            </Card>

            <Card style={cardStyle}>
              <Text className="text-gray-500 font-bold !text-xl">Posts</Text>
              <Title level={2}>{summary?.post?.toLocaleString() || 0}</Title>
              <p className="text-gray-400 font-semibold">
                Posts Have Been Created
              </p>
            </Card>
          </>
        )}
      </div>

      {/* Bar Chart */}
      <Title level={4}>Tickets Overview (Month-wise)</Title>
      {loadingTickets ? (
        <div className="flex justify-center items-center h-[300px]">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            tip="Loading chart data..."
          />
        </div>
      ) : (
        <center>
          <ResponsiveContainer width="50%" height={300}>
            <BarChart data={monthData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Created" stackId="a" fill="#c4b5fd" name="CREATE" />
              <Bar dataKey="Solved" stackId="a" fill="#7c3aed" name="SOLVED" />
            </BarChart>
          </ResponsiveContainer>
        </center>
      )}

      {/* Pie Chart */}
      {loadingSummary ? (
        <>
          <Title level={4} className="mt-10">
            Content Summary
          </Title>
          <div className="flex justify-center items-center h-[350px]">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              tip="Loading summary data..."
            />
          </div>
        </>
      ) : (
        summary && (
          <>
            <Title level={4} className="mt-10">
              Content Summary
            </Title>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label
                  labelLine={false}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: 20,
                    rowGap: 10,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )
      )}
    </div>
  );
}

export default CounselorDashboard;
