// pages/reports/casting.tsx
import { useEffect, useState } from "react";
import { Table, Input, DatePicker, Select, Button, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";

import { useRouter } from "next/navigation";


import dayjs from "dayjs";
import dataAxios from "@/src/axios";
import { record } from "zod";
const { RangePicker } = DatePicker;

export default function CastingReport() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
 const [dateRange, setDateRange] = useState<any>(null);

  
const router = useRouter();

 const apiUrl = "https://kalash.app";

//const apiUrl = "http://localhost:4001";


  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`${apiUrl}/assembly/all`)
    const result = await res.json();
    console.log("API response:", result);
    setData(result.data || []); // ✅ always array 
    setLoading(false);
  };
  fetchData();
}, []);

  // Apply filters
const filteredData = (Array.isArray(data) ? data : []).filter((item) => {
  const matchesSearch =
    item.Name?.toLowerCase().includes(search.toLowerCase()) ||
    item.order_id_c?.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = status === "All" || item.status_c === status;

  let matchesDate = true;
      if (dateRange) {
        const itemDate = dayjs(item.issued_date_c);
        matchesDate =
          itemDate.isAfter(dateRange[0].startOf("day")) &&
          itemDate.isBefore(dateRange[1].endOf("day"));
      }
  
  return matchesSearch && matchesStatus && matchesDate;
});


  const columns = [
    { title: "ID", dataIndex: "Id", key: "id" },
    { title: "Name", dataIndex: "Name", key: "name" },
    { title: "Order ID", dataIndex: "order_id_c", key: "order" },
    { title: "Created Date", dataIndex: "createddate", key: "createddate" },
    { title: "Issued Weight", dataIndex: "issued_weight_c", key: "issuedweight" },
    {
      title: "Issued Date",
      dataIndex: "issued_date_c",
      key: "date",
      render: (val: string) => (val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Status",
      dataIndex: "status_c",
      key: "status",
      render: (text: string) => (
        <Tag color={text === "Finished" ? "green" : "orange"}>{text}</Tag>
      ),
    },

     {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => (
      <Button
        type="primary"
        icon={<EyeOutlined />}
        onClick={() => {router.push(`/Departments/Assembly/assembleShow?assemblyId=${record.Name}`);}}
      />
    ),
  },

  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Assembly Report</h2>

      <div className="flex gap-2 mb-4">
        <RangePicker 
        format="DD-MM-YYYY" 
        onChange={(dates) => setDateRange(dates)} />
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
        <Button onClick={() => { setStatus("All"); setSearch("");  setDateRange(null);}}>
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

