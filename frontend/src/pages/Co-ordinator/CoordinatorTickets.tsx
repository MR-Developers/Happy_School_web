import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Typography,
  Select,
  Spin,
  Table,
  Tag,
  Space,
  Tooltip,
} from "antd";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

type Contributor = {
  name: string;
  email: string;
};

type Ticket = {
  id: string;
  ticketText: string;
  status?: string;
  timestamp?: string;
  contributors?: Contributor[];
  category?: string;
  teacher?: string;
  userName?: string;
  school?: string;
};

type Teacher = {
  Name?: string;
  email: string;
  coins?: number;
};

const CoordinatorTickets = () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachLoading, setTeachLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const email = localStorage.getItem("email");
  const school = localStorage.getItem("school");
  const navigate = useNavigate();

  // ------------------------------
  // Fetch tickets
  // ------------------------------
  useEffect(() => {
    if (!email || !school) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const params = {
          status: selectedStatus || undefined,
          teacher: selectedTeacher || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          category: selectedCategory || undefined,
        };

        const res = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/co-ordinator/tickets/${email}`,
          { params }
        );
        setTickets(res.data.tickets || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [email, school, selectedStatus, selectedTeacher, fromDate, toDate, selectedCategory]);

  // ------------------------------
  // Fetch teachers
  // ------------------------------
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/co-ordinator/teachers/${email}`
        );
        setTeachers(res.data.teachers || []);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      } finally {
        setTeachLoading(false);
      }
    };

    fetchTeachers();
  }, [email]);

  // ------------------------------
  // Format timestamp
  // ------------------------------
  const formatTimestamp = (time: any) => {
    if (!time) return "N/A";
    if (time._seconds) return new Date(time._seconds * 1000).toLocaleString();
    return dayjs(time).format("DD/MM/YYYY hh:mm A");
  };

  // ------------------------------
  // Table Columns
  // ------------------------------
  const columns = [
    {
      title: "Subject",
      dataIndex: "ticketText",
      key: "ticketText",
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-indigo-600 font-medium cursor-pointer">
            {text.length > 30 ? text.substring(0, 30) + "..." : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Resolved"
            ? "green"
            : status === "Ticket Raised"
            ? "orange"
            : "blue";
        return <Tag color={color}>{status || "Pending"}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (t: any) => formatTimestamp(t),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => (
        <Tag color={cat === "Teacher" ? "green" : cat === "Student" ? "blue" : "purple"}>
          {cat}
        </Tag>
      ),
    },
    {
      title: "Contributors",
      dataIndex: "contributors",
      key: "contributors",
      render: (contributors: Contributor[]) => {
        if (!contributors?.length) return <Tag color="default">None</Tag>;
        return contributors.map((c) => (
          <Tag key={c.email} color="cyan">
            {c.name}
          </Tag>
        ));
      },
    },
  ];

  // ------------------------------
  // Drawer form submit
  // ------------------------------
  const handleSubmit = async (values: any) => {
    if (!email || !school) {
      message.error("Missing email or school info in localStorage");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        school,
        ticketText: values.description,
        contributors: values.contributors,
        category: values.category,
        privacy: false,
      };

      if (values.category === "teacher" && values.raisedOn) {
        payload.teacher = values.raisedOn;
      } else if (values.category === "student" && values.raisedOn) {
        payload.student = values.raisedOn;
      }

      const res = await axios.post(
        `https://api-rim6ljimuq-uc.a.run.app/coordinatoraddticket/${email}/${school}`,
        payload
      );

      if (res.status === 200) {
        message.success("Ticket raised successfully!");
        form.resetFields();
        setOpen(false);
        // refresh tickets
        const newTickets = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/coordinatortickets/${email}/${school}`
        );
        setTickets(newTickets.data.tickets || []);
      } else {
        message.warning("Unexpected response");
      }
    } catch (err: any) {
      console.error(err);
      message.error("Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7e6] p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <Title level={3} style={{ color: "#fa8c16", margin: 0 }}>
          🎫 Coordinator Tickets ({tickets.length})
        </Title>

        <div className="flex gap-2">
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
            style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
          >
            Add Ticket
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border rounded-lg shadow-md p-4 mb-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
            >
              <Option value="Ticket Raised">Ticket Raised</Option>
              <Option value="Resolved">Resolved</Option>
            </Select>

            <Select
              placeholder="Teacher"
              value={selectedTeacher}
              onChange={setSelectedTeacher}
              allowClear
            >
              {teachers.map((t) => (
                <Option key={t.email} value={t.email}>
                  {t.Name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
            >
              <Option value="Student">Student</Option>
              <Option value="Teacher">Teacher</Option>
            </Select>
          </div>
        </div>
      )}

      {/* Tickets Table */}
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
            onClick: () => navigate("/showticket", { state: { ticket: record } }),
          })}
          className="cursor-pointer bg-white rounded-lg shadow-md"
        />
      )}

      {/* Drawer for adding tickets */}
      <Drawer
        title={<span style={{ color: "#fa8c16" }}>Create New Ticket</span>}
        width={420}
        onClose={() => setOpen(false)}
        open={open}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} placeholder="Describe the issue" />
          </Form.Item>

          <Form.Item
            name="contributors"
            label="Contributors"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Select contributors">
              {teachers.map((t) => (
                <Option key={t.email} value={t.email}>
                  {t.Name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select category">
              <Option value="student">Student</Option>
              <Option value="teacher">Teacher</Option>
            </Select>
          </Form.Item>

          <Form.Item name="raisedOn" label="Raised On">
            <Input placeholder="Enter student/teacher name or email" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            block
            style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
          >
            Submit
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default CoordinatorTickets;
