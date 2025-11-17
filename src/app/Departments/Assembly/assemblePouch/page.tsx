"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// -----------------------------
// Configuration
// -----------------------------
// const apiBaseUrl = "http://localhost:4001"; // change to 

const apiBaseUrl ="https://kalash.app"

// -----------------------------
// Types (partial, flexible to tolerate column name variations)
// -----------------------------
interface CastingRecord {
  Name: string;
  Id?: number;
  Issud_weight_c?: number;
  Issued_Weight_c?: number;
  Weight_Received_c?: number;
  Received_Weight_c?: number;
  UsedWeightPouch_c?: number;
  Available_Weight_c?: number;
}

interface SelectedCasting {
  castingName: string; // Name string (e.g. "29/10/2025/01")
  usedWeight: number;  // entered by user
  available: number;   // computed from record
}

// -----------------------------
// Component
// -----------------------------

export default function AddFilingDetailsPage() {
  // existing hooks from your original file
  const searchParams = useSearchParams();
  const castingIdFromQuery = searchParams.get("castingId");
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);

  // Casting details for the single-casting existing flow (kept)
  const [castingDetails, setCastingDetails] = useState<any>({
    id: "",
    receivedWeight: 0,
    receivedDate: "",
    orders: [],
  });

  // Existing pouch creation states (kept from your earlier code)
  const [bagName, setBagName] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>("");
  const [receivedWeight, setReceivedWeight] = useState<number>(0);
  const [receivedDate, setReceivedDate] = useState<string>("");
  const [pouchWeights, setPouchWeights] = useState<Record<string, number>>({});
  const [bags, setBags] = useState<Array<{ bagName: string; order: string; weight: number }>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorizedModels, setCategorizedModels] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCategoryQuantities, setSelectedCategoryQuantities] = useState<any[]>([]);
  const [pouchCategories, setPouchCategories] = useState<Record<string, any[]>>({});
  const [currentEditingPouch, setCurrentEditingPouch] = useState<string>("");
  const [issuedDate, setIssuedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [issuedTime, setIssuedTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
  });
  const [filingIssuedWeight, setFilingIssuedWeight] = useState<number>(0);

  // Additional states introduced for multi-casting
  const [allCastings, setAllCastings] = useState<CastingRecord[]>([]);
  const [selectedCastings, setSelectedCastings] = useState<SelectedCasting[]>([]);
  const [mergedBaseId, setMergedBaseId] = useState<string>(""); // e.g. 29/10/2025/01-03
  const [mergedSuffix, setMergedSuffix] = useState<string>("A"); // manual typed suffix
  const [mergedCastingId, setMergedCastingId] = useState<string>(""); // final: 29/10/2025/01-03/A
  const [orderDropdown, setOrderDropdown] = useState([]);


  // Keep the "castingId" field (used by the original form); we'll populate it with mergedCastingId
  const [castingId, setCastingId] = useState<string>(castingIdFromQuery ?? "");

  // For pouch id base generation
  const [formattedId, setFormattedId] = useState<string>("");


  const [castingUsedWeights, setCastingUsedWeights] = useState({});
const totalCastingUsedWeight = Object.values(castingUsedWeights)
  .reduce((a, b) => a + Number(b || 0), 0);


  // -----------------------------
  // Fetch castings for multi-select top section
  // -----------------------------
  useEffect(() => {
    const fetchCastings = async () => {
      try {
        setLoading(true);
        // endpoint should return list of casting records
        const res = await fetch(`${apiBaseUrl}/api/Pouchcasting`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAllCastings(json.data);
        } else {
          console.warn("Pouchcasting endpoint returned no data", json);
          setAllCastings([]);
        }
      } catch (err) {
        console.error("Error fetching pouch castings", err);
        setAllCastings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCastings();
  }, []);

  // -----------------------------
  // Utility: compute available weight for a casting record
  // -----------------------------
  const computeAvailable = (r: CastingRecord) => {
    if (typeof r.Available_Weight_c === "number") return r.Available_Weight_c;
    const received = r.Weight_Received_c ?? r.Received_Weight_c ?? r.Issud_weight_c ?? r.Issued_Weight_c ?? 0;
    const used = r.UsedWeightPouch_c ?? 0;
    return received - used;
  };

  // -----------------------------
  // Top-section: select/deselect castings and set used weight per casting
  // -----------------------------
  const toggleSelectCasting = (record: CastingRecord) => {
    setMergedBaseId("");
    setMergedSuffix("A");
    setMergedCastingId("");
    setFormattedId("");

    const already = selectedCastings.find((c) => c.castingName === record.Name);
    if (already) {
      setSelectedCastings((prev) => prev.filter((p) => p.castingName !== record.Name));
    } else {
      const available = computeAvailable(record);
      setSelectedCastings((prev) => [...prev, { castingName: record.Name, usedWeight: 0, available }]);
    }
  };

  const handleUsedWeightChange = (castingName: string, value: number) => {
    setSelectedCastings((prev) => prev.map((p) => (p.castingName === castingName ? { ...p, usedWeight: value } : p)));
    console.log(selectedCastings);
  };

  // -----------------------------
  // Generate merged base id (range) and final id using manual suffix
  // -----------------------------
  const   generateMergedBase = () => {
    if (selectedCastings.length === 0) {
      toast.error("Select at least one casting to merge");
      return;
    }

    // parse date parts & last number parts
    const parsed = selectedCastings.map((s) => {
      const parts = s.castingName.split("/").map((x) => x.trim());
      const datePart = parts.slice(0, 3).join("/");
      const last = parts[parts.length - 1];
      const num = parseInt(last, 10);
      return { original: s.castingName, datePart, num: isNaN(num) ? 0 : num, last };
    });

    // use datePart of first (if others differ, we still proceed using first datePart)
    const datePart = parsed[0].datePart;
    const nums = parsed.map((p) => p.num).sort((a, b) => a - b);
    const minNum = nums[0].toString().padStart(2, "0");
    const maxNum = nums[nums.length - 1].toString().padStart(2, "0");

    const base = `${datePart}/${minNum}-${maxNum}`; // e.g., 29/10/2025/01-03
    setMergedBaseId(base);

    // if a manual suffix already set use it else default to 'A' (user typed)
    const suffix = mergedSuffix || "A";
    const final = `${base}/${suffix}`;
    
    const usedWeight = selectedCastings.reduce((sum, s) => sum + (s.usedWeight ?? 0), 0);

    setMergedCastingId(final);

    // write into the lower Casting ID field used by the form
    setCastingId(final);

    setReceivedWeight(usedWeight);

    // generate formattedId used by pouch (Pouch Creation ID) — keep similar pattern to your earlier formattedId
    setFormattedId(`PC/${final}`);

     fetchSelectedCastingDetails();

    // optionally show total available (sum)
    const totalAvailable = selectedCastings.reduce((sum, s) => sum + (s.available ?? 0), 0);
    

    console.log("Total available weight for merged castings:", totalAvailable,usedWeight);
    toast.success(`Merged: ${final} — total available ${totalAvailable.toFixed(4)}g`);
    
  };

  const fetchSelectedCastingDetails = async () => {
  try {
    if (!selectedCastings || selectedCastings.length === 0) {
      toast.error("Please select casting IDs first");
      return;
    }

    let allOrderIds = [];

    for (const castId of selectedCastings) {
      const parts = castId.castingName.split("/");
      if (parts.length < 4) continue;

      const [date, month, year, number] = parts.slice(-4);
      const apiUrl = `${apiBaseUrl}/api/casting/all/${date}/${month}/${year}/${number}`;

      console.log("Calling GET:", apiUrl);

      const res = await fetch(apiUrl);
      const result = await res.json();
      
      const data = result.data;


      if (!result.success) continue;

       const { casting = {}, orders = [] } = data || {};

        const receivedWeightValue =
          casting.Weight_Received_c ??
          casting.Received_Weight_c ??
          casting.ReceivedWeight_c ??
          casting.Weight_c ??
          0;

        const issuedWeightValue =
          casting.Issud_weight_c ??
          casting.IssuedWeight_c ??
          0;

        const formattedDate = casting.Received_Date_c
          ? new Date(casting.Received_Date_c).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        const castingDetailsData = {
          id: casting.Id ?? null,
          name: casting.Name ?? castingId,
          issuedDate: casting.Issued_Date_c ? new Date(casting.Issued_Date_c).toISOString().split("T")[0] : "",
          issuedWeight: issuedWeightValue,
          receivedWeight: receivedWeightValue,
          receivedDate: formattedDate,
          status: casting.Status_c ?? "Pending",
          loss: casting.Casting_Loss_c ?? 0,
          orders: Array.isArray(orders) ? orders : [],
        };
        
      setCastingDetails(castingDetailsData);

      // ⭐ Extract orders from result.data.orders
      // const orders = Array.isArray(result.data.orders)
      //   ? result.data.orders
      //   : [];

      // Collect only Order_Id_c
      const extractedIds = orders
        .map(o => o.Order_Id_c)
        .filter(Boolean); // remove null

      allOrderIds = [...allOrderIds, ...extractedIds];
    }

    // Remove Duplicate Order Ids
    const uniqueOrderIds = [...new Set(allOrderIds)];

    setOrderDropdown(uniqueOrderIds);
    console.log("Final Order Dropdown:", uniqueOrderIds);

  } catch (err) {
    console.error(err);
    toast.error("Failed fetching casting details");
  }
};

// const fetchSelectedCastingDetails = async () => {
//   try {
//     if (!selectedCastings || selectedCastings.length === 0) {
//       toast.error("Please select casting IDs first");
//       return;
//     }

//     let allDetails = [];

//     for (const castId of selectedCastings) {
//       const parts = castId.castingName.split("/");
//       if (parts.length < 4) continue;

//       const [date, month, year, number] = parts.slice(-4);
//       const apiUrl = `${apiBaseUrl}/api/casting/all/${date}/${month}/${year}/${number}`;

//       console.log("Calling GET:", apiUrl);

//       const res = await fetch(apiUrl);
//       const result = await res.json();

//       if (!result.success) continue;

//       console.log("Fetched casting detail:", result.data);

//       // ⭐ SAFETY FIX: result.data must be array
//       const detailsArray = Array.isArray(result.data) ? result.data : [];

//       allDetails = [...allDetails, ...detailsArray];
//     }

//     console.log("Fetched all selected casting details:", allDetails);

//     // Extract unique orderIds
//     const uniqueOrderIds = [...new Set(allDetails.map((x) => x.orderId))];

//     setOrderDropdown(uniqueOrderIds);
//     console.log("Final Order Dropdown:", uniqueOrderIds);

//   } catch (err) {
//     console.error(err);
//     toast.error("Failed fetching casting details");
//   }
// };


  // if user edits suffix manually, update mergedCastingId as well
  useEffect(() => {
    if (!mergedBaseId) return;
    const suffix = mergedSuffix || "A";
    const final = `${mergedBaseId}/${suffix}`;
    setMergedCastingId(final);
    setCastingId(final); // keep main form in sync
    setFormattedId(`PC/${final}`);
  }, [mergedSuffix, mergedBaseId]);

  // -----------------------------
  // Keep your existing "fetch single casting details" effect (unchanged logic)
  // This loads when castingId from query exists (your original behavior)
  // -----------------------------
  useEffect(() => {
    const fetchCastingDetails = async () => {
      if (!castingId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // parse castingId like date/month/year/number
        const parts = castingId.split("/");
        if (parts.length < 4) {
          // fallback: don't fetch if malformed
          setLoading(false);
          return;
        }
        const [date, month, year, number] = parts.slice(-4); // safe
        const apiUrl = `${apiBaseUrl}/api/casting/all/${date}/${month}/${year}/${number}`;
        const response = await fetch(apiUrl);
        const responseData = await response.json();
        const { data } = responseData || {};
        const { casting = {}, orders = [] } = data || {};

        const receivedWeightValue =
          casting.Weight_Received_c ??
          casting.Received_Weight_c ??
          casting.ReceivedWeight_c ??
          casting.Weight_c ??
          0;

        const issuedWeightValue =
          casting.Issud_weight_c ??
          casting.IssuedWeight_c ??
          0;

        const formattedDate = casting.Received_Date_c
          ? new Date(casting.Received_Date_c).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        const castingDetailsData = {
          id: casting.Id ?? null,
          name: casting.Name ?? castingId,
          issuedDate: casting.Issued_Date_c ? new Date(casting.Issued_Date_c).toISOString().split("T")[0] : "",
          issuedWeight: issuedWeightValue,
          receivedWeight: receivedWeightValue,
          receivedDate: formattedDate,
          status: casting.Status_c ?? "Pending",
          loss: casting.Casting_Loss_c ?? 0,
          orders: Array.isArray(orders) ? orders : [],
        };
console.log("Fetched casting details:", castingDetailsData);
        setCastingDetails(castingDetailsData);
        setReceivedWeight(receivedWeightValue);
        setReceivedDate(formattedDate);
      } catch (error) {
        console.error("Error fetching casting details:", error);
        toast.error("Failed to fetch casting details");
      } finally {
        setLoading(false);
      }
    };

    fetchCastingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [castingId]);

  // -----------------------------
  // Preserve your existing pouch logic (Add bag, process bag, handle weight changes etc)
  // I'll reuse your earlier functions and wire castingId from above
  // -----------------------------

  const generatePouchName = () => {
    const nextPouchNumber = bags.length + 1;
    return `${formattedId}-${nextPouchNumber.toString().padStart(2, "0")}`;
  };

  const handlePouchWeightChange = (bagNameParam: string, weight: number) => {
    setPouchWeights((prev) => {
      const updated = { ...prev, [bagNameParam]: weight };  
      const totalWeight = Object.values(updated).reduce((sum, w) => sum + (w || 0), 0);
      setFilingIssuedWeight(totalWeight);
      return updated;
    });
  };

  // order selection and categories functions (kept similar to your code)
  const processNewBag = (orderDetails: any) => {
    const newBagName = generatePouchName();
    const castingWeight = castingDetails?.receivedWeight ?? 0; 

    const newBag = {
      bagName: newBagName,
      order: selectedOrder,
      orderNumber: orderDetails?.Order_Id_c ?? orderDetails?.Order_Id ?? orderDetails?.OrderId ?? "",
      weight: castingWeight,
    };

    setBags((prev) => [...prev, newBag]);

    setPouchWeights((prev) => ({
      ...prev,
      [newBagName]: 0,
    }));

    setPouchCategories((prev) => {
      const updated = { ...prev };
      if (!updated[newBagName]) updated[newBagName] = [];
      selectedCategoryQuantities.forEach((cat) => {
        updated[newBagName].push({ ...cat });
      });

      try {
        localStorage.setItem("pouchCategories", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save pouchCategories", err);
      }
      return updated;
    });

    setCurrentEditingPouch(newBagName);
    setSelectedCategory("");
    setSelectedCategoryQuantities([]);
    setBagName(newBagName);

    toast.success(`Added pouch ${newBagName}`);
  };

  const handleAddBag = (e: React.FormEvent) => {
    e.preventDefault();
    // find orderDetails from castingDetails.orders
    const ordersArray: any[] = Array.isArray(castingDetails?.orders) ? castingDetails.orders : [];

    console.log("castingDetails",castingDetails)
    console.log("ordersArray",ordersArray)
    if (!selectedOrder) {
      toast.error("Select an order first");
      return;
    }

    const selectedOrderStr = String(selectedOrder).trim();
    const orderDetails = ordersArray.find((o: any) => {
      const candidates = [o?.Order_Id_c, o?.Order_Id, o?.OrderId, o?.Id, o?.id];
      return candidates.some((c) => c && String(c).trim() === selectedOrderStr);
    });

    if (!orderDetails) {
      toast.error("Order not found in casting details");
      return;
    }

    processNewBag(orderDetails);
  };

  // handle categories and other helpers (kept simplified)
  const fetchCategories = async (orderId: string) => {
    if (!orderId) return;
    try {
      // const orderDetails = castingDetails.orders.find((o: any) => o.Id === orderId);
      // if (!orderDetails) return;
      // const orderIdForApi = orderDetails.Order_Id_c;
      // if (!orderIdForApi) return;
      const parts = orderId.split("/");
      const prefix = parts[0];
      const num = parts[1];
      const apiUrl = `${apiBaseUrl}/api/orders/${prefix}/${num}/categories`;
      console.log("Fetching categories from:", apiUrl);
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.success) {
        // group into categories if structure present
        if (json.data && json.data.categories) {
          const categoriesObj = json.data.categories;
          const catNames = Object.keys(categoriesObj); 
          const modelsByCategory: any = {};
          catNames.forEach((cn) => {
            modelsByCategory[cn] = categoriesObj[cn];
          });
          setCategorizedModels(modelsByCategory);
          setCategories(catNames);
        } else {
          // fallback: try arrays
          const modelsData = Array.isArray(json.data) ? json.data : json.data?.models ?? [];
          const modelsByCategory: any = {};
          if (Array.isArray(modelsData)) {
            modelsData.forEach((m: any) => {
              const cat = m.Category__c ?? "Uncategorized";
              if (!modelsByCategory[cat]) modelsByCategory[cat] = [];
              modelsByCategory[cat].push(m);
            });
            setCategorizedModels(modelsByCategory);
            setCategories(Object.keys(modelsByCategory));
          } else {
            setCategories([]);
          }
        }
      }
    } catch (err) {
      console.error("fetchCategories error", err);
      toast.error("Failed to fetch categories");
    }
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    setSelectedCategory("");
    setSelectedCategoryQuantities([]);
    console.log("Selected order:", orderId);
    fetchCategories(orderId);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const modelsForCategory = categorizedModels[category] || [];
    const totalModels = modelsForCategory.length;
    const totalPieces = totalModels;
    if (!selectedCategoryQuantities.find((c) => c.category === category)) {
      setSelectedCategoryQuantities((prev) => [...prev, { category, quantity: 1, totalModels, totalPieces }]);
    }
  };

  const handleQuantityChange = (category: string, quantity: number) => {
    setSelectedCategoryQuantities((prev) => prev.map((c) => (c.category === category ? { ...c, quantity } : c)));
  };

  const handleAddCategoriesToPouch = () => {
    if (!selectedOrder || selectedCategoryQuantities.length === 0 || bags.length === 0) {
      toast.error("Please select an order, categories, and add at least one pouch");
      return;
    }

    const lastPouch = bags[bags.length - 1];
    setPouchCategories((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (!updated[lastPouch.bagName]) updated[lastPouch.bagName] = [];
      selectedCategoryQuantities.forEach((c) => {
        const idx = updated[lastPouch.bagName].findIndex((x: any) => x.category === c.category);
        if (idx >= 0) updated[lastPouch.bagName][idx] = { ...c };
        else updated[lastPouch.bagName].push({ ...c });
      });
      try {
        localStorage.setItem("pouchCategories", JSON.stringify(updated));
      } catch (err) {
        console.error("localStorage save failed", err);
      }
      return updated;
    });

    toast.success(`Added ${selectedCategoryQuantities.length} categories to ${lastPouch.bagName}`);
    setSelectedCategory("");
    setSelectedCategoryQuantities([]);
  };

  // -----------------------------
  // handleSubmit: create filing and pouches by calling /api/filing/create
  // This loops through bags and sends one filing containing multiple pouches
  // We'll send combined castingIds array (selectedCastings.map(c => c.castingName))
  // -----------------------------
  const handleSubmit = async (e?: React.FormEvent) => {
  e?.preventDefault();

    if (bags.length === 0) {
      console.log("Add at least one pouch before submitting");
      alert("Add at least one pouch before submitting");
      return;
    }

    // Build pouches payload from bags and pouchCategories/pouchWeights
    const pouchesPayload = bags.map((bag, idx) => {
      const weight = parseFloat(String(pouchWeights[bag.bagName] || 0));
      const categoriesForBag = pouchCategories[bag.bagName] || [];
      return {
        pouchId: bag.bagName,
        orderId: bag.order,
        weight,
        name: categoriesForBag[0]?.category ?? "",
        quantity: categoriesForBag[0]?.quantity ?? 0,
        categories: categoriesForBag.map((c) => ({ category: c.category, quantity: c.quantity })),
      };
    });

    console.log("submitted ",pouchesPayload)


    // Determine total issued weight (sum of pouch weights)
    const totalIssued = pouchesPayload.reduce((sum, p) => sum + (p.weight || 0), 0);

    // Payload for backend - include multiple castingIds (selectedCastings)
    const payload = {
      castingIds: selectedCastings.map((c) => c.castingName), // e.g. ["29/10/2025/01", "29/10/2025/02"]
      filingId: mergedCastingId || castingId || formattedId || `PC/${new Date().toISOString()}`,
      issuedDate: new Date().toISOString(),
      orderId: selectedOrder ?? "",
      name: "", // optional
      quantity: bags.length,
      pouches: pouchesPayload,
      receivedWeight: receivedWeight,
      product: selectedCategory,
      selectedCastings: selectedCastings,
    };

    console.log("submit details", payload);

 

    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/assembly/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Filing and pouches created successfully");
        // reset local UI states (but keep merged suffix persistence as manual)
        setBags([]);
        setPouchWeights({});
        setPouchCategories({});
        setSelectedCastings([]);
        setMergedBaseId("");
        setMergedCastingId("");
        setFormattedId("");
        // redirect to table or show result
        alert("Pouch Assembled successfully...");
        setTimeout(() => router.push("/Departments/Assembly"), 800);
      } else {
        console.error("API error:", result);
        toast.error(result.message || "Failed to create filing");
      }
    } catch (err) {
      console.error("submit error", err);
      toast.error("Error while creating filing");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // JSX: top multi-casting area + your existing form (kept structure)
  // -----------------------------
  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full overflow-y-auto p-4 pt-20 bg-gray-50">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">

          {/* --- Top: Multi-casting selection and merged ID generator --- */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Multi-Casting Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
              <div className="col-span-2">
                <div className="border rounded divide-y h-64 overflow-y-auto">
                  {loading ? (
                    <div className="p-4">Loading castings...</div>
                  ) : allCastings.length === 0 ? (
                    <div className="p-4">No castings found</div>
                  ) : (
                    allCastings.map((rec) => {
                      const selected = selectedCastings.find((s) => s.castingName === rec.Name);
                      const available = computeAvailable(rec);
                      return (
                        <div key={rec.Name} className={`p-2 flex items-center justify-between ${selected ? "bg-green-50" : ""}`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => toggleSelectCasting(rec)}
                            />
                            <div>
                              <div className="font-medium">{rec.Name}</div>
                              <div className="text-xs text-gray-500">Received: {(rec.Weight_Received_c ?? rec.Received_Weight_c ?? rec.Issud_weight_c ?? 0).toFixed(4)} g</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-sm mr-2">Avl: {available.toFixed(4)}g</div>
                            {selected && (
                              <Input
                                type="number"
                                placeholder="Used wt"
                                className="w-28"
                                onChange={(e) => handleUsedWeightChange(rec.Name, parseFloat(e.target.value || "0"))}
                              />
                            )}


                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="col-span-1">
                <div className="border rounded p-3 space-y-2">
                  <Label>Manual suffix (A/B/C)</Label>
                  <Input value={mergedSuffix} onChange={(e) => setMergedSuffix(e.target.value.toUpperCase().slice(0, 1))} />
                  <div className="mt-2">
                    <Button onClick={generateMergedBase} disabled={selectedCastings.length === 0}>Generate Merged ID</Button>
                  </div>
                  <div className="mt-2">
                    <Label>Merged base</Label>
                    <Input readOnly value={mergedBaseId} />
                  </div>
                  <div>
                    <Label>Final merged casting id</Label>
                    <Input readOnly value={mergedCastingId} />
                  </div>
                </div>
              </div>
            </div>
            {/* show chosen merged id */}
            {mergedCastingId && <div className="mt-2 text-sm text-gray-600">Merged ID is set into Casting ID: <strong>{mergedCastingId}</strong></div>}
          </div>

          {/* --- The original form area (kept) --- */}
          <div className="container mx-auto py-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Add Pouch Creation Details</h1>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4">Loading casting details...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label>Casting ID</Label>
                        <Input value={castingId || ""} onChange={(e) => setCastingId(e.target.value)} className="bg-gray-100" />
                      </div>
                      <div>
                        <Label>Pouch Creation ID</Label>
                        <Input value={formattedId || ""} readOnly className="bg-gray-100" />
                      </div>
                      <div>
                        <Label>Received Weight (g)</Label> 
                        <Input
                          type="number"
                          value={receivedWeight}
                          onChange={(e) => setReceivedWeight(parseFloat(e.target.value) || 0)}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label>Received Date</Label>
                        <Input
                          type="date"
                          value={receivedDate}
                          onChange={(e) => setReceivedDate(e.target.value)}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div>
                        <Label>Issued Date</Label>
                        <Input
                          type="date"
                          value={issuedDate}
                          onChange={(e) => setIssuedDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Issued Time</Label>
                        <Input
                          type="time"
                          value={issuedTime}
                          onChange={(e) => setIssuedTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mb-6 border p-4 rounded-lg">
                      <h2 className="text-lg font-medium mb-4">Add Pouch Details</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Choose Order</Label>
                          <Select value={selectedOrder} onValueChange={handleOrderSelect}>
                            <SelectTrigger className="w-full bg-grey text-black ">
                              <SelectValue placeholder="Select an order" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-black">
                              {/* {castingDetails.orders?.map((order: any) => (
                                <SelectItem key={order.Id} value={order.Id} className="bg-white text-black hover:bg-gray-100">
                                  {order.Order_Id_c}
                                </SelectItem>
                              ))} */}
                                {orderDropdown.map((oid) => (
      <SelectItem key={oid} value={oid}>
        {oid}
      </SelectItem>
    ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {selectedOrder && (
                        <div className="mt-4 border-t pt-4">
                          <Label>Select Category</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Select value={selectedCategory} onValueChange={handleCategorySelect}>
                              <SelectTrigger className="w-full bg-white text-black">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent className="bg-white text-black">
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category} className="bg-white text-black hover:bg-gray-100">
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {selectedCategoryQuantities.length > 0 && (
                            <div className="mt-4">
                              <h3 className="text-sm font-medium mb-2">Selected Categories</h3>
                              <div className="space-y-2">
                                {selectedCategoryQuantities.map((cat) => (
                                  <div key={cat.category} className="flex items-center space-x-4">
                                    <span className="flex-1">{cat.category}</span>
                                    <span className="text-sm text-gray-500">({cat.totalModels} models, {cat.totalPieces} total pieces)</span>
                                    <div className="w-32">
                                      <Input
                                        type="number"
                                        min="0"
                                        max={cat.totalPieces}
                                        value={cat.quantity}
                                        step="1"
                                        onChange={(e) => handleQuantityChange(cat.category, parseInt(e.target.value) || 0)}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-2 text-sm text-green-600 font-medium">
                                {selectedCategoryQuantities.length > 0 ? (
                                  <p>{selectedCategoryQuantities.length} categories selected. They will be added when you create a new pouch.</p>
                                ) : (
                                  <p>Select categories before creating a pouch.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Button type="button" onClick={handleAddBag} className="w-full bg-blue-500">Add Pouch</Button>
                        <Button type="button" onClick={handleAddCategoriesToPouch} className="w-full bg-green-500">Add Categories to Last Pouch</Button>
                        <div className="flex items-center gap-2">
                          <div>
                            <Label>Filing Issued Weight</Label>
                            <Input value={filingIssuedWeight} readOnly />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bags List */}
                    {bags.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-md font-medium mb-2">Added Pouches</h3>
                        <div className="border rounded-lg divide-y">
                          {bags.map((bag, index) => {
                            const orderDetails = castingDetails.orders?.find((o: any) => o.Id === bag.order);
                            const bagCategories = pouchCategories[bag.bagName] || [];
                            const isCurrentlyEditing = currentEditingPouch === bag.bagName;

                            return (
                              <div key={index} className="p-3 border-b">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">{bag.bagName}</span>
                                    <span className="text-gray-500 ml-2">Order: {orderDetails ? orderDetails.Order_Id_c : bag.order}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <Label>Weight (g)</Label>
                                      <Input
                                        type="number"
                                        step="0.0001"
                                        value={pouchWeights[bag.bagName] || ""}
                                        onChange={(e) => handlePouchWeightChange(bag.bagName, parseFloat(e.target.value) || 0)}
                                        placeholder="Enter weight"
                                      />
                                    </div>
                                    <Button type="button" className="bg-red-500 text-white" onClick={() => {
                                      const newBags = bags.filter((_, i) => i !== index);
                                      setBags(newBags);
                                      const newWeights = { ...pouchWeights };
                                      delete newWeights[bag.bagName];
                                      setPouchWeights(newWeights);
                                      const newPouchCategories = { ...pouchCategories };
                                      delete newPouchCategories[bag.bagName];
                                      setPouchCategories(newPouchCategories);

                                      const totalWeight = Object.values(newWeights).reduce((sum, w) => sum + (w || 0), 0);
                                      setReceivedWeight(totalWeight);
                                    }}>Remove</Button>
                                  </div>
                                </div>

                                {bagCategories.length > 0 && (
                                  <div className="mt-2 text-sm">
                                    <div className="text-gray-600">Categories:</div>
                                    <div className="ml-2">
                                      {bagCategories.map((cat) => (
                                        <div key={cat.category} className="flex items-center gap-2">
                                          <span>{cat.category}:</span>
                                          <span>{cat.quantity} pieces</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2 text-right text-sm text-gray-600">
                          Total Weight: {Object.values(pouchWeights).reduce((sum, w) => sum + (w || 0), 0).toFixed(2)}g
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <Button type="submit" className="w-full bg-blue-600" 
                      // disabled={bags.length === 0}
                      >{loading ? "Submitting..." : "Submit Pouch Details"}</Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
