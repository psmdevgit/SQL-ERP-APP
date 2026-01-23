// "use client";

// import { useState, useEffect } from "react";


// const apiBaseUrl = "http://localhost:5001" ;


// export default function VendorLedgerPage() {
//   const [ledger, setLedger] = useState<any[]>([]);
//   const [filters, setFilters] = useState({
//     fromDate: "",
//     toDate: "",
//     partyName: "",
//     orderId: "",
//   });

//   const fetchLedger = async () => {
//     try {
//       const params = new URLSearchParams(filters).toString();
//       const res = await fetch(`${apiBaseUrl}/api/vendor-ledger?${params}`);
//       const data = await res.json();
//       setLedger(data);
//     } catch (err) {
//       console.error("Error fetching ledger:", err);
//     }
//   };

//   useEffect(() => {
//     fetchLedger();
//   }, []);

//   return (
//     <div className="w-full mt-20">
//       <div className="max-w-screen-xl mx-auto p-6 bg-white shadow rounded-lg">
//         <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
//           Vendor Ledger Transactions
//         </h1>

//         {/* Filters */}
//         <div className="flex gap-4 mb-4">
//           <input
//             type="date"
//             value={filters.fromDate}
//             onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
//             className="border p-2 rounded"
//           />
//           <input
//             type="date"
//             value={filters.toDate}
//             onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
//             className="border p-2 rounded"
//           />
//           <input
//             type="text"
//             placeholder="Party Name"
//             value={filters.partyName}
//             onChange={(e) => setFilters({ ...filters, partyName: e.target.value })}
//             className="border p-2 rounded"
//           />
//           <input
//             type="text"
//             placeholder="Order ID"
//             value={filters.orderId}
//             onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
//             className="border p-2 rounded"
//           />
//           <button
//             onClick={fetchLedger}
//             className="bg-[#1A7A75] text-white px-4 py-2 rounded"
//           >
//             Filter
//           </button>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full border mt-2">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border p-2">Order Date</th>
//                 <th className="border p-2">Party Name</th>
//                 <th className="border p-2">Order ID</th>
//                 <th className="border p-2">Issued Weight</th>
//                 <th className="border p-2">Delivered Weight</th>
//                 <th className="border p-2">Balance Weight</th>
//                 <th className="border p-2">Advance Metal Purity</th>
//               </tr>
//             </thead>
//             <tbody>
//               {ledger.map((row, idx) => (
//                 <tr key={idx} className="text-center">
//                   <td className="border p-2">{new Date(row.tranDate).toLocaleDateString()}</td>
//                   <td className="border p-2">{row.partyName}</td>
//                   <td className="border p-2">{row.orderId}</td>
//                   <td className="border p-2">{row.issuedWeight}</td>
//                   <td className="border p-2">{row.deliveredWeight}</td>
//                   <td className="border p-2">{row.balanceWeight}</td>
//                   <td className="border p-2">{row.advanceMetalPurity}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";

// const apiBaseUrl = "http://localhost:4001";

const apiBaseUrl = "https://Kalash.app";

// Define Ledger item type
interface LedgerItem {
  tranDate?: string;
  party?: string;
  orderId?: string;
  issuedWeight?: number;
  deliveredWeight?: number;
  balanceWeight?: number;
  advanceMetalPurity?: string;
}

export default function VendorLedgerPage() {
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    partyId: "",
    orderId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${apiBaseUrl}/api/vendor-ledger?${params}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("API Response:", data);

      // Handle both array response or { success: true, data: [...] } format
      if (Array.isArray(data)) {
        setLedger(data);
      } else if (data && Array.isArray(data.data)) {
        setLedger(data.data);
      } else {
        setLedger([]);
      }
    } catch (err: any) {
      console.error("Error fetching ledger:", err);
      setError(err.message || "Failed to fetch ledger.");
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div className="w-full mt-20">
      <div className="max-w-screen-xl mx-auto p-6 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
          Vendor Ledger Transactions
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Party ID"
            value={filters.partyId}
            onChange={(e) => setFilters({ ...filters, partyId: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Order ID"
            value={filters.orderId}
            onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            onClick={fetchLedger}
            className="bg-[#1A7A75] text-white px-4 py-2 rounded"
          >
            Filter
          </button>
        </div>

        {/* Loading/Error */}
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Table */}
        {!loading && ledger.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border mt-2">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Order Date</th>
                  <th className="border p-2">Party ID</th>
                  <th className="border p-2">Order ID</th>
                  <th className="border p-2">Issued Weight</th>
                  <th className="border p-2">Delivered Weight</th>
                  <th className="border p-2">Balance Weight</th>
                  <th className="border p-2">Advance Metal Purity</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="border p-2">
                      {row.tranDate ? new Date(row.tranDate).toLocaleDateString() : ""}
                    </td>
                    <td className="border p-2">{row.party || "-"}</td>
                    <td className="border p-2">{row.orderId || "-"}</td>
                    <td className="border p-2">{row.issuedWeight ?? "-"}</td>
                    <td className="border p-2">{row.deliveredWeight ?? "-"}</td>
                    <td className="border p-2">{row.balanceWeight ?? "-"}</td>
                    <td className="border p-2">{row.advanceMetalPurity || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p>No ledger records found.</p>
        )}
      </div>
    </div>
  );
}

