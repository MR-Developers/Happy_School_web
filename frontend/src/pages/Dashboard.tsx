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
} from "recharts";
import { Button, Card, Typography } from "antd";
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

function Dashboard() {
  const [tickets, setTickets] = useState<unknown[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    axios
      .get(`https://api-rim6ljimuq-uc.a.run.app/tickets/${email}`)
      .then((res) => setTickets(res.data.tickets || []))
      .catch((err) => console.error("Error fetching tickets:", err));
  }, []);

  const createdTickets = tickets.length;
  const solvedTickets = tickets.filter(
    (t: any) => t.status?.toLowerCase() === "resolved"
  ).length;
  const unsolvedTickets = createdTickets - solvedTickets;

  const currentMonthIndex = new Date().getMonth();

  const monthData = Array.from({ length: currentMonthIndex + 1 }, (_, i) => {
    const monthName = months[i];

    const created = tickets.filter((t: any) => {
      const date = t.timestamp?.toDate
        ? t.timestamp.toDate()
        : new Date(t.timestamp);
      return dayjs(date).month() === i;
    }).length;

    const solved = tickets.filter((t: any) => {
      const date = t.timestamp?.toDate
        ? t.timestamp.toDate()
        : new Date(t.timestamp);
      return (
        dayjs(date).month() === i && t.status?.toLowerCase() === "resolved"
      );
    }).length;

    return created > 0
      ? { name: monthName, Created: created, Solved: solved }
      : null;
  }).filter(Boolean);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;

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
        };
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Error exporting PDF:", err);
    }
  };

  return (
    <div className="p-6" ref={dashboardRef}>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Dashboard</Title>
        <Button
          type="primary"
          onClick={handleExportPDF}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <Text className="text-gray-500">Created Tickets</Text>
          <Title level={2}>{createdTickets.toLocaleString()}</Title>
          <Text type="success">+10%</Text>
          <p className="text-gray-400">Compared to last month</p>
        </Card>

        <Card>
          <Text className="text-gray-500">Solved Tickets</Text>
          <Title level={2}>{solvedTickets.toLocaleString()}</Title>
          <Text type="success">+50%</Text>
          <p className="text-gray-400">Compared to last month</p>
        </Card>

        <Card>
          <Text className="text-gray-500">Unsolved Tickets</Text>
          <Title level={2} className="text-red-500">
            {unsolvedTickets.toLocaleString()}
          </Title>
          <Text type="danger">-30%</Text>
          <p className="text-gray-400">Compared to last month</p>
        </Card>
      </div>

      <Title level={4}>Tickets Overview (Month-wise)</Title>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthData as any[]}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Created" stackId="a" fill="#c4b5fd" name="CREATE" />
          <Bar dataKey="Solved" stackId="a" fill="#7c3aed" name="SOLVED" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Dashboard;
