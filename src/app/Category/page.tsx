"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AddCategory = () => {
//   const apiBaseUrl = "http://localhost:4001";
  
  const apiBaseUrl = "https://kalash.app";

  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [msgColor, setMsgColor] = useState("red");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Fetch existing categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/category-groups`);
        const data = await response.json();

        if (data.success && data.data) {
          const names = data.data.map((item: any) =>
            item.Name?.toLowerCase()
          );
          setExistingCategories(names);
        }
      } catch (err) {
        console.log("Error fetching categories", err);
      }
    };

    loadCategories();
  }, []);

  // Live search + validation
  const handleCategoryChange = (value: string) => {
    setCategoryName(value);

    if (!value) {
      setMessage("");
      setSuggestions([]);
      return;
    }

    const lower = value.toLowerCase();

    // dropdown suggestions filter
    const match = existingCategories.filter((cat) =>
      cat.toLowerCase().includes(lower)
    );
    setSuggestions(match);

    if (existingCategories.includes(lower)) {
      setMsgColor("red");
      setMessage("Category already exists");
    } else {
      setMsgColor("green");
      setMessage("New category");
    }
  };

  // Submit category
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!categoryName) {
      setMsgColor("red");
      setMessage("Please enter a category name");
      return;
    }

      // VALID FORMAT: CategoryName(CODE)
  const format = /^[A-Za-z0-9 ]+\([A-Za-z0-9]+\)$/;

  if (!format.test(categoryName)) {
    setMsgColor("red");
    setMessage(
      "Correct format: CategoryName(CODE)\nExample: Ring Stone(RST)"
    );
    return;
  }


    if (existingCategories.includes(categoryName.toLowerCase())) {
      setMsgColor("red");
      setMessage("Category already exists");
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/add-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: categoryName.toUpperCase() }),
      });

      const data = await res.json();

      if (data.success) {
        setMsgColor("green");
        setMessage("Category added successfully!");
        setExistingCategories((prev) => [
          ...prev,
          categoryName.toLowerCase(),
        ]); // add to list
        setCategoryName("");
        setSuggestions([]);
      } else {
        setMsgColor("red");
        setMessage("Category not added");
        
      console.log(data.message);
      }
    } catch (err) {
      setMsgColor("red");
      console.log(err);
      setMessage("Category not adde");
    }
  };

  return (
    <div className="container mx-auto p-4 mt-10">
      <div className="flex justify-center mt-10">
        <div className="w-full lg:w-1/2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {/* Category Input + Suggestions */}
                <div className="col-span-2">
                  <Label>Category Name</Label>
                  <Input
                    type="text"
                    value={categoryName}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    placeholder="Enter category name"
                    autoComplete="off"
                  />

                  {/* Suggestion Dropdown */}
                  {suggestions.length > 0 && (
                    <ul className="border rounded-md bg-white shadow p-2 mt-1 max-h-40 overflow-y-auto">
                      {suggestions.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setCategoryName(item);
                            setSuggestions([]);
                            setMsgColor("red");
                            setMessage("Category already exists");
                          }}
                          className="cursor-pointer p-2 hover:bg-gray-100 capitalize"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Submit Button */}
                <div className="col-span-2">
                  <Button type="submit" disabled={msgColor === "red"}>
                    Add Category
                  </Button>
                </div>

                {/* Message */}
                {message && (
                  <p
                    className={`font-semibold col-span-2 ${
                      msgColor === "green"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
