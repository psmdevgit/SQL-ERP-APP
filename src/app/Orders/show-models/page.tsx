"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { PDFDocument, StandardFonts, rgb, degrees, PDFPage, PDFFont } from "pdf-lib";

// import COMPANY_LOGO from "@/assets/PothysLogo.png"

import COMPANY_LOGO from "@/assets/appLogo.png"

const apiBaseUrl = "https://kalash.app";

// const apiBaseUrl = "http://localhost:4001";
const fallbackImage = "/noimage.png"; // put your fallback in /public folder

const imageBaseUrl = "https://psmport.pothysswarnamahalapp.com/FactoryModels/";

interface OrderDetails {
  orderId: string;
  partyName: string;
  deliveryDate: string;
  advanceMetal: string;
  status: string;
  purity: string;
  remarks: string;
  createdBy: string;
  createdDate: string;
  category: string;
}

interface ModelDetails {
  id: string;
  name: string;
  category: string;
  purity: string;
  size: string;
  color: string;
  quantity: string;
  grossWeight: string;
  stoneWeight: string;
  netWeight: string;
  batchNo: string;
  treeNo: string;
  remarks: string;
  orderSheet?: string;
  orderImageSheet?: string;
}

const OrderDetailsPage = () => {
  const [data, setData] = useState<{ orderDetails: OrderDetails; regularModels: ModelDetails[]; canceledModels: ModelDetails[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!orderId) {
        console.log('No orderId provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/order-details?orderId=${orderId}`);
        const result = await response.json();
        
        console.log('API Response:', result);
        console.log('Models data:', result.data?.models);
        
        if (result.success) {
          setData(result.data);
        } else {
          console.error('API request failed:', result);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orderId]);

  console.log('Current data:', data);
  console.log('Regular models:', data?.regularModels);
  console.log('Canceled models:', data?.canceledModels);

  const handleApproveOrder = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`${apiBaseUrl}/api/update-order-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Order approved successfully');
        // Optionally refresh the data
        window.location.reload();
      } else {
        toast.error(result.message || 'Failed to approve order');
      }
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve order');
    } finally {
      setIsUpdating(false);
      setShowConfirmation(false);
    }
  };

  // printing the pdf   ============================================================================================

  async function handlePrintOrderPDF() {
  setIsLoadingPDF(true);
  const minDelay = new Promise(res => setTimeout(res, 2000));

  try {
    const orderInfo: OrderDetails = {
      orderId: data?.orderDetails?.orderId || "-",
      partyName: data?.orderDetails?.partyName || "-",
      deliveryDate: data?.orderDetails?.deliveryDate || "-",
      advanceMetal: data?.orderDetails?.advanceMetal || "-",
      status: data?.orderDetails?.status || "-",
      purity: data?.orderDetails?.purity || "-",
      remarks: data?.orderDetails?.remarks || "-",
      createdBy: data?.orderDetails?.createdBy || "-",
      createdDate: data?.orderDetails?.createdDate || "-",
      category: data?.orderDetails?.category || "-",
    };

    const orderItems = data?.regularModels || [];

    const [pdfBlob] = await Promise.all([
      createOrderPDF(orderInfo, orderItems),
      minDelay,
    ]);

    openPDFAndPrint(pdfBlob);
  } catch (err) {
    console.error(err);
  } finally {
    setIsLoadingPDF(false);
  }
}

async function handlePrintImagePDF() {
  setIsLoadingPDF(true);
  const minDelay = new Promise(res => setTimeout(res, 2000));

  try {
    const pdfDoc = await PDFDocument.create();

    await Promise.all([
      generateImagesOnlyPDF(pdfDoc, data.regularModels),
      minDelay,
    ]);

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

    openPDFAndPrint(pdfBlob);
  } catch (err) {
    console.error(err);
  } finally {
    setIsLoadingPDF(false);
  }
}

function openPDFAndPrint(pdfBlob: Blob) {
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const printWindow = window.open(pdfUrl, "_blank");
  if (!printWindow) return;

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
}


  //================================================================================================================

// async function handleDownloadPDF() {
//   try {
//     console.log("checking data", data);

//     const orderInfo: OrderDetails = {
//       orderId: data?.orderDetails?.orderId || "-",
//       partyName: data?.orderDetails?.partyName || "-",
//       deliveryDate: data?.orderDetails?.deliveryDate || "-",
//       advanceMetal: data?.orderDetails?.advanceMetal || "-",
//       status: data?.orderDetails?.status || "-",
//       purity: data?.orderDetails?.purity || "-",
//       remarks: data?.orderDetails?.remarks || "-",
//       createdBy: data?.orderDetails?.createdBy || "-",
//       createdDate: data?.orderDetails?.createdDate || "-",
//       category: data?.orderDetails?.category || "-",
//     };

//     const orderItems: ModelDetails[] = data?.regularModels || [];

//     // Generate PDF blob
//     const pdfBlob = await createOrderPDF(orderInfo, orderItems);

//     // Create blob URL
//     const pdfUrl = URL.createObjectURL(pdfBlob);

//     // ✅ Open PDF in new tab
//     window.open(pdfUrl, "_blank");

//     // ✅ Trigger automatic download
//     // const link = document.createElement("a");
//     // link.href = pdfUrl;
//     // link.download = `${orderInfo.orderId || "Order"}.pdf`;
//     // link.style.display = "none";
//     // document.body.appendChild(link);
//     // link.click();
//     // document.body.removeChild(link);

//     // Optional: revoke URL after a short delay (so tab loads first)
//     setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
//   } catch (error) {
//     console.error("PDF generation failed:", error);
//   }
// }

const [isLoadingPDF, setIsLoadingPDF] = useState(false);

async function handleDownloadPDF() {
  const startTime = Date.now();
  setIsLoadingPDF(true);
  

  try {
    console.log("checking data", data);

    const orderInfo: OrderDetails = {
      orderId: data?.orderDetails?.orderId || "-",
      partyName: data?.orderDetails?.partyName || "-",
      deliveryDate: data?.orderDetails?.deliveryDate || "-",
      advanceMetal: data?.orderDetails?.advanceMetal || "-",
      status: data?.orderDetails?.status || "-",
      purity: data?.orderDetails?.purity || "-",
      remarks: data?.orderDetails?.remarks || "-",
      createdBy: data?.orderDetails?.createdBy || "-",
      createdDate: data?.orderDetails?.createdDate || "-",
      category: data?.orderDetails?.category || "-",
    };

    const orderItems: ModelDetails[] = data?.regularModels || [];

    // Generate PDF
    const pdfBlob = await createOrderPDF(orderInfo, orderItems);

    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
  } catch (error) {
    console.error("PDF generation failed:", error);
  } finally {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(2000 - elapsed, 0);

    setTimeout(() => {
      setIsLoadingPDF(false);
    }, remaining);
  }
}


// async function handleImagePDF() {
//   try {
//     if (!data?.regularModels?.length) {
//       alert("No models available");
//       return;
//     }

//     // 🧾 Step 1: Create a new PDF document
//     const pdfDoc = await PDFDocument.create();

//     console.log("models ",data.regularModels)

//     // 🖼️ Step 2: Generate all model pages
//     await generateImagesOnlyPDF(pdfDoc, data.regularModels);

//     // 💾 Step 3: Save and open the PDF
//     const pdfBytes = await pdfDoc.save();
//     const blob = new Blob([pdfBytes], { type: "application/pdf" });
//     const pdfUrl = URL.createObjectURL(blob);

//     // Open PDF in a new tab
//     window.open(pdfUrl, "_blank");

//     // Trigger auto download
//     // const link = document.createElement("a");
//     // link.href = pdfUrl;
//     // link.download = `${data?.orderDetails?.orderId || "Order"}_Images.pdf`;
//     // document.body.appendChild(link);
//     // link.click();
//     // document.body.removeChild(link);

//     // Clean up
//     setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
//   } catch (error) {
//     console.error("❌ PDF generation failed:", error);
//   }
// }

async function handleImagePDF() {
  setIsLoadingPDF(true);

  // ⏱️ Minimum loader time
  const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

  try {
    if (!data?.regularModels?.length) {
      alert("No models available");
      return;
    }

    // 🧾 Create PDF
    const pdfDoc = await PDFDocument.create();

    console.log("models", data.regularModels);

    // 🔄 Run PDF generation + min delay in parallel
    await Promise.all([
      generateImagesOnlyPDF(pdfDoc, data.regularModels),
      minDelay,
    ]);

    // 💾 Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(blob);

    // 🖨️ Open PDF
    window.open(pdfUrl, "_blank");

    // 🧹 Cleanup
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
  } finally {
    setIsLoadingPDF(false);
  }
}

async function generateImagesOnlyPDF(pdfDoc, models) {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const model of models) {
    if (!model.name) continue;

    try {
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      const margin = 50;

      // Caption
      const caption = `${model.category || ""} - ${model.name}`;
      const captionWidth = boldFont.widthOfTextAtSize(caption, 14);
      page.drawText(caption, {
        x: (width - captionWidth) / 2,
        y: height - margin,
        size: 14,
        font: boldFont,
      });

      // 🧩 Step 1: Try fetching model image
      let imageBytes = null;
      const extensions = [".png", ".jpg", ".jpeg"];
      for (const ext of extensions) {
        const url = `${imageBaseUrl}${model.name}${ext}`;
        
        try {
          // const res = await fetch(url);

            const res = await fetch(
  `${apiBaseUrl}/get-model-image?name=${model.name}`
);

          
          if (res.ok) {
            imageBytes = await res.arrayBuffer();
            console.log(`✅ Found image for ${model.name}: ${url}`);
            break;
          }
        } catch (err) {
          console.warn(`❌ Error fetching ${url}`, err);
        }
      }

      // 🧩 Step 2: Fallback to default
      if (!imageBytes) {
        console.warn(`⚠️ No valid image found for ${model.name}, using fallback.`);
        const res = await fetch(fallbackImage);
        imageBytes = await res.arrayBuffer();
      }

      // 🧩 Step 3: Embed image
      let embeddedImage;
      try {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } catch {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      // 🧩 Step 4: Draw image centered
      const imgWidth = 300;
      const imgHeight = 300;
      const xOffset = (width - imgWidth) / 2;
      const yOffset = (height - imgHeight) / 2 + 40;
      page.drawImage(embeddedImage, {
        x: xOffset,
        y: yOffset,
        width: imgWidth,
        height: imgHeight,
      });

      // 🧩 Step 5: Draw model details
      const details = [
        `Model: ${model.name || "-"}`,
        `Size: ${model.size || "-"}`,
        `Net Weight: ${model.netWeight || "-"}`,
        `Stone Weight: ${model.stoneWeight || "-"}`,
        `Gross Weight: ${model.grossWeight || "-"}`,
        `Quantity: ${model.quantity || "-"}`,
      ];

      let yText = yOffset - 40;
      details.forEach((line) => {
        const textWidth = font.widthOfTextAtSize(line, 10);
        page.drawText(line, {
          x: (width - textWidth) / 2,
          y: yText,
          size: 10,
          font,
        });
        yText -= 20;
      });
    } catch (err) {
      console.error(`❌ Error generating page for ${model.name}:`, err);
    }
  }

  // 🧩 Step 6: Add page numbers
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width } = page.getSize();
    page.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: width - 100,
      y: 30,
      size: 10,
      font,
    });
  }

  return pdfDoc;
}

async function createOrderPDF(orderInfo: OrderDetails, orderItems: ModelDetails[]) {
  let totalQuantity = 0;
  let totalWeight = 0;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 35;
  const lineHeight = 20;
  const cellPadding = 5;

  function getWrappedTextAndHeight(rawText: any, maxWidth: number, fontSize: number) {
    const text = String(rawText ?? "");
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const width = font.widthOfTextAtSize(currentLine + " " + words[i], fontSize);
      if (width < maxWidth - cellPadding * 2) currentLine += " " + words[i];
      else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return {
      lines,
      height: Math.max(lineHeight, lines.length * (fontSize + 2) + cellPadding * 2),
    };
  }

  function drawWrappedText(rawText: any, x: number, y: number, maxWidth: number, fontSize: number, page: PDFPage, isHeader = false, isTotal = false) {
    const { lines } = getWrappedTextAndHeight(rawText, maxWidth, fontSize);
    let currentY = y - cellPadding;
    lines.forEach((line) => {
      page.drawText(line, {
        x: x + cellPadding,
        y: currentY - fontSize,
        size: fontSize,
        font: isHeader || isTotal ? boldFont : font,
      });
      currentY -= fontSize + 2;
    });
  }

  function drawTableCell(x: number, y: number, width: number, height: number, rawText: any, page: PDFPage, isHeader = false, isTotal = false) {
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
      color: isHeader ? rgb(0.95, 0.95, 0.95) : isTotal ? rgb(0.9, 0.9, 1) : rgb(1, 1, 1),
    });
    if (String(rawText ?? "").length > 0) {
      drawWrappedText(rawText, x, y, width, 10, page, isHeader, isTotal);
    }
  }

  function drawWatermark(page: PDFPage, logo?: PDFImage) {
    const { width, height } = page.getSize();
    page.drawText("Kalash jewellers Pvd Ltd", {
      x: width / 2 - 150,
      y: height / 2,
      size: 60,
      font: boldFont,
      opacity: 0.07,
      rotate: degrees(-45),
    });
    if (logo) {
      const watermarkWidth = width * 0.7;
      const watermarkHeight = (watermarkWidth * logo.height) / logo.width;
      page.drawImage(logo, {
        x: (width - watermarkWidth) / 2,
        y: (height - watermarkHeight) / 2,
        width: watermarkWidth,
        height: watermarkHeight,
        opacity: 0.05,
      });
    }
  }

  // --- Company Logo ---
  const logoImageBytes = await fetch(COMPANY_LOGO.src).then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoImageBytes);

  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  drawWatermark(page, logoImage);

  // let y = 800;
  // const logoWidth = 50;
  // const logoHeight = (logoWidth * logoImage.height) / logoImage.width;

  // // Header
  // page.drawImage(logoImage, { x: margin, y: y - logoHeight + 16, width: logoWidth, height: logoHeight });
  // page.drawText("Kalash jewellers Pvd Ltd Order Invoice", { x: margin + logoWidth + 10, y, size: 16, font: boldFont });
  // y -= Math.max(logoHeight, 25);


  let y = 820;

const logoWidth = 50;
const logoHeight = (logoWidth * logoImage.height) / logoImage.width;

// 🔹 Calculate vertical center line
const centerY = y - logoHeight / 2;

// Draw logo
page.drawImage(logoImage, {
  x: margin,
  y: y - logoHeight,
  width: logoWidth,
  height: logoHeight,
});

// Draw text centered to logo
page.drawText("Kalash jewellers Pvt Ltd Order Invoice", {
  x: margin + logoWidth + 10,
  y: centerY - 6, // 👈 fine-tune text baseline
  size: 16,
  font: boldFont,
});

// Move cursor down
y -= logoHeight + 10;


  // --- Order Details ---
  const detailsColumnWidths = [150, 350];
  const orderDetailsTable = [
    ["Order No :", orderInfo.orderId ?? "-"],
    ["Party Ledger :", orderInfo.partyName ?? "-"],
    ["Product :", orderInfo.category ?? "-"],
    ["Metal Purity :", orderInfo.purity ?? "-"],
    ["Advance Metal :", orderInfo.advanceMetal ?? "-"],
    ["Delivery Date :", orderInfo.deliveryDate ?? "-"],
    ["Created Date :", orderInfo.createdDate ?? "-"],
    ["Created By :", orderInfo.createdBy ?? "-"],
    ["Date :", new Date().toLocaleDateString()],
    // ["Remarks : ", orderInfo.remarks ?? "-"],
  ];

  orderDetailsTable.forEach(([label, value]) => {
    const height = Math.max(
      getWrappedTextAndHeight(label, detailsColumnWidths[0], 10).height,
      getWrappedTextAndHeight(value, detailsColumnWidths[1], 10).height
    );
    drawTableCell(margin, y, detailsColumnWidths[0], height, label, page, true);
    drawTableCell(margin + detailsColumnWidths[0], y, detailsColumnWidths[1], height, value, page);
    y -= height;
  });

  y -= lineHeight * 2;

     //---------------------------------------------------------------------------------------
    
  const remark = orderInfo.remarks.trim();

  page.drawText("Order Remark", { x: margin, y, size: 14, font: boldFont });
      y -= lineHeight *1;

    let newLine = orderInfo.remarks ;
    
newLine = newLine.replace(/[\r\n]+/g, " ").trim();
      //  const newLine = "This is a single-line paragraph.rfgokin uwiorgh9iwpe wue9h9wiuej 8w90efjwiqe0jf 09weijf9i0wejf i0wehjf i0wefh9uiwehfiwuefhweiqufhbwepiufnb9weufhw9eiuf";
page.drawText(newLine, {
  x: margin,      // left margin
  y: y,           // current vertical position
  size: 10,       // font size
  font: boldFont, // or font
  maxWidth: page.getWidth() - margin * 2, // optional, text will be cut if too long
});
 y -= lineHeight *2;




    //----------------------------------------------------------------------------------------


  // --- Items Table ---
  page.drawText("Order Items", { x: margin, y, size: 14, font: boldFont });
  y -= lineHeight * 1.5;

  const headers = ["Design", "Model Name", "Weight", "Size", "Quantity", "Total Weight", "Remarks"];
  const columnWidths = [80, 120, 60, 60, 60, 80, 80];

  let currentX = margin;
  headers.forEach((header, i) => {
    drawTableCell(currentX, y, columnWidths[i], lineHeight, header, page, true);
    currentX += columnWidths[i];
  });
  y -= lineHeight;

  // --- Iterate Items ---
  for (const item of orderItems) {
    const quantity = parseInt(String(item.quantity ?? "0")) || 0;   
    const weightValue =  parseInt(String(item.grossWeight ?? "0")) || 0;
    const itemTotalWeight = weightValue * quantity;

    totalQuantity += quantity;
    totalWeight += itemTotalWeight;

    const rowHeight = 60;
    currentX = margin;
    drawTableCell(currentX, y, columnWidths[0], rowHeight, "", page);

    // --- ✅ Fetch image directly using item.name ---
if (item.name) {
  try {
    const resp = await fetch(
      `${apiBaseUrl}/get-model-image?name=${item.name}&t=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!resp.ok) {
      console.warn("Image not found:", item.name);
      return;
    }

    const arr = await resp.arrayBuffer();

    if (!arr || arr.byteLength < 1000) {
      console.warn("Invalid image:", item.name);
      return;
    }

    const bytes = new Uint8Array(arr);

    // 🔥 Detect file type using magic numbers
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47;

    let pdfImage;

    if (isJpeg) {
      pdfImage = await pdfDoc.embedJpg(arr);
    } else if (isPng) {
      pdfImage = await pdfDoc.embedPng(arr);
    } else {
      console.warn("Unsupported image format:", item.name);
      return;
    }

    const maxWidth = columnWidths[0] - 10;
    const maxHeight = rowHeight - 10;

    const scale = Math.min(
      maxWidth / pdfImage.width,
      maxHeight / pdfImage.height
    );

    const width = pdfImage.width * scale;
    const height = pdfImage.height * scale;

    const xOffset = margin + (columnWidths[0] - width) / 2;
    const yOffset = y - rowHeight + (rowHeight - height) / 2;

    page.drawImage(pdfImage, {
      x: xOffset,
      y: yOffset,
      width,
      height
    });

  } catch (err) {
    console.error(`Image error for ${item.name}`, err);
  }
}
    currentX += columnWidths[0];
    const values = [
      item.name ?? "-",
      String(weightValue),
      item.size ?? "-",
      String(quantity),
      itemTotalWeight.toFixed(2),
      item.remarks ?? "-",
    ];
    values.forEach((val, i) => {
      drawTableCell(currentX, y, columnWidths[i + 1], rowHeight, val, page);
      currentX += columnWidths[i + 1];
    });

    y -= rowHeight;

    if (y < 120) {
      page = pdfDoc.addPage([595.28, 841.89]);
      drawWatermark(page, logoImage);
      y = 800;
      currentX = margin;
      headers.forEach((header, idx) => {
        drawTableCell(currentX, y, columnWidths[idx], lineHeight, header, page, true);
        currentX += columnWidths[idx];
      });
      y -= lineHeight;
    }
  }

  // --- Totals row ---
  currentX = margin;
  const totalRow = ["", "TOTAL", "", "", String(totalQuantity), totalWeight.toFixed(2), ""];
  totalRow.forEach((val, idx) => {
    drawTableCell(currentX, y, columnWidths[idx], lineHeight, val, page, false, true);
    currentX += columnWidths[idx];
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Failed to load order details</div>
      </div>
    );
  }

  // Separate models by status
  const regularModels = data?.regularModels || [];
  const canceledModels = data?.canceledModels || [];

  return (
    // className="main-content" 
    <div  className={isLoadingPDF ? " pointer-events-none select-none" : ""}
      style={{ 
        marginLeft: '250px', 
        width: 'calc(100% - 250px)', 
        height: 'calc(100vh - 64px)', 
        padding: '20px', 
        backgroundColor: '#f5f5f5',
        overflowY: 'auto',
        top: '64px',
        position: 'fixed'
      }}
    >
 

      <div className="container mx-auto px-4" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 'min-content'
        }}
      >
        {/* Order Details Section */}
        <div className="bg-white shadow rounded-lg mb-6 w-full">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-600">Order ID</label>
                <p className="font-medium">{data.orderDetails.orderId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Party Name</label>
                <p className="font-medium">{data.orderDetails.partyName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Delivery Date</label>
                <p className="font-medium">
                  {new Date(data.orderDetails.deliveryDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <p className="font-medium">{data.orderDetails.status}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Purity</label>
                <p className="font-medium">{data.orderDetails.purity}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Advance Metal</label>
                <p className="font-medium">{data.orderDetails.advanceMetal}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Created By</label>
                <p className="font-medium">{data.orderDetails.createdBy}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Created Date</label>
                <p className="font-medium">
                  {new Date(data.orderDetails.createdDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Remarks</label>
                <p className="font-medium">{data.orderDetails.remarks || '-'}</p>
              </div>
            </div>
          </div>
          
        </div>

        <div className="mb-6">
                {data?.regularModels?.[0] && (
          <button
            onClick={() => handleDownloadPDF()}
              disabled={isLoadingPDF}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-file-pdf"></i> 
            {/*Download Order Sheet*/} 
            {isLoadingPDF ? "Preparing PDF..." : "Download PDF"}
          </button>

          
        )}
         <button
    onClick={handlePrintOrderPDF}
    disabled={isLoadingPDF}
    className="btn btn-outline-success"
    title="Print Order PDF"
  >
    <i className="fa-solid fa-print"></i>
  </button>
  
         {data?.regularModels?.[0] && (
          <button className="ms-3"
            onClick={() => handleImagePDF()}
             disabled={isLoadingPDF}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#3184F7',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-file-pdf"></i> Download Image Sheet
          </button>
        )}

        <button
          onClick={handlePrintImagePDF}
          disabled={isLoadingPDF}
          className="btn "
          title="Print Image PDF"
        >
          <i className="fa-solid fa-print"></i>
        </button>
        
        </div>


        {/* Regular Models Table */}
        {regularModels.length > 0 && (
          <div className="bg-white shadow rounded-lg mb-6 w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Model Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stone Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tree No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regularModels.map((model) => (
                    <tr key={model.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{model.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.grossWeight}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.stoneWeight}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.netWeight}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.batchNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.treeNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Canceled Models Table */}
        {canceledModels.length > 0 && (
          <div className="bg-white shadow rounded-lg mb-6 w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-red-600">Canceled Model Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stone Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Weight</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tree No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {canceledModels.map((model) => (
                    <tr key={model.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{model.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.grossWeight}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.stoneWeight}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.netWeight}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.batchNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.treeNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{model.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Download buttons section */}
        {/* <div style={{ 
          display: 'flex', 
          gap: '15px', 
          padding: '20px 0',
          marginTop: 'auto'
        }}>




          {data?.regularModels?.[0]?.orderSheet && (
            <a
              href={ `${apiBaseUrl}${data.regularModels[0].orderSheet}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              <i className="fa-solid fa-file-pdf"></i>
              Download Order Sheet
            </a>
          )}

          {data?.regularModels?.[0]?.orderImageSheet && (
            <a
              href={ `${apiBaseUrl}${data.regularModels[0].orderImageSheet} `}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              <i className="fa-solid fa-file-image"></i>
              Download Image Sheet
            </a>
          )}

          {canceledModels[0]?.orderSheet && (
            <a
              href={canceledModels[0].orderSheet}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#FF5722',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              <i className="fa-solid fa-file-pdf"></i>
              Download Canceled Order Sheet
            </a>
          )}

          {canceledModels[0]?.orderImageSheet && (
            <a
              href={canceledModels[0].orderImageSheet}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#F44336',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none'
              }}
            >
              <i className="fa-solid fa-file-image"></i>
              Download Canceled Image Sheet
            </a>
          )}
        </div> */}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Confirm Approval</h3>
            <p style={{ marginBottom: '24px' }}>
              Are you sure you want to approve this order? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApproveOrder}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoadingPDF && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4 rounded-xl bg-white/90 px-8 py-6 shadow-lg">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      <p className="text-sm font-medium text-gray-700">
        Preparing PDF…
      </p>
    </div>
  </div>
)}


    </div>

    
  );
};

export default OrderDetailsPage;
