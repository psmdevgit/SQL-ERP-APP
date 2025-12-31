import { useEffect, useState } from "react";
import axios from "axios";

interface MonthlyReportRow {
  reportMonth: string;
  castingIssued: number;
  castingReceived: number;
  castingLoss: number;
  grindingIssued: number;
  grindingReceived: number;
  grindingLoss: number;
  mediaIssued: number;
  mediaReceived: number;
  mediaLoss: number;
  polishingIssued: number;
  polishingReceived: number;
  polishingLoss: number;
  totalLoss: number;
}

const RecoveryMonthlyReportTable = () => {
  const [data, setData] = useState<MonthlyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMonthlyReport();
  }, []);

  const apiBaseUrl = "https://kalash.app";

const fetchMonthlyReport = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await fetch(`${apiBaseUrl}/monthly-report`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();
    console.log("Monthly report data:", result);

    setData(Array.isArray(result.data) ? result.data : []);
  } catch (err) {
    console.error("Monthly report fetch failed:", err);
    setError("Failed to load monthly report");
    setData([]);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="mt-6 text-center text-gray-500">
        Loading monthly report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="mt-6 text-center text-gray-500">
        No monthly data available
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border text-sm bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Month</th>

            <th className="border p-2">Casting Issued</th>
            <th className="border p-2">Casting Received</th>
            <th className="border p-2">Casting Loss</th>

            <th className="border p-2">Grinding Issued</th>
            <th className="border p-2">Grinding Received</th>
            <th className="border p-2">Grinding Loss</th>

            <th className="border p-2">Media Issued</th>
            <th className="border p-2">Media Received</th>
            <th className="border p-2">Media Loss</th>

            <th className="border p-2">Polishing Issued</th>
            <th className="border p-2">Polishing Received</th>
            <th className="border p-2">Polishing Loss</th>

            <th className="border p-2 text-red-600">Total Loss</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="border p-2">{row.reportMonth}</td>

              <td className="border p-2">{row.castingIssued.toFixed(3)}</td>
              <td className="border p-2">{row.castingReceived.toFixed(3)}</td>
              <td className="border p-2 text-red-600">
                {row.castingLoss.toFixed(3)}
              </td>

              <td className="border p-2">{row.grindingIssued.toFixed(3)}</td>
              <td className="border p-2">{row.grindingReceived.toFixed(3)}</td>
              <td className="border p-2 text-red-600">
                {row.grindingLoss.toFixed(3)}
              </td>

              <td className="border p-2">{row.mediaIssued.toFixed(3)}</td>
              <td className="border p-2">{row.mediaReceived.toFixed(3)}</td>
              <td className="border p-2 text-red-600">
                {row.mediaLoss.toFixed(3)}
              </td>

              <td className="border p-2">{row.polishingIssued.toFixed(3)}</td>
              <td className="border p-2">{row.polishingReceived.toFixed(3)}</td>
              <td className="border p-2 text-red-600">
                {row.polishingLoss.toFixed(3)}
              </td>

              <td className="border p-2 font-semibold text-red-700">
                {row.totalLoss.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecoveryMonthlyReportTable;

