"use client";
import Image from "next/image";
import "@/styles/loginpage.css";
import test from "node:test";
export default function LandingPage() {
  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full overflow-y-auto p-4 pt-40 mt-[-30px] bg-gray-50">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <Image src='/img.jpg' alt="Main" width={900 } height={900} className="logo-image" />

<div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "10vh",color: "#555", marginTop: "20px"}}>
  <h2>Welcome to Kalash Jewellers Gold Crafts</h2>
</div>

       
      </div>
    </div>
    </div>
  );
}
