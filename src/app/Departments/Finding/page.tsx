"use client";

import { Dropdown } from "antd";
import React, { useEffect, useState } from "react";

interface Report {
  Id: string;
  Name: string;
  ReceivedDate: string;
  Purity: number;
  PureMetalweight: number;
  AlloyWeight: number;
  ReceivedWeight: number;
  PartyCode: string;
  Remark: string;
  Remarks: string;
}

interface OutReport {
  Department: string;
  ReceivedWeight: number;
}

interface ScrapReport {
  Finding: number;
  Scrap: number;
  Remark: string;
  Created: string;
}

// format date for input
const formatDateInput = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const FindingInventory = () => {

  const [reports, setReports] = useState<Report[]>([]);
  const [outReports, setOutReports] = useState<OutReport[]>([]);
  const [scrapReports, setScrapReports] = useState<ScrapReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
// First day of current month
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [item, setItem] = useState("Finding");

  const [fromDate, setFromDate] = useState(formatDateInput(today));
  const [toDate, setToDate] = useState(formatDateInput(today));

  
  const [outFromDate, setOutFromDate] = useState(formatDateInput(today));
  const [outToDate, setOutToDate] = useState(formatDateInput(today));

  
  const [scrapFromDate, setScrapFromDate] = useState(formatDateInput(firstDay));
  const [scrapToDate, setScrapToDate] = useState(formatDateInput(today));


  const [selectedName, setSelectedName] = useState("All");

  const [allNames, setAllNames] = useState<string[]>(["All"]);

  const [activeForm, setActiveForm] = useState<"scrap" | "opening" | null>("scrap");

  const toggleForm = (form: "scrap" | "opening") => {
  setActiveForm((prev) => (prev === form ? null : form));
  setItem("Finding");

   // reset fields
  setScrap("");
  setScrapRemark("");
  setClosingWt("");
  setClosingRemark("");
};

  const [avlFinding, setAvlFinding] = useState("");
  const [scrap, setScrap] = useState("");
  const [closingWt, setClosingWt] = useState("");
  const [scrapRemark, setScrapRemark] = useState("");
  const [closingRemark, setClosingRemark] = useState("");
  const [loading, setLoading] = useState(false);



  // const API_URL = "http://localhost:4001";
  const API_URL = "https://kalash.app";

const fetchFindingWeight = async (item:string) => {
  try {
    const res = await fetch(`${API_URL}/get-inventory`);
    const data = await res.json();

    if (data.success) {
      const findingItem = data.data.find(
        items => items.name.trim().toLowerCase() === item.toLowerCase()
      );

      if (findingItem) {
        setAvlFinding(findingItem.availableWeight);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchFindingWeight(item);
}, [item]);
  // 🔹 Fetch Reports with filters
  const fetchReports = async () => {

    try {

      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/get-inventory-inward?fromDate=${fromDate}&toDate=${toDate}&name=${selectedName}`
      );

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();

      let reportData: Report[] = [];

      if (Array.isArray(data.data)) {

        reportData = data.data.map((item: any) => ({
          Id: item.id,
          Name: item.name,
          ReceivedDate: item.receivedDate,
          Purity: item.purity,
          PureMetalweight: item.pureMetalWeight,
          AlloyWeight: item.alloyWeight,
          ReceivedWeight: item.receivedWeight,
          PartyCode: item.partyCode,
          Remark: item.remark,
          Remarks: item.remarks,
        }));

      }

      console.log("RD",reportData)

      setReports(reportData);

      // dropdown names
      const allowedItems = ["Finding", "Assesmbly Finding"];

      const uniqueNames = Array.from(
        new Set(
          reportData
            .map((r) => r.Name)
            .filter((name) => allowedItems.includes(name))
        )
      );

      setAllNames(["All", ...uniqueNames]);

    } catch (err: any) {

      setError(err.message);

    } finally {

      setIsLoading(false);

    }
  };

    const fetchOutReports = async () => {

    try {

      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/get-finding-outward?fromDate=${outFromDate}&toDate=${outToDate}`
      );

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();

      const reportData: OutReport[] = data.data.map((item: any) => ({
        Department: item.dept,
        ReceivedWeight: item.finding,
      }));

      setOutReports(reportData);


    } catch (err: any) {

      setError(err.message);

    } finally {

      setIsLoading(false);

    }
  };

 const fetchScrapReports = async () => {

    try {

      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/get-finding-scrap?fromDate=${scrapFromDate}&toDate=${scrapToDate}`
      );

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();

      const reportData: ScrapReport[] = data.data.map((item: any) => ({
        Finding: item.findingWeight,
        Scrap: item.scrapWeight,
        Created: item.createdDate,
        Remark: item.remark,
      }));

      setScrapReports(reportData);


    } catch (err: any) {

      setError(err.message);

    } finally {

      setIsLoading(false);

    }
  };

  // 🔹 Load data when filters change
  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate, selectedName]);

useEffect(() => {
  fetchOutReports();
}, [outFromDate, outToDate]);

useEffect(() => {
  fetchScrapReports();
}, [scrapFromDate, scrapToDate]);


  // 🔹 Display Date Format
 const formatDate12 = (dateStr: string) => {
  const date = new Date(dateStr);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  let hours: number | string = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  // const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  hours = String(hours).padStart(2, "0");

  return `${day}-${month}-${year}  ${hours}:${minutes} ${ampm}`;
};


const handleScrapSubmit = async () => {
  if (!avlFinding || !scrap || !scrapRemark) {
    alert("Please fill all scrap update fields");
    return;
  }

  if(avlFinding < scrap){
    alert("Scrap Weight is higher than avl finding");
    return;
  }

  // 🔥 CONFIRM BEFORE SUBMIT
  const isConfirmed = window.confirm(
    `Are you sure?\n\nFinding: ${avlFinding}\nScrap: ${scrap}`
  );

  if (!isConfirmed) return;

  try {
    setLoading(true);

    const response = await fetch(`${API_URL}/findingToScrap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        AvlFindingWeight: avlFinding,
        ScrapWeight: scrap,
        remark: scrapRemark,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Submitted successfully");

      // clear fields
      setAvlFinding("");
      setScrap("");
      setScrapRemark("");

      // 🔥 refresh latest data
      fetchFindingWeight(item);
      fetchScrapReports();

    } else {
      alert("Failed to submit");
    }

  } catch (error) {
    console.error("API Error:", error);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};

const handleClosingSubmit = async () => {
  if (!avlFinding || !closingWt || !closingRemark) {
    alert("Please fill all closing update fields");
    return;
  }

  if(avlFinding < closingWt){
    alert("Closing Weight is higher than avl weight");
    return;
  }

  // 🔥 CONFIRM BEFORE SUBMIT
  const isConfirmed = window.confirm(
    `Are you sure?\n\n Avl ${item} Wt: ${avlFinding}\n Closing Wt: ${closingWt}\n Weight : ${parseFloat(avlFinding) + parseFloat(closingWt)}`
  );

  if (!isConfirmed) return;

  try {
    setLoading(true);

      const payload = {
            itemName: item.trim(),
            purity: '91.7%',
            availableWeight: parseFloat(closingWt),
            unitOfMeasure: 'Grams',
            partyLedger: '0001',
            isCustomItem: '',
            // originalItem: isCustomItem ? null : selectedItem,
            // scrapType: showScrapDropdown ? scrapType : "",
            remarks: closingRemark ? closingRemark : ""
          };
          
                console.log('Submitting payload:', payload);

                const response = await fetch(`${API_URL}/update-inventory`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                  });

      const data = await response.json();

    if (response.ok) {
      alert("Closing Update successfully");

      // clear fields
      setAvlFinding("");
      setClosingWt("");
      setClosingRemark("");

      // 🔥 refresh latest data
      fetchFindingWeight(item);      
      fetchReports();

    } else {
      alert("Failed to submit");
       throw new Error(data.message || 'Failed to update inventory');
    }

  } catch (error) {
    console.error("API Error:", error);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};
  return (

    <div className="grid grid-cols-2 gap-6 w-full">

      <div className="bg-white shadow rounded-lg p-4">

        <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
          Inward
        </h1>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap items-end text-sm">

          <div className="w-[140px]">
            <label className="text-xs font-bold">From Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs w-full"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="w-[140px]">
            <label className="text-xs font-bold">To Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs w-full"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* <div className="w-[160px]">
            <label className="text-xs text-gray-600">Item</label>
            <select
              className="border rounded px-2 py-1 text-xs w-full"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
            >
              {allNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div> */}

        <div className="w-[160px]">
          <label className="text-xs font-bold">Item</label>
          <select
            className="border rounded px-2 py-1 text-xs w-full"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Finding">Finding</option>
            <option value="Assesmbly Finding">Assesmbly Finding</option>
          </select>
        </div>

        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!isLoading && reports.length === 0 && (
          <p>No reports found</p>
        )}

        {!isLoading && reports.length > 0 && (

          <div className="overflow-x-auto">

            <table className="min-w-full border text-xs">

              <thead className="bg-[#1A7A75] text-white">
                <tr>
                  <th className="px-2 py-1 text-left">Item</th>
                  <th className="px-2 py-1 text-left">Received Wt</th>
                  <th className="px-2 py-1 text-left">Received Date</th>
                  <th className="px-2 py-1 text-left">Remarks</th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {reports
  .filter(
    (report) =>
      report.Name === "Finding" ||
      report.Name === "Assesmbly Finding"
  )
  .map((report, index) => (
    <tr key={`${report.Id}-${index}`} className="hover:bg-gray-50">
      <td className="px-2 py-1">
        {report.Name || "-"}
      </td>

      <td className="px-2 py-1">
        {report.ReceivedWeight != null
          ? report.ReceivedWeight.toFixed(2)
          : "-"}
      </td>

      <td className="px-2 py-1">
        {report.ReceivedDate
          ? formatDate12(report.ReceivedDate)
          : "-"}
      </td>

      <td className="px-2 py-1">
        {report.Remarks || "-"}
      </td>
    </tr>
))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      <div className="bg-white shadow rounded-lg p-4">
             <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
                Outward
              </h1>
              <div className="flex gap-3 mb-4 flex-wrap items-end text-sm">

                  <div className="w-[140px]">
                    <label className="text-xs font-bold">From Date</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-xs w-full"
                      value={outFromDate}
                      onChange={(e) => setOutFromDate(e.target.value)}
                    />
                  </div>

                  <div className="w-[140px]">
                    <label className="text-xs font-bold">To Date</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-xs w-full"
                      value={outToDate}
                      onChange={(e) => setOutToDate(e.target.value)}
                    />
                  </div>

        
           </div>


            {isLoading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}

              {!isLoading && outReports.length === 0 && (
                <p>No reports found</p>
              )}

          {!isLoading && outReports.length > 0 && (

            <div className="overflow-x-auto">

              <table className="min-w-full border text-xs">

                <thead className="bg-[#1A7A75] text-white">
                  <tr>
                    <th className="px-2 py-1 text-left">Department</th>
                    <th className="px-2 py-1 text-left">Used Weight</th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {outReports.map((report, index) => (

                    <tr className="hover:bg-gray-50">

                      <td className="px-2 py-1">
                        {report.Department || "-"}
                      </td>

                      <td className="px-2 py-1">
                        {report.ReceivedWeight != null
                          ? report.ReceivedWeight.toFixed(2)
                          : "0.00"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}


      </div>

      <div className="bg-white shadow rounded-lg p-4 flex flex-col gap-2 items-start">
          <div className="flex gap-2 items-start">
              <button
                onClick={() => toggleForm("scrap")}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Scrap Update
              </button>

              <button
                onClick={() => toggleForm("opening")}
                className="px-4 py-2 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Opening / Closing
              </button>
            </div>
           

                {activeForm === "scrap" && (
                      <div className="mt-3 p-3 border rounded bg-gray-50 text-sm w-full">
                          <label className="font-bold text-xs block mb-2">
                            Finding to Scrap
                          </label>

                          <div className="flex flex-col gap-2">
                            {/* Input 1 */}
                            <div>
                              <label className="text-xs">Available Finding Weight</label>
                              <input
                                type="text"
                                value={avlFinding}
                                onChange={(e) => setAvlFinding(e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                                // placeholder="Enter weight"
                                disabled
                                required
                              />
                            </div>

                            {/* Input 2 */}
                            <div>
                              <label className="text-xs">Scrap Weight</label>
                              <input
                                type="text"
                                value={scrap}
                                onChange={(e) => setScrap(e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="Enter finding weight to scrap"
                                required
                              />
                            </div>
                            {/* Input 3 */}
                            <div>
                              <label className="text-xs">Remarks</label>
                              <input
                                type="text"
                                value={scrapRemark}
                                onChange={(e) => setScrapRemark(e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="Enter remark"
                                required
                              />
                            </div>

                            {/* Submit Button */}
                            <button
                              onClick={handleScrapSubmit}
                              disabled={loading}
                              className={`mt-2 px-3 py-1 rounded text-white text-xs font-bold ${
                                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              {loading ? "Submitting..." : "Submit"}
                            </button>
                          </div>
                        </div>
                  )}

                  {activeForm === "opening" && (
                    <div className="mt-3 p-3 border rounded bg-gray-50 text-sm w-full">
                      <label className="font-bold text-xs block mb-2">
                            {item} Closing Update
                          </label>
                            <div className="flex flex-col gap-2">
                            {/* Input 1 */}
                            <div>
                              <label className="text-xs">Item</label>

                              <select
                                className="form-control mt-1"
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                                style={{fontSize:'.7rem', fontWeight:'bold'}}
                              >
                                <option value="Finding">Finding</option>
                                <option value="Assesmbly Finding">Assesmbly Finding</option>
                              </select>
                            </div>


                            <div>
                              <label className="text-xs">Available {item} Weight</label>
                              <input
                                type="text"
                                value={avlFinding}
                                onChange={(e) => setAvlFinding(e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                                // placeholder="Enter weight"
                                disabled
                                required
                              />
                            </div>

                            {/* Input 2 */}
                            <div>
                              <label className="text-xs">Closing Weight</label>
                              <input
                                type="text"
                                value={closingWt}
                                onChange={(e) => setClosingWt(e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="Enter finding weight to scrap"
                                required
                              />
                            </div>
                            {/* Input 3 */}
                            <div>
                              <label className="text-xs">Remarks</label>
                              <input
                                type="text"
                                value={closingRemark}
                                onChange={(e) => setClosingRemark(e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="Enter remark"
                                required
                              />
                            </div>

                            {/* Submit Button */}
                            <button
                              onClick={handleClosingSubmit}
                              disabled={loading}
                              className={`mt-2 px-3 py-1 rounded text-white text-xs font-bold ${
                                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              {loading ? "Submitting..." : "Submit"}
                            </button>
                          </div>
                    </div>
                  )}
          </div>

          <div className="bg-white shadow rounded-lg p-4">
             <h1 className="text-2xl font-bold mb-4 text-[#1A7A75]">
                Finding - Scrap Report
              </h1>
              <div className="flex gap-3 mb-4 flex-wrap items-end text-sm">

                  <div className="w-[140px]">
                    <label className="text-xs font-bold">From Date</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-xs w-full"
                      value={scrapFromDate}
                      onChange={(e) => setScrapFromDate(e.target.value)}
                    />
                  </div>

                  <div className="w-[140px]">
                    <label className="text-xs font-bold">To Date</label>
                    <input
                      type="date"
                      className="border rounded px-2 py-1 text-xs w-full"
                      value={scrapToDate}
                      onChange={(e) => setScrapToDate(e.target.value)}
                    />
                  </div>

        
           </div>


            {isLoading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}

              {!isLoading && scrapReports.length === 0 && (
                <p>No reports found</p>
              )}

          {!isLoading && scrapReports.length > 0 && (

            <div className="overflow-x-auto">

              <table className="min-w-full border text-xs">

                <thead className="bg-[#1A7A75] text-white">
                  <tr>
                    <th className="px-2 py-1 text-left">Date</th>
                    <th className="px-2 py-1 text-left">Avl Finding Weight</th>
                    <th className="px-2 py-1 text-left">Scrap Weight</th>
                    <th className="px-2 py-1 text-left">Remarks</th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {scrapReports.map((report, index) => (

                    <tr className="hover:bg-gray-50">

                      <td className="px-2 py-1">
                       {report.Created ? formatDate12(report.Created) : "-"}
                      </td>

                      <td className="px-2 py-1">
                        {report.Finding != null
                          ? report.Finding.toFixed(2)
                          : "0.00"}
                      </td> 
                      
                      <td className="px-2 py-1">
                        {report.Scrap != null
                          ? report.Scrap.toFixed(2)
                          : "0.00"}
                      </td>

                      <td className="px-2 py-1">
                        {report.Remark || "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}


      </div>

    </div>

  );

};

export default FindingInventory;