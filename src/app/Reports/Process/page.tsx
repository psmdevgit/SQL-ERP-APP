
"use client";

import { useEffect, useState } from "react";

interface ProcessRow {
  process: string;
  issued_wt: number;
  process_wt: number;
  received_wt: number;
  loss_wt: number;
  scrap_wt: number;
  dust_wt: number;
}

interface Report {
  name: string;
  availableWeight: number;
  purity: string;
}

interface DepartmentSummary {
  success: boolean;
  summary: {
    totalCastingLoss: number;
    totalFilingLoss: number;
    totalGrindingLoss: number;
    totalSettingLoss: number;
    totalPolishingLoss: number;
    totalOverallLoss: number;

    totalOverallDust: number;
    totalCastingDust: number;
    totalFiligDust: number;
    totalGrindingDust: number;
    totalMediaDust: number;
    totalCorrectionDust: number;
    totalSettingDust: number;
    totalPolishingDust: number;
    totalDullDust: number;
    totalCuttingDust: number;
  };
}


const rowsFromSummary = (summary: any) => [
  { process: "Grinding", value: summary.totalGrindingDust },
  { process: "Media", value: summary.totalMediaDust },
  { process: "Correction", value: summary.totalCorrectionDust },
  { process: "Setting", value: summary.totalSettingDust },
  { process: "Polishing", value: summary.totalPolishingDust },
  { process: "Dull", value: summary.totalDullDust },
  { process: "Cutting", value: summary.totalCuttingDust },
];


export default function SummaryPage() {
  const [data, setData] = useState<ProcessRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  

  const [dustRows, setDustRows] = useState<
  { process: string; value: number }[]
>([]);

const [totalDUstReceived, setTotalDustReceived] = useState<number>(0);


  const [summaryData, setSummaryData] = useState<DepartmentSummary | null>(null);

  const API_URL = "https://kalash.app";

  
  // const API_URL = "http://localhost:4001";
  
  


useEffect(() => {
  const now = new Date();

  // ✅ First day of current month
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  // ✅ Last day of current month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  fetchSummaryData(startDate, endDate);
}, []);



   const fetchSummaryData = async (startDate: Date, endDate: Date) => {
  try {
    setLoading(true);

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    console.log("Sending dates to backend:", start, end);

    const response = await fetch(
      `${API_URL}/api/department-dust?startDate=${start}&endDate=${end}`
    );

    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    
    const rows = rowsFromSummary(data.summary);


    setDustRows(rows);
    setTotalDustReceived(data.summary.totalOverallDust);

    setSummaryData(data);
  } catch (error) {
    console.error(error);
    setSummaryData(null);
  } finally {
    setLoading(false);
  }
};
// const formatDate = (date: Date) =>
//   date.toISOString().split("T")[0];

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};



  const fetchData = async () => {
    const query = `${API_URL}/api/process-report`;
    setLoading(true);
    try {
      const res = await fetch(query);
      const result = await res.json();

      if (!result.success) {
        console.error("Error fetching data:", result.message);
        return;
      }

      setData(result.data);
      console.log(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_URL}/get-inventory`);
        if (!response.ok) throw new Error("Failed to fetch reports");

        const data = await response.json();
        let reportData: Report[] = [];

        if (Array.isArray(data)) {
          reportData = data;
        } else if (Array.isArray(data.data)) {
          reportData = data.data;
        } else {
          throw new Error("Unexpected data format");
        }

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

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ totals
  const processTotal = data.reduce(
    (sum, row) => sum + Number(row.process_wt || 0),
    0
  );
    const processTotalPurity = data.reduce(
    (sum, row) => sum + Number((row.process_wt*91.7)/100 || 0),
    0
  );

    const taggingRows = data.filter(
    row => row.process?.toLowerCase() === "tagging"
  );

    const totalTagReceived = taggingRows.reduce(
    (sum, row) => sum + Number(row.received_wt || 0),
    0
  );

  console.log("taggeed : ",taggingRows);


  const hiddenItems = [
    "alloy",
  "cutting  dust",
  "dust",
  "g machine dust",
  "p machine dust",
];

const totalTagPurity = taggingRows.reduce(
  (sum, row) => sum + (Number(row.received_wt || 0) * 91.7) / 100,
  0
);

  const filteredReports = reports.filter(
          (r) => Number(r.availableWeight) > 0  &&   !hiddenItems.includes(r.name.toLowerCase().trim())
        );

                  const totalInvWeight = filteredReports.reduce(
                    (sum, r) => sum + (Number(r.availableWeight) || 0),
                    0
                  );

                  const totalInvPurityWt = filteredReports.reduce((sum, r) => {
                    const purityString = String(r.purity).trim().toLowerCase();
                    let purityValue: number = purityString.includes("22k")
                      ? 91.7
                      : parseFloat(purityString) || 0;
                    const availableWeightValue = Number(r.availableWeight) || 0;
                    return sum + (purityValue * availableWeightValue) / 100;
                  }, 0);

const totalRecoveryPurity = (summaryData?.summary.totalOverallDust * 91.7) / 100;

  const inventoryTotalAvl = reports
    .filter((r) => Number(r.availableWeight) > 0 && r.name.toLowerCase() !== "aloy")
    .reduce((sum, r) => sum + (Number(r.availableWeight) || 0 ), 0);

  const inventoryTotalGold = reports
    .filter((r) => Number(r.availableWeight) > 0 && r.name.toLowerCase() !== "aloy")
    .reduce((sum, r) => {
      const purityString = String(r.purity).trim().toLowerCase();
      let purityValue = purityString.includes("22k")
        ? 91.7
        : parseFloat(purityString) || 0;
      return sum + (purityValue * (Number(r.availableWeight) || 0)) / 100;
    }, 0);

  return (
    <div className="p-4 progress-report flex flex-col gap-6">
      {/* ✅ Overall Total Table at Top */}
      {/* <div className="mb-8 w-full">
        <h1 className="text-xl font-bold mb-4">Overall Total</h1>
         <table
            className="border border-collapse w-full bg-white"
            style={{ width: "75%", backgroundColor: "#fff" }}
          >
          <thead className="bg-[#1A7A75] text-white">
            <tr>
              <th className="px-4 py-2 text-sm font-semibold text-left">
                Process Total Wt (gm)
              </th> 
              <th className="px-4 py-2 text-sm font-semibold text-left">
                Inventory Avl Wt (gm)
              </th>
               <th className="px-4 py-2 text-sm font-semibold text-left">
                Purity Gold Wt (gm)
              </th>           
              <th className="px-4 py-2 text-sm font-semibold text-left">
                Inventory Purity Gold Wt (gm)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50 font-medium ">
              <td className="px-4 py-2">{processTotal.toFixed(4)}</td>
              <td className="px-4 py-2">{inventoryTotalAvl.toFixed(4)}</td>
              <td className="px-4 py-2">{processTotalPurity.toFixed(4)}</td>
              <td className="px-4 py-2">{inventoryTotalGold.toFixed(4)}</td>
            </tr>
          </tbody>
            <tfoot className="bg-gray-200 font-bold" style={{backgroundColor: "#EDB652"}}>
      <tr>
        <td colSpan={2} className="px-4 py-2 text-left">
         Total : {(processTotal + inventoryTotalAvl).toFixed(4)}
        </td>
        <td colSpan={2} className="px-4 py-2 text-left">
          Total of Purity : {(processTotalPurity + inventoryTotalGold).toFixed(4)}
        </td>
      </tr>
    </tfoot>
        </table>
      </div> */}

<div className="mt-8 w-full">
  <h1 className="text-xl font-bold mb-4">Final Summary</h1>


  <table
    className="border border-collapse w-full bg-white"
    style={{ width: "60%" }}
  >
    <thead className="bg-[#1A7A75] text-white">
      <tr>
        <th className="px-4 py-2 text-left">Name</th>
        <th className="px-4 py-2 text-right">Weight (gm)</th>
        <th className="px-4 py-2 text-right">Purity Weight (gm)</th>
      </tr>
    </thead>

    <tbody>
      <tr className="border-b">
        <td className="px-4 py-2 font-medium">Process</td>
        <td className="px-4 py-2 text-right">
          {processTotal.toFixed(4)}
        </td>
        <td className="px-4 py-2 text-right">
          {processTotalPurity.toFixed(4)}
        </td>
      </tr>

      <tr className="border-b">
        <td className="px-4 py-2 font-medium">Inventory</td>
        <td className="px-4 py-2 text-right">
          {totalInvWeight.toFixed(4)}
        </td>
        <td className="px-4 py-2 text-right">
          {totalInvPurityWt.toFixed(4)}
        </td>
      </tr>

      <tr className="border-b">
        <td className="px-4 py-2 font-medium">Tagging</td>
        <td className="px-4 py-2 text-right">
          {totalTagReceived.toFixed(4)}
        </td>
        <td className="px-4 py-2 text-right">
          {totalTagPurity.toFixed(4)}
        </td>
      </tr>

      <tr className="border-b">
        <td className="px-4 py-2 font-medium">Recovery Dust</td>
        <td className="px-4 py-2 text-right">
          {summaryData?.summary.totalOverallDust.toFixed(4)}
        </td>
        <td className="px-4 py-2 text-right">
        {totalRecoveryPurity.toFixed(4)}
        </td>
      </tr>


    </tbody>

    <tfoot>
      <tr
        style={{
          backgroundColor: "#EDB652",
          fontWeight: "600",
        }}
      >
        <td className="px-4 py-2 text-left">Grand Total</td>
        <td className="px-4 py-2 text-right">
          {(
            processTotal +
            totalInvWeight +
            totalTagReceived + summaryData?.summary.totalOverallDust
          ).toFixed(4)}
        </td>
        <td className="px-4 py-2 text-right">
          {(
            processTotalPurity +
            totalInvPurityWt +
            totalTagPurity + totalRecoveryPurity
          ).toFixed(4)}
        </td>
      </tr>
    </tfoot>
  </table>

</div>


      {/* ✅ Two Columns Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div>
          <h1 className="text-xl font-bold mb-4">Process Summary</h1>
          <div className="mt-5 overflow-x-auto">
            {loading ? (
              <p className="text-lg font-semibold">Loading...</p>
            ) : (
              <table
                className="border border-collapse"
                style={{ width: "100%", backgroundColor: "#fff" }}
              >
                <thead>
                  <tr
                    className="bg-gray-100"
                    style={{
                      backgroundColor: "#1a7a75",
                      color: "#fff"
                    }}
                  >
                    <th className="border p-2">Process</th>
                    <th className="border p-2">
                      Processing Wt{" "}
                      <span className="text-xs ps-2 text-white-700">(gm)</span>
                    </th>
                       <th className="border p-2">
                      Purity Gold Wt{" "}
                      <span className="text-xs ps-2 text-white-700">(gm)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center p-4 text-gray-500"
                      >
                        No records found
                      </td>
                    </tr>
                  ) : (
                    data.map((row, idx) =>
                      
                      { if (row.process?.toLowerCase() === "tagging") return null;
                        return (
                      <tr key={idx} className="text-center">
                        <td
                          className="border p-2 text-left"
                          style={{ color: "#444", fontWeight: "500" }}
                        >
                          {row.process}
                        </td>
                        <td className="border p-2">
                          {Number(row.process_wt || 0).toFixed(4)}
                        </td>  
                        <td className="border p-2">
                          {Number((row.process_wt*91.7)/100 || 0).toFixed(4)}
                        </td>
                      </tr>
                    )
})
                  )}
                </tbody>
                {data.length > 0 && (
                  <tfoot>
                    <tr
                      className="text-center"
                      style={{
                        backgroundColor: "#EDB652",
                        color: "#000",
                        fontWeight: "500",
                      }}
                    >
                      <td
                        className="border p-2 text-left"
                        style={{ color: "#000", fontWeight: "500" }}
                      >
                        Total:
                      </td>
                      <td className="border p-2">
                        {data
                          .reduce(
                            (sum, row) => sum + Number(row.process_wt || 0),
                            0
                          )
                          .toFixed(4)}
                      </td>

                       <td className="border p-2">
                        {data
                          .reduce(
                            (sum, row) => sum + Number((row.process_wt*91.7)/100 || 0),
                            0
                          )
                          .toFixed(4)}
                      </td>

                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold mb-4">Inventory Items</h1>
          <div className="mt-5 overflow-x-auto">
            {isLoading && <p className="text-gray-500">Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!isLoading && !error && reports.length === 0 && (
              <p className="text-gray-500">No reports found.</p>
            )}

            {!isLoading && !error && reports.length > 0 && (
              <div className="overflow-x-auto">
        {/*         {(() => {
                  const filteredReports = reports.filter(
                    (r) => Number(r.availableWeight) > 0
                  ); */}

                        {(() => {
              
                  const filteredReports = reports.filter(
          (r) => Number(r.availableWeight) > 0  &&   !hiddenItems.includes(r.name.toLowerCase().trim())
        );

                  const totalAvlWeight = filteredReports.reduce(
                    (sum, r) => sum + (Number(r.availableWeight) || 0),
                    0
                  );

                  const totalPurityWt = filteredReports.reduce((sum, r) => {
                    const purityString = String(r.purity).trim().toLowerCase();
                    let purityValue: number = purityString.includes("22k")
                      ? 91.7
                      : parseFloat(purityString) || 0;
                    const availableWeightValue = Number(r.availableWeight) || 0;
                    return sum + (purityValue * availableWeightValue) / 100;
                  }, 0);

                  return (
                    <table className="border border-collapse w-full bg-white">
                      <thead className="bg-[#1A7A75] text-white">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold">
                            Item
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">
                            Purity
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">
                            Avl Weight (gm)
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold">
                            Purity Gold Wt (gm)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredReports.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-4 text-center text-gray-500"
                            >
                              No data found.
                            </td>
                          </tr>
                        ) : (
                          filteredReports.map((report, index) => {
                            const purityString = String(report.purity)
                              .trim()
                              .toLowerCase();
                            let purityValue: number = purityString.includes("22k")
                              ? 91.7
                              : parseFloat(purityString) || 0;

                            const availableWeightValue =
                              Number(report.availableWeight) || 0;

                            const purityGoldWeight = (
                              (purityValue * availableWeightValue) /
                              100
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
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {/* Show footer only if totals > 0 */}
                      {totalAvlWeight > 0 || totalPurityWt > 0 ? (
                        <tfoot>
                          <tr
                            style={{
                              backgroundColor: "#EDB652",
                              color: "#000",
                              fontWeight: "500",
                            }}
                          >
                            <td colSpan={2} className="px-4 py-2">
                              Total:
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {totalAvlWeight.toFixed(4)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {totalPurityWt.toFixed(4)}
                            </td>
                          </tr>
                        </tfoot>
                      ) : null}
                    </table>
                  );
                })()}
              </div>
            )}
          </div>
        
        {/* ==========================      Tagged    ================================= */}

         <div>
                <h1 className="text-xl font-bold mt-3">Tagged Items</h1>
                        <div className=" overflow-x-auto">
                          {loading ? (
                            <p className="text-lg font-semibold">Loading...</p>
                          ) : (
                            <table
                              className="border border-collapse"
                              style={{ width: "100%", backgroundColor: "#fff" }}
                            >
                              <thead>
                                <tr
                                  className="bg-gray-100"
                                  style={{
                                    backgroundColor: "#1a7a75",
                                    color: "#fff"
                                  }}
                                >
                                  <th className="border p-2">Process</th>
                                  <th className="border p-2">
                                    Tagged Wt{" "}
                                    <span className="text-xs ps-2 text-white-700">(gm)</span>
                                  </th>
                                      <th className="border p-2">
                                          Purity Wt <span className="text-xs">(91.7%)</span>
                                      </th>

                                    
                                </tr>
                              </thead>
                              <tbody>
                                {taggingRows.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={7}
                                      className="text-center p-4 text-gray-500"
                                    >
                                      No records found
                                    </td>
                                  </tr>
                                ) : (
                                  // taggingRows.map((row, idx) => (
                                  //   <tr key={idx} className="text-center">
                                  //     <td
                                  //       className="border p-2 text-left"
                                  //       style={{ color: "#444", fontWeight: "500" }}
                                  //     >
                                  //       {row.process}
                                  //     </td>
                                  //     <td className="border p-2">
                                  //       {Number(row.received_wt || 0).toFixed(4)}
                                  //     </td>  
                                      
                                  //   </tr>
                                  // ))

                                  taggingRows.map((row, idx) => {
                const taggedWt = Number(row.received_wt || 0);
                const purityWt = (taggedWt * 91.7) / 100;

                return (
                  <tr key={idx} className="text-center">
                    <td className="border p-2 text-left">
                      {row.process}
                    </td>

                    <td className="border p-2">
                      {taggedWt.toFixed(4)}
                    </td>

                    <td className="border p-2">
                      {purityWt.toFixed(4)}
                    </td>
                  </tr>
                );
                })


                                )
                                }
                              </tbody>
                              {/* {taggingRows.length > 0 && ( */}
                                <tfoot>
                                  <tr
                                    className="text-center"
                                    style={{
                                      backgroundColor: "#EDB652",
                                      color: "#000",
                                      fontWeight: "500",
                                    }}
                                  >
                                    <td
                                      className="border p-2 text-left"
                                      style={{ color: "#000", fontWeight: "500" }}
                                    >
                                      Total:
                                    </td>
                                    <td className="border p-2">
                                      {/* {taggingRows
                                        .reduce(
                                          (sum, row) => sum + Number(row.received_wt || 0),
                                          0
                                        )
                                        .toFixed(4)} */}

                                          {totalTagReceived.toFixed(4)}

                                    </td>

                  <td className="border p-2">
                    {totalTagPurity.toFixed(4)}
                  </td>
                                    

                                  </tr>
                                </tfoot>
                              {/* )} */}
                            </table>
                          )}
                        </div>
                </div>

        </div>

 <div>

 

  <div className="">
  <h1 className="text-xl font-bold">Departments Dust</h1>
          <div className="mt-5 overflow-x-auto">
            {loading ? (
              <p className="text-lg font-semibold">Loading...</p>
            ) : (
              <table
                className="border border-collapse"
                style={{ width: "100%", backgroundColor: "#fff" }}
              >
                <thead>
                  <tr
                    className="bg-gray-100"
                    style={{
                      backgroundColor: "#1a7a75",
                      color: "#fff"
                    }}
                  >
                    <th className="border p-2">Departments</th>
                    <th className="border p-2">
                      Dust Wt{" "}
                      <span className="text-xs ps-2 text-white-700">(gm)</span>
                    </th>
                                      
                  </tr>
                </thead>
               <tbody>
  {dustRows.length === 0 ? (
    <tr>
      <td colSpan={2} className="text-center p-4 text-gray-500">
        No records found
      </td>
    </tr>
  ) : (
    dustRows.map((row, idx) => (
      <tr key={idx} className="text-center">
        <td className="border p-2 text-left">{row.process}</td>
        <td className="border p-2">
          {Number(row.value || 0).toFixed(4)}
        </td>
      </tr>
    ))
  )}
</tbody>

                 <tfoot>
  <tr style={{ backgroundColor: "#EDB652", fontWeight: "500" }}>
    <td className="border p-2 text-left">Total:</td>
    <td className="border p-2 text-center">
      {totalDUstReceived.toFixed(4)}
    </td>
  </tr>
</tfoot>

              </table>
            )}
          </div>
  </div>

</div> 



      </div>

      <style jsx global>{`
        .progress-report {
          height: 100vh;
          padding-top: 75px;
          width: 85%;
          margin-left: auto;
          margin-right: 0;
        }

        @media (max-width: 768px) {
          .progress-report {
            width: 100%;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}


//   "use client";

// import { useEffect, useState } from "react";

// interface ProcessRow {
//   process: string;
//   issued_wt: number;
//   process_wt: number;
//   received_wt: number;
//   loss_wt: number;
//   scrap_wt: number;
//   dust_wt: number;
// }

// interface Report {
//   name: string;
//   availableWeight: number;
//   purity: string;
// }

// export default function SummaryPage() {
//   const [data, setData] = useState<ProcessRow[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [reports, setReports] = useState<Report[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const API_URL = "https://kalash.app";

  
//   // const API_URL = "http://localhost:4001";
  


//   const fetchData = async () => {
//     const query = `${API_URL}/api/process-report`;
//     setLoading(true);
//     try {
//       const res = await fetch(query);
//       const result = await res.json();

//       if (!result.success) {
//         console.error("Error fetching data:", result.message);
//         return;
//       }

//       setData(result.data);
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const response = await fetch(`${API_URL}/get-inventory`);
//         if (!response.ok) throw new Error("Failed to fetch reports");

//         const data = await response.json();
//         let reportData: Report[] = [];

//         if (Array.isArray(data)) {
//           reportData = data;
//         } else if (Array.isArray(data.data)) {
//           reportData = data.data;
//         } else {
//           throw new Error("Unexpected data format");
//         }

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

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ✅ totals
//   const processTotal = data.reduce(
//     (sum, row) => sum + Number(row.process_wt || 0),
//     0
//   );
//     const processTotalPurity = data.reduce(
//     (sum, row) => sum + Number((row.process_wt*91.7)/100 || 0),
//     0
//   );

//   const inventoryTotalAvl = reports
//     .filter((r) => Number(r.availableWeight) > 0 && r.name.toLowerCase() !== "alloy")
//     .reduce((sum, r) => sum + (Number(r.availableWeight) || 0 ), 0);

//   const inventoryTotalGold = reports
//     .filter((r) => Number(r.availableWeight) > 0 && r.name.toLowerCase() !== "alloy")
//     .reduce((sum, r) => {
//       const purityString = String(r.purity).trim().toLowerCase();
//       let purityValue = purityString.includes("22k")
//         ? 91.7
//         : parseFloat(purityString) || 0;
//       return sum + (purityValue * (Number(r.availableWeight) || 0)) / 100;
//     }, 0);

//   return (
//     <div className="p-4 progress-report flex flex-col gap-6">
//       {/* ✅ Overall Total Table at Top */}
//       <div className="mb-8 w-full">
//         <h1 className="text-xl font-bold mb-4">Overall Total</h1>
//          <table
//             className="border border-collapse w-full bg-white"
//             style={{ width: "75%", backgroundColor: "#fff" }}
//           >
//           <thead className="bg-[#1A7A75] text-white">
//             <tr>
//               <th className="px-4 py-2 text-sm font-semibold text-left">
//                 Process Total Wt (gm)
//               </th> 
//               <th className="px-4 py-2 text-sm font-semibold text-left">
//                 Inventory Avl Wt (gm)
//               </th>
//                <th className="px-4 py-2 text-sm font-semibold text-left">
//                 Purity Gold Wt (gm)
//               </th>           
//               <th className="px-4 py-2 text-sm font-semibold text-left">
//                 Inventory Purity Gold Wt (gm)
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr className="bg-gray-50 font-medium ">
//               <td className="px-4 py-2">{processTotal.toFixed(4)}</td>
//               <td className="px-4 py-2">{inventoryTotalAvl.toFixed(4)}</td>
//               <td className="px-4 py-2">{processTotalPurity.toFixed(4)}</td>
//               <td className="px-4 py-2">{inventoryTotalGold.toFixed(4)}</td>
//             </tr>
//           </tbody>
//             <tfoot className="bg-gray-200 font-bold" style={{backgroundColor: "#EDB652"}}>
//       <tr>
//         <td colSpan={2} className="px-4 py-2 text-left">
//          Total : {(processTotal + inventoryTotalAvl).toFixed(4)}
//         </td>
//         <td colSpan={2} className="px-4 py-2 text-left">
//           Total of Purity : {(processTotalPurity + inventoryTotalGold).toFixed(4)}
//         </td>
//       </tr>
//     </tfoot>
//         </table>
//       </div>

//       {/* ✅ Two Columns Side by Side */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* Left Column */}
//         <div>
//           <h1 className="text-xl font-bold mb-4">Process Summary</h1>
//           <div className="mt-5 overflow-x-auto">
//             {loading ? (
//               <p className="text-lg font-semibold">Loading...</p>
//             ) : (
//               <table
//                 className="border border-collapse"
//                 style={{ width: "100%", backgroundColor: "#fff" }}
//               >
//                 <thead>
//                   <tr
//                     className="bg-gray-100"
//                     style={{
//                       backgroundColor: "#1a7a75",
//                       color: "#fff"
//                     }}
//                   >
//                     <th className="border p-2">Process</th>
//                     <th className="border p-2">
//                       Processing Wt{" "}
//                       <span className="text-xs ps-2 text-white-700">(gm)</span>
//                     </th>
//                        <th className="border p-2">
//                       Purity Gold Wt{" "}
//                       <span className="text-xs ps-2 text-white-700">(gm)</span>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {data.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={7}
//                         className="text-center p-4 text-gray-500"
//                       >
//                         No records found
//                       </td>
//                     </tr>
//                   ) : (
//                     data.map((row, idx) => (
//                       <tr key={idx} className="text-center">
//                         <td
//                           className="border p-2 text-left"
//                           style={{ color: "#444", fontWeight: "500" }}
//                         >
//                           {row.process}
//                         </td>
//                         <td className="border p-2">
//                           {Number(row.process_wt || 0).toFixed(4)}
//                         </td>  
//                         <td className="border p-2">
//                           {Number((row.process_wt*91.7)/100 || 0).toFixed(4)}
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//                 {data.length > 0 && (
//                   <tfoot>
//                     <tr
//                       className="text-center"
//                       style={{
//                         backgroundColor: "#EDB652",
//                         color: "#000",
//                         fontWeight: "500",
//                       }}
//                     >
//                       <td
//                         className="border p-2 text-left"
//                         style={{ color: "#000", fontWeight: "500" }}
//                       >
//                         Total:
//                       </td>
//                       <td className="border p-2">
//                         {data
//                           .reduce(
//                             (sum, row) => sum + Number(row.process_wt || 0),
//                             0
//                           )
//                           .toFixed(4)}
//                       </td>

//                        <td className="border p-2">
//                         {data
//                           .reduce(
//                             (sum, row) => sum + Number((row.process_wt*91.7)/100 || 0),
//                             0
//                           )
//                           .toFixed(4)}
//                       </td>

//                     </tr>
//                   </tfoot>
//                 )}
//               </table>
//             )}
//           </div>
//         </div>

// <div>
//   <h1 className="text-xl font-bold mb-4">Inventory Items</h1>
//   <div className="mt-5 overflow-x-auto">
//     {isLoading && <p className="text-gray-500">Loading...</p>}
//     {error && <p className="text-red-500">Error: {error}</p>}
//     {!isLoading && !error && reports.length === 0 && (
//       <p className="text-gray-500">No reports found.</p>
//     )}

//     {!isLoading && !error && reports.length > 0 && (
//       <div className="overflow-x-auto">
// {/*         {(() => {
//           const filteredReports = reports.filter(
//             (r) => Number(r.availableWeight) > 0
//           ); */}

//                 {(() => {
       
//           const filteredReports = reports.filter(
//   (r) => Number(r.availableWeight) > 0 && r.name.toLowerCase() !== "alloy"
// );

//           const totalAvlWeight = filteredReports.reduce(
//             (sum, r) => sum + (Number(r.availableWeight) || 0),
//             0
//           );

//           const totalPurityWt = filteredReports.reduce((sum, r) => {
//             const purityString = String(r.purity).trim().toLowerCase();
//             let purityValue: number = purityString.includes("22k")
//               ? 91.7
//               : parseFloat(purityString) || 0;
//             const availableWeightValue = Number(r.availableWeight) || 0;
//             return sum + (purityValue * availableWeightValue) / 100;
//           }, 0);

//           return (
//             <table className="border border-collapse w-full bg-white">
//               <thead className="bg-[#1A7A75] text-white">
//                 <tr>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">
//                     Item
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">
//                     Purity
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">
//                     Avl Weight (gm)
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">
//                     Purity Gold Wt (gm)
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filteredReports.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       className="px-4 py-4 text-center text-gray-500"
//                     >
//                       No data found.
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredReports.map((report, index) => {
//                     const purityString = String(report.purity)
//                       .trim()
//                       .toLowerCase();
//                     let purityValue: number = purityString.includes("22k")
//                       ? 91.7
//                       : parseFloat(purityString) || 0;

//                     const availableWeightValue =
//                       Number(report.availableWeight) || 0;

//                     const purityGoldWeight = (
//                       (purityValue * availableWeightValue) /
//                       100
//                     ).toFixed(4);

//                     return (
//                       <tr
//                         key={`${report.name}-${index}`}
//                         className="hover:bg-gray-50"
//                       >
//                         <td className="px-4 py-2 text-sm text-gray-800">
//                           {report.name}
//                         </td>
//                         <td className="px-4 py-2 text-sm text-gray-800">
//                           {report.purity}
//                         </td>
//                         <td className="px-4 py-2 text-sm text-gray-800">
//                           {availableWeightValue.toFixed(4)}
//                         </td>
//                         <td className="px-4 py-2 text-sm text-gray-800">
//                           {purityGoldWeight}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>

//               {/* Show footer only if totals > 0 */}
//               {totalAvlWeight > 0 || totalPurityWt > 0 ? (
//                 <tfoot>
//                   <tr
//                     style={{
//                       backgroundColor: "#EDB652",
//                       color: "#000",
//                       fontWeight: "500",
//                     }}
//                   >
//                     <td colSpan={2} className="px-4 py-2">
//                       Total:
//                     </td>
//                     <td className="px-4 py-2 text-sm">
//                       {totalAvlWeight.toFixed(4)}
//                     </td>
//                     <td className="px-4 py-2 text-sm">
//                       {totalPurityWt.toFixed(4)}
//                     </td>
//                   </tr>
//                 </tfoot>
//               ) : null}
//             </table>
//           );
//         })()}
//       </div>
//     )}
//   </div>
// </div>



//       </div>

//       <style jsx global>{`
//         .progress-report {
//           height: 100vh;
//           padding-top: 75px;
//           width: 85%;
//           margin-left: auto;
//           margin-right: 0;
//         }

//         @media (max-width: 768px) {
//           .progress-report {
//             width: 100%;
//             margin: 0 auto;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }
