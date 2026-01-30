"use client";
import { useState, useEffect } from 'react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode  from 'qrcode';
import noimage from "../../../../../assets/no.png";

import {  useSearchParams,useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import Image from 'next/image';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Eye, Printer, Trash2 } from "lucide-react";


interface PartyLedger {
  id: string;
  name: string;
  code: string;
}

interface Order {
  id: string;
  orderNo: string;
}

interface OrderModel {
  id: string;
  modelName: string;
  imageUrl: string | null;
}

// Updated interface with consistent image handling
interface TaggingModel {
  modelId: string;
  modelName: string;
  uniqueNumber: number;
  imageUrl: string | null;
  imageData: string | null; // Base64 image data
  grossWeight: number;
  netWeight: number;
  stoneWeight: number;
  stoneCharges: number;
}

interface TaggedPiece {
  pieceIndex: number;
  uniquePieceNo: string;
  pieceNo: number;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  stoneCharges: string;
}


// Interface for submitted tagged items
interface SubmittedTaggedItem {
  id: string;
  modelDetails: string;
  Model_Unique_Number__c: string;
  Gross_Weight__c: string;
  Net_Weight__c: string;
  Stone_Weight__c: string;
  Stone_Charge__c: string;
   // 🔹 ADD PCS HERE ✅
  pieces: TaggedPiece[];  
  PDF_URL__c?: string;
  pdfUrl?: string;
}

const NewTagging = () => {

  
        const router = useRouter();
  
  const [partyLedgers, setPartyLedgers] = useState<PartyLedger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [orderModels, setOrderModels] = useState<OrderModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<TaggingModel[]>([]);
  const [modelCounts, setModelCounts] = useState<Record<string, number>>({});
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [submittedItems, setSubmittedItems] = useState<SubmittedTaggedItem[]>([]);
  const [isSubmittingModels, setIsSubmittingModels] = useState(false);
  const [isSubmittingTagging, setIsSubmittingTagging] = useState(false);

  
  const [partyCode, setPartyCode] = useState<string>('');

  
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');


  // const [previewData, setPreviewData] = useState<{ model: TaggingModel; pcIndex: number } | null>(null);
  // instead of storing row data snapshot
const [previewData, setPreviewData] = useState<{ modelIndex: number; pcIndex: number } | null>(null);


  const apiBaseUrl = "https://kalash.app" ;

  const imageUrl = "https://psmport.pothysswarnamahalapp.com/FactoryModels/";

  
  // const apiBaseUrl = "http://192.168.5.62:8080" ;
  
  // const apiBaseUrl = "http://localhost:4001" ;

  // Add this helper function at the top of your component
  const getInitialTaggingNumber = () => {
    if (typeof window !== 'undefined') {
      const savedNumber = localStorage.getItem('lastTaggingNumber');
      return savedNumber ? parseInt(savedNumber, 10) : 0;
    }
    return 0;
  };

const handlePreview = (model: TaggingModel) => {
  console.log("Preview clicked for:", model);
  
};

// const handlePrint = async (model: TaggingModel, pcIndex: number) => {
//   console.log("print click :", model);
//   console.log("order detail :", selectedOrder);

//   // return;

//   /* ================= ORDER NO ================= */
//   const orderNo =
//     selectedOrder && selectedOrder.includes("/")
//       ? selectedOrder.split("/").pop()
//       : selectedOrder || "order";

//   /* ================= PRINT SIZE ================= */
//   // 🎯 90mm x 15mm @ 300 DPI
//   const DPI = 300;
//   const width = Math.round((90 / 25.4) * DPI);   // ≈ 1063 px
//   const height = Math.round((15 / 25.4) * DPI); // ≈ 177 px

//   /* ================= SAFE PADDING ================= */
//   const PAGE_PADDING = 20; // 🔥 printer-safe margin
//   const contentWidth = width - PAGE_PADDING * 2;
//   const contentHeight = height - PAGE_PADDING * 2;

//   /* ================= CANVAS ================= */
//   const canvas = document.createElement("canvas");
//   canvas.width = width;
//   canvas.height = height;

//   const ctx = canvas.getContext("2d");
//   if (!ctx) return;

//   /* ================= BACKGROUND ================= */
//   ctx.fillStyle = "#ffffff";
//   ctx.fillRect(0, 0, width, height);

//   /* ================= QR COLUMN ================= */
//   const qrColumnWidth = contentWidth * 0.3;
//   const qrSize = Math.min(qrColumnWidth * 0.9, contentHeight * 0.9);

//   const pc =
//     model.pcs?.[pcIndex] || {
//       netWeight: 0,
//       stoneWeight: 0,
//       grossWeight: 0,
//       pieceNo: "-",
//     };

// // 🔥 format to 3 decimals (no commas)
// const gross = Number(pc.grossWeight || 0).toFixed(3);
// const stone = Number(pc.stoneWeight || 0).toFixed(3);
// const net   = Number(pc.netWeight || 0).toFixed(3);
// const piece = pc.pieceNo || 1;

// // 🔥 FINAL QR VALUE
// const qrValue = `${gross}${stone}${net}${piece}${model.modelName}`;


//   const qrCanvas = document.createElement("canvas");
//   // await QRCode.toCanvas(qrCanvas, `${model.modelName}-${pcIndex + 1}`, {
//   //   width: qrSize,
//   //   margin: 0,
//   // });

//   await QRCode.toCanvas(qrCanvas, qrValue, {
//   width: qrSize,
//   margin: 0,
// });


//   const qrX = PAGE_PADDING + (qrColumnWidth - qrSize) / 2;
//   const qrY = PAGE_PADDING + (contentHeight - qrSize) / 2;
//   ctx.drawImage(qrCanvas, qrX, qrY);

//   /* ================= DETAILS COLUMN ================= */
//   const detailsStartX = PAGE_PADDING + qrColumnWidth;
//   const innerPadding = 6;

//   // const pc =
//   //   model.pcs?.[pcIndex] || {
//   //     netWeight: 0,
//   //     stoneWeight: 0,
//   //     grossWeight: 0,
//   //     pieceNo: "-",
//   //   };

//   const lines = [
//     { text: model.modelName, font: "bold 30px Arial" },
//     { text: "N.wt | S.wt | G.wt", font: "bold 25px Arial" },
//     {
//       text: `${pc.netWeight || 0}g | ${pc.stoneWeight || 0}g | ${pc.grossWeight || 0}g`,
//       font: "bold 25px Arial",
//     },
//     { text: `Pc: ${pc.pieceNo || "-"}`, font: "bold 28px Arial" },
//   ];

//   const lineHeight = 30;
//   const textBlockHeight = lines.length * lineHeight;

//   let textY =
//     PAGE_PADDING +
//     (contentHeight - textBlockHeight) / 2 +
//     lineHeight / 1.3;

//   lines.forEach(({ text, font }) => {
//     ctx.font = font;
//     ctx.fillStyle = "#000000";
//     ctx.textAlign = "left";
//     ctx.textBaseline = "middle";
//     ctx.fillText(text, detailsStartX + innerPadding, textY);
//     textY += lineHeight;
//   });

//   /* ================= DOWNLOAD ================= */
//   const fileName = `${orderNo}_${model.modelName}_#${pcIndex + 1}.png`;
// const imageData = canvas.toDataURL("image/png");
//   const link = document.createElement("a");
//   link.download = fileName;
//   link.href = canvas.toDataURL("image/png");
//   link.click();

//   // alert("Tag Generated and Downloaded Successfully!");
// //   /* ---- Print ---- */
// // const printWindow = window.open("", "_blank");
// // if (!printWindow) return;

// // printWindow.document.write(`
// //   <html>
// //     <head>
// //       <title>Print Tag</title>
// //       <style>
// //         @page {
// //           size: 90mm 15mm;
// //           margin: 0;
// //         }
// //         body {
// //           margin: 0;
// //           display: flex;
// //           justify-content: center;
// //           align-items: center;
// //         }
// //         img {
// //           width: 90mm;
// //           height: 15mm;
// //         }
// //       </style>
// //     </head>
// //     <body>
// //       <img src="${imageData}" onload="window.print(); window.close();" />
// //     </body>
// //   </html>
// // `);

// // printWindow.document.close();

// const printWindow = window.open("", "_blank");
// if (!printWindow) return;

// printWindow.document.write(`
// <html>
// <head>
//   <style>
//     @page { size: 90mm 15mm; margin: 0; }
//     body { margin: 0; }
//     img { width: 90mm; height: 15mm; display: block; }
//   </style>
// </head>
// <body>
//   <img src="${imageData}" />
// </body>
// </html>
// `);

// printWindow.document.close();

// printWindow.onload = () => {
//   setTimeout(() => {
//     printWindow.print();
//     printWindow.close();
//   }, 300);
// };
// alert("Tag Generated, Downloaded & Sent to Printer!");
// };

     const handlePrint = async (model: TaggingModel, pcIndex: number) => {
  /* ================= ORDER NO ================= */
  const orderNo =
    selectedOrder && selectedOrder.includes("/")
      ? selectedOrder.split("/").pop()
      : selectedOrder || "order";

  /* ================= PRINT SIZE ================= */
  const DPI = 300;
  const width = Math.round((90 / 25.4) * DPI);   // 1063px
  const height = Math.round((15 / 25.4) * DPI); // 177px

  const PAGE_PADDING = 10;
  const contentWidth = width - PAGE_PADDING * 2;
  const contentHeight = height - PAGE_PADDING * 2;

  /* ================= CANVAS ================= */
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  /* ================= PC DATA ================= */
  const pc =
    model.pcs?.[pcIndex] || {
      netWeight: 0,
      stoneWeight: 0,
      grossWeight: 0,
      pieceNo: 1,
    };

  const gross = Number(pc.grossWeight || 0).toFixed(3);
  const stone = Number(pc.stoneWeight || 0).toFixed(3);
  const net   = Number(pc.netWeight || 0).toFixed(3);
  const piece = pc.pieceNo || 1;

  /* ================= QR ================= */
  const qrValue = `${gross}${stone}${net}${piece}${model.modelName}`;

  const qrSize = Math.min(contentHeight * 0.95, 100);
  const qrCanvas = document.createElement("canvas");

  // await QRCode.toCanvas(qrCanvas, qrValue, {
  //   width: qrSize,
  //   margin: 0,
  // });

        await QRCode.toCanvas(qrCanvas, qrValue, {
  width: qrSize,
  margin: 0,
  errorCorrectionLevel: "H", // 🔥 stronger QR = darker blocks
  color: {
    dark: "#000000",   // 🔥 PURE BLACK
    light: "#FFFFFF", // 🔥 PURE WHITE
  },
  scale: 1, // 🔥 prevents anti-alias blur
});

       
  /* ================= LEFT COLUMN (WEIGHTS) ================= */
  let leftX = PAGE_PADDING + 30;
  let leftY = PAGE_PADDING + 20;
const lineGap = 38; // 🔥 increase this for more spacing

  ctx.fillStyle = "#000000";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 32px Arial";

  
const drawBoldText = (
  text: string,
  x: number,
  y: number
) => {
  ctx.fillText(text, x, y);
  ctx.fillText(text, x + 0.6, y); // 🔥 makes print darker
};


  // ctx.fillText(`Grs wt : ${gross}g`, leftX, leftY);  
  drawBoldText(`Grs wt : ${gross}g`, leftX, leftY);
  leftY += lineGap;

  // ctx.fillText(`St wt : ${stone}g`, leftX, leftY);
  drawBoldText(`St wt : ${stone}g`, leftX, leftY);
  leftY += lineGap;

  // ctx.fillText(`Nt wt : ${net}g`, leftX, leftY);
  drawBoldText(`Nt wt : ${net}g`, leftX, leftY);
  leftY += lineGap;

  // ctx.fillText(`Pcs : ${piece}`, leftX, leftY);
  drawBoldText(`Pcs : ${piece}`, leftX, leftY);

  /* ================= RIGHT COLUMN ================= */
  const rightStartX = PAGE_PADDING + contentWidth * 0.55;

  /* MODEL NAME (TOP RIGHT) */
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "left";
  // ctx.fillText(model.modelName, rightStartX - 240, PAGE_PADDING + 18);
  
    drawBoldText(model.modelName, rightStartX - 240, PAGE_PADDING + 18);


  const qrTopGap = -30; 
  /* QR (CENTER RIGHT) */
  const qrX = rightStartX - 200;
  const qrY = PAGE_PADDING + (contentHeight - qrSize  - qrTopGap) / 2;
  ctx.drawImage(qrCanvas, qrX, qrY);

  /* KJGC / 22KT (BOTTOM RIGHT) */
  // ctx.font = "bold 22px Arial";
  // ctx.fillText("KJGC", qrX + qrSize + 12, qrY + qrSize / 2 - 10);
  
  // ctx.font = "bold 32px Arial";
  // ctx.fillText(model.modelName, qrX + qrSize + 12, qrY + qrSize / 2 );

  // ctx.font = "bold 20px Arial";
  // ctx.fillText("22KT", leftX + 110, PAGE_PADDING + contentHeight - 10);

  /* ================= DOWNLOAD ================= */
  const fileName = `${orderNo}_${model.modelName}_#${pcIndex + 1}.png`;
  const imageData = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.download = fileName;
  link.href = imageData;
  link.click();

  /* ================= PRINT ================= */
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
    <head>
      <style>
        @page { size: 90mm 15mm; margin: 0; }
        body { margin: 0; }
        img { width: 90mm; height: 15mm; display: block; }
      </style>
    </head>
    <body>
      <img src="${imageData}" />
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  alert("Tag Generated !!!");
};
  
useEffect(() => {
  if (partyCode && partyLedgers.length > 0) {
    const match = partyLedgers.find(
      (party) => party.code === partyCode
    );

    if (match) {
      setSelectedParty(match.code); // ✅ AUTO SELECT
    }
  }
}, [partyCode, partyLedgers]);

useEffect(() => {
  if (!orderId || orders.length === 0) return;

  const match = orders.find(
    (order) =>
      order.id === orderId || order.orderNo === orderId
  );

  if (match) {
    setSelectedOrder(match.id); // ✅ AUTO SELECT
  }
}, [orderId, orders]);


const handleRemove = (modelIndex: number, pcIndex: number) => {
  setSelectedModels(prev => {
    const updated = [...prev];
    const m = { ...updated[modelIndex] };

    if (!m.pcs) return prev;

    // If only 1 row remains → alert and block removal
    if (m.pcs.length === 1) {
      // setTimeout(() => alert("At least one model detail is required."), 0);

      alert("At least one model detail is required.");

      return prev;
    }

    // Remove the row
    const pcs = [...m.pcs];
    pcs.splice(pcIndex, 1);

    // Update pcs and quantity
    m.pcs = pcs;
    m.quantity = pcs.length;  // 🔹 Keep quantity in sync with row count

    updated[modelIndex] = m;
    return updated;
  });
};

const handlePreviewPDFOne = async () => {
  const element = document.querySelector(".maincontent") as HTMLElement;
  if (!element) return;

  try {
    // Convert the div to canvas
    // const canvas = await html2canvas(element, { scale: 2 });

    const canvas = await html2canvas(element, {
  scale: 2,
  useCORS: true,        // allow cross-origin images
  allowTaint: false,    // prevent tainted canvas
  logging: false
});


    const imgData = canvas.toDataURL("image/png");

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions
    const imgWidth = pageWidth - 120; // margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    // ✅ Open in new tab
    const pdfBlob = pdf.output("bloburl");
    window.open(pdfBlob, "_blank");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};


  // Update the useState initialization
  const [lastTaggingNumber, setLastTaggingNumber] = useState(getInitialTaggingNumber);


  // set default order and party code

    useEffect(() => {

    if (!orderId) return;

    const fetchPartyCode = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/tagOrder?orderId=${orderId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Party Ledgers API Response:', result);

          if (result.success && result.data.length > 0) {
            console.log(result.data)
        setPartyCode(result.data[0].partyName); // ✅ FIX
      } else {
        setPartyCode("");
      }
      } catch (error) {
        console.error('Error fetching party ledgers:', error);
        setPartyCode("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartyCode();
  }, [apiBaseUrl, orderId]);



  // Fetch party ledgers on component mount
  useEffect(() => {
    const fetchPartyLedgers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/customer-groups`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Party Ledgers API Response:', result);

        if (result.success && Array.isArray(result.data)) {
          const formattedData = result.data
            .filter(party => party.Id && party.Party_Code_c)
            .map(party => ({
              id: party.Id,
              name: party.Party_Code_c,
              code: party.Party_Code_c
            }));
          console.log('Formatted Party Data:', formattedData);
          setPartyLedgers(formattedData);
        } else {
          console.error('Invalid party data format received:', result);
          setPartyLedgers([]);
        }
      } catch (error) {
        console.error('Error fetching party ledgers:', error);
        setPartyLedgers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartyLedgers();
  }, [apiBaseUrl]);

  // Fetch orders when party is selected
  useEffect(() => {
    if (selectedParty) {
      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const response = await fetch(`${apiBaseUrl}/api/taggingorders?partyCode=${selectedParty}`);
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success && Array.isArray(result.data)) {
            const formattedOrders = result.data.map(orderNo => ({
              id: orderNo,
              orderNo: orderNo
            }));
            console.log('Formatted Orders:', formattedOrders);
            setOrders(formattedOrders);
          } else {
            console.error('Invalid orders data format received:', result);
            setOrders([]);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchOrders();
    } else {
      // Reset orders when no party is selected
      setOrders([]);
      setSelectedOrder('');
    }
  }, [selectedParty, apiBaseUrl]);

  // Update the order models effect
  useEffect(() => {
    if (selectedOrder) {
      console.log('Fetching models for order:', selectedOrder);
      
      const fetchOrderModels = async () => {
        setIsLoadingModels(true);
        try {
          const response = await fetch(`${apiBaseUrl}/api/tagging-order-models?orderId=${selectedOrder}`);
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success && Array.isArray(result.data)) {
            const formattedModels = await Promise.all(result.data.map(async (modelCode) => {
              try {
                const imageResponse = await fetch(`${apiBaseUrl}/api/model-image?modelCode=${modelCode}`);
                
                if (!imageResponse.ok) {
                  console.warn(`Image API error for model ${modelCode}: ${imageResponse.status}`);
                  return {
                    id: modelCode,
                    modelName: modelCode,
                    orderId: selectedOrder,
                    imageUrl: null
                  };
                }
                
                const imageData = await imageResponse.json();
                
                console.log("imageData",imageData);
                return {
                  id: modelCode,
                  modelName: modelCode,
                  orderId: selectedOrder,
                  imageUrl: imageData.success && imageData.data ? imageData.data : null
                };
              } catch (error) {
                console.error(`Error fetching image for model ${modelCode}:`, error);
                return {
                  id: modelCode,
                  modelName: modelCode,
                  orderId: selectedOrder,
                  imageUrl: null
                };
              }
            }));
            
            // Directly set the new models without accumulation
            setOrderModels(formattedModels);
            console.log('Set new models for order:', formattedModels);
            
          } else {
            console.error('Invalid order models data format received:', result);
            setOrderModels([]); // Clear models if invalid data
          }
        } catch (error) {
          console.error('Error fetching order models:', error);
          setOrderModels([]); // Clear models on error
        } finally {
          setIsLoadingModels(false);
        }
      };

      fetchOrderModels();
    } else {
      setOrderModels([]); // Clear models when no order selected
    }
  }, [selectedOrder, apiBaseUrl]);

  // Helper function to fetch and convert image to base64
  const getImageData = async (url: string): Promise<string | null> => {
    try {
      if (!url) {
        console.log('No URL provided for image');
        return null;
      }
      
      // For Salesforce URLs, use the backend proxy
      if (url.includes('salesforce.com') || url.includes('force.com') || url.startsWith('/api/download-file')) {
        // Extract the original URL if it's already a proxy URL
        const fileUrl = url.startsWith('/api/download-file') 
          ? new URLSearchParams(url.split('?')[1]).get('url')
          : url;
          
        console.log('Fetching through backend proxy:', fileUrl);
        
        const response = await fetch(`${apiBaseUrl}/api/download-file?url=${encodeURIComponent(fileUrl)}`, {
          method: 'GET',
          headers: {
            'Accept': 'image/*'
          }
        });
        
        if (!response.ok) {
          console.error('Proxy response error:', {
            status: response.status,
            statusText: response.statusText,
            url: fileUrl
          });
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      
      // For other URLs, fetch directly
      console.log('Fetching non-Salesforce URL directly:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error('Error fetching image data:', {
        error,
        url,
        message: error.message
      });
      return null;
    }
  };

  // Update handleModelSelection to handle image fetching more robustly
  const handleModelSelection = async (modelCode: string) => {
    try {
      // Find the model from current order's models only
      const selectedModel = orderModels.find((model) => model.id === modelCode);
      console.log("Selected model:", selectedModel);

      if (!selectedModel) {
        console.error("Selected model not found in current order models list");
        return;
      }

      // Get model count for unique numbering
      const modelCount = modelCounts[modelCode] || 0;
      const newCount = modelCount + 1;
      
      // Update model counts
      setModelCounts({
        ...modelCounts,
        [modelCode]: newCount
      });

      // Fetch and process image data
      let imageData = null;
      if (selectedModel.imageUrl) {
        console.log('Attempting to fetch image for model:', {
          modelCode,
          imageUrl: selectedModel.imageUrl
        });
        
        try {
          imageData = await getImageData(selectedModel.imageUrl);
          console.log('Image data fetched successfully:', {
            modelCode,
            hasData: Boolean(imageData)
          });
        } catch (imageError) {
          console.error('Failed to fetch image, continuing without image:', {
            modelCode,
            error: imageError
          });
        }
      }

      // Create new tagging model
      // const newTaggingModel: TaggingModel = {
      //   modelId: modelCode,
      //   modelName: modelCode,
      //   uniqueNumber: newCount,
      //   imageUrl: selectedModel.imageUrl,
      //   imageData: imageData,
      //   grossWeight: 0,
      //   netWeight: 0,
      //   stoneWeight: 0,
      //   stoneCharges: 0
      // };

      // Create new tagging model
const newTaggingModel: TaggingModel = {
  modelId: modelCode,
  modelName: selectedModel.modelName,   // better to use actual name
  uniqueNumber: newCount,
  imageUrl: selectedModel.imageUrl,
  imageData: imageData,
  quantity: 1,  // ✅ start with 1 quantity
  pcs: [        // ✅ initialize with one pc row
    {
      stoneWeight: 0,
      netWeight: 0,
      grossWeight: 0,
      stoneCharges: 0
    }
  ],
  grossWeight: 0,
  netWeight: 0,
  stoneWeight: 0,
  stoneCharges: 0
};


      // Add to selected models
      setSelectedModels(prevModels => [...prevModels, newTaggingModel]);
      console.log('Model added successfully:', {
        modelCode,
        hasImage: Boolean(imageData)
      });

    } catch (error) {
      console.error("Error in handleModelSelection:", {
        modelCode,
        error: error.message,
        stack: error.stack
      });
    }
  };

  // Update weight and charges values
  const handleWeightUpdate = (index: number, field: keyof TaggingModel, value: number) => {
    const updatedModels = [...selectedModels];
    updatedModels[index][field] = value;
    
    // If updating stone or net weight, automatically update gross weight
    if (field === 'stoneWeight' || field === 'netWeight') {
      const model = updatedModels[index];
      updatedModels[index].grossWeight = Number(
        (model.stoneWeight + model.netWeight).toFixed(3)
      );
    }
    
    setSelectedModels(updatedModels);
  };

  // Update the generatePDF function for individual models
const generatePDF = async (model: TaggingModel): Promise<Uint8Array> => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const black = rgb(0, 0, 0);

    // Image handling (same approach)
    let imageBottomY = page.getHeight() - 100;
    if (model.imageData) {
      try {
        const imageDataString = model.imageData.replace(/^data:image\/\w+;base64,/, "");
        const imageBytes = Uint8Array.from(atob(imageDataString), (c) =>
          c.charCodeAt(0)
        );
        const image = await pdfDoc.embedJpg(imageBytes);

        const maxDimension = 300;
        const scale = Math.min(maxDimension / image.width, maxDimension / image.height);

        const width = image.width * scale;
        const height = image.height * scale;
        const x = (page.getWidth() - width) / 2;

        imageBottomY = page.getHeight() - height - 70;

        page.drawImage(image, {
          x,
          y: imageBottomY + 20,
          width,
          height,
        });
      } catch (imageError) {
        console.warn("Could not embed image in PDF:", imageError);
      }
    }

    // compute totals from pcs
    const totals = computeModelTotals(model);

    // Build details using totals (safe)
    const details = [
      `Model Name: ${model.modelName || "-"}`,
      `Model ID: ${model.modelId || "-"}`,
      `Unique Number: ${model.uniqueNumber ?? "-"}`,
      `Pcs: ${totals.pcsCount}`,
      `Gross Weight: ${Number(totals.grossTotal).toFixed(3)} g`,
      `Net Weight: ${Number(totals.netTotal).toFixed(3)} g`,
      `Stone Weight: ${Number(totals.stoneTotal).toFixed(3)} g`,
      `Stone Charges: Rs. ${Number(totals.stoneChargesTotal).toFixed(2)}`,
    ];

    let yPosition = imageBottomY;
    // If imageBottomY might be too low, cap start so text is visible
    if (yPosition > page.getHeight() - 50) yPosition = page.getHeight() - 120;

    details.forEach((detail) => {
      page.drawText(detail, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: black,
      });
      yPosition -= 20;
    });

    return pdfDoc.save();
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};



  // Update the generateTaggingId function
  const generateTaggingId = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const nextNumber = lastTaggingNumber + 1;
    return `TAG-${year}${month}${day}-${String(nextNumber).padStart(3, '0')}`;
  };

  // Add this helper function at the top level
  const generateUniqueNumber = () => {
    if (selectedModels.length === 0) {
      return 1;
    }
    
    // Get the highest unique number from existing models
    const highestNumber = selectedModels.reduce((max, model) => {
      const currentNumber = Number(model.uniqueNumber);
      return isNaN(currentNumber) ? max : Math.max(max, currentNumber);
    }, 0);
    
    // Return next number in sequence
    return highestNumber + 1;
  };
// Helper: compute totals from model.pcs
const computeModelTotals = (model) => {
  const pcs = model.pcs || [];
  const rate = typeof stoneRate !== "undefined" ? stoneRate : 600;

  let netTotal = 0;
  let stoneTotal = 0;
  let grossTotal = 0;
  let stoneChargesTotal = 0;

  pcs.forEach((pc) => {
    const pcNet = Number(pc?.netWeight || 0);
    const pcStone = Number(pc?.stoneWeight || 0);

    // prefer explicit grossWeight if present, otherwise net + stone
    const pcGross =
      pc.grossWeight !== undefined && pc.grossWeight !== null
        ? Number(pc.grossWeight)
        : pcNet + pcStone;

    // prefer explicit stoneCharges if present, otherwise stone * rate
    const pcStoneCharges =
      pc.stoneCharges !== undefined && pc.stoneCharges !== null
        ? Number(pc.stoneCharges)
        : pcStone * rate;

    netTotal += pcNet;
    stoneTotal += pcStone;
    grossTotal += pcGross;
    stoneChargesTotal += pcStoneCharges;
  });

  return {
    pcsCount: pcs.length,
    netTotal,
    stoneTotal,
    grossTotal,
    stoneChargesTotal,
  };
};

const handleSubmitModels = async () => {
  setIsSubmittingModels(true);
  try {
    console.log("Starting submission of models:", selectedModels);

    const taggingId = generateTaggingId();

    // ✅ Pre-validation
    for (const model of selectedModels) {
      const totals = computeModelTotals(model);
      if (Number(totals.netTotal) === 0) {
        alert("Please enter Net Weight before model submitting.....");
        setIsSubmittingModels(false);
        return; // stop entire submission
      }
    }

    // ✅ Process models locally
  //   const taggedItems = selectedModels.map((model) => {
  //     const totals = computeModelTotals(model);

  //      const pieces = (model.pcs || []).map((pc, pcIndex) => ({
  //   pieceIndex: pcIndex + 1,
  //   uniquePieceNo: `${model.uniqueNumber}-${pcIndex + 1}`,
  //   pieceNo: Number(pc.pieceNo || 0),
  //   netWeight: Number(pc.netWeight || 0).toFixed(3),
  //   stoneWeight: Number(pc.stoneWeight || 0).toFixed(3),
  //   grossWeight: Number(pc.grossWeight || 0).toFixed(3),
  //   stoneCharges: Number(pc.stoneCharges || 0).toFixed(2),
  // }));

  //     const modelData = {
  //       taggingId: taggingId,
  //       modelDetails: model.modelName,
  //       modelUniqueNumber: String(model.uniqueNumber),
  //       grossWeight: Number(totals.grossTotal).toFixed(3),
  //       netWeight: Number(totals.netTotal).toFixed(3),
  //       stoneWeight: Number(totals.stoneTotal).toFixed(3),
  //       stoneCharge: Number(totals.stoneChargesTotal).toFixed(2),
  //         // 🔹 ADD PCS HERE ✅
  //   pieces: pieces,
  //     };

  //     console.log("✅ Local model data:", modelData);

  //     return modelData;
  //   });

  const taggedItems: SubmittedTaggedItem[] = selectedModels.map((model) => {
  const totals = computeModelTotals(model);

  const pieces: TaggedPiece[] = (model.pcs || []).map((pc, pcIndex) => ({
    pieceIndex: pcIndex + 1,
    uniquePieceNo: `${model.uniqueNumber}-${pcIndex + 1}`,
    pieceNo: Number(pc.pieceNo || 0),
    netWeight: Number(pc.netWeight || 0).toFixed(3),
    stoneWeight: Number(pc.stoneWeight || 0).toFixed(3),
    grossWeight: Number(pc.grossWeight || 0).toFixed(3),
    stoneCharges: Number(pc.stoneCharges || 0).toFixed(2),
  }));

  const modelData: SubmittedTaggedItem = {
    id: taggingId, // ✅ REQUIRED

    modelDetails: model.modelName,
    Model_Unique_Number__c: String(model.uniqueNumber),

    Gross_Weight__c: Number(totals.grossTotal).toFixed(3),
    Net_Weight__c: Number(totals.netTotal).toFixed(3),
    Stone_Weight__c: Number(totals.stoneTotal).toFixed(3),
    Stone_Charge__c: Number(totals.stoneChargesTotal).toFixed(2),

    pieces, // ✅ PCS INCLUDED
  };

  return modelData;
});


    // ✅ Set locally processed items
    console.log("All tagged items :", taggedItems);      
    setSubmittedItems(taggedItems);

    alert("Models submitted successfully!");
  } catch (error) {
    console.error("Error in handleSubmitModels:", error);
    alert("Error processing models: Unknown error");
  } finally {
    setIsSubmittingModels(false);
  }
};

const handleRemoveModel = (modelIndex: number) => {
  setSelectedModels(prev =>
    prev.filter((_, index) => index !== modelIndex)
  );
};



// const handleSubmitModels = async () => {

//   setIsSubmittingModels(true);
//   try {
//     console.log("Starting submission of models:", selectedModels);

//     const taggingId = generateTaggingId();

//      // ✅ Pre-validation
//     for (const model of selectedModels) {
//       const totals = computeModelTotals(model);
//       if (Number(totals.netTotal) === 0) {
//      alert('Please enter Net Weight before model submitting.....');
//         setIsSubmittingModels(false);
//         return; // stop whole submission
//       }
//     }

  



  // Helper function to preview PDF
  const handlePreviewPDF = async (downloadUrl: string) => {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing PDF:', error);
      // alert('Error opening PDF preview');


    }
  };

  // Preview PDF for a model
  const previewModelPDF = async (model: TaggingModel) => {
    try {
      console.log('Generating PDF preview for', model.modelName);
      const pdfBytes = await generatePDF(model);
      
      // Create blob and URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing PDF:', error);
      // alert(`Error generating PDF preview: ${error.message}`);
    }
  };

  // Handle final tagging submission

  const handleSubmitTagging = async () => {
  setIsSubmittingTagging(true);
  const taggingId = generateTaggingId(); // ✅ Generate once

  try {
    if (submittedItems.length === 0) {
      // alert('Please submit models first');
      setIsSubmittingTagging(false);
      return;
    }

    // Upload each model PDF
    const taggedItems = await Promise.all(
      selectedModels.map(async (model) => {
        const pdfBytes = await generatePDF(model);
        const totals = computeModelTotals(model);

        const formData = new FormData();
        const modelData = {
          taggingId,
          modelDetails: model.modelName,
          modelUniqueNumber: String(model.uniqueNumber),
          grossWeight: Number(totals.grossTotal || 0).toFixed(3),
          netWeight: Number(totals.netTotal || 0).toFixed(3),
          stoneWeight: Number(totals.stoneTotal || 0).toFixed(3),
          stoneCharge: Number(totals.stoneChargesTotal || 0).toFixed(2),
        };

        Object.entries(modelData).forEach(([key, value]) => formData.append(key, value));

          // 🔹 PCS DATA
    const pieces = (model.pcs || []).map((pc, pcIndex) => ({      
      tagID: `${taggingId}`,
      modelName: `${model.modelName}`,
      pieceIndex: pcIndex + 1,
      uniquePieceNo: `${model.uniqueNumber}-${pcIndex + 1}`,
      pieceNo: Number(pc.pieceNo || 0),
      netWeight: Number(pc.netWeight || 0).toFixed(3),
      stoneWeight: Number(pc.stoneWeight || 0).toFixed(3),
      grossWeight: Number(pc.grossWeight || 0).toFixed(3),
      stoneCharges: Number(pc.stoneCharges || 0).toFixed(2),
    }));

    // ✅ Append pieces as JSON
    formData.append("pieces", JSON.stringify(pieces));


        const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
        const safeModelName = (model.modelName || "model").replace(/\s+/g, "_");
        const pdfFileName = `${taggingId}_${safeModelName}_${model.uniqueNumber}.pdf`;
        formData.append("pdf", pdfBlob, pdfFileName);

        // console.log("🔍 FormData contents:");
        // for (const [key, value] of formData.entries()) {
        //   console.log(key, value);
        // }

        const response = await fetch(`${apiBaseUrl}/api/create-tagged-item`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.message || "Failed to create tagged item");
        return result.data;
      })
    );

    // Calculate totals across models
    const totals = selectedModels.reduce((acc, model) => {
      const pcsTotals = model.pcs.reduce(
        (pcsAcc, p) => ({
          grossWeight: pcsAcc.grossWeight + (p.grossWeight || 0),
          netWeight: pcsAcc.netWeight + (p.netWeight || 0),
          stoneWeight: pcsAcc.stoneWeight + (p.stoneWeight || 0),
          stoneCharges: pcsAcc.stoneCharges + (p.stoneWeight || 0) * 600,
        }),
        { grossWeight: 0, netWeight: 0, stoneWeight: 0, stoneCharges: 0 }
      );
      return {
        grossWeight: acc.grossWeight + pcsTotals.grossWeight,
        netWeight: acc.netWeight + pcsTotals.netWeight,
        stoneWeight: acc.stoneWeight + pcsTotals.stoneWeight,
        stoneCharges: acc.stoneCharges + pcsTotals.stoneCharges,
      };
    }, { grossWeight: 0, netWeight: 0, stoneWeight: 0, stoneCharges: 0 });

    
    const oID = orderId ? orderId : selectedOrder;
    
    // Generate summary files
    const pdfBytes = await generateSummaryPDF(selectedModels);
    const excelBlob = generateExcel(selectedModels,oID);

    // Prepare tagging submission
    const formData = new FormData();

    const formDataDetails = {
      oID,
      taggingId,
      partyCode: selectedParty,
      // orderNo:selectedOrder,
      totalGrossWeight: totals.grossWeight.toFixed(3),
      totalNetWeight: totals.netWeight.toFixed(3),
      totalStoneWeight: totals.stoneWeight.toFixed(3),
      totalStoneCharges: totals.stoneCharges.toFixed(2),
      stoneRate: "600", // per gram
      modelCount: selectedModels.length,
    };
    Object.entries(formDataDetails).forEach(([k, v]) => formData.append(k, v));

    formData.append("pdfFile", new Blob([pdfBytes], { type: "application/pdf" }), "tagging_summary.pdf");
    formData.append("excelFile", excelBlob, "tagging_summary.xlsx");

        // console.log("🔍 FormData contents:");
        // for (const [key, value] of formData.entries()) {
        //   console.log(key, value);
        // }
   

    const response = await fetch(`${apiBaseUrl}/api/submit-tagging`, { method: "POST", body: formData });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Failed to submit tagging");

    alert("Tagging order submitted successfully!");
    setTimeout(() => router.push(`/Billing/Tagging`), 500);

    // Reset form state
    setSelectedParty("");
    setSelectedOrder("");
    setOrderModels([]);
    setSelectedModels([]);
    setPreviewData(null);
    setModelCounts({});
    setSubmittedItems([]);
    setOrders([]);

    const newNumber = lastTaggingNumber + 1;
    setLastTaggingNumber(newNumber);
    localStorage.setItem("lastTaggingNumber", newNumber.toString());

  } catch (error) {
    console.error("Error submitting tagging:", error);
    alert(`Error submitting tagging: ${error.message}`);
  } finally {
    setIsSubmittingTagging(false);
  }
};



const generateSummaryPDF = async (models: TaggingModel[]): Promise<Uint8Array> => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const black = rgb(0, 0, 0);

    // Add title
    page.drawText('Tagging Summary', {
      x: 50,
      y: height - 50,
      size: 16,
      font: helveticaBold,
      color: black,
    });

    // Add table headers
    const headers = [
      'Sr.No',
      'Model',
      'Unique #',
      'Net Wt',
      'Stone Wt',
      'Gross Wt',
      'Stone Charges',
    ];
    let yPos = height - 100;
    let xPos = 50;

    headers.forEach((header) => {
      page.drawText(header, {
        x: xPos,
        y: yPos,
        size: 12,
        font: helveticaBold,
        color: black,
      });
      xPos += 75;
    });

    let srNo = 1;

    // Track grand totals
    let grandNet = 0;
    let grandStone = 0;
    let grandGross = 0;
    let grandCharges = 0;

    // Add table rows (per piece)
    models.forEach((model) => {
      (model.pcs || []).forEach((pc, pcIndex) => {
        yPos -= 20;
        if (yPos < 50) {
          // add new page if space runs out
          const newPage = pdfDoc.addPage([595, 842]);
          yPos = height - 50;
          page.drawText("Continued...", {
            x: 50,
            y: yPos,
            size: 12,
            font: helvetica,
            color: black,
          });
        }

        page.drawText(srNo.toString(), { x: 50, y: yPos, size: 10, font: helvetica, color: black });
        page.drawText(model.modelName || '-', { x: 125, y: yPos, size: 10, font: helvetica, color: black });
        page.drawText(`${model.uniqueNumber}-${pcIndex + 1}`, { x: 200, y: yPos, size: 10, font: helvetica, color: black });
        page.drawText((pc.netWeight || 0).toFixed(3), { x: 275, y: yPos, size: 10, font: helvetica, color: black });
        page.drawText((pc.stoneWeight || 0).toFixed(3), { x: 350, y: yPos, size: 10, font: helvetica, color: black });
        page.drawText((pc.grossWeight || 0).toFixed(3), { x: 425, y: yPos, size: 10, font: helvetica, color: black });
        page.drawText((pc.stoneCharges || 0).toFixed(2), { x: 500, y: yPos, size: 10, font: helvetica, color: black });

        // Update grand totals
        grandNet += pc.netWeight || 0;
        grandStone += pc.stoneWeight || 0;
        grandGross += pc.grossWeight || 0;
        grandCharges += pc.stoneCharges || 0;

        srNo++;
      });
    });

    // Add Grand Total row
    yPos -= 30;
    page.drawText('Grand Total', { x: 125, y: yPos, size: 12, font: helveticaBold, color: black });
    page.drawText(grandNet.toFixed(3), { x: 275, y: yPos, size: 12, font: helveticaBold, color: black });
    page.drawText(grandStone.toFixed(3), { x: 350, y: yPos, size: 12, font: helveticaBold, color: black });
    page.drawText(grandGross.toFixed(3), { x: 425, y: yPos, size: 12, font: helveticaBold, color: black });
    page.drawText(grandCharges.toFixed(2), { x: 500, y: yPos, size: 12, font: helveticaBold, color: black });

    return pdfDoc.save();
  } catch (error) {
    console.error('Error generating summary PDF:', error);
    throw new Error(`Failed to generate summary PDF: ${error.message}`);
  }
};



  // Add a button to generate and preview the summary PDF
  const previewSummaryPDF = async () => {
    try {
      console.log("details of selectedmodel",selectedModels);
      console.log('Generating summary PDF for', selectedModels.length, 'models');
      const pdfBytes = await generateSummaryPDF(selectedModels);
      
      // Create blob and URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing summary PDF:', error);
      // alert(`Error generating summary PDF preview: ${error.message}`);
    }
  };

  // Add this function to generate Excel
  // const generateExcel = (models: TaggingModel[]): Blob => {
  //   // Prepare the data for Excel
  //   const excelData = models.map((model, index) => {
  //     const submittedItem = submittedItems[index];
      
  //     return {
  //      // 'Sr.No': index + 1,
  //       'Model Name': model.modelName,
  //       'Net Weight': model.netWeight.toFixed(3),
  //       'Stone Weight': model.stoneWeight.toFixed(3),
  //       'Gross Weight': model.grossWeight.toFixed(3),
  //       'Stone Charges': model.stoneCharges.toFixed(2),
  //       'PDF URL': submittedItem?.pdfUrl || '' // Url || '' // Optionally include preview URL if needed
  //     };
  //   });

  //   // Create worksheet
  //   const ws = XLSX.utils.json_to_sheet(excelData);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Tagging Summary');

  //   // Generate Excel file
  //   const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  //   return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  // };

// const generateExcel = (models: TaggingModel[]): Blob => {
//   const excelData: any[] = [];

//   models.forEach((model, modelIndex) => {
//     // Loop through each pcs entry (child rows)
//     model.pcs.forEach((p, pcsIndex) => {
//       excelData.push({
//         // 'Sr.No': `${modelIndex + 1}.${pcsIndex + 1}`, 
//         // 'Model ID': model.modelId,
//         'Model Name': model.modelName,
//         // 'Unique Number': model.uniqueNumber,
//         'Net Weight': p.netWeight.toFixed(3),
//         'Stone Weight': p.stoneWeight.toFixed(3),
//         'Gross Weight': p.grossWeight.toFixed(3),
//         'Stone Charges': p.stoneCharges.toFixed(2),
//         'count': p.pieceNo
//         // 'PDF URL': `${apiBaseUrl}${model.imageUrl}` || ''
//       });
//     });
//   });

//   // Grand total across all models
//   const grandTotals = models.reduce(
//     (acc, model) => {
//       acc.netWeight += model.pcs.reduce((a, b) => a + b.netWeight, 0);
//       acc.stoneWeight += model.pcs.reduce((a, b) => a + b.stoneWeight, 0);
//       acc.grossWeight += model.pcs.reduce((a, b) => a + b.grossWeight, 0);
//       acc.stoneCharges += model.pcs.reduce((a, b) => a + b.stoneCharges, 0);
//       acc.pcsCount += model.pcs.reduce((a, b) => a + b.pieceNo, 0);
//       return acc;
//     },
//     { netWeight: 0, stoneWeight: 0, grossWeight: 0, stoneCharges: 0, pcsCount: 0 }
//   );

//   excelData.push({
//     'Model Name': 'GRAND TOTAL',
//     // 'Unique Number': '',
//     'Net Weight': grandTotals.netWeight.toFixed(3),
//     'Stone Weight': grandTotals.stoneWeight.toFixed(3),
//     'Gross Weight': grandTotals.grossWeight.toFixed(3),
//     'Stone Charges': grandTotals.stoneCharges.toFixed(2),
//     'count': grandTotals.pcsCount,
//     // 'PDF URL': ''
//   });

//   // Create worksheet
//   const ws = XLSX.utils.json_to_sheet(excelData);
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Tagging Summary');

//   // Generate Excel file
//   const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
//   return new Blob([excelBuffer], {
//     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//   });
// };

const generateExcel = (
  models: TaggingModel[],
  oID: string
): Blob => {

  const excelData: any[] = [];

  // ================= DATA ROWS =================
  models.forEach((model) => {
    model.pcs.forEach((p) => {
      excelData.push({
        "Model Name": model.modelName,
        "Net Weight": p.netWeight.toFixed(3),
        "Stone Weight": p.stoneWeight.toFixed(3),
        "Gross Weight": p.grossWeight.toFixed(3),
        "Stone Charges": p.stoneCharges.toFixed(2),
        "Count": p.pieceNo
      });
    });
  });

  // ================= GRAND TOTAL =================
  const grandTotals = models.reduce(
    (acc, model) => {
      acc.netWeight += model.pcs.reduce((a, b) => a + b.netWeight, 0);
      acc.stoneWeight += model.pcs.reduce((a, b) => a + b.stoneWeight, 0);
      acc.grossWeight += model.pcs.reduce((a, b) => a + b.grossWeight, 0);
      acc.stoneCharges += model.pcs.reduce((a, b) => a + b.stoneCharges, 0);
      acc.pcsCount += model.pcs.reduce((a, b) => a + b.pieceNo, 0);
      return acc;
    },
    { netWeight: 0, stoneWeight: 0, grossWeight: 0, stoneCharges: 0, pcsCount: 0 }
  );

  excelData.push({
    "Model Name": "GRAND TOTAL",
    "Net Weight": grandTotals.netWeight.toFixed(3),
    "Stone Weight": grandTotals.stoneWeight.toFixed(3),
    "Gross Weight": grandTotals.grossWeight.toFixed(3),
    "Stone Charges": grandTotals.stoneCharges.toFixed(2),
    "Count": grandTotals.pcsCount
  });

  // ================= CREATE SHEET =================
  const ws = XLSX.utils.json_to_sheet(excelData, { origin: "A3" });

  // ================= HEADER ROWS =================
  XLSX.utils.sheet_add_aoa(
    ws,
    [
      [`Order ID : ${oID}`], // Row 1
      [],                         // Row 2 (blank)
    ],
    { origin: "A1" }
  );

  // Optional: merge Order ID row across columns
  ws["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 5 } // merge till "Count" column
    }
  ];

  // ================= WORKBOOK =================
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tagging Summary");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array"
  });

  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
};


  // Add preview Excel function
  const previewExcel = () => {

    const oID = orderId ? orderId : selectedOrder;
    try {
      const excelBlob = generateExcel(selectedModels, oID);
      const url = window.URL.createObjectURL(excelBlob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing Excel:', error);
      // alert('Error generating Excel preview');
    }
  };

  // First, let's deduplicate the orderModels array before rendering
  const uniqueModels = Array.from(new Map(orderModels.map(model => [model.id, model])).values());

  return (
<div className="flex justify-center gap-2">
  {/* Form container */}
  <div className="max-w-6xl p-6 px-10 mx-auto bg-white rounded-lg shadow-md mt-[100px]">
    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">New Tagging</h1>

    <form
      className=" max-w-6xl mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitTagging();
      }}
    >
      {/* Party & Order Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Party */}
        {/* <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Party</label>
          <Select
            onValueChange={(value) => {
              const selectedParty = partyLedgers.find((party) => party.code === value);
              if (selectedParty) {
                setSelectedParty(selectedParty.code);
                setSelectedOrder('');
                setSelectedModels([]);
                setSubmittedItems([]);
              }
            }}
          >
            <SelectTrigger className="w-full bg-white border border-gray-200">
              <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Party'} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {partyLedgers.length > 0 ? (
                partyLedgers.map((party) => (
                  <SelectItem key={party.id} value={party.code} className="hover:bg-gray-100">
                    {party.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>
                  {isLoading ? 'Loading...' : 'No parties available'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div> */}


<div className="form-group">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Select Party
  </label>

  <Select
    value={selectedParty}
    onValueChange={(value) => {
      const selectedPartyObj = partyLedgers.find(
        (party) => party.code === value
      );

      if (selectedPartyObj) {
        setSelectedParty(selectedPartyObj.code);
        setSelectedOrder("");
        setSelectedModels([]);
        setSubmittedItems([]);
      }
    }}
  >
    <SelectTrigger className="w-full bg-white border border-gray-200">
      <SelectValue
        placeholder={isLoading ? "Loading..." : "Select Party"}
      />
    </SelectTrigger>

    <SelectContent className="bg-white">
      {partyLedgers.length > 0 ? (
        partyLedgers.map((party) => (
          <SelectItem
            key={party.id}
            value={party.code}
            className="hover:bg-gray-100"
          >
            {party.name}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="no-data" disabled>
          {isLoading ? "Loading..." : "No parties available"}
        </SelectItem>
      )}
    </SelectContent>
  </Select>
</div>


        {/* Order */}
        {/* <div className="form-group relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Order</label>
          <Select
            value={selectedOrder}
            onValueChange={(value) => setSelectedOrder(value)}
            disabled={!selectedParty || isLoadingOrders}
          >
            <SelectTrigger className="w-full bg-white border border-gray-200">
              <SelectValue placeholder={isLoadingOrders ? 'Loading Orders...' : 'Select Order'} />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <SelectItem key={`${order.id}-${order.orderNo}`} value={order.id} className="hover:bg-gray-100">
                    {order.orderNo}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled >
                  {isLoadingOrders ? 'Loading...' : 'No orders available'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div> */}

<div className="form-group relative z-10">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Select Order
  </label>

  <Select
    value={selectedOrder}
    onValueChange={(value) => setSelectedOrder(value)}
    disabled={!selectedParty || isLoadingOrders}
  >
    <SelectTrigger className="w-full bg-white border border-gray-200">
      <SelectValue
        placeholder={
          isLoadingOrders ? "Loading Orders..." : "Select Order"
        }
      />
    </SelectTrigger>

    <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
      {orders.length > 0 ? (
        orders.map((order) => (
          <SelectItem
            key={`${order.id}-${order.orderNo}`}
            value={order.id}
            className="hover:bg-gray-100"
          >
            {order.orderNo}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="no-data" disabled>
          {isLoadingOrders ? "Loading..." : "No orders available"}
        </SelectItem>
      )}
    </SelectContent>
  </Select>
</div>


      </div>

      {/* Model Selection */}
      {selectedOrder && (
        <div className="space-y-4 mx-auto">
          <div className="form-group relative z-10">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Model</label>
            <Select onValueChange={handleModelSelection} disabled={!selectedOrder || isLoadingModels}>
              <SelectTrigger className="w-full bg-white border border-gray-200">
                <SelectValue placeholder={isLoadingModels ? 'Loading Models...' : 'Select Model'} />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100
             hover:scrollbar-thumb-gray-500 ">
                {uniqueModels.length > 0 ? (
                  uniqueModels.map((model, index) => (
                    <SelectItem key={`model-${model.id}-${index}`} value={model.id} className="hover:bg-gray-100">
                      {model.modelName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>
                    {isLoadingModels ? 'Loading...' : 'No models available'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Selected Models with Pcs Grid */}
      {selectedModels.length > 0 && (
        <div className="space-y-4 mx-auto">
          <label className="block text-sm font-medium text-gray-700">Selected Models Details</label>
          {selectedModels.map((model, index) => {
            const stoneRate = 600; // Rs per gram

            return (
             <div key={model.uniqueNumber} className="border rounded-lg p-4 bg-white shadow-sm"> 
  {/* Header */}
  <div className="flex justify-between items-center mb-3">
    <p className="font-medium text-gray-800">
      {model.modelName}{' '}
      <span className="ml-2 text-sm text-gray-500">#{model.uniqueNumber}</span>
    </p>

    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-600">Quantity</label>
      <input
        type="number"
        min="1"
        value={model.quantity || 1}
        onChange={(e) => {
          const qty = Math.max(1, parseInt(e.target.value || '0', 10) || 1);
          setSelectedModels(prev => {
            const updated = [...prev];
            const m = { ...updated[index] };
            const oldPcs = Array.isArray(m.pcs) ? [...m.pcs] : [];

            // build new pcs preserving existing where possible
            const newPcs = Array.from({ length: qty }, (_, i) => {
              if (oldPcs[i]) return { ...oldPcs[i] };
              return { stoneWeight: 0, netWeight: 0, grossWeight: 0, stoneCharges: 0 };
            });

            m.quantity = qty;
            m.pcs = newPcs;
            updated[index] = m;
            return updated;
          });
        }}
        className="w-16 h-8 text-sm px-2 border border-gray-300 rounded"
      />

       {/* REMOVE MODEL BUTTON */}
    <button
      onClick={() => handleRemoveModel(index)}
      className="p-1 text-red-600 hover:text-red-800"
      title="Remove Model"
    >
      {/* <Trash2 className="w-5 h-5" />  */}
       <X className="w-5 h-5" /> 
    </button>
    </div>
  </div>

  {/* Quick Summary */}
  <div className="mb-2 text-sm text-gray-700">
    Total Pcs: {model.quantity || 0} / Remaining:{' '}
    {(model.quantity || 0) - (model.pcs?.filter((p) => p.netWeight > 0 || p.stoneWeight > 0).length || 0)}
  </div>

  {/* Grid Table */}
  <div className="overflow-x-auto">
    <table className="min-w-full border border-gray-300 text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1">#</th>
          <th className="border px-2 py-1">Unique No.</th>
          
          <th className="border px-2 py-1">Gross Wt</th>
          <th className="border px-2 py-1">Stone Wt (g)</th>
          <th className="border px-2 py-1">Net Wt (g)</th>
          <th className="border px-2 py-1">Piece No</th>


          <th className="border px-2 py-1">Stone Charges</th>
          <th className="border px-2 py-1">Preview</th>
          <th className="border px-2 py-1">Print</th>
          <th className="border px-2 py-1">Remove</th>
        </tr>
      </thead>
      <tbody>
        {model.pcs?.map((pc, pcIndex) => (
          <tr key={pcIndex}>
            <td className="border px-2 py-1 text-center">{pcIndex + 1}</td>

            {/* display unique per-row without adding extra state */}
            <td className="border px-2 py-1 text-center">
              {`${model.uniqueNumber}-${pcIndex + 1}`}
            </td>


    {/* Gross & Charges (display only) */}
            <td className="border px-2 py-1 text-center bg-gray-50">
              {/* {(Number(pc.grossWeight || 0)).toFixed(3)} */}
               <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={pc.grossWeight}
                  onChange={(e) => {
                    const grossWeight = Number(e.target.value || 0);

                    setSelectedModels(prev => {
                      const updated = [...prev];
                      const m = { ...updated[index] };
                      const pcs = [...(m.pcs || [])];
                      const newPc = { ...pcs[pcIndex] };

                      newPc.grossWeight = grossWeight;

                      // 🔥 Auto-calc net weight
                      newPc.netWeight =
                        grossWeight - Number(newPc.stoneWeight || 0);

                      pcs[pcIndex] = newPc;
                      m.pcs = pcs;
                      updated[index] = m;
                      return updated;
                    });
                  }}
                  className="w-full h-7 px-2 border border-gray-300 rounded"
                />
            </td>

            {/* Stone Weight */}
            <td className="border px-2 py-1">
              <input
                type="number"
                step="0.001"
                min="0"
                value={pc.stoneWeight}
                onChange={(e) => {
                  const stoneWeight = Number(e.target.value || 0);
                  setSelectedModels(prev => {
                    const updated = [...prev];
                    const m = { ...updated[index] };
                    const pcs = m.pcs ? [...m.pcs] : [];
                    const newPc = { ...pcs[pcIndex] };
                    newPc.stoneWeight = stoneWeight;

                    // recalc gross & stoneCharges
                    // newPc.grossWeight = (Number(newPc.netWeight || 0) + stoneWeight);
                    // newPc.stoneCharges = stoneWeight * (typeof stoneRate !== 'undefined' ? stoneRate : 600);
                    newPc.netWeight =
                          Number(newPc.grossWeight || 0) - stoneWeight;

                        // Charges
                        newPc.stoneCharges =
                          stoneWeight * (typeof stoneRate !== "undefined" ? stoneRate : 600);
        
                    pcs[pcIndex] = newPc;
                    m.pcs = pcs;
                    updated[index] = m;
                    return updated;
                  });
                }}
                className="w-full h-7 px-2 border border-gray-300 rounded"
              />
            </td>

            {/* Net Weight */}
            <td className="border px-2 py-1">
              {/* <input
                type="number"
                step="0.001"
                min="0"
                value={pc.netWeight}
                onChange={(e) => {
                  const netWeight = Number(e.target.value || 0);
                  setSelectedModels(prev => {
                    const updated = [...prev];
                    const m = { ...updated[index] };
                    const pcs = m.pcs ? [...m.pcs] : [];
                    const newPc = { ...pcs[pcIndex] };
                    newPc.netWeight = netWeight;
                    // recalc gross & keep stone charges based on current stoneWeight
                    newPc.grossWeight = netWeight + (Number(newPc.stoneWeight || 0));
                    newPc.stoneCharges = (Number(newPc.stoneWeight || 0)) * (typeof stoneRate !== 'undefined' ? stoneRate : 600);
                    pcs[pcIndex] = newPc;
                    m.pcs = pcs;
                    updated[index] = m;
                    return updated;
                  });
                }}
                className="w-full h-7 px-2 border border-gray-300 rounded"
              /> */}
              <input
  type="number"
  value={(Number(pc.netWeight || 0)).toFixed(3)}
  readOnly
  className="w-full h-7 px-2 border border-gray-300 rounded bg-gray-50"
/>

            </td>

            <td className="border px-2 py-1">
  <input
    type="number"
    min="1"
    value={pc.pieceNo || "0"}
    onChange={(e) => {
      const pieceNo = Number(e.target.value || 0);

      setSelectedModels(prev => {
        const updated = [...prev];
        const m = { ...updated[index] };
        const pcs = [...(m.pcs || [])];
        pcs[pcIndex] = { ...pcs[pcIndex], pieceNo };
        m.pcs = pcs;
        updated[index] = m;
        return updated;
      });
    }}
    className="w-full h-7 px-2 border border-gray-300 rounded"
  />
</td>



        
            <td className="border px-2 py-1 text-center bg-gray-50">
                {(Number(pc.stoneCharges || 0)).toFixed(2)} ₹
            </td>
            <td className="preview border text-center">
              <button
                onClick={() => {
                  const piece = Number(pc.pieceNo || 0);
                  const stoneWeight = Number(pc.stoneWeight || 0);
                  const netWeight = Number(pc.netWeight || 0); // Add this if you want to check netWeight too

                  // if (stoneWeight === 0 || netWeight === 0)
                  
                  if (netWeight === 0 || piece === 0) 
                    {
                    alert('Please enter Net Weight & Pieces before previewing.');
                    return;
                  }

                  setPreviewData({ modelIndex: index, pcIndex });
                  handlePreview(model);
                }}
                className="p-2 text-blue-600 hover:text-blue-800"
              >
                <Eye className="w-5 h-5" />
              </button>
            </td>

           <td className="print border text-center">
              <button
                onClick={() => { 
                   const piece = Number(pc.pieceNo || 0);
                  const netWeight = Number(pc.netWeight || 0); // Add this if you want to check netWeight too

                  // if (stoneWeight === 0 || netWeight === 0)
                  if (netWeight === 0 || piece === 0 )
                     {
                    alert('Please enter Net Weight and piece before Tag Printing.');
                    return;
                  }
                  handlePrint(model, pcIndex)}}
                className="p-2 text-green-600 hover:text-green-800"
              >
                <Printer className="w-5 h-5" />
              </button>
            </td>


          <td className="remove text-center">
            <button
              onClick={() => handleRemove(index, pcIndex)}
              className="p-2 text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </td>


          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Actions */}
  <div className="flex justify-end mt-3 gap-2">
    <Button
      type="button"
      onClick={() => previewModelPDF(model)}
      className="h-7 w-20 text-xs text-white bg-blue-500 hover:bg-blue-100 border-blue-200"
    >
      Preview
    </Button>
    {/* <Button
      type="button"
      onClick={() => {
        setSelectedModels(prev => prev.filter((_, i) => i !== index));
      }}
      className="h-7 w-20 text-xs text-white bg-red-500 hover:bg-red-600 rounded"
    >
      Remove
    </Button> */}
  </div>
</div>

            );
          })}
        </div>
      )}

      {/* Summary Table */}
      {selectedModels.length > 0 && (
        <div className="mt-8 mx-auto">
          <h2 className="text-lg font-medium text-gray-800 mb-4 text-center">Summary Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border-b text-left text-xs font-medium text-gray-500 uppercase">Sr.No</th>
                  <th className="px-4 py-2 border-b text-left text-xs font-medium text-gray-500 uppercase">Model Name</th>
                  <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Pcs</th>
                  <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Net Wt (g)</th>
                  <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Stone Wt (g)</th>
                  <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Gross Wt (g)</th>
                  <th className="px-4 py-2 border-b text-right text-xs font-medium text-gray-500 uppercase">Stone Charges (₹)</th>
                </tr>
              </thead>
              <tbody>
                {selectedModels.map((model, index) => {
                  const pcs = model.pcs || [];
                  const netTotal = pcs.reduce((sum, pc) => sum + (pc.netWeight || 0), 0);
                  const stoneTotal = pcs.reduce((sum, pc) => sum + (pc.stoneWeight || 0), 0);
                  const grossTotal = pcs.reduce((sum, pc) => sum + (pc.grossWeight || 0), 0);
                  const stoneChargesTotal = pcs.reduce((sum, pc) => sum + (pc.stoneCharges || 0), 0);

                  return (
                    <tr key={`${model.modelId}-${index}`} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{model.modelName}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{pcs.length}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{netTotal.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{stoneTotal.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{grossTotal.toFixed(3)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{stoneChargesTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}

                {/* Grand Total */}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-2 text-sm text-gray-900">Total</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{selectedModels.length} Models</td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {selectedModels.reduce((sum, m) => sum + (m.pcs?.length || 0), 0)} Pcs
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {selectedModels.reduce((sum, m) => sum + m.pcs?.reduce((s, pc) => s + (pc.netWeight || 0), 0), 0).toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {selectedModels.reduce((sum, m) => sum + m.pcs?.reduce((s, pc) => s + (pc.stoneWeight || 0), 0), 0).toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {selectedModels.reduce((sum, m) => sum + m.pcs?.reduce((s, pc) => s + (pc.grossWeight || 0), 0), 0).toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {selectedModels.reduce((sum, m) => sum + m.pcs?.reduce((s, pc) => s + (pc.stoneCharges || 0), 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="mt-6 flex gap-2 justify-center">
        <Button
          type="button"
          onClick={handleSubmitModels}
          disabled={isSubmittingModels || selectedModels.length === 0}
          className="h-8 px-4 text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmittingModels ? 'Submitting...' : 'Submit Models'}
        </Button>
        <Button
          type="button"
          onClick={handleSubmitTagging}
          disabled={isSubmittingTagging || selectedModels.length === 0}
          className="h-8 px-4 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmittingTagging ? 'Creating Tagging...' : 'Create Tagging Order'}
        </Button>
        <Button
          type="button"
          onClick={previewSummaryPDF}
          disabled={selectedModels.length === 0}
          className="h-8 px-4 text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          Preview PDF
        </Button>
        <Button
          type="button"
          onClick={previewExcel}
          disabled={selectedModels.length === 0}
          className="h-8 px-4 text-sm text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
        >
          Preview Excel
        </Button>
      </div>
    </form>
  </div>

  {/* Preview Sidebar */}
  {/* <div className="w-[400px] mt-[200px] space-y-4">
    <div className="sticky top-[220px] bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Model Preview</h2>
      {selectedModels.length > 0 ? (() => {
        const currentModel = selectedModels[selectedModels.length - 1];
        const pcs = currentModel.pcs || [];
        const netTotal = pcs.reduce((sum, pc) => sum + (pc.netWeight || 0), 0);
        const stoneTotal = pcs.reduce((sum, pc) => sum + (pc.stoneWeight || 0), 0);
        const grossTotal = pcs.reduce((sum, pc) => sum + (pc.grossWeight || 0), 0);
        const stoneChargesTotal = pcs.reduce((sum, pc) => sum + (pc.stoneCharges || 0), 0);

        return (
          <div className="space-y-4">
            <div className="aspect-square w-full relative rounded-lg overflow-hidden border border-gray-200">
              {currentModel.imageData ? (
                <img
                  src={currentModel.imageData}
                  alt={`Model ${currentModel.modelName}`}
                  className="w-full h-full object-contain"
                  onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-medium">{currentModel.modelName}</p>
              <p>Unique #: {currentModel.uniqueNumber}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Net Weight:</span>
                  <p>{netTotal.toFixed(3)}g</p>
                </div>
                <div>
                  <span className="text-gray-500">Stone Weight:</span>
                  <p>{stoneTotal.toFixed(3)}g</p>
                </div>
                <div>
                  <span className="text-gray-500">Gross Weight:</span>
                  <p>{grossTotal.toFixed(3)}g</p>
                </div>
                <div>
                  <span className="text-gray-500">Stone Charges:</span>
                  <p>₹{stoneChargesTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={async () => {
                  const pdfBytes = await generatePDF(currentModel);
                  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                  const url = window.URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }}
                className="w-full text-sm"
              >
                Preview PDF
              </Button>
            </div>
          </div>
        );
      })() : (
        <div className="aspect-square w-full flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500 text-sm">Select a model to preview</p>
        </div>
      )}
    </div>
  </div> */}

  {/* Preview Sidebar */}
{/* Preview Sidebar */}
{previewData && (
  <div className="w-[350px] mt-[100px] space-y-4">
    <div className="sticky top-[100px] bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center  mb-4">
        <h2 className="text-lg font-semibold">Model Preview</h2>
        <button
          onClick={() => setPreviewData(null)}
          className="text-red-600 font-bold text-lg hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className='maincontent'>
         

        {(() => {
          const model = selectedModels[previewData.modelIndex];
          const pc = model?.pcs?.[previewData.pcIndex];
          console.log(`${apiBaseUrl}${model.imageUrl}`);
          if (!model || !pc) return <p>No data</p>;

          return (
            <>
              {/* Image */}
              <div className="aspect-square w-full relative rounded-lg overflow-hidden border border-gray-200">
                {model.modelName ? (
                  <img
                    src={`${imageUrl}${model.modelName}.png`}
                    alt={`Model ${model.modelName}`}
                    crossOrigin="anonymous"    // 👈 Add this
                    className="w-full h-full object-contain"
                     onError={(e) => {
                      const target = e.currentTarget;
                      console.warn("Image load failed, trying fallback for:", target.src);
                      if (target.src.endsWith(".png")) {
                        target.src = `${imageUrl}${model.modelName}.jpg`;
                      } else if (target.src.endsWith(".jpg")) {
                        target.src = `${imageUrl}${model.modelName}.jpeg`;
                      } else {
                        target.src = noimage.src;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="text-sm text-gray-600 mt-4">
                <p className="font-medium">Model Name : {model.modelName}</p>
                <p>
                  Unique No #: {model.uniqueNumber}-{previewData.pcIndex + 1}
                </p>

                <div className="mt-3 border rounded p-2 text-black font-bold ">
                  <p className="font-bold">Pc #{previewData.pcIndex + 1}</p>
                  <p>Net Weight: {pc.netWeight?.toFixed(3)}g</p>
                  <p>Stone Weight: {pc.stoneWeight?.toFixed(3)}g</p>
                  <p>Gross Weight: {pc.grossWeight?.toFixed(3)}g</p>
                  <p>Stone Charges: ₹{pc.stoneCharges?.toFixed(2)}</p>
                </div>

          

              </div>
            </>
          );
      })()}
      
      
          </div>

    <button
        onClick={handlePreviewPDFOne}
        className="p-2 text-white text-xs bg-blue-600 rounded hover:bg-blue-700 block mx-auto"
      >
        Preview PDF
      </button>

    </div>



  </div>
  
)}





  
</div>

  );
};

export default NewTagging;
