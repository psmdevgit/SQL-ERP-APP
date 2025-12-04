'use client';


import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Pouch {
  Id: string;
  Name: string;
  Order_Id__c?: string;
  Product__c?: string;
  Quantity__c?: number;
    Received_Weight_Media__c?: number;
  Received_Weight_Grinding__c?: number;
  Received_Weight_Setting__c?: number;
  Received_Weight_Polishing__c?: number;
  Received_Weight_Dull__c?: number;
  categories?: Array<{Category__c: string, Quantity__c: number}>;
}

interface DepartmentRecord {
  attributes: {
    type: string;
    url: string;
  };
  Id: string;
  Name: string;
  status__c: string;
  Issued_Weight__c: number;
  Received_Weight__c: number | null;
}

export default function CreateGrindingFromDepartment() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [departmentRecords, setDepartmentRecords] = useState<DepartmentRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<string>('');
  const [selectedRecordData, setSelectedRecordData] = useState<DepartmentRecord | null>(null);
  const [pouches, setPouches] = useState<Pouch[]>([]);


  const [tempOrder, setTempOrder] = useState<string>('');
  const [tempProduct, settempProduct] = useState<string>('');
  const [tempQuantity, setTempQuantity] = useState<number | ''>('');


  const [pouchWeights, setPouchWeights] = useState<{ [key: string]: number }>({});
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [filingId, setFilingId] = useState<string>('');
  const [filingWeight, setFilingWeight] = useState<number>(0);
  const [selectedPouches, setSelectedPouches] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();

const apiBaseUrl = "https://kalash.app"; 

// const apiBaseUrl = "http://localhost:4001";

// Fetch department records when department changes
  useEffect(() => {
    const fetchDepartmentRecords = async () => {
      if (!selectedDepartment) return;

      try {
        setLoading(true);
        const endpoint = `${apiBaseUrl}/api/${selectedDepartment.toLowerCase()}`;
        console.log('Fetching from endpoint:', endpoint);
        
        const response = await fetch(`${apiBaseUrl}/api/${selectedDepartment.toLowerCase()}`);
        const result = await response.json();


        console.log("selected data : ", result.data);

        if (result.success) {
          // Filter for received records
       const receivedRecords = result.data.filter((record: DepartmentRecord) => {
  // Normalize all keys to lowercase for easy matching
  const keys = Object.keys(record).reduce((acc, key) => {
    acc[key.toLowerCase()] = record[key];
    return acc;
  }, {} as Record<string, any>);

  const status = keys["status__c"].trim();

  return status === "Finished" || status === "Completed";
});
          
          console.log('Received records:', receivedRecords);
          setDepartmentRecords(receivedRecords);
        } else {
          toast.error(`Failed to fetch ${selectedDepartment} records`);
          // alert(`Failed to fetch ${selectedDepartment} records`);
        }
      } catch (error) {
        console.error(`Error fetching ${selectedDepartment} records:`, error);
        toast.error('Failed to fetch records');
        // alert('Failed to fetch records');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentRecords();
  }, [selectedDepartment]);

  // Fetch pouches when record is selected
  useEffect(() => {
    const fetchPouches = async () => {
      if (!selectedRecord || !selectedDepartment) return;

      try {
        setLoading(true);
        const [prefix, date, month, year, number, subnumber] = selectedRecord.split('/');
        // Use the standard API pattern for pouches
        const endpoint = `${apiBaseUrl}/api/${selectedDepartment.toLowerCase()}/${prefix}/${date}/${month}/${year}/${number}/${subnumber}/pouches`;
        console.log('Fetching pouches from:', endpoint);
        
        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          console.log('Fetched pouches:', result.data.pouches);
          console.log('Fetched pouches:', result.data.cutting);
          setPouches(result.data.pouches);
          setTempOrder(result.data.cutting.Order_Id__c);
          settempProduct(result.data.cutting.Product__c);

          setTempQuantity(result.data.cutting.Quantity__c);
          // Initialize weights to 0
          const weights: { [key: string]: number } = {};
          result.data.pouches.forEach((pouch: Pouch) => {
            weights[pouch.Id] = pouch[Received_Weight_Cutting__c] || 0;
          });


          console.log("weight :", weights);
          setPouchWeights(weights);

        } else {
        //   toast.error('Failed to fetch pouches');
console.log('Failed to fetch pouches');
          // alert('Failed to fetch pouches');
        }
      } catch (error) {
        console.error('Error fetching pouches:', error);
        // toast.error('Failed to fetch pouches');
      } finally {
        setLoading(false);
      }
    };

    fetchPouches();
  }, [selectedRecord, selectedDepartment]);

  // Generate Filing ID and Pouch IDs
  useEffect(() => {
    if (selectedRecord) {
      const [_, date, month, year, number, subnumber] = selectedRecord.split('/');
      // Create prefix based on selected department (G + first letter of department)
      const deptPrefix = {
        'Cutting': 'PLC',
        // 'Setting': 'GS',
        // 'Polishing': 'GP',
        // 'Dull': 'GD'
      }[selectedDepartment] || 'P';
      
      const newFilingId = `${deptPrefix}/${date}/${month}/${year}/${number}/${subnumber || '001'}PLC`;
      setFilingId(newFilingId);
    }
  }, [selectedRecord, selectedDepartment]);

  // Handle pouch weight change
  const handlePouchWeightChange = (pouchId: string, weight: number, maxWeight: number) => {
    if (weight > maxWeight) {
      toast.error(`Weight cannot exceed ${maxWeight.toFixed(4)}g`);
      return;
    }

    setPouchWeights(prev => {
      const newWeights = { ...prev, [pouchId]: weight };
      const newTotal = Object.values(newWeights).reduce((sum, w) => sum + (w || 0), 0);
      setTotalWeight(newTotal);
      return newWeights;
    });
  };

  // Update record selection handler
  const handleRecordSelection = (recordName: string) => {
    setSelectedRecord(recordName);
    const recordData = departmentRecords.find(record => record.Name === recordName);
    setSelectedRecordData(recordData || null);
  };

  // Handle filing weight change
  const handleFilingWeightChange = (weight: number) => {
    setFilingWeight(weight);
    // Recalculate total weight including pouches
    const pouchTotal = Object.values(pouchWeights).reduce((sum, w) => sum + (w || 0), 0);
    setTotalWeight(pouchTotal + weight);
  };

  // Add handler for pouch selection
  const handlePouchSelection = (pouchId: string, isSelected: boolean) => {
    setSelectedPouches(prev => ({
      ...prev,
      [pouchId]: isSelected
    }));
    
    // Reset weight if pouch is deselected
    if (!isSelected) {
      setPouchWeights(prev => {
        const { [pouchId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle form submission
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   try {
//     setLoading(true);

//     if (!selectedRecordData) {
//       toast.error("No record selected");
//       return;
//     }

//     console.log("✅ Selected Pouches:", selectedPouches);
//     console.log("✅ Available Pouches:", pouches);

//     // --- STEP 1: Create pouch data ---
//     const pouchData = Object.entries(selectedPouches)
//       .filter(([_, isSelected]) => isSelected)
//       .map(([pouchId]) => {
//         // Match ID safely (number/string)
//         const sourcePouch = pouches.find(p => String(p.Id) === String(pouchId));
//         if (!sourcePouch) {
//           console.warn("⚠️ Pouch not found for ID:", pouchId);
//           return null;
//         }

//         // Extract pouch number from name
//         const sourcePouchNumber = sourcePouch.Name.split("/").pop()?.replace("POUCH", "") || "1";
//         const paddedPouchNumber = sourcePouchNumber.padStart(2, "0");
//         const newPouchId = `${filingId}/POUCH${paddedPouchNumber}`;

//         // Weight handling
//         const weight = parseFloat(
//           (pouchWeights[pouchId] ?? sourcePouch.Received_Weight_Setting__c ?? 0).toFixed(4)
//         );

//         // Categories fallback
//         const categories = Array.isArray(sourcePouch.categories) ? sourcePouch.categories : [];

//         console.log("📦 Processing Pouch:", {
//           sourcePouch: sourcePouch.Name,
//           newId: newPouchId,
//           orderId: sourcePouch.Order_Id__c,
//           product: sourcePouch.Product__c,
//           quantity: sourcePouch.Quantity__c,
//           weight,
//           categoriesCount: categories.length
//         });

//         return {
//           pouchId: newPouchId,
//           orderId: sourcePouch.Order_Id__c,
//           name: sourcePouch.Product__c,
//           quantity: sourcePouch.Quantity__c,
//           weight,
//           categories: categories.map(cat => ({
//             category: cat.Category__c,
//             quantity: cat.Quantity__c
//           }))
//         };
//       })
//       .filter(Boolean); // Remove nulls

//     // --- STEP 2: Build main record ---
//     const firstPouch = pouchData.length > 0 ? pouchData[0] : null;

//     const requestData = {
//       platingId: filingId, // ✅ correct param for grinding endpoint
//       totalWeight: parseFloat(totalWeight.toFixed(4)),
//       issuedDate: new Date().toISOString(),
//       orderId: firstPouch?.orderId || null,
//       name: firstPouch?.name || null,
//       quantity: firstPouch?.quantity || null,
//       status: "Pending",
//       pouches: pouchData,
      
//     };

//     console.log("🚀 Grinding Submission Payload:", JSON.stringify(requestData, null, 2));
    

//     // --- STEP 3: Send to server ---
//     const response = await fetch(`${apiBaseUrl}/api/plating/create`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestData)
//     });

//     const result = await response.json();
//     console.log("✅ Server Response:", result);

//     // --- STEP 4: Handle response ---
//     if (result.success) {
//       if (result.data) {
//         if (Array.isArray(result.data) && result.data.length > 0) {
//           const recordData = result.data[0];
//           console.log("Record data from server:", recordData);
//         } else {
//           console.log("Record data (object):", result.data);
//         }
//       }

//       toast.success("Plating record created successfully");
//       alert("Plating record created successfully");
//       router.push("/Departments/Plating");
//     } else {
//       throw new Error(result.message || "Failed to create plating record"); 
//     }
//   } catch (error: any) {
//     console.error("❌ Error creating plating record:", error);
//     // toast.error(error.message || "Failed to create plating record");
//     alert("Failed to create plating record");
//   } finally {
//     setLoading(false);
//   }
// };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setLoading(true);

    if (!selectedRecordData) {
      toast.error("No record selected");
      return;
    }

    // --- Build pouch data (no change) ---setpouch
    const pouchData = Object.entries(selectedPouches)
      .filter(([_, isSelected]) => isSelected)
      .map(([pouchId]) => {

        console.log(pouchId);
        const sourcePouch = pouches.find(p => String(p.Id) === String(pouchId));
        if (!sourcePouch) return null;

        console.log("source pouch :", pouches);

        const sourcePouchNumber = sourcePouch.Name.split("/").pop()?.replace("POUCH", "") || "1";
        const newPouchId = `${filingId}/POUCH${sourcePouchNumber.padStart(2, "0")}`;
        const weight = parseFloat(
          (pouchWeights[pouchId] ?? sourcePouch.Received_Weight_Setting__c ?? 0).toFixed(4)
        );

        const categories = Array.isArray(sourcePouch.categories) ? sourcePouch.categories : [];


        return {
            id : newPouchId,
          pouchId: pouchId,
          product: tempProduct,
          quantity: sourcePouch.Quantity__c,
          platingWeight: weight,   // API expects Issued_Weight_Plating__c
          orderId: sourcePouch.Order_Id__c,
          categories: categories.map(cat => ({
            category: cat.Category__c,
            quantity: cat.Quantity__c
          }))
        };
      })
      .filter(Boolean);

    // pick first pouch values for main record
    const first = pouchData[0] || null;

    // --- FIXED PAYLOAD TO MATCH API ---
    const requestData = {
      dullId: selectedRecordData?.dullId || null,   // if needed
      platingId: filingId,
      issuedDate: new Date().toISOString(),
      totalWeight: parseFloat(totalWeight.toFixed(4)),
      status: "Pending",
      product: tempProduct || null,   // API expects product
      quantity: tempQuantity || null, // API expects quantity
      orderId: tempOrder || null,   // API expects orderId
      pouches: pouchData                  // API expects pouches
    };

    console.log("🚀 FINAL Plating Payload:", JSON.stringify(requestData, null, 2));

    const response = await fetch(`${apiBaseUrl}/api/plating/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    console.log("Server Response:", result);

    if (result.success) {
      toast.success("Plating record created successfully");
      alert("Plating record created successfully");
      router.push("/Departments/Plating/Plating_Table");
    } else {
      throw new Error(result.message || "Failed to create plating record");
    }
  } catch (error: any) {
    console.error("❌ Error creating plating record:", error);
    alert("Failed to create plating record");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Create Plating from Department</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Department Selection with white background */}
            <div>
              <Label>Select Department</Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-white border border-gray-200"
                  style={{ backgroundColor: 'white' }}
                >
                  <SelectItem value="Cutting">Cutting</SelectItem>
                  {/* <SelectItem value="Setting">Setting</SelectItem>
                  <SelectItem value="Polishing">Polishing</SelectItem>
                  <SelectItem value="Dull">Dull</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* Record Selection with white background */}
            {selectedDepartment && (
              <div>
                <Label>Select {selectedDepartment} Record</Label>
                <Select
                  value={selectedRecord}
                  onValueChange={handleRecordSelection}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200">
                    <SelectValue placeholder={`Select ${selectedDepartment} record`} />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-white border border-gray-200 max-h-64 overflow-y-auto"
                    style={{ backgroundColor: 'white' }}
                  >
                    {departmentRecords.map(record => (
                      <SelectItem 
                        key={record.Id} 
                        value={record.Name}
                        className="hover:bg-gray-100"
                      >
                        {record.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filing ID Display */}
            {filingId && (
              <div>
                <Label>Filing ID</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {filingId}
                </div>
              </div>
            )}

            {/* Pouches */}
            {pouches.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Select Pouches to Include</h3>
                {pouches.map((pouch) => {
                  const receivedWeightField = {
                      'Cutting': 'Received_Weight_Cutting__c',
                    'Setting': 'Received_Weight_Setting__c',
                    'Polishing': 'Received_Weight_Polishing__c',
                    'Dull': 'Received_Weight_Dull__c'
                  }[selectedDepartment];
                  
                  const maxWeight = pouch[receivedWeightField] || 0;
                  const pouchNumber = pouch.Name?.split('/').pop()?.replace('P', '') || '';
                  const newPouchId = `${filingId}/P${pouchNumber.padStart(2, '0')}`;

                  return (
                    <div key={pouch.Id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-5 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPouches[pouch.Id] || false}
                            onChange={(e) => handlePouchSelection(pouch.Id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label className="ml-2">Select Pouch</Label>
                        </div>
                        <div>
                          <Label>Source Pouch</Label>
                          <div className="mt-1">{pouch.Name}</div>
                        </div>
                        <div>
                          <Label>New Grinding Pouch</Label>
                          <div className="mt-1">{newPouchId}</div>
                        </div>
                        <div>
                          <Label>Available Weight</Label>
                          <div className="mt-1">{maxWeight.toFixed(4)}g</div>
                        </div>
                        <div>
                          <Label>Weight to Grinding</Label>
                          <Input
                            type="number"
                            step="0.0001"
                            // value={selectedPouches[pouch.Id] ? (pouchWeights[pouch.Id] || '') : ''}

                            value={selectedPouches[pouch.Id] ? pouchWeights[pouch.Id] : ''}
                            onChange={(e) => handlePouchWeightChange(
                              pouch.Id,
                              parseFloat(e.target.value) || 0,
                              maxWeight
                            )}
                            disabled={!selectedPouches[pouch.Id]}
                            max={maxWeight}
                            className="mt-1"
                            required={selectedPouches[pouch.Id]}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Weight Display */}
            <div>
              <Label>Total Weight</Label>
              <div className="mt-1 text-lg font-semibold">
                {totalWeight.toFixed(4)}g
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || totalWeight === 0}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Plating Record'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
