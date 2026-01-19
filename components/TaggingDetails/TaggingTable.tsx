/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Pagination,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";

import { ITag } from "@/interface/table.interface";
import { fetchTaggingData } from "@/data/crm/tag-data";
import TableControls from "@/components/elements/SharedInputs/TableControls";
import useMaterialTableHook from "@/hooks/useMaterialTableHook";
import { useTableStatusHook } from "@/hooks/use-condition-class";

const TaggingTable = () => {
  const [tags, setTags] = useState<ITag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  const apiurl = "https://kalash.app";

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") setStartDate(value);
    else setEndDate(value);
  };

  const handleResetDates = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
  };

  const handleStatusChange = (value: string) => setStatusFilter(value);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const data = await fetchTaggingData();
        setTags(data);
      } catch (err) {
        console.error("Error loading tagging data:", err);
        setError("Failed to load tagging data");
      } finally {
        setLoading(false);
      }
    };
    loadTags();
  }, []);


//   const handleDispatch = async (taggingId: string) => {
//   const confirmed = window.confirm(
//     `Are you sure you want to dispatch Tag ID: ${taggingId}?`
//   );

//   if (!confirmed) return;

//   try {

//      const res = await fetch("/api/tagging/dispatch", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ taggingId }),
//   });

//   if (!res.ok) {
//     throw new Error("Failed to dispatch tag");
//   }


//     alert("Dispatched successfully");
//   } catch (error) {
//     console.error(error);
//     alert("Dispatch failed");
//   }
// };

 


  // ✅ Filter data
 
 
  const handleDispatch = async (taggingId: string) => {
  const confirmed = window.confirm(
    `Are you sure you want to dispatch Tag ID: ${taggingId}?`
  );

  if (!confirmed) return;

  try {
    const res = await fetch(`${apiurl}/api/tagging/dispatch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taggingId }),
    });

    if (!res.ok) {
      throw new Error("Failed to dispatch tag");
    }

    // ✅ Update UI state
    setTags(prev =>
      prev.map(tag =>
        tag.taggingId === taggingId
          ? { ...tag, flag: 2 }
          : tag
      )
    );

    alert("Dispatched successfully");
  } catch (error) {
    console.error(error);
    alert("Dispatch failed");
  }
};


  const filteredTags = useMemo(() => {
    let filtered = [...tags];

    if (startDate || endDate) {
      filtered = filtered.filter((tag) => {
        const date = new Date(tag.receivedDate);
        if (isNaN(date.getTime())) return true;
        const formatted = date.toISOString().split("T")[0];
        if (startDate && formatted < startDate) return false;
        if (endDate && formatted > endDate) return false;
        return true;
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (tag) => tag.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort by receivedDate (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.receivedDate).getTime() || 0;
      const dateB = new Date(b.receivedDate).getTime() || 0;
      return dateB - dateA;
    });

    return filtered;
  }, [tags, startDate, endDate, statusFilter]);

  const {
    selected,
    searchQuery,
    filteredRows,
    handleSelectAllClick,
    handleClick,
    handleSearchChange,
  } = useMaterialTableHook<ITag>(filteredTags, 10);

  const pageStart = page * rowsPerPage;
  const pageEnd = pageStart + rowsPerPage;
  const rowsToDisplay =
    filteredRows && filteredRows.length > 0 ? filteredRows : filteredTags;
  const paginatedRows = rowsToDisplay.slice(pageStart, pageEnd);

    // ✅ Move this ABOVE the "if (loading)" and "if (error)" returns
  const totalReceivedWeight = useMemo(() => {
    return filteredTags.reduce(
      (sum, tag) => sum + Number(tag.receivedWeight || 0),
      0
    );
  }, [filteredTags]);

  if (loading) return <div>Loading tagging data...</div>;
  if (error) return <div>Error: {error}</div>;



  return (
    <>
      <div className="col-span-12">
        <div className="card__wrapper">

          <div className="flex justify-between items-center mb-3 px-3">
    <div className="text-sm font-semibold text-gray-700" style={{fontSize:"1.1rem"}}>
      Total Received Weight:{" "}
      <span className="text-primar font-bold">{totalReceivedWeight.toFixed(2)} g</span>
    </div>
  </div>
  
          <div className="manaz-common-mat-list w-full table__wrapper table-responsive">
            <TableControls
              rowsPerPage={rowsPerPage}
              searchQuery={searchQuery}
              handleChangeRowsPerPage={handleRowsPerPageChange}
              handleSearchChange={handleSearchChange}
              startDate={startDate}
              endDate={endDate}
              handleDateChange={handleDateChange}
              handleResetDates={handleResetDates}
              statusFilter={statusFilter}
              handleStatusChange={handleStatusChange}
              statusOptions={[
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "finished", label: "Finished" },
              ]}
            />

            <Box sx={{ width: "100%" }}>
              <Paper sx={{ width: "100%", mb: 2 }}>
                <TableContainer>
                  <Table className="whitespace-nowrap">
                    <TableHead>
                      <TableRow className="table__title">
                        {/* <TableCell padding="checkbox">
                          <Checkbox
                            className="custom-checkbox checkbox-small"
                            color="primary"
                            indeterminate={
                              selected.length > 0 &&
                              selected.length < filteredRows.length
                            }
                            checked={
                              filteredRows.length > 0 &&
                              selected.length === filteredRows.length
                            }
                            onChange={(e) =>
                              handleSelectAllClick(e.target.checked, filteredRows)
                            }
                            size="small"
                          />
                        </TableCell> */}
                        <TableCell>Tagging ID</TableCell>
                        <TableCell>Received Weight</TableCell>
                        <TableCell>Received Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Transfer</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRows.length > 0 ? (
                        paginatedRows.map((tag, index) => {
                          const statusClass = useTableStatusHook(tag.status);
                          return (
                            <TableRow
                              key={tag.id}
                              selected={selected.includes(index)}
                              onClick={() => handleClick(index)}
                            >
                              {/* <TableCell padding="checkbox">
                                <Checkbox
                                  className="custom-checkbox checkbox-small"
                                  checked={selected.includes(index)}
                                  onChange={() => handleClick(index)}
                                  size="small"
                                />
                              </TableCell> */}
                              <TableCell>{tag.taggingId}</TableCell>
                              <TableCell>{tag.receivedWeight}</TableCell>
                              <TableCell>{tag.receivedDate}</TableCell>
                              <TableCell>{tag.status}</TableCell>
                              <TableCell>{tag.orderId}</TableCell>
                              <TableCell>{tag.product}</TableCell>
                              <TableCell>{tag.quantity}</TableCell>
                              <TableCell>
                                <button
                                  className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                                  onClick={() => { window.location.href = `/Billing/Tagging/new-tagging?orderId=${tag.orderId}`;}}
                                >
                                  Tagging
                                  <ArrowRightIcon className="w-4 h-4 text-white" />
                                </button>
                              </TableCell>

                              {/* <TableCell>
  {tag.status?.toLowerCase() == "finished" && (
    <button
      className="px-3 py-1 text-xs font-semibold text-white bg-yellow-600 rounded hover:bg-green-700"
      onClick={(e) => {       
        handleDispatch(tag.taggingId);
      }}
    >
      Dispatch
    </button>
  )}
    {tag.flag == 2 && (
    <button
      className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded"     
    >      
      Dispatched
    </button>
  )}
</TableCell> */}


<TableCell>
  {tag.flag === 1 && (
    <button
      className="px-3 py-1 text-xs font-semibold text-white bg-yellow-600 rounded hover:bg-yellow-700"
      onClick={(e) => {
        e.stopPropagation();
        handleDispatch(tag.taggingId);
      }}
    >
      Dispatch
    </button>
  )}

  {tag.flag === 2 && (
    <button
      className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded cursor-not-allowed"
      disabled
    >
      Dispatched
    </button>
  )}
</TableCell>


                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No tagging data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>

            <Box className="table-search-box mt-[30px]" sx={{ p: 2 }}>
              <Box>
                {`Showing ${pageStart + 1} to ${Math.min(
                  pageEnd,
                  rowsToDisplay.length
                )} of ${rowsToDisplay.length} entries`}
              </Box>
              <Pagination
                count={Math.ceil(rowsToDisplay.length / rowsPerPage)}
                page={page + 1}
                onChange={(e, value) => handlePageChange(value - 1)}
                variant="outlined"
                shape="rounded"
                className="manaz-pagination-button"
              />
            </Box>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaggingTable;
