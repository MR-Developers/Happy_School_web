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
  Tooltip,
  Grid,
  Card,
} from "antd";
import { PlusOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

type Contributor = {
  name: string;
  email: string;
};

type Ticket = {
  id: string;
  ticketText: string;
  status?: string;
  timestamp?: any;
  category?: string;
  contributors?: Contributor[];
};

type Teacher = {
  Name?: string;
  email: string;
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
  const [selectedCategory, setSelectedCategory] = useState("");

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const email = localStorage.getItem("email");
  const school = localStorage.getItem("school");
  const navigate = useNavigate();

  // Format created timestamp
  const formatTimestamp = (t: any) => {
    if (!t) return "N/A";
    if (t._seconds)
      return dayjs(t._seconds * 1000).format("DD/MM/YYYY hh:mm A");
    return dayjs(t).format("DD/MM/YYYY hh:mm A");
  };

  // Fetch tickets
  useEffect(() => {
    if (!email) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const params = {
          status: selectedStatus || undefined,
          teacher: selectedTeacher || undefined,
          category: selectedCategory || undefined,
        };

        const res = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/co-ordinator/tickets/${email}`,
          { params }
        );

        setTickets(res.data.tickets || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [selectedStatus, selectedTeacher, selectedCategory]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(
          `https://api-rim6ljimuq-uc.a.run.app/co-ordinator/teachers/${email}`
        );
        setTeachers(res.data.teachers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setTeachLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Desktop Table Columns
  const columns = [
    {
      title: "Subject",
      dataIndex: "ticketText",
      key: "ticketText",
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="font-medium text-blue-600">
            {text.length > 40 ? text.substring(0, 40) + "..." : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Resolved"
              ? "green"
              : status === "Ticket Raised"
              ? "orange"
              : "blue"
          }
        >
          {status || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (t: any) => formatTimestamp(t),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => (
        <Tag color={cat === "Teacher" ? "green" : "blue"}>{cat}</Tag>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    if (!email || !school) return message.error("Missing user info");

    setSubmitting(true);
    try {
      const payload: any = {
        school,
        ticketText: values.description,
        contributors: values.contributors,
        category: values.category,
      };

      await axios.post(
        `https://api-rim6ljimuq-uc.a.run.app/raiseticket/${email}`,
        payload
      );

      message.success("Ticket created!");
      setOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: isMobile ? "14px" : "24px",
        backgroundColor: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
        <Title level={isMobile ? 4 : 3}>Tickets ({tickets.length})</Title>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            icon={<FilterOutlined />}
            block={isMobile}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            block={isMobile}
            onClick={() => setOpen(true)}
            style={{ background: "#fa8c16", borderColor: "#fa8c16" }}
          >
            Add Ticket
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      {/* FILTER POPUP LIKE COUNSELOR PAGE */}
      {showFilters && (
        <div className="relative sm:absolute sm:right-0 sm:top-16 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm text-gray-700"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="Ticket Raised">Ticket Raised</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Teacher Search Dropdown */}
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
              onChange={(value) => setSelectedTeacher(value)}
            >
              {teachers.map((t) => (
                <Select.Option key={t.email} value={t.email}>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium text-gray-800">
                      {t.Name || "Unknown"}
                    </span>
                    <span className="text-gray-500 text-xs truncate">
                      ({t.email})
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Category Checkboxes */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategory === "Student"}
                  onChange={() =>
                    setSelectedCategory(
                      selectedCategory === "Student" ? "" : "Student"
                    )
                  }
                />
                <span className="ml-2">Student</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategory === "Teacher"}
                  onChange={() =>
                    setSelectedCategory(
                      selectedCategory === "Teacher" ? "" : "Teacher"
                    )
                  }
                />
                <span className="ml-2">Teacher</span>
              </label>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 text-sm text-gray-600 hover:underline"
              onClick={() => setShowFilters(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm border border-red-400 text-red-600 rounded-md hover:bg-red-100"
              onClick={() => {
                setSelectedStatus("");
                setSelectedTeacher("");
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

      {/* MOBILE CARD VIEW */}
      {isMobile && (
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            tickets.map((t) => (
              <Card
                key={t.id}
                onClick={() =>
                  navigate("/showticket", { state: { ticket: t } })
                }
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 12,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600, color: "#1677ff" }}>
                  {t.ticketText.length > 30
                    ? t.ticketText.substring(0, 30) + "..."
                    : t.ticketText}
                </div>

                <div style={{ marginTop: 6 }}>
                  <Tag
                    color={
                      t.status === "Resolved"
                        ? "green"
                        : t.status === "Ticket Raised"
                        ? "orange"
                        : "blue"
                    }
                  >
                    {t.status}
                  </Tag>
                  <Tag color={t.category === "Teacher" ? "green" : "blue"}>
                    {t.category}
                  </Tag>
                </div>

                <div style={{ marginTop: 6, color: "#666" }}>
                  <strong>Created: </strong> {formatTimestamp(t.timestamp)}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* DESKTOP TABLE */}
      {!isMobile && (
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          pagination={{
            pageSize: 8,
            position: ["bottomCenter"],
            showSizeChanger: false,
          }}
          bordered
          className="rounded-lg shadow-sm"
          onRow={(record) => ({
            onClick: () =>
              navigate("/showticket", { state: { ticket: record } }),
          })}
        />
      )}

      {/* DRAWER FORM */}
      <Drawer
        title="Create New Ticket"
        onClose={() => setOpen(false)}
        open={open}
        width={isMobile ? "100%" : 420}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea
              placeholder="Describe the issue"
              rows={3}
              style={{ resize: "none" }}
            />
          </Form.Item>

          <Form.Item
            name="contributors"
            label="Contributors"
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              placeholder="Select contributors"
              loading={teachLoading}
            >
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
            <Select>
              <Option value="Teacher">Teacher</Option>
              <Option value="Student">Student</Option>
            </Select>
          </Form.Item>

          <Button
            type="primary"
            block
            loading={submitting}
            style={{ background: "#fa8c16", borderColor: "#fa8c16" }}
            htmlType="submit"
          >
            Submit
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default CoordinatorTickets;
