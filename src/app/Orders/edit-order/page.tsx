'use client';

import { Eye } from "lucide-react";
import { Trash2 } from "lucide-react";
import noimage from "../../../../assets/no.png"; // remove {}
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";  
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import { Flex } from "antd";
import { useSearchParams } from 'next/navigation';

const API_URL = "https://kalash.app";

// const API_URL = "http://localhost:4001";


  const imageapi = "https://psmport.pothysswarnamahalapp.com/FactoryModels/" ;

export default function EditOrder() {


  
   const searchParams = useSearchParams();
   const orderNo = searchParams.get('orderId');


  console.log("Editing order number:", orderNo);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
const router = useRouter();
  
    const [imageUrl, setImageUrl] = useState("");

    const [orderSelectedItems, setOrderSelectedItems] = useState<OrderSelectedItem[]>([]);
  

    const [modelFields, setModelFields] = useState<{
      [key: string]: { size: string; quantity: number; weight: string };
    }>({});

  const [selectedModels, setSelectedModels] = useState([]);

    // State for which models are expanded
  const [expandedModels, setExpandedModels] = useState<{ [key: string]: boolean }>({});
 // Toggle expand/collapse for a model
const toggleExpand = (modelName: string) => {
  setExpandedModels((prev) => ({
    ...prev,
    [modelName]: !prev[modelName],
  }));
};

  
  interface Category {
  Id: string;
  Name: string;
}

interface OrderSelectedItem {
  category: string;
  size: string;
  quantity: number;
  grossWeight: string;
  netWeight: string;
  stoneWeight: string;
  designImage?: string;
  modelName: string;
  itemRemark: string; // ✅ match UI
}

interface Model {
  Id: string;
  Name: string;
  Image_URL_c?: string;
  Category_c : string;
  Size_c : string;
  Gross_Weight_c : string;
  Net_Weight_c : string;
  Stone_Weight_c : string;
}

  const [models, setModels] = useState<Model[]>([]);
  
  const [previewImage, setPreviewImage] = useState(null);
  
    const [selectedCategory, setSelectedCategory] = useState("");

    const resolveImage = (modelName, setImage) => {
      const formats = ["png", "jpg", "jpeg"];
      let index = 0;
    
      const tryLoad = () => {
        if (index >= formats.length) {
          setImage(noimage.src);
          return;
        }
    
        const img = document.createElement("img");
        const src = `${imageapi}${modelName}.${formats[index]}`;
    
        img.onload = () => setImage(src);
        img.onerror = () => {
          index++;
          tryLoad();
        };
    
        img.src = src;
      };
    
      tryLoad();
    };

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    loadOrder();
    loadItems();
  }, []);


    useEffect(() => {
      if (!selectedCategory) {
        setModels([]);
        setImageUrl("");
        return;
      }
  
      fetch(`${API_URL}/api/previewModels?categoryId=${selectedCategory}`)
        .then((res) => res.json())
        .then((data) => {setModels(data),console.log(data)})
        .catch((err) => console.error(err));
  
                                         
    }, [selectedCategory]);

    useEffect(() => {
        fetchCategories();
      }, []);

        const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/category-groups`);
    const result = await response.json();

    console.log("cat datas", result);

    if (result.success) {
      // Run all checks in parallel
      const checks = result.data.map(async (cat: Category) => {

        const res = await fetch(
          `${API_URL}/api/previewModels?categoryId=${cat.Name}` // 👈 use Id, not Name
        );
        const models = await res.json();

        console.log("cat get from sql", models);
        return models.length > 0 ? cat : null;
      });

      // Wait for all to finish
      const categoriesWithModels = (await Promise.all(checks)).filter(Boolean) as Category[];

      setCategories(categoriesWithModels);
      console.log("Categories with data:", categoriesWithModels);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

//  -------------------   handle item select    --------------- 

const handleModelSelect = (model: Model) => {
  setSelectedModels((prev) => {
    const isSelected = prev.includes(model.Name);

    if (!isSelected) {
      // initialize fields using actual API fields
      setModelFields((prevFields) => ({
        ...prevFields,
        [model.Name]: {
          size: model.Size_c || "",
          quantity: 1,
          weight: model.Gross_Weight_C || "",
          netWeight: model.Net_Weight_c || "",
          stoneWeight: model.Stone_Weight_c || ""
        },
      }));
      console.log(modelFields);

      return [...prev, model.Name];
    } else {
      // remove
      const updated = { ...modelFields };
      delete updated[model.Name];
      setModelFields(updated);

      return prev.filter((name) => name !== model.Name);
    }
  });
};

  // ------------------- LOAD ORDER -------------------
const loadOrder = async () => {
  const encoded = encodeURIComponent(orderNo);
  // const res = await fetch(`${API_URL}/api/Editorders/${encoded}`);
  const res = await fetch(`${API_URL}/api/Editorders?orderNo=${encoded}`);

  const data = await res.json();

  console.log(data);
  setOrder(data);
};



  // ------------------- LOAD ITEMS -------------------
  const loadItems = async () => {

      const encoded = encodeURIComponent(orderNo);
    // const res = await fetch(`${API_URL}/api/Editorders/${encoded}/items`);
      const res = await fetch(`${API_URL}/api/Editorders/items?orderNo=${encoded}`);
 
    const data = await res.json();
    setItems(data);   
    console.log("Loaded items:", data);
  };

  // ------------------- UPDATE ORDER -------------------
  const updateOrder = async () => {

     try {
    const response =  await fetch(`${API_URL}/api/Editorders/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      // API returned an error
      const err = await response.json();

      console.log("Error updating order: " + err.error)
      return;
    }

    alert("Order updated successfully");
        loadOrder();
    loadItems();
    // window.location.reload();
router.refresh();  
  } catch (error) {
    // Network error or any unexpected error
    
      alert("Update failed !!!");
    console.log("Something went wrong: " + error.message);
  }

    
  };

  // ------------------- UPDATE ITEMS -------------------
  // const updateItems = async () => {
  //   await fetch(`${API_URL}/api/Editorders/update-items`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ items }),
  //   });

  //   alert("Items updated successfully");
  // };


  const updateItems = async () => {
  try {
    const response = await fetch(`${API_URL}/api/Editorders/update-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      // API returned an error
      const err = await response.json();

      console.log("Error updating items: " + err.error)
      return;
    }

    alert("Items updated successfully");
        loadOrder();
    loadItems();
    // window.location.reload();
router.refresh();  
  } catch (error) {
    // Network error or any unexpected error
    
      alert("Update failed !!!");
    console.log("Something went wrong: " + error.message);
  }
};


  // ------------------- FRONTEND UI -------------------
  if (!order) return <div>Loading...</div>;

  const updateItemField = (index, key, val) => {
    const cloned = [...items];
    cloned[index][key] = val;
    setItems(cloned);
  };


//   const deleteItem = async (itemId) => {
//   if (!confirm("Are you sure you want to delete this item?")) return;

//   try {
//     const res = await fetch(`/api/order-items/delete/${itemId}`, {
//       method: "POST",
//     });

//     const data = await res.json();

//     if (data.success) {
//       // Remove item from UI
//       setItems(items.filter((i) => i.Id !== itemId));
//     } else {
//       alert("Delete failed: " + data.message);
//     }
//   } catch (error) {
//     console.error("Delete error:", error);
//   }
// };


const deleteItem = async (itemId) => {

  
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
console.log(itemId);

    const res = await fetch(`${API_URL}/api/order-items/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: itemId }),
    });

    const data = await res.json();

    if (!data.success) {
      console.log("Error: " + data.message);
      alert("Failed to delete item !!!")
      return;
    }

    alert("Item deleted successfully");
        loadOrder();
    loadItems();
    // window.location.reload();
    router.refresh();  

  } catch (err) {
    console.log("Network error: " + err.message);
      alert("Failed to delete item !!!")
  }
};
const handleAddSelectedItem = async () => {
 
  if (selectedModels.length === 0) {
    alert("Please select at least one model");
    return;
  }

  const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  modelName: string
) => {
  const target = e.currentTarget;

  if (target.src.endsWith(".png")) {
    target.src = `${imageapi}${modelName}.jpg`;
    console.log("png not found, trying jpg");
  } 
  else if (target.src.endsWith(".jpg")) {
    target.src = `${imageapi}${modelName}.jpeg`;
    console.log("jpg not found, trying jpeg");
  } 
  else {
    target.src = noimage.src;
    console.log("no image found, using placeholder");
  }
};

  const newItems = selectedModels.map((modelName) => {
    const model = models.find((m) => m.Name === modelName);

    // 🔥 get edited values from modelFields
    const fields = modelFields[modelName];

    return {
      category: model?.Category_c || "",
      size: fields?.size || model?.Size_c || "0",
      quantity: fields?.quantity || 1,
      grossWeight: fields?.weight || model?.Gross_Weight_c || "0",
      netWeight: fields?.netWeight || model?.Net_Weight_c || "0",
      stoneWeight: fields?.stoneWeight || model?.Stone_Weight_c || "0",

      designImage: model?.Image_URL_c || "",
      modelName: model?.Name || "",
      itemRemark: "",
    };
  });

  console.log("selected item :", newItems);

  // setOrderSelectedItems((prev) => [...prev, ...newItems]);

 try {
    const response = await fetch(`${API_URL}/api/Editorders/add-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newItems, orderNo }),
    });

    if (!response.ok) {
      // API returned an error
      const err = await response.json();

      console.log("Error updating items: " + err.error)
      return;
    }

    alert("Models added successfully");
    // window.location.reload();
        loadOrder();
    loadItems();
    router.refresh();  

  } catch (error) {
    // Network error or any unexpected error
    
      alert("Update failed !!!");
    console.log("Something went wrong: " + error.message);
  }

  // RESET SECTION
  setSelectedModels([]);
  setModelFields({});
  setSelectedCategory("");
};

  return (
    <div className="p-6 mx-auto space-y-6" style={{display:"Flex", gap:"20px",marginLeft:"250px"}}>

      <div style={{marginTop:"50px",width:"50%"}}>
          {/* ORDER INFO CARD */}
          <div className="bg-white shadow rounded-xl p-5 space-y-4" >
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
                      type="number"
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


      <div className="bg-white shadow rounded-xl p-5 space-y-4" style={{marginTop:"50px",width:"50%"}}>
                  <div className="form-card" id="AddItemBox">
                    <div className="one-column-form">
                      <div className="fieldgroup flex gap-2">
                        <div style={{ width: "100%" }}>
                          <Label htmlFor="category" className="font-bold">Category</Label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full border p-2 rounded"
                          >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat) => (
                              <option key={cat.Id} value={cat.Name}>
                                {cat.Name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                
                      <div className="field-group">
                        <Label htmlFor="designImage">Design Image</Label>
                
                <div
                  className="modelPreview grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-4 gap-4 mt-4 overflow-scroll"
                  style={{ maxHeight: "550px" }}
                >
                
                  {models.length > 0 ? (
                    models.map((model) => {
                      const isSelected = selectedModels.includes(model.Name);
                      const expanded = expandedModels[model.Name] || false;
                      const fields = modelFields[model.Name] || { size: "", quantity: 1, weight: "" };
                
                      return (
                        <div
                          key={model.Id}
                          className={`p-2 border rounded-md text-center cursor-pointer transition ${
                            isSelected ? "bg-blue-200 border-blue-500" : "bg-gray-100"
                          }`}
                        >
                          <div className="relative">
                  <img
                    src={`${imageapi}${model.Name}.png`}
                    alt={model.Name}
                    className="w-50 h-50 object-contain mx-auto"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.endsWith(".png")) target.src = `${imageapi}${model.Name}.jpg`;
                      else if (target.src.endsWith(".jpg")) target.src = `${imageapi}${model.Name}.jpeg`;
                      else target.src = noimage.src;
                    }}
                    onClick={() => handleModelSelect(model)}
                  />
                
                  {/* Eye Icon */}
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  onClick={(e) => {
                    e.stopPropagation();
                    resolveImage(model.Name, setPreviewImage);
                  }}
                >
                  <Eye size={16} />
                </button>
                </div>
                
                          <p className="mt-2 text-sm font-medium">{model.Name}</p>
                
                          {isSelected && (
                            <div className="mt-2 text-left">
                              <button
                                type="button"
                                className="text-blue-600 text-sm mb-2"
                                onClick={() => toggleExpand(model.Name)}
                              >
                                {expanded ? "Hide Details ▲" : "Show Details ▼"}
                              </button>
                
                              {expanded && (
                                <div className="space-y-2">
                
                  {/* Size */}
                  <div className="flex items-center gap-2">
                    <Label className="w-16 text-sm">Size</Label>
                    <input style={{width:"20px"}}
                      type="text"
                      value={fields.size}
                      onChange={(e) =>
                        setModelFields((prev) => ({
                          ...prev,
                          [model.Name]: { ...prev[model.Name], size: e.target.value },
                        }))
                      }
                      className="flex-1 border px-2 py-1 rounded text-sm h-8"
                    />
                  </div>
                
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <Label className="w-16 text-sm">Quantity</Label>
                    <input style={{width:"20px"}}
                      type="number"
                      value={fields.quantity}
                      onChange={(e) =>
                        setModelFields((prev) => ({
                          ...prev,
                          [model.Name]: { ...prev[model.Name], quantity: Number(e.target.value) },
                        }))
                      }
                      className="flex-1 border px-2 py-1 rounded text-sm h-8"
                      min={1}
                    />
                  </div>
                
                  {/* Weight */}
                  <div className="flex items-center gap-2">
                    <Label className="w-16 text-sm">Weight</Label>
                    <input style={{width:"20px"}}
                      type="text"
                      value={fields.weight}
                      onChange={(e) =>
                        setModelFields((prev) => ({
                          ...prev,
                          [model.Name]: { ...prev[model.Name], weight: e.target.value },
                        }))
                      }
                      className="flex-1 border px-2 py-1 rounded text-sm h-8"
                    />
                  </div>
                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="col-span-full text-gray-500">
                      No models available for this category
                    </p>
                  )}
                </div>
                      </div>
                    </div>
                
                    <button
                      className="add-item-button mt-4 btn bg-success text-white"
                      onClick={handleAddSelectedItem}
                    >
                      Add Item
                    </button>
                  </div>
      </div>

 {previewImage && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg relative max-w-3xl">
      <button
        className="absolute top-2 right-2 text-xl font-bold"
        onClick={() => setPreviewImage(null)}
      >
        ✖
      </button>
      <img
        src={previewImage}
        alt="Preview"
        className="max-h-[80vh] max-w-full object-contain"
      />
    </div>
  </div>
)}

    </div>
  );
}
