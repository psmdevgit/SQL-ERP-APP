import { IFiling } from "@/interface/table.interface";

 //const apiUrl = "http://localhost:4001";


const apiUrl = "https://kalash.app";

// Function to fetch grinding data from the server
export const fetchGrindingData = async (): Promise<IFiling[]> => {
  try {
    const response = await fetch(`${apiUrl}/api/grinding`);
    const result = await response.json();
    console.log("Raw API Response:", result);

    if (response.ok && result.success) {
      if (Array.isArray(result.data)) {
        return result.data.map((grinding: any) => {
          // Log each record's raw data
          console.log("Processing grinding record:", grinding);

          return {
            id:grinding.Name,
            issuedWeight: grinding.Issued_Weight__c || 0,  // Updated to match server field
            issuedDate: grinding.Issued_Date__c || '-',    // Updated to match server field
            receivedWeight: grinding.Received_Weight__c || 0, // Updated to match server field
            receivedDate: grinding.Received_Date__c || '-',  // Updated to match server field
            status: grinding.Status__c,
            product: grinding.Product__c || 'N/A',
            quantity: grinding.Quantity__c || 0,
            orderId : grinding.Order_Id__c || '',
            grindingLoss: grinding.Grinding_loss__c || 0 ,// Calculate loss
            movedstatus : grinding.movedstatus || 0,

            grindingDust : grinding.Grinding_Dust_Weight__c || 0,

            ornamentWeight: grinding.Grinding_Ornament_Weight__c || 0,
            scrapWeight: grinding.Grinding_Scrap_Weight__c || 0,
            dustWeight: grinding.Grinding_Dust_Weight__c || 0,
            findingWeight: grinding.Finding_Received__c || 0

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
