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
  const [tickets, setTickets] = useState<any[]>([]);
  const [summary, setSummary] = useState<{
    post: number;
    announcement: number;
    challenge: number;
  } | null>(null);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const donutData = summary
    ? [
        { name: "Posts", value: summary.post, color: "#6366f1" }, // Indigo
        {
          name: "Announcements",
          value: summary.announcement,
          color: "#10b981",
        }, // Green
        { name: "Challenges", value: summary.challenge, color: "#f97316" }, // Orange
      ]
    : [];

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    axios
      .get(`https://api-rim6ljimuq-uc.a.run.app/tickets/${email}`)
      .then((res) => {
        console.log("Fetched tickets:", res.data.tickets);
        setTickets(res.data.tickets || []);
      })
      .catch((err) => console.error("Error fetching tickets:", err));
  }, []);
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;
    axios
      .get(`https://api-rim6ljimuq-uc.a.run.app/dashboard/summary/${email}`)
      .then((res) => {
        const { postCount, announcementCount, challengeCount } = res.data;
        setSummary({
          post: postCount,
          announcement: announcementCount,
          challenge: challengeCount,
        });
      })
      .catch((err) => {
        console.error("Error fetching dashboard summary:", err);
      });
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
      } else if (t.timestamp.toDate) {
        parsed = dayjs(t.timestamp.toDate());
      } else {
        parsed = dayjs(t.timestamp);
      }
      return parsed.isValid() ? parsed.month() : null;
    } catch (err) {
      console.error("Invalid timestamp format", t.timestamp);
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
        <BarChart data={monthData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Created" stackId="a" fill="#c4b5fd" name="CREATE" />
          <Bar dataKey="Solved" stackId="a" fill="#7c3aed" name="SOLVED" />
        </BarChart>
      </ResponsiveContainer>
      {summary && (
        <>
          <Title level={4} className="mt-10">
            Content Summary
          </Title>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

export default Dashboard;
