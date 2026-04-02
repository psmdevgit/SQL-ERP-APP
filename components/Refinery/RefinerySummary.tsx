"use client";

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

const RefinerySummary: React.FC = () => {

  const today = new Date();

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [customStartDate, setCustomStartDate] = useState<Date | null>(monthStart);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(monthEnd);

  const [summaryData, setSummaryData] = useState<DepartmentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [castingTotalLossData, setcastingTotalLossData] =
    useState<{ totalLoss: number; currentLoss: number } | null>(null);

  const [cLoss, setCLoss] = useState<number>(0);

const [showRecovery, setShowRecovery] = useState(false);

  const [receivedDust, setReceivedDust] = useState({
    Casting_Loss: "",
    Grinding_dust: "",
    Media_dust: "",
    Correction_dust: "",
    Polishing_dust: "",
    Dull_dust: "",
    Cutting_Dust: "",
  });

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // =============================================
  // FETCH SUMMARY DATA
  // =============================================

  const fetchSummaryData = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${apiBaseUrl}/api/department-dust?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
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

  // =============================================
  // FETCH CASTING LOSS
  // =============================================

  const fetchCastingLoss = async (fromDate: Date, toDate: Date) => {
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/castingLoss?fromDate=${formatDate(fromDate)}&toDate=${formatDate(toDate)}`
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      setcastingTotalLossData({
        totalLoss: data.Loss || 0,
        currentLoss: data.currentLoss || 0,
      });

    } catch (err) {
      console.error(err);
    }
  };

  // =============================================
  // MAIN DATA FETCH
  // =============================================

  useEffect(() => {
    if (!customStartDate || !customEndDate) return;

    fetchSummaryData(customStartDate, customEndDate);
    fetchCastingLoss(customStartDate, customEndDate);

  }, [customStartDate, customEndDate]);

  useEffect(() => {
    if (!castingTotalLossData) return;
    setCLoss(castingTotalLossData.totalLoss);
  }, [castingTotalLossData]);

  // =============================================
  // SUMMARY CARDS
  // =============================================

  const summaryCards = useMemo(() => {

    if (!summaryData?.summary) return [];

    const s = summaryData.summary;

    return [

      {
        iconClass: "fa-light fa-gear",
        title: "Casting Dust",
        value: `${cLoss.toFixed(3)} g`,
        description: "Total casting Dust",
        isIncrease: false,
      },

      {
        iconClass: "fa-light fa-gear",
        title: "Grinding Dust",
        value: `${s.totalGrindingDust.toFixed(3)} g`,
        description: "Total grinding dust",
        isIncrease: false,
      },

      {
        iconClass: "fa-light fa-gear",
        title: "Media Dust",
        value: `${s.totalMediaDust.toFixed(3)} g`,
        description: "Total media dust",
        isIncrease: false,
      },

      {
        iconClass: "fa-light fa-gear",
        title: "Correction Dust",
        value: `${s.totalCorrectionDust.toFixed(3)} g`,
        description: "Total correction dust",
        isIncrease: false,
      },

      {
        iconClass: "fa-light fa-gear",
        title: "Polishing Dust",
        value: `${s.totalPolishingDust.toFixed(3)} g`,
        description: "Total polishing dust",
        isIncrease: false,
      },

      {
        iconClass: "fa-light fa-arrow-trend-down",
        title: "Dull Dust",
        value: `${s.totalDullDust.toFixed(3)} g`,
        description: "Total dull dust",
        isIncrease: false,
      },

      {
        iconClass: "fa-light fa-arrow-trend-down",
        title: "Cutting Dust",
        value: `${s.totalCuttingDust.toFixed(3)} g`,
        description: "Total cutting dust",
        isIncrease: false,
      },

      {
        iconClass: "fa-light fa-scale-balanced",
        title: "Total Dust",
        value: `${s.totalOverallDust.toFixed(3)} g`,
        description: "Overall dust",
        isIncrease: false,
      },

    ];

  }, [summaryData, cLoss]);

  // =============================================
  // RECOVERY FORM
  // =============================================

  const handleReceivedChange = (e: any) => {
    setReceivedDust({
      ...receivedDust,
      [e.target.name]: e.target.value,
    });
  };

  const submitMonthlyRecovery = async () => {

    if (!summaryData) return;

    const s = summaryData.summary;

    const payload = {

      issuedDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,

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
      }

    };

    const res = await fetch(`${apiBaseUrl}/recovery/monthly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to submit recovery");
      return;
    }

    alert("Recovery submitted successfully");
    setShowRecovery(false);

  };

  // =============================================
  // UI
  // =============================================

  return (

    <>

      {/* DATE FILTER */}

      <div className="flex items-center gap-4 mb-6">

        <div>
          <label className="text-sm text-gray-600 me-3" style={{fontWeight:'bold'}}>From Date</label>
          <DatePicker
            selected={customStartDate}
            onChange={(date) => setCustomStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="px-2 py-1 border rounded text-sm"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 me-3" style={{fontWeight:'bold'}}>To Date</label>
          <DatePicker
            selected={customEndDate}
            onChange={(date) => setCustomEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="px-2 py-1 border rounded text-sm"
          />
        </div>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Loading...
          </div>
        ) : summaryCards.map((card, i) => (
          <SummarySingleCard key={i} {...card} />
        ))}

      </div>

      {/* RECOVERY BUTTON */}

        <div className="mt-6">
          <button
            onClick={() => setShowRecovery((prev) => !prev)}
            className="bg-primary text-white px-5 py-2 rounded"
          >
            {showRecovery ? "Hide Recover Dust" : "Recover Dust"}
          </button>
      </div>

      {showRecovery && summaryData && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative shadow-lg">

      <button
        onClick={() => setShowRecovery(false)}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
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
            ["Casting Dust", "Casting_Loss", cLoss],
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
