'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button, Input } from "@mui/material";

interface InventoryItem {
  id: string;
  itemName: string;
  purity: string;
  availableWeight: number;
  issueWeight: number;
  productType: string;
}

interface ApiInventoryItem {
  name: string;
  purity: string;
  availableWeight: number;
}

interface SelectedItem {
  name: string;
  purity: string;
  availableWeight: number;
  issueWeight: number;
}

const apiUrl = "https://kalash.app";

export default function Handmade() {

  const [mode, setMode] = useState<"INV_TO_HAND" | "HAND_TO_INV" | null>(null);

  const [inventoryApiItems, setInventoryApiItems] = useState<ApiInventoryItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
const [handmadeStock, setHandmadeStock] = useState(0);
const [handmadeProducts, setHandmadeProducts] = useState([]);

  const [productType, setProductType] = useState("");

  const [selectedItem, setSelectedItem] = useState<SelectedItem>({
    name: "",
    purity: "",
    availableWeight: 0,
    issueWeight: 0
  });

  /* ================= FETCH ================= */
useEffect(() => {
  fetchInventoryItems();

  if (mode === "HAND_TO_INV") {
    fetchHandmadeProducts();
  }
}, [mode]);

  const fetchInventoryItems = async () => {
    try {
      const res = await fetch(`${apiUrl}/get-inventory`);
      const json = await res.json();
      if (json.success) setInventoryApiItems(json.data);
    } catch (err) {
      console.error("Fetch inventory error", err);
    }
  };
const fetchHandmadeProducts = async () => {
  try {
    const res = await fetch(`${apiUrl}/get-handmade-products`);
    const data = await res.json();

    console.log("✅ Handmade API Response:", data);

    if (data.success) {
      setHandmadeProducts(data.data);   // [{ name, availableWeight }]
    } else {
      console.error("❌ Handmade API Error:", data.message);
    }
  } catch (err) {
    console.error("❌ Failed to load handmade products", err);
  }
};


  const fetchHandmadeItems = async () => {
    try {
      const res = await fetch(`${apiUrl}/get-HandMadeInventory`);
      const json = await res.json();
      if (json.success) setInventoryApiItems(json.data);
    } catch (err) {
      console.error("Fetch handmade error", err);
    }
  };

  /* ================= MODE HANDLER ================= */

  const selectMode = (m: "INV_TO_HAND" | "HAND_TO_INV") => {
    setMode(m);
    setInventoryItems([]);
    setSelectedItem({
      name: "",
      purity: "",
      availableWeight: 0,
      issueWeight: 0
    });

    if (m === "INV_TO_HAND") fetchInventoryItems();
    if (m === "HAND_TO_INV") fetchInventoryItems();   // inventory list only
  };

  /* ================= ITEM SELECTION ================= */

  const handleItemSelection = (name: string) => {
    const found = inventoryApiItems.find(i => i.name === name);
    if (!found) return;

    setSelectedItem({
      name: found.name,
      purity: found.purity,
      availableWeight: found.availableWeight,
      issueWeight: 0
    });
  };

  /* ================= ADD ITEM ================= */
const handleAddInventoryItem = () => {

  if (!selectedItem.name) {
    alert("Select item");
    return;
  }

  if (!productType && mode === "INV_TO_HAND") {
    alert("Select product type");
    return;
  }

  if (selectedItem.issueWeight <= 0) {
    alert("Enter valid issue weight");
    return;
  }

  // ✅ Dynamic available stock based on mode
  const availableStock =
    mode === "INV_TO_HAND"
      ? selectedItem.availableWeight      // Inventory stock
      : handmadeStock;                    // Handmade stock

  if (selectedItem.issueWeight > availableStock) {
    alert(`Issue weight exceeds available stock (${availableStock})`);
    return;
  }

  const newItem: InventoryItem = {
    id: Date.now().toString(),
    itemName: selectedItem.name,
    purity: selectedItem.purity,
    availableWeight: availableStock,
    issueWeight: selectedItem.issueWeight,
    productType: productType || ""
  };

  setInventoryItems(prev => [...prev, newItem]);

  // ✅ Reduce handmade stock live (HAND_TO_INV only)
  if (mode === "HAND_TO_INV") {
    setHandmadeStock(prev => prev - selectedItem.issueWeight);
  }

  // ✅ Reset fields
  setSelectedItem({
    name: "",
    purity: "",
    availableWeight: 0,
    issueWeight: 0
  });
};


  /* ================= REMOVE ITEM ================= */

  const handleRemoveInventoryItem = (id: string) => {
    setInventoryItems(prev => prev.filter(i => i.id !== id));
  };

  /* ================= SUBMIT ================= */

  const submitTransfer = async () => {

    if (!mode || inventoryItems.length === 0) {
     
      alert("Nothing to submit");
      return;
    }
if (mode === "HAND_TO_INV" && !productType) {
  alert("Please select Handmade Product Type");
  return;
}

   const payload = {
  mode,
  productType, // ✅ send selected handmade product type
  items: inventoryItems.map(item => ({
    itemName: item.itemName,
    purity: item.purity,
    availableWeight: item.availableWeight,
    issueWeight: item.issueWeight,
    productType: productType,   // ✅ force send
    partyledger: "0001"
  }))
};


    console.log("PAYLOAD:", payload);

    try {
      const url =
        mode === "INV_TO_HAND"
          ? `${apiUrl}/transfer`
          : `${apiUrl}/HandMadetransfer`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Transfer failed");
        return;
      }

      alert("Transfer successful ✅");

      setInventoryItems([]);
      setMode(null);

    } catch (err) {
      console.error("Submit error", err);
      alert("Server error");
    }
  };

  /* ================= UI ================= */

  return (
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 mr-[300px] md:mr-[300px]">
               <div className="mb-4 bg-gray-100 p-4 rounded"></div>
    <div className="p-6 max-w-5xl mx-auto">
  
      <h1 className="text-2xl font-bold mb-6">Handmade Department</h1>

      {/* MODE BUTTONS */}
      <div className="flex gap-4 mb-6">
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded"
          onClick={() => selectMode("INV_TO_HAND")}
        >
          Inventory ➜ Handmade
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => selectMode("HAND_TO_INV")}
        >
          Handmade ➜ Inventory
        </button>
         <div className="breadcrumb__btn">
              <Link 
                href="/Departments/Handmade/Reports"
                className="btn btn-primary"
              >
               Transaction Reports
              </Link>    
            </div>
      </div>

      {/* FORM */}
      {mode && (
        <div className="border rounded p-4 space-y-4 bg-gray-50">

<div className="header-txt">
  <h3>
    {mode === "INV_TO_HAND"
      ? "Transfer from Inventory to Handmade"
      : "Transfer from Handmade to Inventory"}
  </h3>
  </div>
          {/* PRODUCT TYPE */}
         {/* PRODUCT TYPE */}
{(mode === "INV_TO_HAND" || mode === "HAND_TO_INV") && (

  
  <div>
  <Label>Product Type</Label>

  <Select
    value={productType}
    onValueChange={(value) => {
      setProductType(value);

      // ✅ Only for HAND_TO_INV load handmade stock
      if (mode === "HAND_TO_INV") {
        const selected = handmadeProducts.find(
          (x: any) => x.name === value
        );

        setHandmadeStock(
          selected ? Number(selected.availableWeight) : 0
        );
      }
    }}
  >
    <SelectTrigger className="bg-white text-black border border-gray-300">
      <SelectValue placeholder="Select Type" />
    </SelectTrigger>

    <SelectContent className="bg-white text-black border border-gray-300 shadow-md">
      {/* Inventory ➜ Handmade */}
      {mode === "INV_TO_HAND" && (
        <>
          <SelectItem className="hover:bg-gray-100" value="COIN">
            COIN
          </SelectItem>
          <SelectItem className="hover:bg-gray-100" value="THAPPA">
            THAPPA
          </SelectItem>
          <SelectItem className="hover:bg-gray-100" value="HANDMADE">
            HANDMADE
          </SelectItem>
          <SelectItem className="hover:bg-gray-100" value="OTHER">
            OTHER
          </SelectItem>
        </>
      )}

      {/* Handmade ➜ Inventory */}
      {mode === "HAND_TO_INV" &&
        handmadeProducts.map((p: any) => (
          <SelectItem
            key={p.name}
            value={p.name}
            className="hover:bg-gray-100"
          >
            {p.name}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>

)}



          {/* ITEM NAME */}
          {/* <div className="w-full overflow-relative ">
            <Label>Item Name</Label>
            <Select value={selectedItem.name} onValueChange={handleItemSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>
              <SelectContent>
                {inventoryApiItems.map(item => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          <div className="w-50">
            <Label>Item Name</Label>

            <Select value={selectedItem.name} onValueChange={handleItemSelection}>
              <SelectTrigger className="bg-white text-black border border-gray-300">
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>

              <SelectContent className="bg-white text-black border border-gray-300 shadow-md">
                {inventoryApiItems.map((item) => (
                  <SelectItem
                    key={item.name}
                    value={item.name}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          {/* PURITY */}
          <div>
            <Label className="mb-1 block text-sm font-medium text-gray-700">Purity</Label>
            &nbsp; &nbsp;<Input value={selectedItem.purity} readOnly />
          </div>

          {/* AVAILABLE */}
          {/* AVAILABLE */}
<div>
  <Label className="mb-1 block text-sm font-medium text-gray-700">Available Weight</Label>
  &nbsp; &nbsp;<Input
  
  className="hover:bg-gray-100 focus:bg-gray-100"
    value={
      mode === "HAND_TO_INV"
        ? handmadeStock               // ✅ handmade stock
        : selectedItem.availableWeight // ✅ inventory stock
    }
    readOnly
  />
</div>

          {/* ISSUE */}
          <div>
            <Label  className="mb-1 block text-sm font-medium text-gray-700">Issue Weight</Label>
           &nbsp; &nbsp; <Input
              type="number"
              className="hover:bg-gray-100 focus:bg-gray-100"
              value={selectedItem.issueWeight}
              onChange={e =>
                setSelectedItem({
                  ...selectedItem,
                  issueWeight: Number(e.target.value)
                })
              }
            />
          </div>

          <button
onClick={handleAddInventoryItem}  
  className="bg-yellow-600 text-white hover:bg-green-700 px-5 py-2 rounded-md shadow me-3"
>
            Add Item
          </button>

          {/* ITEMS TABLE */}
          {inventoryItems.length > 0 && (
<div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
  <table className="min-w-full border-collapse bg-white">
    <thead className="bg-gray-100 border-b">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
          Item Name
        </th>
        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
          Purity
        </th>
        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
          Issue Weight
        </th>
        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
          Product Type
        </th>
        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
          Action
        </th>
      </tr>
    </thead>

    <tbody>
      {inventoryItems.map((i, index) => (
        <tr
          key={i.id}
          className={`border-b hover:bg-gray-50 transition ${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          }`}
        >
          <td className="px-4 py-2 text-sm text-gray-800">
            {i.itemName}
          </td>

          <td className="px-4 py-2 text-center text-sm text-gray-800">
            {i.purity}
          </td>

          <td className="px-4 py-2 text-center text-sm font-medium text-gray-900">
            {i.issueWeight}
          </td>

          <td className="px-4 py-2 text-center text-sm text-gray-800">
            {i.productType || "-"}
          </td>

          <td className="px-4 py-2 text-center">
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => handleRemoveInventoryItem(i.id)}
            >
              Remove
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          )}

          <button
            className="bg-yellow-600 text-white hover:bg-green-700 px-5 py-2 rounded-md shadow"
            onClick={submitTransfer}
          >
            Submit Transfer
          </button>
        </div>
      )}
    </div>
    </div>

  );
}

