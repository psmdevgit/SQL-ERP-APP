
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { radians } from "pdf-lib";
import { todo } from "node:test";

import { Table, DatePicker, Button, Typography } from "antd";

const { Title } = Typography;

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === "-") return "-";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "-" : format(date, "dd-MM-yyyy");
};

const getStartOfYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
};

const getToday = () => {
  const now = new Date();
  return format(now, "yyyy-MM-dd");
};

interface ProcessRow {
  process: string;
  issued_wt: number;
  process_wt: number;
  received_wt: number;
  loss_wt: number;
  scrap_wt: number;
  dust_wt: number;
  finding_wt: number;
  issueddate: string;
  issued_dates: string;
}

interface ProcessDetailRow {
  Name?: string;
  [key: string]: any; // Allow dynamic fields like casting_loss, loss, scrap_loss
}

const LOSS_FIELD_MAP: Record<string, string> = {
  casting: "Casting_Loss",
  filing: "Filing_Loss",
  grinding:"Grinding_loss__c",
  polishing: "Polishing_loss__c",
  media:"Grinding_loss__c",
  correction:"Grinding_loss__c",
  setting:"Setting__c",
  dull:"Dull_loss__c",  
  plating:"plating_loss__c",
  cutting:"Cutting_loss__c",
};


const FINDING_FIELD_MAP: Record<string, string> = {

  grinding:"Finding_Received__c",
  media:"Finding_Weight__c",
  correction:"Finding_Weight__c",
  assembly:"findingWeight"
};

const SCRAP_FIELD_MAP: Record<string, string> = {
 casting: "Scrap_Weight",
  filing: "Filing_Scrap_Weight",
  grinding: "Grinding_Scrap_Weight__C",
  media: "Grinding_Scrap_Weight__c",
  correction: "Grinding_Scrap_Weight__c",
  setting: "Setting_Scrap_Weight__c",  
  polishing: "Polishing_Scrap_Weight__c",
  dull: "Dull_Scrap_Weight__c",
  plating: "Plating_Scrap_Weight__c",  
  cutting: "Cutting_Scrap_Weight__c",
};

const DUST_FIELD_MAP: Record<string, string> = {
 casting: "Dust_Weight",
  filing: "Filing_Dust_Weight",
  grinding: "Grinding_Dust_Weight__c",
  media: "Grinding_Dust_Weight__c",
  correction: "Grinding_Dust_Weight__c",
  setting: "Setting_Dust_Weight__c",  
  polishing: "Polishing_Dust_Weight__c",
  dull: "Dull_Dust_Weight__c",
  plating: "Plating_Dust_Weight__c",  
  cutting: "Cutting_Dust_Weight__c",
};

const ISSUED_FIELD_MAP: Record<string, string> = {
  casting: "Issued_weight",
  filing: "Issued_Weight",
  grinding: "Issued_Weight__c",
  media:"Issued_Weight__c",
  correction:"Issued_Weight__c",
  setting: "Issued_Weight__c",  
  polishing: "Issued_Weight__c",
  dull: "Issued_Weight__c",
  plating: "Issued_Weight__c",  
  cutting: "Issued_Weight__c",
  assembly:"issued_weight_c"
};

const ID_FIELD_MAP: Record<string, string> = {
   casting: "Name",
  filing: "Name",
  grinding: "Name",
  media:"Name",
  correction:"Name",
  setting: "Name",  
  polishing: "Name",
  dull: "Name",
  plating: "Name",  
  cutting: "Name",
  tagging: "taggingId",
  assembly:"Name",
};

const RECEIVED_FIELD_MAP: Record<string, string> = {
  casting: "Received_Weight",
  filing: "Received_Weight",
  grinding: "Received_Weight__c",
  media:"Received_Weight__c",
  correction:"Received_Weight__c",
  setting: "Returned_weight__c",  
  polishing: "Received_Weight__c",
  dull: "Returned_weight__c",
  plating: "Returned_weight__c",  
  cutting: "Returned_weight__c",
  tagging: "receivedWeight",
};

const ISSUED_DATE_FIELD_MAP: Record<string, string> = {
  casting: "Issued_Date",
  filing: "Issued_Date",
  grinding: "Issued_Date__c",
  media: "Issued_Date__c",
  correction: "Issued_Date__c",
  setting: "Issued_Date__c",  
  polishing: "Issued_Date__c",
  dull: "Issued_Date__c",
  plating: "Issued_Date__c",  
  cutting: "Issued_Date__c",
  tagging: "issuedDate",
  assembly:"issued_date_c",
};

const RECEIVED_DATE_FIELD_MAP: Record<string, string> = {
  casting: "Received_Date",
  filing: "Received_Date",
  grinding: "Received_Date__c",
  media: "Received_Date__c",
  correction: "Received_Date__c",
  setting: "Received_Date__c",  
  polishing: "Received_Date__c",
  dull: "Received_Date__c",
  plating: "Received_Date__c",  
  cutting: "Received_Date__c",
  tagging: "receivedDate",
  assembly:"issued_date_c",
};
const STATUS_FIELD_MAP: Record<string, string> = {
  casting: "status",
  filing: "Status",
  grinding: "Status__c",
  media: "Status__c", 
   correction: "Status__c",
  setting: "status__c",  
  polishing: "status__c",
  dull: "status__c",
  plating: "Status__c",  
  cutting: "Status__c",
  tagging: "status",
  assembly:"status_c"
};
const getLossValue = (row: ProcessDetailRow, process: string) => {
  const lossField = LOSS_FIELD_MAP[process.toLowerCase()];
  return row[lossField] ?? 0;
};
const getIssuedValue = (row: ProcessDetailRow, process: string) => {
  const IssuedField = ISSUED_FIELD_MAP[process.toLowerCase()];
  return row[IssuedField] ?? 0;
};
const getIDValue = (row: ProcessDetailRow, process: string) => {
  const ID = ID_FIELD_MAP[process.toLowerCase()];
  return row[ID] ?? 0;
};
const getReceivedValue = (row: ProcessDetailRow, process: string) => {
  const RecievedField = RECEIVED_FIELD_MAP[process.toLowerCase()];
  return row[RecievedField] ?? 0;
};
const getIssuedDate = (row: ProcessDetailRow, process: string) => {
  const IssuedDateField = ISSUED_DATE_FIELD_MAP[process.toLowerCase()];
  return row[IssuedDateField] ?? 0;
};
const getReceivedDate = (row: ProcessDetailRow, process: string) => {
  const RecievedDateField = RECEIVED_DATE_FIELD_MAP[process.toLowerCase()];
  return row[RecievedDateField] ?? 0;
};
const getStatus = (row: ProcessDetailRow, process: string) => {
  const StatusField = STATUS_FIELD_MAP[process.toLowerCase()];
  return row[StatusField] ?? 0;
};
const getfINDING = (row: ProcessDetailRow, process: string) => {
  const FindingField = FINDING_FIELD_MAP[process.toLowerCase()];
  return row[FindingField] ?? 0;
};
const getScrap = (row: ProcessDetailRow, process: string) => {
  const ScarapField = SCRAP_FIELD_MAP[process.toLowerCase()];
  return row[ScarapField] ?? 0;
};
const getDust = (row: ProcessDetailRow, process: string) => {
  const DustField = DUST_FIELD_MAP[process.toLowerCase()];
  return row[DustField] ?? 0;
};

export default function ProcessOpening() {
  const [summaryData, setSummaryData] = useState<ProcessRow[]>([]);
  const [fromDate, setFromDate] = useState(getToday());
  const [toDate, setToDate] = useState(getToday());
  const [loading, setLoading] = useState(false);

  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ProcessDetailRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const API_URL = "https://kalash.app";

  
  // const API_URL = "http://localhost:4001";


  // Fetch summary
  const fetchSummary = async () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) {
        alert("From Date cannot be greater than To Date");
        setFromDate(getStartOfYear());
        return;
      }
    }

    const query = `${API_URL}/api/process-summary?fromDate=${fromDate}&toDate=${toDate}`;
    setLoading(true);
    try {
      const res = await fetch(query);
      const result = await res.json();
      if (!result.success) {
        console.error("Error fetching summary:", result.message);
        return;
      }
      setSummaryData(result.data);

      console.log(result.data)
    } catch (err) {
      console.error("Summary fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for a process
  const fetchDetails = async (processName: string) => {
    setDetailLoading(true);
    try {

      console.log(processName);

      if(processName.toLowerCase() == 'tagging'){
        processName = 'tag';
      }
        
      const res = await fetch(`${API_URL}/api/${processName}`);
      const result = await res.json();
      if (!result.success) {
        console.error("Error fetching details:", result.message);
        setDetailData([]);
        return;
      }
      setDetailData(result.data);
      console.log(processName ," : ",result.data);
    } catch (err) {
      console.error("Detail fetch error:", err);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle click on process
  const handleProcessClick = (processName: string) => {
    if (selectedProcess === processName) {
      // Toggle off
      setSelectedProcess(null);
      setDetailData([]);
    } else {
      // Show details for new process
      setSelectedProcess(processName);
      fetchDetails(processName);
    }
  };

const toPureDate = (dt: string | null) => {
  if (!dt) return null;
  return new Date(dt.split("T")[0]); // keep only yyyy-mm-dd
}; 

const filteredDetailData = detailData.filter((item) => {
  const issueDate = toPureDate(getIssuedDate(item, selectedProcess || ""));
  
  // If no issued date → include it
  if (!issueDate) return true;

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  // Compare ONLY issued date
  if (from && issueDate < from) return false;
  if (to && issueDate > to) return false;

  return true;
});

function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}


  useEffect(() => {
    fetchSummary();
  }, [fromDate, toDate]);

  return (
    <div className="p-4 progress-report">
      {/* <h1 className="text-xl font-bold mb-4">Process Summary</h1> */}
<Title level={3}>Opening / Closing Department Reports</Title>
      {/* Date Filters */}
      <div
        className="flex justify-center items-center gap-8 mb-4 p-2"
        style={{ backgroundColor: "#eee", width: "50%", margin: "auto", borderRadius:"10px" }}
      >
        <div className="flex items-center gap-2">
          <label className="font-medium">From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">To Date:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      </div>

      {/* Summary Table */}
      <div
        className="mt-5 p-5 overflow-x-auto tablediv"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // backgroundColor: "#eee",
          borderRadius: "20px",
        }}
      >
        {loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <table
            className="w-full border border-collapse"
            style={{ width: "75%", backgroundColor: "#fff" }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#1a7a75",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                <th className="border p-2">Process</th>
                <th className="border p-2">Opening Wt (gm)</th>
                {/* <th className="border p-2">Processing Wt (gm)</th> */}
                <th className="border p-2">Closing Wt (gm)</th>
                {/* <th className="border p-2">Loss Wt (gm)</th> */}
                {/* <th className="border p-2">Scrap Wt (gm)</th> */}
                {/* <th className="border p-2">Dust Wt (gm)</th> */}
                {/* <th className="border p-2">Findings (gm)</th> */}                
                <th className="border p-2">Issued Date</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                summaryData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`text-center ${
                      selectedProcess === row.process ? "bg-gray-300" : ""
                    }`}
                  >
                    <td
                      className="border p-2 cursor-pointer text-blue-630 underline font-bold"
                      onClick={() => handleProcessClick(row.process)}
                    >
                      {row.process}
                    </td>
                    <td className="border p-2">
                      {Number(row.issued_wt || 0).toFixed(2)}
                    </td>
                    {/* <td className="border p-2">
                      {Number(row.process_wt || 0).toFixed(2)}
                    </td> */}
                    <td className="border p-2">
                      {Number(row.received_wt || 0).toFixed(2)}
                    </td>
                    {/* <td className="border p-2">
                      {Number(row.loss_wt || 0).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {Number(row.scrap_wt || 0).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      {Number(row.dust_wt || 0).toFixed(2)}
                    </td>
                     <td className="border p-2">
                      {Number(row.finding_wt || 0).toFixed(2)}
                    </td> */}
                    <td className="border p-2">
                      {`${formatDate(fromDate)} - ${formatDate(toDate)}`}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Table Appears Below Summary Table */}
      {selectedProcess && (
        <div className="mt-2 p-4" style={{    
          backgroundColor: "#eee",
          borderRadius: "20px",}}>

          <h2 className="text-lg font-bold mb-3 text-center">
            Details for: {selectedProcess}
          </h2>
          {detailLoading ? (
            <p className="text-center font-semibold">Loading details...</p>
          ) : 
          filteredDetailData.length === 0 ? (
            <p className="text-center text-gray-500">No details found</p>
          ) : (
            <table
              className="w-full border border-collapse"
              style={{ width: "75%", margin: "auto", backgroundColor: "#fff" }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#EDB652",
                    color: "#000",
                    fontSize: ".8rem",
                  }}
                >
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Issued Wt (gm)</th>
                  <th className="border p-2">Received Wt (gm)</th>
                  {/* <th className="border p-2">scrap Wt (gm)</th>   
                  <th className="border p-2">dust Wt (gm)</th>   
                  <th className="border p-2">Loss Wt (gm)</th>    
                  <th className="border p-2">Finding Wt</th>     */}
                  <th className="border p-2">Issued Date</th>
                  {/* <th className="border p-2">Received Date</th>               */}
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetailData.map((item, idx) => (
                  <tr key={idx} className="text-center" style={{fontSize:".8rem"}}>
                    <td className="border p-2">
                      {/* {item.Name} */}
                      
                        {(getIDValue(item, selectedProcess))}

                    </td>
                    {/* <td className="border p-2">
                      {Number(item.Issued_weight || 0).toFixed(2)}
                    </td> */}
                    <td className="border p-2">
                        {Number(getIssuedValue(item, selectedProcess) || 0).toFixed(2)}
                    </td>
                    {/* <td className="border p-2">
                      {Number(item.Received_Weight || 0).toFixed(2)}
                    </td> */}
                    <td className="border p-2">
                        {Number(getReceivedValue(item, selectedProcess) || 0).toFixed(2)}
                    </td>
                    {/* <td className="border p-2">
                      {Number(item.casting_loss || 0).toFixed(2)}
                    </td> */}
                        {/* <td className="border p-2">
                        {Number(getScrap(item, selectedProcess) || 0).toFixed(2)}
                    </td>
                        <td className="border p-2">
                        {Number(getDust(item, selectedProcess) || 0).toFixed(2)}
                    </td>
                    <td className="border p-2">
                        {Number(getLossValue(item, selectedProcess) || 0).toFixed(2)}
                    </td>

                      <td className="border p-2">
                        {Number(getfINDING(item, selectedProcess) || 0).toFixed(2)}
                    </td> */}

                    {/* <td className="border p-2">{item.Issued_Date || "-"}</td> */}
                    <td className="border p-2">
                        {formatDate(getIssuedDate(item, selectedProcess) || "-")}
                    </td>
                    {/* <td className="border p-2">{item.Received_Date || "-"}</td> */}
                    {/* <td className="border p-2">
                        {formatDate(getReceivedDate(item, selectedProcess) || "-")}
                    </td> */}
                    {/* <td className="border p-2">{item.status || "-"}</td> */}
                    <td className="border p-2">
                        {(getStatus(item, selectedProcess) || "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style jsx global>{`
        .progress-report {
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


