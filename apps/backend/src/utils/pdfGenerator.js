import PDFDocument from "pdfkit";

/**
 * PDF Report Generator for Test Results
 * Creates professional medical reports for different test types
 *
 * CUSTOMIZATION NOTES:
 * - Header shows lab-specific name from healthCenterId.name
 * - Address built from addressLine1, addressLine2, district, province
 * - Contact info from phoneNumber and email fields
 * - Signature area includes placeholder for manual signatures (print scenarios)
 *
 * FUTURE ENHANCEMENTS (Post-Evaluation):
 * - Logo support: Add logoPath field to Lab model, use doc.image() to display
 * - Lab registration number: Add registrationNumber field, display in header
 * - Accreditation info: Add accreditationBody field for official credentials
 * - QR code: Generate QR with verification URL for authenticity checks
 * - Watermark: Add "COPY" watermark for printed copies vs original
 * - Medical director: Add medicalDirectorName, medicalDirectorSignature fields
 *
 * HARD COPY SUPPORT:
 * - Footer includes signature placeholder for printed reports
 * - Disclaimer differentiates digital vs printed report authentication
 * - Lab stamp area reserved in footer for official documentation
 */

/**
 * Generate PDF report for a test result
 * @param {Object} testResult - Test result with populated references
 * @returns {Promise<string>} - Path to generated PDF file
 */
export const generateTestResultPDF = (testResult) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      // Collect PDF data chunks in memory — return Buffer, never touch disk or cloud
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Generate report based on discriminator type
      const discriminator = testResult.constructor.modelName;

      console.log("[PDF Generator] Discriminator type:", discriminator);

      switch (discriminator) {
        case "BloodGlucose":
          generateBloodGlucoseReport(doc, testResult);
          break;
        case "Hemoglobin":
          generateHemoglobinReport(doc, testResult);
          break;
        case "BloodPressure":
          generateBloodPressureReport(doc, testResult);
          break;
        case "Pregnancy":
          generatePregnancyReport(doc, testResult);
          break;
        case "XRay":
        case "ECG":
        case "Ultrasound":
        case "AutomatedReport":
          generateGenericReport(doc, testResult);
          break;
        default:
          console.warn(
            "[PDF Generator] Unknown discriminator, using generic report",
          );
          generateGenericReport(doc, testResult);
      }

      // Finalize PDF — triggers data/end events
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Add report header with logo and center information
 * Customizable per lab for professional branding
 */
const addReportHeader = (doc, healthCenter) => {
  // Lab-specific name (not hardcoded)
  const labName = healthCenter?.name || "Medical Laboratory";
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(labName.toUpperCase(), { align: "center" });

  doc
    .fontSize(12)
    .font("Helvetica")
    .text("Medical Laboratory Report", { align: "center" });

  // Health Center Info (if available)
  if (healthCenter) {
    doc.moveDown(0.5);

    // Build complete address from lab schema fields
    const addressParts = [];
    if (healthCenter.addressLine1) addressParts.push(healthCenter.addressLine1);
    if (healthCenter.addressLine2) addressParts.push(healthCenter.addressLine2);
    if (healthCenter.district) addressParts.push(healthCenter.district);
    if (healthCenter.province) addressParts.push(healthCenter.province);

    if (addressParts.length > 0) {
      doc.fontSize(9).text(addressParts.join(", "), { align: "center" });
    }

    // Contact information
    if (healthCenter.phoneNumber) {
      doc
        .fontSize(9)
        .text(`Tel: ${healthCenter.phoneNumber}`, { align: "center" });
    }
    if (healthCenter.email) {
      doc.fontSize(9).text(`Email: ${healthCenter.email}`, { align: "center" });
    }
  }

  // Horizontal line
  doc
    .moveDown(1)
    .strokeColor("#333333")
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown(1);
};

/**
 * Add patient information section
 */
const addPatientInfo = (doc, testResult) => {
  const patient = testResult.patientProfileId;
  const yStart = doc.y;

  // Section heading with light gray background band
  doc
    .rect(50, yStart, 495, 18)
    .fill("#F0F0F0");
  doc
    .fillColor("#000000")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Patient Information", 55, yStart + 3);

  // Capture data start Y BEFORE writing any column — both columns must start here
  const dataStartY = yStart + 26;

  doc.fontSize(10).font("Helvetica");

  // Left column — patient demographics
  const leftX = 55;
  let leftY = dataStartY;
  const lineH = 18;

  if (patient?.full_name) {
    doc.text(`Patient Name: ${patient.full_name}`, leftX, leftY);
    leftY += lineH;
  }
  if (patient?.date_of_birth) {
    const age = Math.floor(
      (new Date() - new Date(patient.date_of_birth)) /
        (365.25 * 24 * 60 * 60 * 1000),
    );
    doc.text(`Age: ${age} years`, leftX, leftY);
    leftY += lineH;
  }
  if (patient?.gender) {
    doc.text(`Gender: ${patient.gender}`, leftX, leftY);
    leftY += lineH;
  }

  // Right column — report metadata — starts at the SAME dataStartY as left column
  const rightX = 320;
  let rightY = dataStartY;

  if (testResult.bookingId?.bookingDate) {
    doc.text(
      `Collection Date: ${new Date(testResult.bookingId.bookingDate).toLocaleDateString()}`,
      rightX,
      rightY,
      { width: 225 },
    );
    rightY += lineH;
  }
  doc.text(
    `Report Date: ${new Date(testResult.releasedAt || Date.now()).toLocaleDateString()}`,
    rightX,
    rightY,
    { width: 225 },
  );
  rightY += lineH;
  doc.text(`Report ID: ${testResult._id}`, rightX, rightY, { width: 225 });
  rightY += lineH;

  // Advance Y past both columns with a small bottom margin
  doc.y = Math.max(leftY, rightY) + 12;

  // Horizontal line
  doc
    .strokeColor("#333333")
    .lineWidth(0.5)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown(0.8);
};

/**
 * Add test results section header
 */
const addResultsHeader = (doc, testName) => {
  const y = doc.y;
  doc.rect(50, y, 495, 18).fill("#F0F0F0");
  doc
    .fillColor("#000000")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Test Results", 55, y + 3);
  doc.y = y + 26;
  doc.fontSize(10).font("Helvetica").text(`Test Type: ${testName}`, 55);
  doc.moveDown(0.8);
};

/**
 * Add result row with interpretation
 */
const addResultRow = (
  doc,
  parameter,
  value,
  unit,
  referenceRange,
  interpretation,
) => {
  const yPos = doc.y;

  // Parameter name
  doc.fontSize(10).font("Helvetica").text(parameter, 50, yPos, { width: 150 });

  // Value with unit
  doc
    .font("Helvetica-Bold")
    .text(`${value} ${unit}`, 210, yPos, { width: 100 });

  // Reference range
  doc.font("Helvetica").text(referenceRange, 320, yPos, { width: 120 });

  // Interpretation
  let color = "#000000";
  if (interpretation.toLowerCase().includes("high")) {
    color = "#D32F2F"; // Red
  } else if (interpretation.toLowerCase().includes("low")) {
    color = "#1976D2"; // Blue
  } else if (interpretation.toLowerCase().includes("normal")) {
    color = "#388E3C"; // Green
  }

  doc.fillColor(color).text(interpretation, 450, yPos, { width: 95 });
  doc.fillColor("#000000"); // Reset color

  doc.moveDown(0.8);
};

/**
 * Add observations/notes section
 */
const addObservations = (doc, observations) => {
  if (observations && observations.trim()) {
    doc.moveDown(0.8);
    const y = doc.y;
    doc.rect(50, y, 495, 18).fill("#F0F0F0");
    doc
      .fillColor("#000000")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Observations / Notes:", 55, y + 3);
    doc.y = y + 26;
    doc.fontSize(10).font("Helvetica").text(observations, 55, doc.y, {
      align: "justify",
      width: 485,
    });
    doc.moveDown(0.5);
  }
};

/**
 * Add footer with signature area (prepared for both digital and print scenarios)
 */
const addFooter = (doc, testResult) => {
  doc.moveDown(1.5);

  // Horizontal line
  doc
    .strokeColor("#333333")
    .lineWidth(0.5)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();

  doc.moveDown(0.8);

  // Capture Y before writing either side so both align horizontally
  const sigY = doc.y;

  // Left side — Verified By block
  doc.fontSize(9).font("Helvetica").text("Verified By:", 50, sigY);

  const personnelName =
    testResult.testingPersonnelId?.fullName ||
    testResult.testingPersonnelId?.name ||
    "Lab Personnel";
  doc.font("Helvetica-Bold").text(personnelName, 50, sigY + 14);
  doc.font("Helvetica").text("Medical Laboratory Technician", 50, sigY + 26);

  // Right side — Date, aligned with "Verified By:" line
  doc.fontSize(9).font("Helvetica").text(
    `Date: ${new Date(testResult.releasedAt || Date.now()).toLocaleDateString()}`,
    400,
    sigY,
    { width: 145, align: "right" },
  );

  // Signature placeholder for print scenarios — below both sides
  doc.y = sigY + 42;
  doc.fontSize(8).font("Helvetica").fillColor("#999999");
  doc.text(
    "[For hard copy: Manual signature and official stamp required above]",
    50,
    doc.y,
    { align: "center", width: 495 },
  );

  // Disclaimer pinned to bottom of page
  doc
    .fontSize(8)
    .font("Helvetica-Oblique")
    .fillColor("#666666")
    .text(
      "This report is valid only with authorized signature and official stamp when collected as hard copy. " +
        "Digital reports are authenticated electronically. Results are based on the sample provided.",
      50,
      doc.page.height - 70,
      { align: "center", width: 495 },
    );

  doc.fillColor("#000000");
};

/**
 * Add table column headers with a tight underline rule.
 * The separator is drawn immediately below the text so it reads as
 * belonging to the headers, not the first data row.
 */
const addTableHeader = (doc) => {
  const headerY = doc.y;
  doc.fontSize(9).font("Helvetica-Bold");
  doc.text("Parameter",       50,  headerY, { width: 150 });
  doc.text("Result",          210, headerY, { width: 100 });
  doc.text("Reference Range", 320, headerY, { width: 120 });
  doc.text("Interpretation",  450, headerY, { width: 95  });

  // 9pt text is ~12px tall. Draw the rule at +15px (text + 3px breathing room).
  const lineY = headerY + 15;
  doc
    .strokeColor("#333333")
    .lineWidth(1)
    .moveTo(50, lineY)
    .lineTo(545, lineY)
    .stroke();

  // Advance cursor past the rule with a clear gap before the first data row.
  doc.y = lineY + 10;
};

/**
 * Close the result table with a thin bottom rule.
 * Visually separates results from the "Additional info" block below.
 */
const addTableFooter = (doc) => {
  doc
    .strokeColor("#AAAAAA")
    .lineWidth(0.5)
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .stroke();
  doc.y = doc.y + 8;
};

/**
 * Generate Blood Glucose Test Report
 */
const generateBloodGlucoseReport = (doc, testResult) => {
  addReportHeader(doc, testResult.healthCenterId);
  addPatientInfo(doc, testResult);
  addResultsHeader(doc, `Blood Glucose Test - ${testResult.glucoseTestType}`);

  // Reference ranges based on test type
  const getReferenceRange = (testType) => {
    switch (testType) {
      case "Fasting":
        return "70-100 mg/dL";
      case "Random":
        return "<200 mg/dL";
      case "Postprandial":
        return "<140 mg/dL";
      case "HbA1c":
        return "<5.7%";
      default:
        return "See guidelines";
    }
  };

  // Interpret result
  const interpretGlucose = (level, testType) => {
    switch (testType) {
      case "Fasting":
        if (level < 70) return "Low";
        if (level <= 100) return "Normal";
        if (level <= 125) return "Prediabetes";
        return "High (Diabetes)";
      case "Random":
        if (level < 70) return "Low";
        if (level < 140) return "Normal";
        if (level < 200) return "Elevated";
        return "High";
      case "Postprandial":
        if (level < 70) return "Low";
        if (level < 140) return "Normal";
        if (level < 200) return "Elevated";
        return "High";
      case "HbA1c":
        if (level < 5.7) return "Normal";
        if (level < 6.5) return "Prediabetes";
        return "Diabetes";
      default:
        return "See physician";
    }
  };

  addTableHeader(doc);

  // Add result
  const unit = testResult.glucoseTestType === "HbA1c" ? "%" : testResult.unit;
  addResultRow(
    doc,
    "Glucose Level",
    testResult.glucoseLevel,
    unit,
    getReferenceRange(testResult.glucoseTestType),
    interpretGlucose(testResult.glucoseLevel, testResult.glucoseTestType),
  );

  addTableFooter(doc);

  // Additional info
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica");
  doc.text(`Test Type: ${testResult.glucoseTestType}`, 55);
  doc.text(`Sample Type: ${testResult.sampleType}`, 55);
  doc.text(`Sample Quality: ${testResult.sampleQuality}`, 55);
  doc.text(
    `Collection Time: ${new Date(testResult.sampleCollectionTime).toLocaleString()}`,
    55,
  );
  if (testResult.fastingDuration) {
    doc.text(`Fasting Duration: ${testResult.fastingDuration} hours`, 55);
  }

  addObservations(doc, testResult.observations);
  addFooter(doc, testResult);
};

/**
 * Generate Hemoglobin Test Report
 */
const generateHemoglobinReport = (doc, testResult) => {
  addReportHeader(doc, testResult.healthCenterId);
  addPatientInfo(doc, testResult);
  addResultsHeader(doc, "Hemoglobin Test");

  // Reference ranges based on gender
  const getReferenceRange = (gender) => {
    // Default ranges if gender not specified
    if (!gender) return "12-16 g/dL";

    switch (gender.toLowerCase()) {
      case "male":
        return "13.5-17.5 g/dL";
      case "female":
        return "12.0-15.5 g/dL";
      default:
        return "12-16 g/dL";
    }
  };

  // Interpret result
  const interpretHemoglobin = (level, gender) => {
    const ranges = {
      male: { low: 13.5, normal: 17.5 },
      female: { low: 12.0, normal: 15.5 },
      default: { low: 12.0, normal: 16.0 },
    };

    const range = ranges[gender?.toLowerCase()] || ranges.default;

    if (level < range.low) return "Low (Anemia)";
    if (level <= range.normal) return "Normal";
    return "High";
  };

  addTableHeader(doc);

  // Add result
  const gender = testResult.patientProfileId?.gender;
  addResultRow(
    doc,
    "Hemoglobin Level",
    testResult.hemoglobinLevel,
    testResult.unit,
    getReferenceRange(gender),
    interpretHemoglobin(testResult.hemoglobinLevel, gender),
  );

  addTableFooter(doc);

  // Additional info
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica");
  doc.text(`Sample Type: ${testResult.sampleType}`, 55);
  doc.text(`Sample Quality: ${testResult.sampleQuality}`, 55);
  doc.text(`Testing Method: ${testResult.method}`, 55);
  doc.text(
    `Collection Time: ${new Date(testResult.sampleCollectionTime).toLocaleString()}`,
    55,
  );

  addObservations(doc, testResult.observations);
  addFooter(doc, testResult);
};

/**
 * Generate Blood Pressure Test Report
 */
const generateBloodPressureReport = (doc, testResult) => {
  addReportHeader(doc, testResult.healthCenterId);
  addPatientInfo(doc, testResult);
  addResultsHeader(doc, "Blood Pressure Test");

  // Interpret blood pressure
  const interpretBP = (systolic, diastolic) => {
    if (systolic < 90 || diastolic < 60) return "Low (Hypotension)";
    if (systolic < 120 && diastolic < 80) return "Normal";
    if (systolic < 130 && diastolic < 80) return "Elevated";
    if (systolic < 140 || diastolic < 90) return "High (Stage 1)";
    if (systolic < 180 || diastolic < 120) return "High (Stage 2)";
    return "Hypertensive Crisis";
  };

  addTableHeader(doc);

  // Add results
  addResultRow(
    doc,
    "Systolic Pressure",
    testResult.systolic,
    "mmHg",
    "90-120 mmHg",
    testResult.systolic < 90
      ? "Low"
      : testResult.systolic < 120
        ? "Normal"
        : "High",
  );

  addResultRow(
    doc,
    "Diastolic Pressure",
    testResult.diastolic,
    "mmHg",
    "60-80 mmHg",
    testResult.diastolic < 60
      ? "Low"
      : testResult.diastolic < 80
        ? "Normal"
        : "High",
  );

  addResultRow(
    doc,
    "Overall Assessment",
    `${testResult.systolic}/${testResult.diastolic}`,
    "mmHg",
    "<120/<80 mmHg",
    interpretBP(testResult.systolic, testResult.diastolic),
  );

  addTableFooter(doc);

  // Additional info
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica");
  doc.text(`Measurement Position: ${testResult.position}`, 55);
  doc.text(`Arm Used: ${testResult.arm}`, 55);
  if (testResult.heartRate) {
    doc.text(`Heart Rate: ${testResult.heartRate} bpm`, 55);
  }

  addObservations(doc, testResult.observations);
  addFooter(doc, testResult);
};

/**
 * Generate Pregnancy Test Report
 */
const generatePregnancyReport = (doc, testResult) => {
  addReportHeader(doc, testResult.healthCenterId);
  addPatientInfo(doc, testResult);
  addResultsHeader(doc, "Pregnancy Test");

  addTableHeader(doc);

  // Add result
  addResultRow(
    doc,
    "hCG Detection",
    testResult.result,
    "",
    "Negative",
    testResult.result === "Positive" ? "Pregnant" : "Not Pregnant",
  );

  addTableFooter(doc);

  // Additional info
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica");
  doc.text(`Test Type: ${testResult.pregnancyTestType}`, 55);
  doc.text(`Sample Type: ${testResult.sampleType}`, 55);
  doc.text(`Test Sensitivity: ${testResult.sensitivity} mIU/ml`, 55);

  addObservations(doc, testResult.observations);
  addFooter(doc, testResult);
};

/**
 * Generate generic report for other test types
 */
const generateGenericReport = (doc, testResult) => {
  addReportHeader(doc, testResult.healthCenterId);
  addPatientInfo(doc, testResult);
  addResultsHeader(doc, testResult.testTypeId?.name || "Medical Test");

  doc.fontSize(10).font("Helvetica");
  doc.text(
    "This is a generic test report. Detailed interpretation requires specialized medical review.",
    55,
  );

  // Check if there are uploaded files
  if (testResult.uploadedFiles && testResult.uploadedFiles.length > 0) {
    doc.moveDown(1);
    doc.font("Helvetica-Bold").text("Uploaded Files:", 55);
    doc.font("Helvetica");
    testResult.uploadedFiles.forEach((file, index) => {
      doc.text(`${index + 1}. ${file.fileName} (${file.mimeType})`, 55);
    });
  }

  addObservations(doc, testResult.observations);
  addFooter(doc, testResult);
};
