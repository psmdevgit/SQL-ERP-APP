"use client";
import React, { useState } from "react";
import DailyInventory from "../DailyInventory/page";
import ProcessingOpening from "../ProcessOpening/page";
import { Button } from "antd";

const OpeningClosing = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "dept">("inventory");

  return (
    <div style={{ display:"flex", justifyContent:'center', alignItems:'center', flexDirection:'column', paddingTop:'100px' }}>

      {/* TOGGLE BUTTONS */}
      <div style={{display: "flex", gap: 10, marginBottom:'-50px' }}>
        <Button
          type={activeTab === "inventory" ? "primary" : "default"}
          onClick={() => setActiveTab("inventory")}
          >
          Inventory
        </Button>

        <Button
          type={activeTab === "dept" ? "primary" : "default"}
          onClick={() => setActiveTab("dept")}
        >
          Departments
        </Button>
      </div>

      {/* SHOW COMPONENT BASED ON BUTTON */}
      {activeTab === "inventory" ? (
        <DailyInventory />
      ) : (
        <ProcessingOpening />
      )}
    </div>
  );
};

export default OpeningClosing;
