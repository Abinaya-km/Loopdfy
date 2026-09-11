// Generates a real, valid PDF file client-side that users can actually download and open!
export function createLoopedPdfBlob(filename: string = "acceptance.pdf"): Blob {
  const content = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 5 0 R
    >>
  >>
>>
endobj
4 0 obj
<<
  /Length 480
>>
stream
BT
/F1 24 Tf
50 720 Td
(LooPDfy - Official Certificate of Loop Acceptance) Tj
/F1 14 Tf
0 -40 Td
(You pulled hard. The loop pulled harder.) Tj
0 -30 Td
(File: ${filename}) Tj
0 -30 Td
(Status: Unlocked from link, then secretly relocked.) Tj
0 -30 Td
(Redirect Destination: https://the-loop-never-ends.example.com) Tj
0 -50 Td
(Congratulations on completing all 10 pulls.) Tj
0 -25 Td
(As promised by the handwritten note:) Tj
0 -25 Td
("because a fix that stays fixed isn't funny.") Tj
0 -60 Td
(Generated with humor by LooPDfy.) Tj
ET
endstream
endobj
5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000798 00000 n 
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
887
%%EOF`;

  return new Blob([content], { type: "application/pdf" });
}

export function downloadLoopedPdf(filename: string = "acceptance.pdf") {
  const blob = createLoopedPdfBlob(filename);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Generates a real, verified cleared PDF file client-side with exact byte offsets
export function createClearedPdfBlob(filename: string = "cleared_document.pdf", originalName?: string): Blob {
  const safeOriginal = (originalName || filename).replace(/[()\\]/g, "");
  const title = "LooPDfy - Cleared & Cleaned PDF";
  const line1 = `Original File: ${safeOriginal}`;
  const line2 = "Status: CLEARED (Surpassed all 10 rope pulls)";
  const line3 = "Redirect Links: Detected, Disarmed & Stripped Clean";
  const line4 = "Verification: All malicious loops sanitized successfully";
  const line5 = `Generated: ${new Date().toLocaleDateString()}`;
  const line6 = "Enjoy your clean document - from LooPDfy";

  const streamContent = [
    "BT",
    "/F1 22 Tf",
    "50 720 Td",
    `(${title}) Tj`,
    "/F1 12 Tf",
    "0 -42 Td",
    `(${line1}) Tj`,
    "0 -28 Td",
    `(${line2}) Tj`,
    "0 -28 Td",
    `(${line3}) Tj`,
    "0 -28 Td",
    `(${line4}) Tj`,
    "0 -28 Td",
    `(${line5}) Tj`,
    "0 -40 Td",
    `(${line6}) Tj`,
    "ET"
  ].join("\n");

  const streamLength = new TextEncoder().encode(streamContent).length;

  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";

  const header = "%PDF-1.4\n";
  const off1 = header.length;
  const off2 = off1 + obj1.length;
  const off3 = off2 + obj2.length;
  const off4 = off3 + obj3.length;
  const off5 = off4 + obj4.length;
  const startxref = off5 + obj5.length;

  const pad = (n: number) => n.toString().padStart(10, "0");
  const xref = `xref\n0 6\n0000000000 65535 f \n${pad(off1)} 00000 n \n${pad(off2)} 00000 n \n${pad(off3)} 00000 n \n${pad(off4)} 00000 n \n${pad(off5)} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  const fullPdf = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
  return new Blob([fullPdf], { type: "application/pdf" });
}

export function downloadClearedPdf(filename: string = "cleared_document.pdf", originalName?: string) {
  const cleanName = filename.startsWith("cleared_") ? filename : `cleared_${filename}`;
  const finalFilename = cleanName.endsWith(".pdf") ? cleanName : `${cleanName}.pdf`;
  const blob = createClearedPdfBlob(finalFilename, originalName);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

