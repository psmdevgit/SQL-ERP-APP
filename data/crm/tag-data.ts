import { ITag } from "@/interface/table.interface";

// const apiUrl = "http://localhost:4001";
const apiUrl = "https://kalash.app";

// Function to fetch tagging data
export const fetchTaggingData = async (): Promise<ITag[]> => {
  try {
    const response = await fetch(`${apiUrl}/api/Tag`);
    const result = await response.json();
    console.log("Raw API Response:", result);

    if (response.ok && result.success) {
      if (Array.isArray(result.data)) {
        return result.data.map((tag: any) => {
          console.log("Processing tag record:", tag);

          return {
            id: tag.id,
            taggingId: tag.taggingId,
            orderId: tag.orderId,
            product: tag.product,
            quantity: tag.quantity,
            receivedWeight: tag.receivedWeight,
            receivedDate: tag.receivedDate,
            status: tag.status,
            flag: tag.flag
          };
        });
      } else {
        console.error("Data is not an array:", result.data);
        return [];
      }
    } else {
      console.error("Failed to fetch tagging records:", result.error);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchTaggingData:", error);
    throw error;
  }
};

export default fetchTaggingData;
