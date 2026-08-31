"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button, Input } from "@mui/material";
import { toast } from "react-hot-toast";

const apiUrl = "http://localhost:4001";

const DEPARTMENTS = [
  "Filing",
  "Grinding",
  "Media",
  "Correction",
  "Setting",
  "Polishing",
  "Dull",
  "Plating",
  "Cutting",
];

interface PendingPouch {
  pouchId: number;
  pouchName: string;
  product: string | null;
  quantity: number;
  orderId: string | null;
  issuedWeight: number;
}

interface PendingRecord {
  sourceName: string;
  issuedWeight: number;
  product: string | null;
  quantity: number;
  orderId: string | null;
  status: string | null;
  pouches: PendingPouch[];
}

interface PouchEdit {
  weight: number;
  quantity: number;
}

export default function StockTransfer() {
  const searchParams = useSearchParams();
  const [fromDept, setFromDept] = useState(
    searchParams.get("fromDepartment") || ""
  );
  const [toDept, setToDept] = useState("");
  const [records, setRecords] = useState<PendingRecord[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [edits, setEdits] = useState<Record<string, PouchEdit>>({});
  const [issuedDate, setIssuedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [issuedTime, setIssuedTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  });
  const [status, setStatus] = useState("Pending");
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async (department: string) => {
    if (!department) {
      setRecords([]);
      return;
    }
    setLoadingPending(true);
    setSelected({});
    setEdits({});
    try {
      const res = await fetch(
        `${apiUrl}/transfer/pending?department=${encodeURIComponent(department)}`
      );
      const json = await res.json();
      if (json.success) setRecords(json.data.records ?? []);
      else {
        setRecords([]);
        toast.error(json.message || "Failed to load pending pouches");
      }
    } catch (err) {
      console.error("Fetch pending error", err);
      setRecords([]);
      toast.error("Server error while loading pending pouches");
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchPending(fromDept);
  }, [fromDept]);

  const keyOf = (sourceName: string, pouchId: number) =>
    `${sourceName}::${pouchId}`;

  const toggleRecord = (record: PendingRecord, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [record.sourceName]: checked }));
    if (checked) {
      setEdits((prev) => {
        const next = { ...prev };
        record.pouches.forEach((p) => {
          const k = keyOf(record.sourceName, p.pouchId);
          if (!next[k]) next[k] = { weight: p.issuedWeight, quantity: p.quantity };
        });
        return next;
      });
    }
  };

  const isChecked = (sourceName: string) => Boolean(selected[sourceName]);

  const selectedRecords = records.filter((r) => isChecked(r.sourceName));

  const totals = selectedRecords.reduce(
    (acc, r) => {
      r.pouches.forEach((p) => {
        const e = edits[keyOf(r.sourceName, p.pouchId)];
        acc.weight += Number(e?.weight) || 0;
        acc.quantity += Number(e?.quantity) || 0;
      });
      return acc;
    },
    { weight: 0, quantity: 0 }
  );

  const submitTransfer = async () => {
    if (!fromDept || !toDept) {
      toast.error("Select From and To departments");
      return;
    }
    if (fromDept === toDept) {
      toast.error("From and To departments cannot be the same");
      return;
    }
    if (selectedRecords.length === 0) {
      toast.error("Select at least one pending record");
      return;
    }

    setSubmitting(true);
    try {
      const recordsPayload = selectedRecords.map((r) => {
        const pouches = r.pouches.map((p) => {
          const e = edits[keyOf(r.sourceName, p.pouchId)] || { weight: 0, quantity: 0 };
          return { pouchId: p.pouchId, weight: Number(e.weight) || 0, quantity: Number(e.quantity) || 0 };
        });

        pouches.forEach((p) => {
          if (p.weight <= 0) {
            throw new Error(`Pouch ${p.pouchId} must have a valid transfer weight`);
          }
        });

        return {
          sourceName: r.sourceName,
          product: r.product ?? undefined,
          orderId: r.orderId ?? undefined,
          pouches,
        };
      });

      const combinedDateTime = `${issuedDate}T${issuedTime}:00.000Z`;

      const payload = {
        fromDepartment: fromDept,
        toDepartment: toDept,
        issuedDate: combinedDateTime,
        status,
        records: recordsPayload,
      };

      const res = await fetch(`${apiUrl}/transfer/pouches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Transfer failed");
        return;
      }

      toast.success(`${json.message} (${json.transferNo})`);
      setSelected({});
      setEdits({});
      fetchPending(fromDept);
    } catch (err) {
      console.error("Transfer error", err);
      toast.error(err instanceof Error ? err.message : "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6 mr-[300px] md:mr-[300px]">
      <div className="mb-4 bg-gray-100 p-4 rounded"></div>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Stock Transfer Module</h1>
          <Link
            href="/Departments/StockTransfer/Reports"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 no-underline"
          >
            Stock Reports
          </Link>
        </div>

        <div className="border rounded p-4 space-y-4 bg-gray-50">
          <div className="header-txt">
            <h3>Transfer Pending Pouches between Departments</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>From Department</Label>
              <Select value={fromDept} onValueChange={setFromDept}>
                <SelectTrigger className="bg-white text-black border border-gray-300">
                  <SelectValue placeholder="Select From Department" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 shadow-md">
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d} className="hover:bg-gray-100">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>To Department</Label>
              <Select value={toDept} onValueChange={setToDept}>
                <SelectTrigger className="bg-white text-black border border-gray-300">
                  <SelectValue placeholder="Select To Department" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-gray-300 shadow-md">
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d} className="hover:bg-gray-100">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {fromDept && toDept && fromDept === toDept && (
            <p className="text-sm text-red-600 font-medium">
              From and To departments cannot be the same.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Issued Date</Label>
              <Input
                type="date"
                className="bg-white"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Issued Time</Label>
              <Input
                type="time"
                className="bg-white"
                value={issuedTime}
                onChange={(e) => setIssuedTime(e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Input
                className="bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Pending Records in {fromDept || "..."}</Label>

            {!fromDept && (
              <p className="text-sm text-gray-500 mt-2">
                Select a From department to load pending pouches.
              </p>
            )}

            {loadingPending && (
              <p className="text-sm text-gray-500 mt-2">Loading...</p>
            )}

            {fromDept && !loadingPending && records.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No pending records in {fromDept}.
              </p>
            )}

            {records.map((record) => (
              <div
                key={record.sourceName}
                className={`mt-3 rounded-lg border ${
                  isChecked(record.sourceName)
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-gray-200 bg-white"
                } shadow-sm`}
              >
                <div className="p-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked(record.sourceName)}
                    onChange={(e) => toggleRecord(record, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Record ID</div>
                      <div className="font-medium">{record.sourceName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Issued Weight (g)</div>
                      <div>{Number(record.issuedWeight).toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Product</div>
                      <div>{record.product || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Order ID</div>
                      <div>{record.orderId || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Pouch Count</div>
                      <div>{record.pouches.length}</div>
                    </div>
                  </div>
                </div>

                {isChecked(record.sourceName) && (
                  <div className="px-3 pb-3">
                    <table className="min-w-full border-collapse bg-white rounded">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border">
                            Pouch ID
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border">
                            Product
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border">
                            Issued Weight (g)
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border">
                            Transfer Weight (g)
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.pouches.map((pouch) => {
                          const k = keyOf(record.sourceName, pouch.pouchId);
                          const edit = edits[k] || {
                            weight: pouch.issuedWeight,
                            quantity: pouch.quantity,
                          };
                          return (
                            <tr key={pouch.pouchId} className="border">
                              <td className="px-3 py-2 border text-sm">
                                {pouch.pouchName}
                              </td>
                              <td className="px-3 py-2 border text-sm">
                                {pouch.product || record.product || "-"}
                              </td>
                              <td className="px-3 py-2 border text-sm">
                                {Number(pouch.issuedWeight).toFixed(4)}
                              </td>
                              <td className="px-3 py-2 border">
                                <input
                                  type="number"
                                  step="0.0001"
                                  className="border rounded px-2 py-1 w-32"
                                  value={edit.weight}
                                  onChange={(e) =>
                                    setEdits((prev) => ({
                                      ...prev,
                                      [k]: { ...edit, weight: parseFloat(e.target.value) || 0 },
                                    }))
                                  }
                                />
                              </td>
                              <td className="px-3 py-2 border">
                                <input
                                  type="number"
                                  className="border rounded px-2 py-1 w-24"
                                  value={edit.quantity}
                                  onChange={(e) =>
                                    setEdits((prev) => ({
                                      ...prev,
                                      [k]: { ...edit, quantity: parseInt(e.target.value) || 0 },
                                    }))
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedRecords.length > 0 && (
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
              <div className="text-sm">
                <span className="font-medium">
                  Selected Transfer Total Weight:{" "}
                </span>
                <span>{totals.weight.toFixed(4)}g</span>
                <span className="ml-4 font-medium">
                  Total Quantity:{" "}
                </span>
                <span>{totals.quantity}</span>
              </div>
              <Button
                variant="contained"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={submitTransfer}
                disabled={submitting}
              >
                {submitting ? "Transferring..." : "Submit Transfer"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}