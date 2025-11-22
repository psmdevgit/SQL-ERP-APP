"use client";
import React, { useEffect, useState } from "react";

import { Table, DatePicker, Button, Typography } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title } = Typography;

const DailyInventory: React.FC = () => {
  const today = dayjs(); // ⬅️ today
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedDates, setSelectedDates] = useState<any>([today, today]); // ⬅️ default

  const columns = [
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },
    {
      title: "Purity",
      dataIndex: "purity",
      key: "purity",
      render: (v: any) => `${v}%`,
    },
    { title: "Opening Wt", dataIndex: "openingWeight", key: "openingWeight" },
    // { title: "Opening Pure Wt", dataIndex: "openingPureWeight", key: "openingPureWeight" },
    { title: "Closing Wt", dataIndex: "closingWeight", key: "closingWeight" },
    // { title: "Closing Pure Wt", dataIndex: "closingPureWeight", key: "closingPureWeight" },
    {
      title: "Opening Date",
      dataIndex: "openingDate",
      key: "openingDate",
      render: (d: string) => dayjs(d).format("DD-MM-YYYY HH:mm"),
    },
    {
      title: "Closing Date",
      dataIndex: "closingDate",
      key: "closingDate",
      render: (d: string) => (d ? dayjs(d).format("DD-MM-YYYY HH:mm") : "-"),
    },
  ];

  

  const API_URL = "https://kalash.app";

//   const API_URL = "http://localhost:4001";

  const fetchReport = async (dates: any) => {
    if (!dates) return;

    const from = dates[0].format("YYYY-MM-DD");
    const to = dates[1].format("YYYY-MM-DD");

    setLoading(true);

    const res = await fetch(
      `${API_URL}/api/daily-inventory-report?from=${from}&to=${to}`
    );

    const json = await res.json();
    setData(json.data);
    setLoading(false);
  };

  // ⬅️ Auto load today's report on page open
  useEffect(() => {
    fetchReport([today, today]);
  }, []);

  return (
    <div style={{ padding: 20 ,marginTop:50}} class="w-[60%] mx-auto">
      <Title level={3}>Opening / Closing Inventory Report</Title>

      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <RangePicker
          value={selectedDates}
          format="DD-MM-YYYY"
          onChange={(dates) => {
            setSelectedDates(dates);
            fetchReport(dates);
          }}
        />

        <Button
          type="primary"
          onClick={() => {
            if (selectedDates) fetchReport(selectedDates);
          }}
        >
          Load Report
        </Button>
      </div>

      {/* <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 50 }}
        rowKey={(r) => r.itemName + r.openingDate}
      /> */}
      <Table
  columns={columns}
  dataSource={data}
  loading={loading}
  pagination={{ pageSize: 50 }}
  rowKey={(r) => r.itemName + r.openingDate}
  size="small"
  bordered
  style={{ fontSize: "12px" }}
  components={{
    header: {
      cell: (props: any) => (
        <th
          {...props}
          style={{
            background: "#1A7A75",
            color: "white",
            fontSize: "14px",
            padding: "6px",
            textTransform: "capitalize",
          }}
        />
      )
    }
  }}
/>

    </div>
  );
};

export default DailyInventory;
