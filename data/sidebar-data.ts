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
     { label: "Orders", link: "/Orders", key: "orders" },
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
export const getSidebarData = (): SidebarCategory[] => {
  const username = localStorage.getItem("username")?.toLowerCase();

  if (!username) return sidebarData;

  return sidebarData.map(category => {
    const filteredItems = category.items.map(item => {

      if (!item.subItems) return item;

      const matchedSubItems = item.subItems.filter(
        sub => sub.key?.toLowerCase() === username
      );

      return matchedSubItems.length > 0
        ? { ...item, subItems: matchedSubItems }
        : null;
    }).filter(Boolean);

    return { ...category, items: filteredItems };
  }).filter(category => category.items.length > 0);
};

export default sidebarData;
