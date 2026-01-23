"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";


const apiBaseUrl =  "https://kalash.app";
//  const apiBaseUrl ="http://localhost:4001";


interface AssemblyDetails {
  Id: string;
  Name: string;
  issued_date_c: string;
  quantity_c: number;
  order_id_c: string;
  status_c: string;
  findingWeight: number;
  issued_weight_c: number;
  createddate: string | null;
  castingcount: number | null;
}

interface ItemsDetails {
  castingName: string;
  createddate: string;
  usedWeight: number;
  availableWeight: number;
}

const CastingAllDetailsPage = () => {
  const [data, setData] = useState<{
    assembly: AssemblyDetails;
    assemblyItems: ItemsDetails[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [filteredOrders, setFilteredOrders] = useState(data?.assembly || []);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      const assemblyId = searchParams.get('assemblyId');
      console.log('Full Assembly ID:', assemblyId);

      if (!assemblyId) {
        console.error('Missing assembly ID');
        // alert('Missing casting ID');
        // toast.error('Missing casting ID');
        setLoading(false);
        return;
      }

      // Split the casting ID and rearrange to match server endpoint order
      const [date, month, year, number, alpha] = assemblyId.split('/');
      console.log('Original ID components:', { date, month, year, number, alpha });

      if (!date || !month || !year || !number) {
        console.error('Invalid casting ID format');
        // alert('Invalid casting ID format');
        toast.error('Invalid casting ID format');
        setLoading(false);
        return;
      }

      // Construct API URL in the correct order: date/month/year/number
      const apiUrl = `${apiBaseUrl}/api/assembly/view/${date}/${month}/${year}/${number}/${alpha}`;
      console.log('Fetching from:', apiUrl);

      try {
        console.log('Starting API request...');
        const response = await fetch(apiUrl);
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
          console.log('Setting data:', result.data);
          setData(result.data);
          console.log('assembly Details:', result.data.assembly);
          console.log('assembly Items:', result.data.assemblyItems);
        } else {
          console.error('API returned error:', result.message);
          // alert(result.message || 'Failed to fetch casting details');
          toast.error(result.message || 'Failed to fetch casting details');
        }
      } catch (error) {
        console.error('Error in fetch operation:', error);
        // alert('Error fetching casting details');
        toast.error('Error fetching casting details');
      } finally {
        console.log('Fetch operation completed');
        setLoading(false);
      }
    };

    console.log('Component mounted, starting fetch...');
    fetchDetails();
  }, [searchParams]);

  // Log component state changes
  useEffect(() => {
    console.log('Current data state:', data);
    console.log('Loading state:', loading);
  }, [data, loading]);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    console.log('Rendering error state - no data');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Failed to load assembly details</div>
      </div>
    );
  }

  console.log('Rendering component with data');
  return (
    <div className="p-6">
     <div className="w-4/5 mt-10 ml-[250px] mr-auto">
        {/* Casting Details Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assembly Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-600">Assembly Number</label>
                <p className="font-medium">{data.assembly.Name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Issued Date</label>
                <p className="font-medium">
                  {new Date(data.assembly.issued_date_c).toLocaleDateString()}
                </p>
              </div>
                      
              
              <div>
                <label className="text-sm text-gray-600">Issued Weight</label>
                <p className="font-medium">{data.assembly.issued_weight_c}g</p>
              </div>   
              <div>
                <label className="text-sm text-gray-600">Finding Weight</label>
                <p className="font-medium">{data.assembly.findingWeight}g</p>
              </div>
              {data.assembly.createddate && (
                <>
                  <div>
                    <label className="text-sm text-gray-600">Created Date</label>
                    <p className="font-medium">
                      {new Date(data.assembly.createddate).toLocaleDateString()}
                    </p>
                  </div>                
                </>
              )}
                <div>
                    <label className="text-sm text-gray-600">Order ID</label>
                    <p className="font-medium">{data.assembly.order_id_c}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Casting Count</label>
                    <p className="font-medium">{data.assembly.castingcount}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <p className="font-medium">{data.assembly.status_c}</p>
                  </div>
            </div>
          </div>
        </div>

        {/* Inventory Items Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assembly - Used Casting</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Casting Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Used Weight
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Available Weight
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created Date
                    </th>
                  
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.assemblyItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.castingName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.usedWeight}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(item.createddate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CastingAllDetailsPage;
