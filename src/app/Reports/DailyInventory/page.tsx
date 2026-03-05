"use client";
import React, { useEffect, useState } from "react";
import { Table, DatePicker, Button, Typography } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
const { RangePicker } = DatePicker;
const { Title } = Typography;

const DailyInventory: React.FC = () => {

  const today = dayjs();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<any>([today, today]);

  const API_URL = "https://kalash.app";
  
  // const API_URL = "http://localhost:4001";

  dayjs.extend(utc);

  // ✅ Table Columns
  const columns = [
    { title: "Item Name", dataIndex: "itemName", key: "itemName" },

    {
      title: "Purity",
      dataIndex: "purity",
      key: "purity",
      render: (v: any) => `${v}%`,
    },

    { title: "Opening Wt", dataIndex: "openingWeight", key: "openingWeight" },

    { title: "Closing Wt", dataIndex: "closingWeight", key: "closingWeight" },

    {
      title: "Opening Date",
      dataIndex: "openingDate",
      key: "openingDate",
      render: (d: string) => dayjs.utc(d).format("DD-MM-YYYY"),
    },

  {
  title: "Closing Date",
  dataIndex: "closingDate",
  key: "closingDate",
  render: (d: string) => d ? dayjs.utc(d).format("DD-MM-YYYY") : "-"
}
  ];

  // ✅ GROUP DATA BY ITEM
  const groupInventory = (rows: any[]) => {

    const grouped: any = {};

    rows.forEach((row) => {

      if (!grouped[row.itemName]) {
        grouped[row.itemName] = [];
      }

      grouped[row.itemName].push(row);

    });

    const result: any[] = [];

    Object.keys(grouped).forEach((item) => {

      const items = grouped[item].sort(
        (a: any, b: any) =>
          new Date(a.openingDate).getTime() -
          new Date(b.openingDate).getTime()
      );

      const first = items[0];
      const last = items[items.length - 1];

      result.push({
        itemName: item,
        purity: first.purity,
        openingWeight: first.openingWeight,
        closingWeight: last.closingWeight,
        openingDate: first.openingDate,
        closingDate: last.closingDate,
      });

    });

    return result;
  };

  // ✅ FETCH REPORT
  const fetchReport = async (dates: any) => {

    if (!dates) return;

    const from = dates[0].format("YYYY-MM-DD");
    const to = dates[1].format("YYYY-MM-DD");

    setLoading(true);

    const res = await fetch(
      `${API_URL}/api/daily-inventory-report?from=${from}&to=${to}`
    );

    const json = await res.json();

    const groupedData = groupInventory(json.data);

    setData(groupedData);

    setLoading(false);
  };

  // ✅ Load today's data on page load
  useEffect(() => {
    fetchReport([today, today]);
  }, []);

  return (
    <div style={{ padding: 20, marginTop: 50 }} className="w-[60%] mx-auto">

      <Title level={3}>Opening / Closing Inventory Reports</Title>

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
          style={{display:'none'}}
          onClick={() => {
            if (selectedDates) fetchReport(selectedDates);
          }}
        >
          Load Report
        </Button>

      </div>

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
            ),
          },
        }}
      />

    </div>
  );
};

export default DailyInventory;
