import { IFiling } from "@/interface/table.interface";

const apiUrl = "https://kalash.app";


//const apiUrl = "http://localhost:4001";

// Function to fetch grinding data from the server
export const fetchGrindingData = async (): Promise<IFiling[]> => {
  try {
    const response = await fetch(`${apiUrl}/api/filing`);
    const result = await response.json();
    console.log("Raw API Response:", result); // Log raw response

    if (response.ok && result.success) {
      if (Array.isArray(result.data)) {
        return result.data.map((grinding: any) => {
          // Log each record's raw data
          console.log("Processing grinding record:", {
            raw: grinding,
            issuedWeight: grinding.Issued_weight,   
            issuedWeightField: grinding.Issued_weight__c
          });

          return {
            id: grinding.Name,
            issuedWeight: grinding.Issued_Weight || 0, // Changed to match API field name
            issuedDate: grinding.Issued_Date || '-',
            receivedWeight: grinding.Received_Weight || 0,
            receivedDate: grinding.Received_Date || '-',
            status: grinding.Status || 'Open',
            orderId: grinding.OrderId || '',
            product :grinding.product || '',  
            quantity:grinding.quantity || 0,  
            grindingLoss: grinding.Filing_Loss || 0,

            movedstatus: grinding.movedstatus || 0,
            filingDust: grinding.Filing_Dust_Weight || 0,

            ornamentWeight: grinding.Filing_Ornament_Weight || 0,
            scrapWeight: grinding.Filing_Scrap_Weight || 0,
            dustWeight: grinding.Filing_Dust_Weight || 0,
            findingWeight: grinding.Filing_Finding_Weight || 0,
            AddedFindingWeight: grinding.Filing_Added_Finding_Weight || 0,





  //             ornamentWeight: number;
  // scrapWeight: number;
  // dustWeight: number;
  // findingWeight: number;
  // AddedFindingWeight: number;
          };
        });
      } else {
        console.error("Data is not an array:", result.data);
        return [];
      }
    } else {
      console.error("Failed to fetch grinding records:", result.error);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchGrindingData:", error);
    throw error;
  }
};

export default fetchGrindingData;
