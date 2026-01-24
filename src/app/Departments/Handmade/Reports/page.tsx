'use client';

import React, { useEffect, useState } from "react";
import { Input  } from "@mui/material";
import { Button } from "@/components/ui/button";
import Link from "next/link";

//const apiUrl = "https://kalash.app";

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
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  // ---------------- LOAD TRANSACTION REPORT ----------------
const loadTransactionReport = async () => {
  try {
    setLoading(true);

    const params = new URLSearchParams({
      fromDate,
      toDate,
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

  const [editedRows, setEditedRows] = useState({});
  const [showModal, setShowModal] = useState(false);
const [activeRow, setActiveRow] = useState<any>(null);
const [showViewModal, setShowViewModal] = useState(false);
const [viewRow, setViewRow] = useState<any>(null);


const [modalData, setModalData] = useState({
  meltingRecip: "",
  cuttingRecip: "",
  drumRecip: "",
  meltingLoss: 0,
  cuttingLoss: 0,
  drumLoss: 0,
  totalLoss: 0,
});
const openViewModal = (row) => {
  setViewRow(row);
  setShowViewModal(true);
};

const openEditModal = (row) => {
  setActiveRow(row);

  setModalData({
    meltingRecip: row.MeltingRecip || "",
    cuttingRecip: row.CuttingRecip || "",
    drumRecip: row.DrumPolishRecipt || "",
    meltingLoss: 0,
    cuttingLoss: 0,
    drumLoss: 0,
    totalLoss: 0,
  });

  setShowModal(true);
};
const updateModal = (field, value) => {
  const updated = { ...modalData, [field]: value };

  const issued = Number(activeRow?.IssuedWeight || 0);
  const meltingRecip = Number(updated.meltingRecip || 0);
  const cuttingRecip = Number(updated.cuttingRecip || 0);
  const drumRecip = Number(updated.drumRecip || 0);

  updated.meltingLoss = issued - meltingRecip;
  updated.cuttingLoss = meltingRecip - cuttingRecip;
  updated.drumLoss = cuttingRecip - drumRecip;
  updated.totalLoss = issued - drumRecip;

  setModalData(updated);
};


const updateRow = (index, field, value) => {
  const updated = { ...(editedRows[index] || {}), [field]: value };

  const issued = Number(txnData[index].IssuedWeight || 0);

  const meltingRecip = Number(updated.meltingRecip || 0);
  const cuttingRecip = Number(updated.cuttingRecip || 0);
  const drumRecip = Number(updated.drumRecip || 0);

  updated.meltingLoss = issued - meltingRecip;
  updated.cuttingLoss = meltingRecip - cuttingRecip;
  updated.drumLoss = cuttingRecip - drumRecip;
  updated.totalLoss = issued - drumRecip;

  setEditedRows(prev => ({
    ...prev,
    [index]: updated
  }));
};

const saveModalData = async () => {
  const payload = {
    id: activeRow.Id,
    ...modalData
  };

  console.log("Saving payload:", payload);
  const res = await fetch(`${apiUrl}/updateHandmadeLoss`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows: [payload] })
  });

  const data = await res.json();

  if (data.success) {
    alert("Updated successfully");
    setShowModal(false);
    loadTransactionReport();
  }
};


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
  value={fromDate}
  onChange={e => setFromDate(e.target.value)}
  placeholder="From Date"
/>

<Input
  type="date"
  value={toDate}
  onChange={e => setToDate(e.target.value)}
  placeholder="To Date"
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
             <th>Issued</th>
<th className="p-2 border">Action</th>


      
              <th className="p-2 border">Mode</th>
              <th className="p-2 border text-center">View</th>

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
               <td>{Number(row.IssuedWeight).toFixed(3)}</td>

<td className="p-2 border text-center">
<Button size="sm" onClick={() => openEditModal(row)}>
  Edit
</Button>

</td>


                <td className="p-2 border">{row.Mode}</td>
                <td className="p-2 border text-center">
  {row.MeltingRecip ? (
    <button
      title="View / Edit Loss"
      onClick={() => openViewModal(row)}
      className="text-blue-600 hover:text-blue-800"
    >
      👁️
    </button>
  ) : (
    <span className="text-gray-400">—</span>
  )}
</td>

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

          {showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-[500px] p-5 space-y-4">

      <h3 className="text-lg font-semibold">
        Edit Loss – {activeRow?.ProductType}
      </h3>

      <div className="grid grid-cols-2 gap-3">

        <div>
          <label>Melting Receipt</label>
          <Input
            value={modalData.meltingRecip}
            onChange={e => updateModal("meltingRecip", e.target.value)}
          />
        </div>

        <div>
          <label>Melting Loss</label>
          <Input value={modalData.meltingLoss.toFixed(3)} disabled />
        </div>

        <div>
          <label>Cutting Receipt</label>
          <Input
            value={modalData.cuttingRecip}
            onChange={e => updateModal("cuttingRecip", e.target.value)}
          />
        </div>

        <div>
          <label>Cutting Loss</label>
          <Input value={modalData.cuttingLoss.toFixed(3)} disabled />
        </div>

        <div>
          <label>Drum Receipt</label>
          <Input
            value={modalData.drumRecip}
            onChange={e => updateModal("drumRecip", e.target.value)}
          />
        </div>

        <div>
          <label>Drum Loss</label>
          <Input value={modalData.drumLoss.toFixed(3)} disabled />
        </div>

        <div className="col-span-2">
          <label>Total Loss</label>
          <Input value={modalData.totalLoss.toFixed(3)} disabled />
        </div>

      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button onClick={saveModalData}>
          Submit
        </Button>
      </div>

    </div>
  </div>
)}
{showViewModal && viewRow && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-[520px] p-6 space-y-4">

      <h3 className="text-lg font-semibold text-center">
        Loss Details
      </h3>

      <div className="grid grid-cols-2 gap-3 text-sm">

        <div><b>Issued Weight:</b> {Number(viewRow.IssuedWeight).toFixed(3)}</div>

        <div><b>Melting Receipt:</b> {viewRow.MeltingRecip || 0}</div>
        <div><b>Melting Loss:</b> {viewRow.MeltingLoss || 0}</div>

        <div><b>Cutting Receipt:</b> {viewRow.cuttingRecip || 0}</div>
        <div><b>Cutting Loss:</b> {viewRow.cuttingLoss || 0}</div>

        <div><b>Drum Receipt:</b> {viewRow.drumPolishRecipt || 0}</div>
        <div><b>Drum Loss:</b> {viewRow.drumPolishLoss || 0}</div>

        <div className="col-span-2 font-semibold text-green-700">
          Total Loss:{" "}
          {(Number(viewRow.IssuedWeight || 0) -
            Number(viewRow.drumPolishRecipt || 0)).toFixed(3)}
        </div>

        <div className="col-span-2">
          <b>Status:</b> {viewRow.status || "Pending"}
        </div>

      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowViewModal(false)}>
          Close
        </Button>
      </div>

    </div>
  </div>
)}

        </table>

      </div>

    </div>
    </div>
  );
}

