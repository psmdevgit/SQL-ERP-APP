'use client';

import React, { useEffect, useState } from "react";
import { Input  } from "@mui/material";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const apiUrl = "http://localhost:4001";

export default function HandmadeReports() {

  const [stockData, setStockData] = useState<any[]>([]);
  const [txnData, setTxnData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("");
  const [productType, setProductType] = useState("");

  // ---------------- LOAD STOCK SUMMARY ----------------
  const loadStockReport = async () => {
    try {
      const res = await fetch(`${apiUrl}/report/handmade-stock`);
      const data = await res.json();
      if (data.success) setStockData(data.data);
    } catch (err) {
      console.error("Stock report error", err);
    }
  };

  // ---------------- LOAD TRANSACTION REPORT ----------------
  const loadTransactionReport = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        date,
        mode,
        productType
      });

      const res = await fetch(
        `${apiUrl}/report/handmade-transactions?${params}`
      );

      const data = await res.json();
      if (data.success) setTxnData(data.data);

    } catch (err) {
      console.error("Txn report error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockReport();
  }, []);

  // ----------------------------------------------------

  return (
     <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 mr-[300px] md:mr-[300px]">
               <div className="mb-4 bg-gray-100 p-4 rounded"></div>
    <div className="p-6 max-w-6xl mx-auto space-y-8">


  <div className="mb-4">
 <Link
  href="/Departments/Handmade/CreateHandMade"
  className="inline-block bg-green-500 text-white px-4 py-2 rounded 
             hover:bg-blue-600 no-underline"
>
  Create HandMade
</Link>
</div>
      <h1 className="text-2xl font-bold">Handmade Reports</h1>

      {/* ================= STOCK SUMMARY ================= */}
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-3">Handmade Stock Summary</h2>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Product Type</th>
              <th className="p-2 border">Available Weight</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((row, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{row.ProductType}</td>
                <td className="p-2 border text-right">
                  {Number(row.Weight).toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= TRANSACTION REPORT ================= */}
      <div className="bg-white border rounded p-4 space-y-4">

        <h2 className="font-semibold">Transaction Report</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <select
            className="border rounded px-2"
            value={mode}
            onChange={e => setMode(e.target.value)}
          >
            <option value="">All Modes</option>
            <option value="INV TO HAND">Inventory → Handmade</option>
            <option value="HAND TO INV">Handmade → Inventory</option>
          </select>

          <Input
            placeholder="Product Type"
            value={productType}
            onChange={e => setProductType(e.target.value)}
          />

          <Button onClick={loadTransactionReport}>
            Search
          </Button>
        </div>

        {/* Grid */}
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">From</th>
              <th className="p-2 border">To</th>
              <th className="p-2 border">From Metal</th>
              <th className="p-2 border">To Metal</th>
              <th className="p-2 border">Issued Weight</th>
              <th className="p-2 border">Mode</th>
            </tr>
          </thead>

          <tbody>
            {txnData.map((row, idx) => (
              <tr key={idx}>
                <td className="p-2 border">
                  {new Date(row.TranDate).toLocaleDateString()}
                </td>
                <td className="p-2 border">{row.FromLocation}</td>
                <td className="p-2 border">{row.ToLocation}</td>
                <td className="p-2 border">{row.FromMetal}</td>
                <td className="p-2 border">{row.ToMetal}</td>
                <td className="p-2 border text-right">
                  {Number(row.IssuedWeight).toFixed(3)}
                </td>
                <td className="p-2 border">{row.Mode}</td>
              </tr>
            ))}

            {!loading && txnData.length === 0 && (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
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
