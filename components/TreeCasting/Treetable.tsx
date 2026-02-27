// pages/reports/casting.tsx
"use client";

import { useEffect, useState } from "react";
import { Table, Input, DatePicker, Select, Button, Tag } from "antd";
import dayjs from "dayjs";
import { DeleteOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;

export default function CastingReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dateRange, setDateRange] = useState<any>(null);

const apiUrl = "https://kalash.app";
  
//const apiUrl = "http://localhost:4001";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`${apiUrl}/casting-trees/all`);
      const result = await res.json();

      setData(result.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ------------------------------------
  //  DELETE ROW
  // ------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const response = await fetch(`${apiUrl}/casting-tree/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert("Delete failed");
        return;
      }

      alert("Deleted successfully!");
      setData((prev) => prev.filter((item) => item.Name !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // ------------------------------------
  //  FILTER LOGIC
  // ------------------------------------
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.Name?.toLowerCase().includes(search.toLowerCase()) ||
      item.OrderID_C?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === "All" || item.status_c === status;

    let matchesDate = true;
    if (dateRange) {
      const itemDate = dayjs(item.issued_Date_c);
      matchesDate =
        itemDate.isAfter(dateRange[0].startOf("day")) &&
        itemDate.isBefore(dateRange[1].endOf("day"));
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // ------------------------------------
  //  TABLE COLUMNS
  // ------------------------------------
  const columns = [
    { title: "ID", dataIndex: "Name", key: "id" },
    { title: "Tree Weight", dataIndex: "Tree_Weight_c", key: "tw" },
    { title: "Order ID", dataIndex: "OrderID_C", key: "order" },
    { title: "Stone Name", dataIndex: "stone_type_c", key: "stone" },
    { title: "Stone Weight", dataIndex: "stone_weight_c", key: "sw" },
    {
      title: "Issued Date",
      dataIndex: "issued_Date_c",
      key: "date",
      render: (val: string) => (val ? dayjs(val).format("DD-MM-YYYY HH:mm") : "-"),
    },
    {
      title: "Status",
      dataIndex: "status_c",
      key: "status",
      render: (text: string) => (
        <Tag color={text.trim() === "Completed" ? "green" : "orange"}>
          {text}
        </Tag>
      ),
    },
    { title: "Remarks", dataIndex: "remark", key: "remark" },

    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        const isFinished = record.status_c === "Completed";

        return (
          <Button
            danger
            type="text"
            disabled={isFinished}
            onClick={() => handleDelete(record.Name)}
            icon={<DeleteOutlined />}
            style={{
              color: isFinished ? "#000" : "white",
              backgroundColor: isFinished ? "#ccc" : "red",
              cursor: isFinished ? "not-allowed" : "pointer",
              padding: "2px 8px",
            }}
          />
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Casting Tree Report</h2>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-2 mb-4">
        <RangePicker
          format="DD-MM-YYYY"
          onChange={(range) => setDateRange(range)}
        />

        <Select
          value={status}
          onChange={setStatus}
          style={{ width: 150 }}
          options={[
            { label: "All Status", value: "All" },
            { label: "Completed", value: "Completed" },
            { label: "Pending", value: "Pending" },
          ]}
        />

        <Input.Search
          placeholder="Search ID / Order"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
        />

        <Button
          onClick={() => {
            setStatus("All");
            setSearch("");
            setDateRange(null);
          }}
        >
          Reset
        </Button>
      </div>

      {/* TABLE */}
      <Table
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        rowKey="Name"
        size="small"                  // 🔥 Smaller table height
        pagination={{ pageSize: 13 }}
        style={{ fontSize: "12px" }} // 🔥 Reduce table font size
      />
    </div>
  );
}
