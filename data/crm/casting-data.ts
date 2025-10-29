import { ICasting } from "@/interface/table.interface";

const apiUrl = "https://kalash.app";

// ✅ Corrected Fetch Function
export const fetchDealData = async (): Promise<ICasting[]> => {
  try {
    const response = await fetch(`${apiUrl}/api/casting`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Fetch returns a Response object, so we parse it manually
    const result = await response.json();
    console.log("API Response:", result);

    // ✅ Check backend structure (e.g. { success: true, data: [...] })
    if (result.success && Array.isArray(result.data)) {
      return result.data.map((casting: any) => ({
        id: casting.Name,
        issuedWeight: casting.Issued_weight || 0,
        receivedWeight: casting.Received_Weight || 0,
        issuedDate: casting.Issued_Date || "-",
        receivedDate: casting.Received_Date || "-",
        status: casting.status || "Open",
        castingLoss: casting.Casting_Loss || 0,
        ornamentWeight: casting.Ornament_Weight || 0,
        scrapWeight: casting.Scrap_Weight || 0,
        dustWeight: casting.Dust_Weight || 0,
      }));
    } else {
      console.error("Unexpected API structure:", result);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchDealData:", error);
    throw error;
  }
};
