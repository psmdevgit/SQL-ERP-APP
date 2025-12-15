'use client';

import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";

//const API_URL = "https://kalash.app";

const API_URL = "http://localhost:4001";

export default function EditOrder() {

const orderNo = new URLSearchParams(window.location.search).get("orderId");
  console.log("Editing order number:", orderNo);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadOrder();
    loadItems();
  }, []);

  

  // ------------------- LOAD ORDER -------------------
const loadOrder = async () => {
  const encoded = encodeURIComponent(orderNo);
  const res = await fetch(`${API_URL}/api/Editorders/${encoded}`);
  const data = await res.json();
  setOrder(data);
};



  // ------------------- LOAD ITEMS -------------------
  const loadItems = async () => {

      const encoded = encodeURIComponent(orderNo);
    const res = await fetch(`${API_URL}/api/Editorders/${encoded}/items`);
    const data = await res.json();
    setItems(data);
   
    console.log("Loaded items:", data);
  };

  // ------------------- UPDATE ORDER -------------------
  const updateOrder = async () => {
    await fetch(`${API_URL}/Editorders/update`, {
      method: "PUT",

      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    alert("Order updated successfully");
  };

  // ------------------- UPDATE ITEMS -------------------
  const updateItems = async () => {
    await fetch(`${API_URL}/Editorders/update-items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    alert("Items updated successfully");
  };

  // ------------------- FRONTEND UI -------------------
  if (!order) return <div>Loading...</div>;

  const updateItemField = (index, key, val) => {
    const cloned = [...items];
    cloned[index][key] = val;
    setItems(cloned);
  };


  const deleteItem = async (itemId) => {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    const res = await fetch(`/api/order-items/delete/${itemId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success) {
      // Remove item from UI
      setItems(items.filter((i) => i.Id !== itemId));
    } else {
      alert("Delete failed: " + data.message);
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
};

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* ORDER INFO CARD */}
    <div className="bg-white shadow rounded-xl p-5 space-y-4">
  <h2 className="text-xl font-bold text-gray-700">Edit Order</h2>

  <table className="w-full border rounded">
    <thead className="bg-gray-100">
      <tr>
        <th className="border p-2">Party Name</th>
        <th className="border p-2">Category</th>
        <th className="border p-2">Purity</th>
        <th className="border p-2">Priority</th>
        <th className="border p-2">Delivery Date</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td className="border p-2">
          <input
            className="border p-2 rounded w-full"
            value={order.partyName}
            onChange={(e) => setOrder({ ...order, partyName: e.target.value })}
          />
        </td>

        <td className="border p-2">
          <input
            className="border p-2 rounded w-full"
            value={order.category}
            onChange={(e) => setOrder({ ...order, category: e.target.value })}
          />
        </td>

        <td className="border p-2">
          <input
            className="border p-2 rounded w-full"
            value={order.purity}
            onChange={(e) => setOrder({ ...order, purity: e.target.value })}
          />
        </td>

        <td className="border p-2">
          <input
            className="border p-2 rounded w-full"
            value={order.priority}
            onChange={(e) => setOrder({ ...order, priority: e.target.value })}
          />
        </td>

        <td className="border p-2">
          <input
            type="date"
            className="border p-2 rounded w-full"
            value={order.deliveryDate?.slice(0, 10)}
            onChange={(e) =>
              setOrder({ ...order, deliveryDate: e.target.value })
            }
          />
        </td>
      </tr>
    </tbody>
  </table>

  <textarea
    className="border p-2 rounded w-full"
    value={order.remark}
    onChange={(e) => setOrder({ ...order, remark: e.target.value })}
    placeholder="Remarks"
  />

  <button
    onClick={updateOrder}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
  >
    Update Order
  </button>
</div>


      {/* ORDER ITEMS */}
<div className="bg-white shadow rounded-xl p-5 mt-5">
  <h2 className="text-xl font-bold text-gray-700 mb-4">
    Edit Order Items
  </h2>
<table className="w-full border rounded">
  <thead className="bg-gray-100">
    <tr>
      <th className="border p-2">Name</th>
      <th className="border p-2">Weight Range</th>
      <th className="border p-2">Size</th>
      <th className="border p-2">Qty</th>
      <th className="border p-2">Remark</th>
      <th className="border p-2 text-center">Delete</th>
    </tr>
  </thead>

  <tbody>
    {items.map((item, index) => (
      <tr key={item.Id}>
        <td className="border p-2">
          <input
            className="border p-2 rounded w-full"
            value={item.Name}
            onChange={(e) =>
              updateItemField(index, "category", e.target.value)
            }
          />
        </td>

        <td className="border p-2">
          <input
            className="border p-2 rounded w-full"
            value={item.weightRange}
            onChange={(e) =>
              updateItemField(index, "weightRange", e.target.value)
            }
          />
        </td>

        <td className="border p-2">
          <input
            className="border p-2 rounded w-full"
            value={item.size}
            onChange={(e) =>
              updateItemField(index, "size", e.target.value)
            }
          />
        </td>

        <td className="border p-2">
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={item.quantity}
            onChange={(e) =>
              updateItemField(index, "quantity", e.target.value)
            }
          />
        </td>

        <td className="border p-2">
          <input
            className="border p-2 rounded w-full"
            value={item.remark}
            onChange={(e) =>
              updateItemField(index, "remark", e.target.value)
            }
          />
        </td>

        {/* DELETE ICON */}
        <td className="border p-2 text-center">
          <button
            onClick={() => deleteItem(item.Id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


  <button
    onClick={updateItems}
    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-3"
  >
    Update Items
  </button>
</div>

    </div>
  );
}
