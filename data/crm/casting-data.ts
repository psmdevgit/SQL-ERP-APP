import { ICasting } from "@/interface/table.interface";

// import dataAxios from '../../src/axios';
const apiUrl = "https://kalash.app";

// Function to fetch casting data from the server
export const fetchDealData = async (): Promise<ICasting[]> => {
  try {
    const response = await fetch(`${apiUrl}/api/casting`);
    console.log("API Response:", response.data); // ✅ Axios gives data directly

    const result = response.data;

    // If your backend returns { success: true, data: [...] }n
    if (result.success && Array.isArray(result.data)) {
      return result.data.map((casting: any) => {
        return {
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
        };
      });
    } else {
      console.error("Unexpected API structure:", result);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchDealData:", error);
    throw error;
  }
};


// You can remove the fallback static data since we're getting it from the API now
