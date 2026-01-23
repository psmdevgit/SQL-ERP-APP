
import React, { useState, useEffect, useMemo } from "react";
import SummarySingleCard from "@/components/common/SummarySingleCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

const apiBaseUrl = "https://kalash.app";

// const apiBaseUrl = "http://localhost:4001";


const SapiBaseUrl = "https://kalash.app";

const RefinerySummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<DepartmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  
  

  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
const [receivedDust, setReceivedDust] = useState({
  Casting_Loss: "",
  Grinding_dust: "",
  Media_dust: "",
  Correction_dust: "",
  Polishing_dust: "",
  Dull_dust: "",
  Cutting_Dust: "",
});


      const [lossData, setLossData] = useState([]);


useEffect(() => {
  if (!customStartDate || !customEndDate) return;
  fetchFilterLossWeight(customStartDate, customEndDate);
}, [customStartDate, customEndDate]);



const fetchFilterLossWeight = async (fromDate: Date, toDate: Date) => {
  try {
    setTotalWeightLoading(true);

    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);

    const res = await fetch(
      `${apiBaseUrl}/api/castingLossFilter?fromDate=${formattedFromDate}&toDate=${formattedToDate}`
    );

    if (!res.ok) throw new Error("Failed to fetch total loss");

    const data = await res.json();
    console.log("loss :", data);

    // ✅ correct mapping
    settotalLossData({ totalLoss: data.Loss });

  } catch (err) {
    console.error(err);
    settotalLossData(null);
  } finally {
    setTotalWeightLoading(false);
  }
};

const [totalLossData, settotalLossData] =
  useState<{ totalLoss: number } | null>(null);

const [totalWeightLoading, setTotalWeightLoading] = useState(false);




       const fetchCastingLossReport = async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/api/CastingLossReport`);
      
          if (!res.ok) {
            throw new Error("Failed to fetch casting loss report");
          }
      
          const data = await res.json();
          setLossData(data);
          console.log("losses summarey :", data);
      
        } catch (error) {
          console.error("Error loading casting loss report", error);
        }
      };
      
      useEffect(() => {
        fetchCastingLossReport();
      }, []);


  // ✅ SAFE date formatter (NO timezone conversion)
  // const formatDate = (date: Date) => {
  //   const yyyy = date.getFullYear();
  //   const mm = String(date.getMonth() + 1).padStart(2, "0");
  //   const dd = String(date.getDate()).padStart(2, "0");
  //   return `${yyyy}-${mm}-${dd}`;
  // };
  const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};


  const fetchSummaryData = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      console.log("Sending dates to backend:", start, end);

      const response = await fetch(
        `${apiBaseUrl}/api/department-dust?startDate=${start}&endDate=${end}`
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error(error);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    let startDate = new Date(now);
    let endDate = new Date(now);

    switch (dateRange) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "week":
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;

      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return;
        }
        break;
    }

    fetchSummaryData(startDate, endDate);
  }, [dateRange, customStartDate, customEndDate]);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    setShowCustomDatePicker(range === "custom");
  };

  



    const totalLoss = Number(lossData.totalLoss || 0 );

  //     const castingLossValue = totalLossData
  // ? totalLossData.totalLoss
  // : totalLoss;

  //   const castingLossValue =
  // dateRange === "custom" && totalLossData
  //   ? totalLossData.totalLoss
  //   : totalLoss;
  const [castingLossValue, setCastingLossValue] = useState<number>(0);

  useEffect(() => {
  if (dateRange === "custom" && totalLossData) {
    setCastingLossValue(totalLossData.totalLoss);
  } else {
    setCastingLossValue(totalLoss);
  }
}, [dateRange, totalLossData, totalLoss]);

useEffect(() => {
  if (dateRange !== "custom") {
    settotalLossData(null);
  }
}, [dateRange]);
  
  
  const summaryCards = useMemo(() => {
    if (!summaryData?.summary) return [];

    const s = summaryData.summary;

    return [
      {
        iconClass: "fa-light fa-gear",
        title: "Casting Loss",
        // value: `${s.totalCastingLoss.toFixed(3)} g`,
        // value: `${totalLoss.toFixed(3)} g`,
         value: `${castingLossValue.toFixed(3)} g`,
        description: "Total casting loss",
        isIncrease: false,
      },
      {
        iconClass: "fa-light fa-gear",
        title: "Grinding Dust",
        value: `${s.totalGrindingDust.toFixed(3)} g`,
        description: "Total grinding department dust",
        isIncrease: false,
      },

      
      {
        iconClass: "fa-light fa-gear",
        title: "Media Dust",
        value: `${s.totalMediaDust.toFixed(3)} g`,
        description: "Total media department dust",
        isIncrease: false,
      },



      {
        iconClass: "fa-light fa-gear",
        title: "Correction Dust",
        value: `${s.totalCorrectionDust.toFixed(3)} g`,
        description: "Total correction department dust",
        isIncrease: false,
      },
      // {
      //   iconClass: "fa-light fa-gem",
      //   title: "Setting Dust",
      //   value: `${s.totalSettingDust.toFixed(3)} g`,
      //   description: "Total setting department dust",
      //   isIncrease: false,
      // },
      {
        iconClass: "fa-light fa-sparkles",
        title: "Polishing Dust",
        value: `${s.totalPolishingDust.toFixed(3)} g`,
        description: "Total polishing department dust",
        isIncrease: false,
      },
      {
        iconClass: "fa-light fa-arrow-trend-down",
        title: "Dull Dust",
        value: `${s.totalDullDust.toFixed(3)} g`,
        description: "Total dull department dust",
        isIncrease: false,
      },
      {
        iconClass: "fa-light fa-arrow-trend-down",
        title: "Cutting Dust",
        value: `${s.totalCuttingDust.toFixed(3)} g`,
        description: "Total cutting department dust",
        isIncrease: false,
      },
      {
        iconClass: "fa-light fa-scale-balanced",
        title: "Total Dust",
        value: `${s.totalOverallDust.toFixed(3)} g`,
        description: "Overall total dust",
        isIncrease: false,
      },
    ];
  }, [summaryData]);



 // Update DatePicker to show Indian time
  const DatePickerComponent = ({ selected, onChange, ...props }) => {
    // Convert to Indian time for display
    const selectedIndianDate = selected 
      ? new Date(selected.getTime() + (5.5 * 60 * 60 * 1000))
      : null;

    const handleChange = (date: Date) => {
      // Convert back to UTC for storage
      const utcDate = date 
        ? new Date(date.getTime() - (5.5 * 60 * 60 * 1000))
        : null;
      onChange(utcDate);
    };

    return (
      <DatePicker
        selected={selectedIndianDate}
        onChange={handleChange}
        {...props}
      />
    );
  };


  const [showRecovery, setShowRecovery] = useState(false);

  const toggleRecovery = () => setShowRecovery(prev => !prev);

  const submitMonthlyRecovery = async () => {
 
  if (!summaryData) {
    alert("No summary data available");
    return;
  }

  const s = summaryData.summary;
const now = new Date();
const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const payload = {
   issuedDate: `${prevMonth.getFullYear()}-${String(
  prevMonth.getMonth() + 1
).padStart(2, "0")}`,

    system: {
      Casting_Loss: s.totalCastingLoss,
      Grinding_dust: s.totalGrindingDust,
      Media_dust: s.totalMediaDust,
      Correction_dust: s.totalCorrectionDust,
      Polishing_dust: s.totalPolishingDust,
      Dull_dust: s.totalDullDust,
      Cutting_Dust: s.totalCuttingDust,
    },

    received: {
      Casting_Loss: Number(receivedDust.Casting_Loss || 0),
      Grinding_dust: Number(receivedDust.Grinding_dust || 0),
      Media_dust: Number(receivedDust.Media_dust || 0),
      Correction_dust: Number(receivedDust.Correction_dust || 0),
      Polishing_dust: Number(receivedDust.Polishing_dust || 0),
      Dull_dust: Number(receivedDust.Dull_dust || 0),
      Cutting_Dust: Number(receivedDust.Cutting_Dust || 0),
    },
  };

  const res = await fetch(`${SapiBaseUrl}/recovery/monthly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    alert("Failed to submit recovery");
    return;
  }

  alert("Monthly recovery submitted successfully");
setShowRecovery(false);
window.location.reload();
  // Clear the form
};

const handleReceivedChange = (e: any) => {
  setReceivedDust({
    ...receivedDust,
    [e.target.name]: e.target.value,
  });
};


  return (
      <>

    <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="text-sm font-medium">Filter by:</div>
        <div className="flex flex-wrap gap-2">
          {["day", "week", "month", "custom"].map((range) => (
            <button
              key={range}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                dateRange === range
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-slate-600"
              }`}
              onClick={() => handleDateRangeChange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        
        {showCustomDatePicker && (
          <div className="flex items-center gap-2">
            {/* <DatePickerComponent
              selected={customStartDate}
              onChange={setCustomStartDate}
              selectsStart
              startDate={customStartDate}
              endDate={customEndDate}
              placeholderText="Start Date"
              className="px-2 py-1 text-sm border rounded"
              dateFormat="yyyy-MM-dd"
            />
            <span>to</span>
            <DatePickerComponent
              selected={customEndDate}
              onChange={setCustomEndDate}
              selectsEnd
              startDate={customStartDate}
              endDate={customEndDate}
              minDate={customStartDate}
              placeholderText="End Date"
              className="px-2 py-1 text-sm border rounded"
              dateFormat="yyyy-MM-dd"
            /> */}

            <DatePicker
  selected={customStartDate}
  onChange={(date) => setCustomStartDate(date)}
  selectsStart
  startDate={customStartDate}
  endDate={customEndDate}
  placeholderText="Start Date"
  className="px-2 py-1 text-sm border rounded"
  dateFormat="yyyy-MM-dd"
/>

<span>to</span>

<DatePicker
  selected={customEndDate}
  onChange={(date) => setCustomEndDate(date)}
  selectsEnd
  startDate={customStartDate}
  endDate={customEndDate}
  minDate={customStartDate}
  placeholderText="End Date"
  className="px-2 py-1 text-sm border rounded"
  dateFormat="yyyy-MM-dd"
/>

          </div>
        )}
      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Loading summary data...
          </div>
        ) : summaryData ? (
          summaryCards.map((card, i) => <SummarySingleCard key={i} {...card} />)
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No data available 
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div className="mt-6">
        <button
          onClick={toggleRecovery}
          className="bg-primary text-white px-5 py-2 rounded"
          aria-pressed={showRecovery}
        >
          {showRecovery ? "Hide Recover Dust" : "Recover Dust"}
        </button>
      </div>

{/* {totalLossData && (
  <div className="mt-4 bg-white border rounded p-4 text-sm">
    <b>Total Casting Loss Till {formatDate(customEndDate!)}:</b>{" "}
    {totalWeightLoading
      ? "Loading..."
      : `${totalLossData.totalLoss.toFixed(3)} g`}
  </div>
)} */}


      {/* Modal / Popup */}
      {showRecovery  && summaryData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative shadow-lg">
            <button
              onClick={() => setShowRecovery(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
              aria-label="Close popup"
            >
              &times;
            </button>

            <h3 className="text-md font-semibold mb-4">
              Monthly Received Dust Entry
            </h3>

            <table className="w-full border text-sm bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Department</th>
                  <th className="border p-2">Issued (g)</th>
                  <th className="border p-2">Received (g)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  // ["Casting Loss", "Casting_Loss", summaryData.summary.totalCastingLoss],
                  ["Casting Loss", "Casting_Loss", castingLossValue],
                  ["Grinding Dust", "Grinding_dust", summaryData.summary.totalGrindingDust],
                  ["Media Dust", "Media_dust", summaryData.summary.totalMediaDust],
                  ["Correction Dust", "Correction_dust", summaryData.summary.totalCorrectionDust],
                  ["Polishing Dust", "Polishing_dust", summaryData.summary.totalPolishingDust],
                  ["Dull Dust", "Dull_dust", summaryData.summary.totalDullDust],
                  ["Cutting Dust", "Cutting_Dust", summaryData.summary.totalCuttingDust],
                ].map(([label, key, issued]: any) => (
                  <tr key={key}>
                    <td className="border p-2">{label}</td>
                    <td className="border p-2 font-medium">
                      {issued.toFixed(3)}
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        step="0.001"
                        name={key}
                        value={(receivedDust as any)[key]}
                        onChange={handleReceivedChange}
                        className="w-full border px-2 py-1 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>




            <div className="text-right mt-4">
              <button
                onClick={submitMonthlyRecovery}
                className="bg-primary text-white px-5 py-2 rounded"
              >
                Submit Monthly Recovery
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RefinerySummary;
