"use client";
import { useEffect, useState } from "react";

interface Category {
  Id: string;
  Name: string;
}

interface Model {
  Id: string;
  Name: string;
  Image_URL_c?: string;
}

export default function ImageShowPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [imageUrl, setImageUrl] = useState("");

    // const apiBaseUrl = "https://erp-server-r9wh.onrender.com" ;

  
  const apiBaseUrl = "http://localhost:5001" ;

    useEffect(() => {
      fetchCategories();
    }, []);

  // Fetch categories on page load
  // const fetchCategories = async () => {
  //   try {
  //     const response = await fetch(`${apiBaseUrl}/category-groups`);
  //     const result = await response.json();
  //     if (result.success) {
  //       setCategories(result.data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching categories:", error);
  //   }
  // };

    const fetchCategories = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/category-groups`);
    const result = await response.json();

    // console.log("cat datas", result);

    if (result.success) {
      // Run all checks in parallel
      const checks = result.data.map(async (cat: Category) => {

        const res = await fetch(
          `${apiBaseUrl}/api/previewModels?categoryId=${cat.Name}` // 👈 use Id, not Name
        );
        const models = await res.json();

        // console.log("cat get from sql", models);
        return models.length > 0 ? cat : null;
      });

      // Wait for all to finish
      const categoriesWithModels = (await Promise.all(checks)).filter(Boolean) as Category[];

      setCategories(categoriesWithModels);
      // console.log("Categories with data:", categoriesWithModels);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

  // Fetch models when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setModels([]);
      setSelectedModel("");
      setImageUrl("");
      return;
    }

    fetch(`${apiBaseUrl}/api/previewModels?categoryId=${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch((err) => console.error(err));

  }, [selectedCategory]);

  // Set image when model changes
  useEffect(() => {
    if (!selectedModel) {
      setImageUrl("");
      console.log("no model")
      return;
    }

    const model = models.find((m) => m.Name === selectedModel);
    if (model && model.Image_URL_c) {
      setImageUrl(model.Image_URL_c);
      console.log("image url", model.Image_URL_c);
    } else {
      setImageUrl("");
    }
  }, [selectedModel, models]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Models Preview</h2>

      {/* Category Dropdown */}
      <div>
        <label className="font-bold">Category: </label>
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

      {/* Model Dropdown */}
    <div style={{ marginTop: "10px" }}>
  <label className="font-bold">Model Name: </label>
  <select
    value={selectedModel}
    onChange={(e) => setSelectedModel(e.target.value)}
    disabled={!selectedCategory || models.length === 0}
     className="w-full border p-2 rounded"
  >
    {models.length === 0 ? (
      <option value="">No Models</option>
    ) : (
      <>
        <option value="">-- Select Model --</option>
        {models.map((model) => (
          <option key={model.Id} value={model.Name}>
            {model.Name}
          </option>
        ))}
      </>
    )}
  </select>
</div>


      {/* Image Preview */}
      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <img
            // src={"D:/Kalash Sql/Needha_ERP_server-main" +imageUrl}
            src={`${apiBaseUrl}${imageUrl}`}

            alt="Model Preview"
            style={{ width: "350px", border: "1px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
}
