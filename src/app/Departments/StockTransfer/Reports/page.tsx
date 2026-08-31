"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@mui/material";
import Link from "next/link";

const apiUrl = "https://kalash.app";

interface PendingSummary {
  department: string;
  pendingCount: number;
  totalIssuedWeight: number;
}

interface TxnRow {
  id: number;
  transferNo: string;
  fromDepartment: string;
  toDepartment: string;
  sourceName: string;
  targetName: string;
  pouchId: number;
  pouchName: string;
  transferWeight: number;
  status: string;
  createdDate: string;
}

export default function StockTransferReports() {
  const [pendingData, setPendingData] = useState<PendingSummary[]>([]);
  const [txnData, setTxnData] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [fromDepartment, setFromDepartment] = useState("");
  const [toDepartment, setToDepartment] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadPendingReport = async () => {
    try {
      const res = await fetch(`${apiUrl}/transfer/pending-departments`);
      const data = await res.json();
      if (data.success) setPendingData(data.data || []);
    } catch (err) {
      console.error("Pending report error", err);
    }
  };

  const loadTransactionReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        fromDepartment,
        toDepartment,
        fromDate,
        toDate,
      });

      const res = await fetch(`${apiUrl}/transfer/history?${params}`);
      const data = await res.json();
      if (data.success) setTxnData(data.data || []);
    } catch (err) {
      console.error("Txn report error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingReport();
    loadTransactionReport();
  }, []);

  const formatDate = (d: string) => {
    if (!d) return "-";
    const date = new Date(d);
    return isNaN(date.getTime()) ? d : date.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6 mr-[300px] md:mr-[300px]">
      <div className="mb-4 bg-gray-100 p-4 rounded"></div>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div className="mb-4">
          <Link
            href="/Departments/StockTransfer"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 no-underline"
          >
            Stock Transfer
          </Link>
        </div>

        <h1 className="text-2xl font-bold">Stock Transfer Reports</h1>

        {/* Pending Pouches Summary */}
        <div className="bg-white border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Pending Pouches by Department</h2>
            <button
              onClick={loadPendingReport}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
            >
              Refresh
            </button>
          </div>

          {pendingData.length === 0 ? (
            <p className="text-gray-500">No pending data found</p>
          ) : (
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-left">Department</th>
                  <th className="p-2 border text-right">Pending Records</th>
                  <th className="p-2 border text-right">Total Issued Weight (g)</th>
                  <th className="p-2 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingData.map((row) => (
                  <tr key={row.department} className="hover:bg-gray-50">
                    <td className="p-2 border font-medium">{row.department}</td>
                    <td className="p-2 border text-right">
                      {row.pendingCount}
                    </td>
                    <td className="p-2 border text-right">
                      {Number(row.totalIssuedWeight).toFixed(4)}
                    </td>
                    <td className="p-2 border text-center">
                      <Link
                        href={`/Departments/StockTransfer?fromDepartment=${encodeURIComponent(
                          row.department
                        )}`}
                        className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 no-underline"
                      >
                        Transfer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Transfer History */}
        <div className="bg-white border rounded p-4 space-y-4">
          <h2 className="font-semibold">Transfer History</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input
              placeholder="From Department"
              value={fromDepartment}
              onChange={(e) => setFromDepartment(e.target.value)}
            />
            <Input
              placeholder="To Department"
              value={toDepartment}
              onChange={(e) => setToDepartment(e.target.value)}
            />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button
              onClick={loadTransactionReport}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">Date</th>
                <th className="p-2 border text-left">Transfer No</th>
                <th className="p-2 border text-left">From</th>
                <th className="p-2 border text-left">To</th>
                <th className="p-2 border text-left">Source Record</th>
                <th className="p-2 border text-left">Target Record</th>
                <th className="p-2 border text-left">Pouch</th>
                <th className="p-2 border text-right">Weight (g)</th>
                <th className="p-2 border text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {txnData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{formatDate(row.createdDate)}</td>
                  <td className="p-2 border">{row.transferNo}</td>
                  <td className="p-2 border">{row.fromDepartment}</td>
                  <td className="p-2 border">{row.toDepartment}</td>
                  <td className="p-2 border">{row.sourceName}</td>
                  <td className="p-2 border">{row.targetName}</td>
                  <td className="p-2 border">{row.pouchName}</td>
                  <td className="p-2 border text-right">
                    {Number(row.transferWeight).toFixed(4)}
                  </td>
                  <td className="p-2 border">{row.status}</td>
                </tr>
              ))}

              {!loading && txnData.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-3 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}