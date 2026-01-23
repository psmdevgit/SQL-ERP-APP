import { useState, useEffect } from 'react';
export type RowObject = { [key: string]: string | number | boolean };
type Order = "asc" | "desc";

export default function useMaterialTableHook<T>(initialRows: T[] = [], initialRowsPerPage: number = 10) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [filteredRows, setFilteredRows] = useState<T[]>(initialRows);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof T | ''>('created_date');
  const [selected, setSelected] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);


  // const apiurl = "http://localhost:4001";
  
  const apiurl = "https://kalash.app";

  // Update filtered rows when rows or search query changes
  useEffect(() => {
    // Ensure rows is an array before spreading
    let result = Array.isArray(rows) ? [...rows] : [];

    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter((row) => {
        return Object.values(row as any).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredRows(result);
    
    // Reset to page 1 if current page would be empty with new filtered data
    const maxPage = Math.ceil(result.length / rowsPerPage);
    if (page > maxPage && maxPage > 0) {
      setPage(1);
    }
  }, [rows, searchQuery, rowsPerPage]);

  // Calculate pagination with safety checks
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const startIndex = Math.min((page - 1) * rowsPerPage, Math.max(0, filteredRows.length - 1));
  const endIndex = Math.min(startIndex + rowsPerPage, filteredRows.length);
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (checked: boolean, rows: T[]) => {
    if (checked) {
      const newSelected = rows.map((_, index) => startIndex + index);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (index: number) => {
    const selectedIndex = selected.indexOf(index);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, index);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (newPage: number) => {
    // Ensure page is within valid range
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(validPage);
  };

  const handleChangeRowsPerPage = (value: string) => {
    setRowsPerPage(parseInt(value, 10));
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when search changes
  };

const handleDelete = async (id: number | string) => {
  console.log(`Deleting item with ID: ${id}`);

  try {
    const response = await fetch(`${apiurl}/order-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log(data.message);
      alert("Order Deletion Failed");
      return;
    }

    alert("Deleted successfully!");
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};



const handleTagDelete = async (id: number | string) => {
  // ✅ Confirmation prompt
  const isConfirmed = window.confirm(
    "Are you sure you want to delete this tag?\n"
  );

  if (!isConfirmed) {
    return; // ❌ Stop if user cancels
  }

  console.log(`Deleting item with ID: ${id}`);

  try {
    const response = await fetch(`${apiurl}/tag-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log(data.message);
      alert("Tag Deletion Failed");
      return;
    }

    alert("Tags Deleted successfully!");
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};



  return {
    order,
    orderBy,
    selected,
    searchQuery,
    filteredRows,
    paginatedRows,
    page,
    rowsPerPage,
    totalPages,
    startIndex,
    endIndex,
    handleDelete,
    handleTagDelete,
    handleRequestSort,
    handleSelectAllClick,
    handleClick,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    setRows, // Expose this to allow updating rows from outside
  };
}