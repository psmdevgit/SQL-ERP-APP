// pages/reports/casting.tsx
import { useEffect, useState } from "react";
import { Table, Input, DatePicker, Select, Button, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import dayjs from "dayjs";
import dataAxios from "@/src/axios";
const { RangePicker } = DatePicker;

export default function CastingReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

const apiUrl = "https://kalash.app";

// const apiUrl = "http://localhost:4001";

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`${apiUrl}/casting-trees/all`)
    const result = await res.json();
    console.log("API response:", result);
    setData(result.data || []); // ✅ always array
    setLoading(false);
  };
  fetchData();
}, []);

// delete the wax tree

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
      alert("Deletion failed");
      console.log(result.message);
      return;
    }

    alert("Wax Tree Deleted successfully!");

    // window.location.reload();

    // Refresh table after delete
    setData((prev) => prev.filter((item) => item.Name !== id));
  } catch (error) {
    console.error(error);
  }
};


  // Apply filters
const filteredData = (Array.isArray(data) ? data : []).filter((item) => {
  const matchesSearch =
    item.Name?.toLowerCase().includes(search.toLowerCase()) ||
    item.orderId__c?.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = status === "All" || item.status__c === status;
  return matchesSearch && matchesStatus;
});


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
      render: (val: string) => (val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Status",
      dataIndex: "status_c",
      key: "status",
      render: (text: string) => (
        <Tag color={text.trim() === "Completed" ? "green" : "orange"}>{text}</Tag>
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
    color: isFinished ? "#000" : "white",            // icon & text color
    backgroundColor: isFinished ? "#ddd" : "red", // button bg
    cursor: isFinished ? "not-allowed" : "pointer",
  }}
/>

          );
        },
      },

  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Casting Tree Report</h2>

      <div className="flex gap-2 mb-4">
        <RangePicker format="DD-MM-YYYY" />
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { label: "All Status", value: "All" },
            { label: "Finished", value: "Finished" },
            { label: "Pending", value: "Pending" },
          ]}
        />
        <Input.Search
          placeholder="Search by ID/Order"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => { setStatus("All"); setSearch(""); }}>
          Reset Filters
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        rowKey="Id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
