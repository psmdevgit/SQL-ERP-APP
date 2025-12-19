

"use client";
import { Flex } from "antd";
import React, { useEffect, useState } from "react";

interface Report {
  Id?: string;
  Process: string;
  Name: string;
  Issued_Date: string;
  Receieved_Date: string;
  IssuedWeight: number;
  OrnamWeight: number;
  Finding:number;
  ReceivedWeight: number;
  Status: string;
}


// For input field date format
const formatDateInput = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const FindingReports : React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [fromDate, setFromDate] = useState(formatDateInput(today));
  const [toDate, setToDate] = useState(formatDateInput(today));
  const [selectedName, setSelectedName] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState("All");

  const [allNames, setAllNames] = useState<string[]>([]);
  const [allOrders, setAllOrders] = useState<string[]>([]);

  const API_URL = "http://localhost:4001";

  
  // const API_URL = "https://kalash.app";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/get-finding-transactions`);
        if (!response.ok) throw new Error("Failed to fetch reports");

        const data = await response.json();

        console.log("data",data)

        let reportData: Report[] = [];
        if (Array.isArray(data.data)) {
       reportData = data.data.map((item: any) => ({
  Id: item.id,
  Process: item.process,
  Name: item.name,
  Issued_Date: item.Issued_Date,
  Receieved_Date: item.Receieved_Date,
  IssuedWeight: item.IssuedWeight,
  OrnamWeight: item.OrnamWeight,
  Finding: item.Finding,
  ReceivedWeight: item.ReceivedWeight,
  Status: item.Status,
}));

        }

        // build dropdown lists
        const uniqueNames = Array.from(new Set(reportData.map((r) => r.Process))).filter(Boolean);
        const uniqueStatus = Array.from(new Set(reportData.map((r) => r.Status))).filter(Boolean);

        setAllNames(["All", ...uniqueNames]);
        setAllOrders(["All", ...uniqueStatus]);

        setReports(reportData);
        setFilteredReports(reportData);

        console.log(reportData);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [API_URL]);

  // 🔁 Filter on date, name, order
// 🔁 Filter on date, name, order
useEffect(() => {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  // ⏰ Adjust toDate to end of the selected day
  to.setHours(23, 59, 59, 999);

  const filtered = reports.filter((report) => {
    const created = new Date(report.Issued_Date);
    const dateInRange = created >= from && created <= to;
    const nameMatch = selectedName === "All" || report.Process === selectedName;
    const orderMatch = selectedOrder === "All" || report.Status === selectedOrder;
    return dateInRange && nameMatch && orderMatch;
  });

  setFilteredReports(filtered);
}, [fromDate, toDate, selectedName, selectedOrder, reports]);

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // ⬅ 24-hour format
  });
};



  return (
    <div className="w-full mt-20">
      <div className="max-w-screen-lg mx-auto p-6 bg-white shadow rounded-lg">

      <div style={{display:'flex', justifyContent:'space-between'}}>
          <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
              Finding Used Details
          </h1>

          <button className="btn text-white" style={{background:'#ffbf0d', fontWeight:'600'}}>Update Findings</button>
      </div>
       

        {/* 🔎 Filter Controls */}
        <div className="flex gap-2 mb-6 flex-wrap">
        <div>
  <label className="text-sm text-gray-700">From Date</label>
  <input
    type="date"
    className="border rounded px-3 py-1 w-full"
    value={fromDate}
    onChange={(e) => {
      const newFrom = e.target.value;
      if (new Date(newFrom) > new Date(toDate)) {
        alert("From Date cannot be greater than To Date");
        setFromDate(formatDateInput(startOfYear)); // reset to default
      } else {
        setFromDate(newFrom);
      }
    }}
  />
</div>

<div>
  <label className="text-sm text-gray-700">To Date</label>
  <input
    type="date"
    className="border rounded px-3 py-1 w-full"
    value={toDate}
    onChange={(e) => {
      const newTo = e.target.value;
      if (new Date(newTo) < new Date(fromDate)) {
        alert("To Date cannot be earlier than From Date");
        setToDate(formatDateInput(today)); // reset to today
      } else {
        setToDate(newTo);
      }
    }}
  />
</div>


          <div>
            <label className="text-sm text-gray-700">Filter by Department</label>
            <select
              className="border rounded px-3 py-1 w-full"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
            >
              {allNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* <div>
            <label className="text-sm text-gray-700">Filter by Order ID</label>
            <select
              className="border rounded px-3 py-1 w-full"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
            >
              {allOrders.map((order) => (
                <option key={order} value={order}>
                  {order}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        {isLoading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!isLoading && !error && filteredReports.length === 0 && (
          <p className="text-gray-500">No reports found.</p>
        )}

        {!isLoading && !error && filteredReports.length > 0 && (
          <div className="space-y-10">
            {Object.entries(
              // filteredReports.reduce<Record<string, Report[]>>((acc, report) => {
              //   if (!acc[report.Name]) acc[report.Name] = [];
              //   acc[report.Name].push(report);
              //   return acc;
              // }, {})
              filteredReports.reduce<Record<string, Report[]>>((acc, report) => {
  if (!acc[report.Process]) acc[report.Process] = [];
  acc[report.Process].push(report);
  return acc;
}, {})

            ).map(([process, items]) => {

 const totalIssued = items.reduce((sum, r) => sum + (r.IssuedWeight || 0), 0);
              const totalOrnam = items.reduce((sum, r) => sum + (r.OrnamWeight || 0), 0);
              const totalFinding = items.reduce((sum, r) => sum + (r.Finding || 0), 0);
              const totalReceived = items.reduce((sum, r) => sum + (r.ReceivedWeight || 0), 0);              
             return ( 
              <div key={process}>
                <h2 className="text-xl font-semibold mb-2 text-[#1A7A75]">{process}</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border rounded-md">
                    <thead className="bg-[#1A7A75] text-white whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Issued Date</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Issued Wt</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Ornam Wt</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Finding Wt</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Received Wt</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold">Received Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((report, index) => (
                        <tr key={`${report.Id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
                            {report.Name || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
                            {formatDateTime(report.Issued_Date) || "-"}
                          </td>

                             <td className="px-4 py-2 text-sm text-gray-800">
                            {report.IssuedWeight != null ? report.IssuedWeight.toFixed(2) : "-"}
                          </td>

                        <td className="px-4 py-2 text-sm text-gray-800">
                            {report.OrnamWeight != null ? report.OrnamWeight.toFixed(2) : "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800">
                            {report.Finding != null ? report.Finding.toFixed(2) : "-"}
                          </td>

                          <td className="px-4 py-2 text-sm text-gray-800">
                            {report.ReceivedWeight != null ? report.ReceivedWeight.toFixed(2) : "-"}
                          </td>

                          <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
                            {formatDateTime(report.Receieved_Date) || "-"}
                          </td>
                         
                         
                        </tr>
                      ))}
                    </tbody>
                     <tfoot className="bg-gray-100 font-semibold">
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-800">Total</td>
                          <td></td>
                          <td className="px-4 py-2 text-sm text-gray-800">{totalIssued.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-800">{totalOrnam.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-800">{totalFinding.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-800">{totalReceived.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                  </table>
                </div>
              </div>
            );
})}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingReports;
