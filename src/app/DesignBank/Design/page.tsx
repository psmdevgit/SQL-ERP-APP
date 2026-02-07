
"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import noimage from "../../../../assets/no.png"; 

import { Eye } from "lucide-react";



const apiBaseUrl = "https://Kalash.app";
// const apiBaseUrl = "http://localhost:4001"
const imageapi = "https://psmport.pothysswarnamahalapp.com/FactoryModels/";

interface Category {
  Id: string;
  Name: string;
}

interface Model {
  Id: string;
  Name: string;
  Image_URL__c?: string;
  Category__c: string;
  Size__c: string;
  Gross_Weight__c: string;
  Net_Weight__c: string;
  Stone_Weight__c: string;
}

const Designs: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  const [previewImage, setPreviewImage] = useState(null);
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


  // ✅ Fetch categories on load
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/category-groups`);
      const result = await response.json();

      if (result.success) {
        const checks = result.data.map(async (cat: Category) => {
          const res = await fetch(`${apiBaseUrl}/api/previewModels?categoryId=${cat.Name}`);
          const models = await res.json();
          return models.length > 0 ? cat : null;
        });

        const categoriesWithModels = (await Promise.all(checks)).filter(Boolean) as Category[];
        setCategories(categoriesWithModels);
        console.log("Categories with data:", categoriesWithModels);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ✅ Fetch models when category changes
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        setModels([]); // clear old data immediately
        let url =
          selectedCategory === "All"
            ? `${apiBaseUrl}/api/previewModelsAll`
            : `${apiBaseUrl}/api/previewModels?categoryId=${selectedCategory}`;

        const res = await fetch(url);
        const data = await res.json();
        setModels(data);
        console.log("Models:", data);
      } catch (err) {
        console.error("Error fetching models:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedCategory]);

  return (
    <div className="form-card" id="AddItemBox">
      <h2 style={{ textAlign: "center" }}>Design Bank</h2>

      <div className="one-column-form">
        <div className="fieldgroup flex gap-2">
          <div style={{ width: "30%" }}>
            <Label htmlFor="category" className="font-bold">
              Category
            </Label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="All">All</option>
              {categories.map((cat) => (
                <option key={cat.Id} value={cat.Name}>
                  {cat.Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-group mt-4">
          <Label htmlFor="designImage" className="font-bold">
            Design Models
          </Label>

          {loading ? (
            <p className="mt-4 text-center text-gray-500">Loading models...</p>
          ) : (
            <div
              className="modelPreview grid gap-4 mt-4 overflow-scroll grid-cols-6"
              style={{ maxHeight: "700px" }}
            >
              {models.length > 0 ? (
                models.map((model) => (
                  <div
                    key={`${model.Id}-${selectedCategory}`} // ✅ unique key so React reloads image
                    className="border relative rounded-md text-center cursor-pointer transition"
                    style={{
                      padding:"0px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                  

                    <img
                      src={`${imageapi}${model.Name}.png`}
                      alt={model.Name}
                      className=""
                      style={{ maxHeight: "180px", objectFit:"contain" }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.endsWith(".png")) {
                          target.src = `${imageapi}${model.Name}.jpg`;
                        } else if (target.src.endsWith(".jpg")) {
                          target.src = `${imageapi}${model.Name}.jpeg`;
                        } else {
                          target.src = noimage.src ;
                          
                        }
                      }}
                    />

                    <p className="mt-2 font-bold" style={{color:"black",
                      background: "#FCF5E7",}}>{model.Name}</p>
                        <button
                      type="button"
                      className="absolute  top-1 right-1 bg-white rounded-full p-1 shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        resolveImage(model.Name, setPreviewImage);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    
                  </div>

                ))
              ) : (
                <p className="col-span-full text-gray-500 text-center">
                  No models available for this category
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {previewImage && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg relative max-w-3xl">
      <button
        className="absolute  text-white bg-danger px-2 rounded-md top-2 right-2 text-xl font-bold"
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
};

export default Designs;
