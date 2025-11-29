"use client";


import Image from "next/image";


import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/loginpage.css"; // ✅ Ensure your custom CSS is loaded
import pothylogo from "../../assets/logindesign.jpg"  // ✅ Import your logo image
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  // API base URL (Uses `.env.local` for flexibility)
  const API_BASE_URL= "https://kalash.app" ;
  //const API_BASE_URL = " http://localhost:4001" ;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // ✅ Client-side validation before sending request
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");

      setLoading(false);
      return;
    }


 try {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  // ❗ Throw error for non-200 responses
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || "Login failed");
  }

  const data = await response.json();
  setLoading(false);

  if (data.success) {
    console.log("Login success:", data);

    localStorage.setItem("username", username);
    localStorage.setItem("department", data.department);

    let redirectUrl = "/DesignBank/Design";

    switch (data.department?.toLowerCase()) {
      case "waxing":
        redirectUrl = "/Departments/Waxing/waxing_table";
        break;

      case "casting":
        redirectUrl = "/Departments/Casting/casting_table";
        break;

      case "pouch":
        redirectUrl = "/Departments/Filing/add_filing_details/Grinding_Table";
        break;

      case "grinding":
        redirectUrl = "/Departments/Grinding/Grinding_Table";
        break;

      case "setting":
        redirectUrl = "/Departments/Setting/Setting_Table";
        break;

      case "polishing":
        redirectUrl = "/Departments/Polishing/Polishing_Table";
        break;

      case "dull":
        redirectUrl = "/Departments/Dull/Dull_Table";
        break;

      case "plating":
        redirectUrl = "/Departments/Plating/Plating_Table";
        break;

      case "cutting":
        redirectUrl = "/Departments/Cutting/Cutting_Table";
        break;

      case "orders":
        redirectUrl = "/Orders";
        break;
    }

    router.push(redirectUrl);
  }

} catch (error: any) {
  alert("Login failed: " + error.message);
  console.error("❌ Login error:", error.message);
  setError(error.message || "An error occurred. Please try again.");
  setLoading(false);
}

  };
  
  return (
 <div className="flex min-h-screen bg-gray-100">

      {/* LEFT SIDE IMAGE */}
      <div className="w-1/2 h-screen relative hidden md:block">
        <Image
          src={pothylogo}   // 👉 Replace with your chosen image
          alt="Login visual"
          fill
          className="object-cover"
        />
      </div>

      {/* RIGHT SIDE LOGIN PANEL */}
      <div className="w-full md:w-1/2 bg-white p-10 shadow-xl flex flex-col">

        {/* Top Tabs */}
        {/* <div className="flex justify-center gap-10 text-gray-500 border-b pb-4">
          <span className="cursor-pointer hover:text-black">Wishlist</span>
          <span className="text-black border-b-2 border-black pb-2">Account</span>
          <span className="cursor-pointer hover:text-black">Cart</span>
        </div> */}

        {/* Login Text */}
        <div className="flex flex-col items-center mt-10">
          <h2 className="text-2xl font-semibold mb-2 ">Log in</h2>
          <p className="text-gray-500">To access your account</p>
          <div>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
</div>
        </div>

        {/* Login Form */}
        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-600">User Name</label>
            <input
              type="text"
              className="mt-2 w-full border rounded-lg p-3 focus:outline-none"
              placeholder="Enter your email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
        <div className="relative mt-2">
  <input
    type={showPassword ? "text" : "password"}
    className="w-full border rounded-lg p-3 focus:outline-none"
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-3 text-gray-400 text-sm cursor-pointer select-none"
  >
    {showPassword ? "Hide" : "Show"}
  </span>
</div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <a className="text-gray-500 text-sm cursor-pointer hover:underline">
              I forget my password
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg mt-4 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Create Account */}
        {/* <div className="mt-16 text-center">
          <p className="text-gray-500">Don't have an account?</p>
          <button className="mt-3 px-6 py-3 border rounded-full font-medium hover:bg-gray-100">
            Create an account
          </button>
        </div> */}
      </div>
    </div>
  );
}
