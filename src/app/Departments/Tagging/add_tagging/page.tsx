
"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useRouter } from 'next/navigation';

interface CuttingData {
  Id: string;
  Name: string;
  Issued_Date__c: string;
  Returned_weight__c: number;
  Received_Date__c: string;
  Status__c: string;
  Quantity__c: number;
  Product__c: string;
  Order_Id__c: string;
}

export default function AddTagging() {
  const searchParams = useSearchParams();
  const cuttingId = searchParams.get("cuttingId");

  const [cutting, setCutting] = useState<CuttingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [taggingId, setTaggingId] = useState("");
  const [receivedWeight, setReceivedWeight] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  
    const router = useRouter();

  const apiBaseUrl = "http://localhost:4001";

  
  // const apiBaseUrl = "https://kalash.app";

  useEffect(() => {
    if (!cuttingId) return;

    const parts = cuttingId.split("/");
    if (parts.length !== 6) {
      console.error("Invalid cuttingId format:", cuttingId);
      return;
    }

    const [prefix, date, month, year, number, subnum] = parts;
    const generatedTagId = `TAG/${date}/${month}/${year}/${number}/${subnum}`;
    setTaggingId(generatedTagId);

    const fetchCutting = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${apiBaseUrl}/api/cutting-tagging/${prefix}/${date}/${month}/${year}/${number}/${subnum}`
        );
        const data = await res.json();

        if (data.success) {
          setCutting(data.data.cutting);
          setReceivedWeight(data.data.cutting.Returned_weight__c ?? 0);
          setQuantity(data.data.cutting.Quantity__c ?? 0);
        } else {
          console.error("API error:", data.message);
        }
      } catch (err) {
        console.error("Error fetching cutting details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCutting();
  }, [cuttingId]);

//   const handleSubmit = () => {
//     if (!cutting) return;

//     const updatedData = {
//       TaggingId: taggingId,
//       Order: cutting.Order_Id__c,
//       Product: cutting.Product__c,
//       Quantity: quantity,
//       ReceivedWeight: receivedWeight,
//       IssuedDate: cutting.Issued_Date__c,
//       ReceivedDate: cutting.Received_Date__c,
//     };

//     alert(`✅ Tagging Details:
// Tagging ID: ${updatedData.TaggingId}
// Order: ${updatedData.Order}
// Product: ${updatedData.Product}
// Quantity: ${updatedData.Quantity}
// Received Weight: ${updatedData.ReceivedWeight}
// Issued Date: ${new Date(updatedData.IssuedDate).toLocaleDateString()}
// Received Date: ${new Date(updatedData.ReceivedDate).toLocaleDateString()}
// `);
//   };

const handleSubmit = async () => {
  if (!cutting) return;

  const payload = {
    cuttingId: cuttingId,
    Name: taggingId,
    product: cutting.Product__c,
    Received_weight: receivedWeight,
    quantity: quantity,
    Order_id: cutting.Order_Id__c,
    issued_date: new Date().toISOString(),   // current date/time
    received_date: new Date().toISOString(), // current date/time
  };

  try {
    const res = await fetch(`${apiBaseUrl}/api/tagging-add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Tagging inserted successfully!");  
        setTimeout(() => {
        router.push("/Departments/Tagging/Tagging_Table");
      }, 1000);    
    } else {
      alert(`❌ Failed: ${data.message}`);
    }
  } catch (error) {
    alert("⚠️ Tagging Not Submit....");
    console.error(error);
  }
};

  if (loading) return <div className="p-4">Loading...</div>;
  if (!cutting)
    return <div className="p-4 text-red-500">No cutting data found.</div>;

  return (
    <div className="p-6 flex justify-end">
      <div
        className="w-[80%] bg-white rounded-lg shadow p-6 border border-gray-200"
        style={{ marginTop: "100px" }}
      >
        <h1 className="text-xl font-bold mb-4 text-center">Tagging Details</h1>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 border p-4 rounded-lg shadow-inner">
          <div>
            <label className="block text-sm font-medium">Tagging ID</label>
            <input
              type="text"
              value={taggingId}
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Order</label>
            <input
              type="text"
              value={cutting.Order_Id__c}
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Product</label>
            <input
              type="text"
              value={cutting.Product__c ?? "-"}
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Received Weight</label>
            <input
              type="number"
              value={receivedWeight}
              onChange={(e) => setReceivedWeight(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Issued Date</label>
            <input
              type="text"
              value={
                cutting.Issued_Date__c
                  ? new Date(cutting.Issued_Date__c).toLocaleDateString()
                  : "-"
              }
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Received Date</label>
            <input
              type="text"
              value={
                cutting.Received_Date__c
                  ? new Date(cutting.Received_Date__c).toLocaleDateString()
                  : "-"
              }
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-start">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
