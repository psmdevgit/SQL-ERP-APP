import { SidebarCategory } from "@/interface";

const sidebarData: SidebarCategory[] = [
  {
    id: 1,
    category: "Main",
    items: [
      {
        id: 1,
        label: "Dashboards",
        icon: "fa-solid fa-gauge",
        subItems: [
          { label: "Current Stock", link: "/Reports/Process" },
        ],
      },
      {
        id: 2,
        label: "Reports",
        icon: "fa-solid fa-file",
        subItems: [
          { label: "Current Process", link: "/DashBoard/Overallprocess" },
          { label: "Inventory Items", link: "/Reports/InventoryItems" },
          { label: "Opening / Closing", link: "/Reports/DailyInventory" },
          { label: "Inventory Inward", link: "/Reports/InwardInventory" },
          { label: "Inventory Transactions", link: "/Reports/InventoryIssued" },
          { label: "Party Ledger", link: "/Reports/VendorRep/PartyLedger" },
          { label: "Order Transaction", link: "/Reports/OrderTransaction" },
        ],
      },
      {
        id: 3,
        label: "Master",
        icon: "fa-solid fa-gear",
        subItems: [
          { label: "Inventory", link: "/Inventory" },
          { label: "Models", link: "/Models/add-models" },
          { label: "Category", link: "/Category" },
          { label: "Vendor", link: "/Reports/VendorRep/VendorList" },
          { label: "Stone", link: "/StoneMaster" },
        ],
      },
      {
        id: 4,
        label: "Design Bank",
        icon: "fa-regular fa-gem",
        subItems: [
          { label: "Designs", link: "/DesignBank/Design" }
        ]
      },
      {
        id: 5,
        label: "Orders",
        icon: "icon-crm",
        subItems: [
          { label: "Orders", link: "/Orders", key: "orders" },
        ],
      },
      {
        id: 6,
        label: "Making Progress",
        icon: "fa-solid fa-arrow-progress",
        subItems: [
          { label: "Waxing", link: "/Departments/Waxing/waxing_table", key: "waxing" },
          { label: "Casting Inventory", link: "/Departments/Casting/casting_table", key: "casting" },
          { label: "Assembly", link: "/Departments/Assembly", key: "assembly" },
          { label: "Filing", link: "/Departments/Filing/add_filing_details/Grinding_Table", key: "filing" },
          { label: "Grinding", link: "/Departments/Grinding/Grinding_Table", key: "grinding" },
          { label: "Media", link: "/Departments/Media/media_Table", key: "media" },
          { label: "Correction", link: "/Departments/Correction/correction_Table", key: "correction" },
          { label: "Setting", link: "/Departments/Setting/Setting_Table", key: "setting" },
          { label: "Polishing", link: "/Departments/Polishing/Polishing_Table", key: "polishing" },
          { label: "Dull", link: "/Departments/Dull/Dull_Table", key: "dull" },
          { label: "Plating", link: "/Departments/Plating/Plating_Table", key: "plating" },
          { label: "Cutting", link: "/Departments/Cutting/Cutting_Table", key: "cutting" },
          { label: "Tagging", link: "/Departments/Tagging/Tagging_Table", key: "cutting" },
   
          { label: "Refinery", link: "/Refinery", key: "refinery" },
        ],
      },
      {
        id: 7,
        label: "Billing",
        icon: "fa-sharp fa-light fa-wallet",
        subItems: [
          { label: "Tagging", link: "/Billing/Tagging" },
          { label: "Billing", link: "/Billing/Billing" },
        ],
      },
    ],
  },
];

// ✅ FINAL FILTER LOGIC
// FINAL FILTER LOGIC (supports multiple departments)
export const getSidebarData = (): SidebarCategory[] => {
  const departmentString = localStorage.getItem("department")?.toLowerCase();

  if (!departmentString) return sidebarData;

  // Convert "orders/waxing" → ["orders", "waxing"]
  const userDepartments = departmentString.split("/").map(d => d.trim());

  return sidebarData
    .map(category => {
      const filteredItems = category.items
        .map(item => {
          // Skip items without subItems → they should be hidden
          if (!item.subItems || item.subItems.length === 0) return null;

          // Filter subitems based on user departments
          const matchedSubItems = item.subItems.filter(
            sub => sub.key && userDepartments.includes(sub.key.toLowerCase())
          );

          // If NO match → hide this menu item
          if (matchedSubItems.length === 0) return null;

          // Return filtered menu item
          return { ...item, subItems: matchedSubItems };
        })
        .filter(Boolean); // remove null items

      // If this category has NO remaining items → remove the category
      return filteredItems.length > 0 ? { ...category, items: filteredItems } : null;
    })
    .filter(Boolean); // Remove empty categories
};


export default sidebarData;
