// "use client";
// import React, { useEffect, useState } from "react";

// interface Report {
//   name: string;
//   availableWeight: number;
//   purity: string | number; // allow both from API
// }

// const InventoryItemSummary: React.FC = () => {
//   const [reports, setReports] = useState<Report[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const API_URL = "https://kalash.app";
//   // const API_URL = "http://localhost:4001";

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const response = await fetch(`${API_URL}/get-inventory`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch reports");
//         }
//         const data = await response.json();
//         console.log("Fetched data in sql :", data);

//         let reportData: Report[] = [];

//         if (Array.isArray(data)) {
//           reportData = data;
//         } else if (Array.isArray(data.data)) {
//           reportData = data.data;
//         } else {
//           throw new Error("Unexpected data format");
//         }

//         // Sort by name ascending
//         reportData.sort((a, b) => a.name.localeCompare(b.name));

//         setReports(reportData);
//       } catch (err: any) {
//         console.error(err);
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchReports();
//   }, []);

//   // ✅ filter here so we can reuse
//   // const filteredReports = reports.filter(
//   //   (report) => Number(report.availableWeight) > 0
//   // );

//   const filteredReports = reports.filter(
//   (report) =>
//     Number(report.availableWeight) > 0 && report.name.toLowerCase() !== "alloy"
// );
  

//   return (
//     <div className="w-full mt-20" style={{ height: "100vh" }}>
//       <div className="max-w-screen-md mx-auto p-6 bg-white shadow rounded-lg">

//         <div className="">
//             <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
//               Inventory Items
//             </h1>

//             <div>

//               <p className="font-bold">party code : </p>
//               <dropdown></dropdown>
//             </div>



//         </div>
        

//         {isLoading && <p className="text-gray-500">Loading...</p>}
//         {error && <p className="text-red-500">Error: {error}</p>}

//         {!isLoading && !error && filteredReports.length === 0 && (
//           <p className="text-gray-500">No reports found.</p>
//         )}

//         {!isLoading && !error && filteredReports.length > 0 && (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-[#1A7A75]" style={{ color: "white" }}>
//                 <tr>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">
//                     Item
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">
//                     Purity
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">
//                     Avl Weight (g)
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">
//                     Purity Gold Wt (g)
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filteredReports.map((report, index) => {
//                   const purityString = String(report.purity).trim().toLowerCase();
//                   let purityValue: number;

//                   if (purityString.includes("22k")) {
//                     purityValue = 91.7; // 22K gold percentage
//                   } else {
//                     purityValue = parseFloat(purityString) || 0;
//                   }

//                   const availableWeightValue =
//                     Number(report.availableWeight) || 0;

//                   const purityGoldWeight = (
//                     (purityValue * availableWeightValue) / 100
//                   ).toFixed(4);

//                   return (
//                     <tr
//                       key={`${report.name}-${index}`}
//                       className="hover:bg-gray-50"
//                     >
//                       <td className="px-4 py-2 text-sm text-gray-800">
//                         {report.name}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-800">
//                         {report.purity}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-800">
//                         {availableWeightValue.toFixed(4)}
//                       </td>
//                       <td className="px-4 py-2 text-sm text-gray-800">
//                         {purityGoldWeight}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InventoryItemSummary;

"use client";
import React, { useEffect, useState } from "react";

interface Report {
  name: string;
  availableWeight: number;
  purity: string | number;
  partycode: string;
}

const InventoryItemSummary: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParty, setSelectedParty] = useState<string>("All");

  const API_URL = "https://kalash.app";
  // const API_URL = "http://localhost:4001";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/get-inventory`);
        if (!response.ok) throw new Error("Failed to fetch reports");

        const data = await response.json();
        console.log("Fetched data in SQL:", data);

        let reportData: Report[] = [];

        if (Array.isArray(data)) {
          reportData = data;
        } else if (Array.isArray(data.data)) {
          reportData = data.data;
        } else {
          throw new Error("Unexpected data format");
        }

        // Sort by name ascending
        reportData.sort((a, b) => a.name.localeCompare(b.name));

        setReports(reportData);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // 🧩 Get unique party codes
  const uniqueParties = Array.from(
    new Set(reports.map((r) => r.partycode))
  ).filter((p) => p && p.trim() !== "");

  // 🧮 Apply filters
  const filteredReports = reports.filter((report) => {
    const isValidWeight = Number(report.availableWeight) > 0;
    const notAlloy = report.name.toLowerCase() !== "alloy";
    const matchesParty =
      selectedParty === "All" || report.partycode === selectedParty;

    return isValidWeight && notAlloy && matchesParty;
  });

  return (
    <div className="w-full mt-20" style={{ height: "100vh" }}>
      <div className="max-w-screen-md mx-auto p-6 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
          Inventory Items
        </h1>

        {/* 🔽 Dropdown for Party Filter */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Party Code:</label>
          <select
            className="border p-2 rounded-md w-full"
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
          >
            <option value="All">All</option>
            {uniqueParties.map((party) => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!isLoading && !error && filteredReports.length === 0 && (
          <p className="text-gray-500">No reports found.</p>
        )}

        {!isLoading && !error && filteredReports.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#1A7A75]" style={{ color: "white" }}>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Item
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Purity
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Avl Weight (g)
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Purity Gold Wt (g)
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">
                    Party Code
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report, index) => {
                  const purityString = String(report.purity).trim().toLowerCase();
                  let purityValue: number;

                  if (purityString.includes("22k")) {
                    purityValue = 91.7;
                  } else {
                    purityValue = parseFloat(purityString) || 0;
                  }

                  const availableWeightValue =
                    Number(report.availableWeight) || 0;

                  const purityGoldWeight = (
                    (purityValue * availableWeightValue) / 100
                  ).toFixed(4);

                  return (
                    <tr
                      key={`${report.name}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {report.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {report.purity}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {availableWeightValue.toFixed(4)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {purityGoldWeight}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {report.partycode}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryItemSummary;

