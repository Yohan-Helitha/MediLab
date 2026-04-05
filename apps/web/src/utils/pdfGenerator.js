import { jsPDF } from 'jspdf';

// Load image as base64
const loadImageAsBase64 = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.log('Logo could not be loaded, continuing without it');
    return null;
  }
};

export const generateVisitPDF = async (visit, user) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Load logo image
  const logoBase64 = await loadImageAsBase64('/images/logo1.png');

  // Colors
  const brandColor = [14, 120, 107];
  const lightBrand = [232, 245, 242];
  const darkText = [20, 25, 35];
  const lightText = [100, 110, 130];
  const borderColor = [200, 210, 220];

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top accent bar
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Header section with logo area
  doc.setFillColor(...lightBrand);
  doc.rect(0, 8, pageWidth, 35, 'F');

  // Add logo image if available
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 15, 12, 18, 25);
  }

  // Hospital name and title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandColor);
  doc.setFontSize(16);
  doc.text('MEDILAB', 36, 25);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.setFontSize(9);
  doc.text('Healthcare System', 36, 32);

  // Document title on right
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.setFontSize(14);
  doc.text('CLINICAL VISIT RECORD', pageWidth - 70, 25);

  // Document number and date on right
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.setFontSize(8);
  doc.text(`Date: ${formattedDate}`, pageWidth - 70, 32);
  doc.text(`Time: ${formattedTime}`, pageWidth - 70, 36);

  // Patient Information Section
  let yPos = 48;
  doc.setFillColor(...brandColor);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT INFORMATION', 18, yPos + 5);

  yPos += 10;
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const patientName = visit.member_name || user?.full_name || 'N/A';
  const memberId = visit.member_id || user?.member_id || 'N/A';
  
  // Two column layout
  doc.text(`Patient Name: ${patientName}`, 18, yPos);
  doc.text(`Member ID: ${memberId}`, pageWidth / 2 + 10, yPos);
  
  yPos += 6;
  doc.text(`Visit Date: ${new Date(visit.visit_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 18, yPos);
  doc.text(`Visit Type: ${visit.visit_type}`, pageWidth / 2 + 10, yPos);

  // Reason for Visit Section
  yPos += 12;
  doc.setFillColor(...brandColor);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CHIEF COMPLAINT / REASON FOR VISIT', 18, yPos + 5);

  yPos += 10;
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const reasonLines = doc.splitTextToSize(visit.reason_for_visit || 'Not documented', pageWidth - 36);
  doc.text(reasonLines, 18, yPos);
  yPos += (reasonLines.length * 5.5) + 3;

  // Clinical Assessment Section
  yPos += 2;
  doc.setFillColor(...brandColor);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DIAGNOSIS & CLINICAL ASSESSMENT', 18, yPos + 5);

  yPos += 10;
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const diagnosisLines = doc.splitTextToSize(visit.diagnosis || 'Assessment pending', pageWidth - 36);
  doc.text(diagnosisLines, 18, yPos);
  yPos += (diagnosisLines.length * 5.5) + 3;

  // Clinical Notes Section
  yPos += 2;
  doc.setFillColor(...brandColor);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PROVIDER NOTES', 18, yPos + 5);

  yPos += 10;
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  
  const notesLines = doc.splitTextToSize(visit.doctor_notes || 'No additional notes documented', pageWidth - 36, { maxWidth: pageWidth - 36 });
  doc.text(notesLines, 18, yPos);
  yPos += (notesLines.length * 5) + 3;

  // Follow-up Box
  yPos += 3;
  const lightGrayBg = [245, 248, 251];
  doc.setFillColor(...lightGrayBg);
  doc.setDrawColor(...brandColor);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, pageWidth - 30, 12, 'FD');
  
  doc.setTextColor(...brandColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FOLLOW-UP REQUIRED:', 18, yPos + 5);
  
  const followUpText = visit.follow_up_required 
    ? `YES - Scheduled for ${new Date(visit.follow_up_date).toLocaleDateString()}`
    : 'NO FOLLOW-UP REQUIRED';
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkText);
  doc.text(followUpText, 18, yPos + 10);

  // Footer
  yPos = pageHeight - 15;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.2);
  doc.line(15, yPos, pageWidth - 15, yPos);

  doc.setTextColor(...lightText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Generated: ${formattedDate} | ${formattedTime}`, 18, yPos + 5);
  
  doc.setTextColor(180, 185, 195);
  doc.text('MediLab Clinical Record | Confidential Patient Information', pageWidth - 90, yPos + 5);
  
  doc.setFontSize(6);
  doc.text(`Page 1 of 1`, pageWidth / 2 - 3, pageHeight - 2);

  doc.save(`MediLab-Clinical-Visit-${new Date(visit.visit_date).toISOString().split('T')[0]}.pdf`);
};

export const generateReferralPDF = async (referral, user) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Load logo image
  const logoBase64 = await loadImageAsBase64('/images/logo1.png');

  // Colors - Same as visit PDF but with different urgency colors
  const brandColor = [14, 120, 107]; // Teal - same as visits
  const lightBrand = [232, 245, 242]; // Light teal - same as visits
  const darkText = [20, 25, 35];
  const lightText = [100, 110, 130];
  const borderColor = [200, 210, 220];

  // Urgency color map - Different colors for priorities
  const urgencyColorMap = {
    'Routine': [34, 197, 94], // Green
    'Urgent': [251, 146, 60], // Orange
    'Emergency': [239, 68, 68] // Red
  };

  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top accent bar
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Header section
  doc.setFillColor(...lightBrand);
  doc.rect(0, 8, pageWidth, 35, 'F');

  // Add logo image if available
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 15, 12, 18, 25);
  }

  // Hospital name
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandColor);
  doc.setFontSize(16);
  doc.text('MEDILAB', 36, 25);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.setFontSize(9);
  doc.text('Healthcare System', 36, 32);

  // Document title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.setFontSize(14);
  doc.text('MEDICAL REFERRAL FORM', pageWidth - 80, 25);

  // Referral stamp
  const urgencyLevel = referral.urgency_level || 'Routine';
  const urgencyColor = urgencyColorMap[urgencyLevel] || [100, 100, 100];
  doc.setFillColor(...urgencyColor);
  doc.rect(pageWidth - 110, 32, 35, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(`${urgencyLevel.toUpperCase()}`, pageWidth - 108, 36.5);

  // Referral Number and Date
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.setFontSize(8);
  doc.text(`Date: ${formattedDate}`, pageWidth - 60, 32);
  doc.text(`Time: ${formattedTime}`, pageWidth - 60, 36);

  // Patient Information Section
  let yPos = 48;
  doc.setFillColor(...brandColor);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT INFORMATION', 18, yPos + 5);

  yPos += 10;
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  doc.text(`Full Name: ${user?.full_name || 'N/A'}`, 18, yPos);
  doc.text(`Member ID: ${user?.member_id || 'N/A'}`, pageWidth / 2 + 10, yPos);
  
  yPos += 6;
  doc.setTextColor(...lightText);
  doc.setFontSize(8);
  doc.text(`Date of Issue: ${formattedDate}`, 18, yPos);

  // Referral Details Section
  yPos += 10;
  doc.setFillColor(...brandColor);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('REFERRAL DETAILS', 18, yPos + 5);

  yPos += 10;
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  doc.text(`Referred To: ${referral.referred_to}`, 18, yPos);
  doc.text(`Status: ${referral.referral_status}`, pageWidth / 2 + 10, yPos);
  
  yPos += 6;
  doc.text(`Type: Clinical Consultation`, 18, yPos);
  doc.text(`Urgency: ${urgencyLevel}`, pageWidth / 2 + 10, yPos);

  // Reason for Referral Section
  yPos += 10;
  doc.setFillColor(...brandColor);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CLINICAL INDICATION', 18, yPos + 5);

  yPos += 10;
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const reasonLines = doc.splitTextToSize(referral.referral_reason || 'To be assessed by specialist', pageWidth - 36);
  doc.text(reasonLines, 18, yPos);
  yPos += (reasonLines.length * 5.5) + 5;

  // Status Badge
  yPos += 2;
  doc.setFillColor(...urgencyColor);
  doc.rect(15, yPos, pageWidth - 30, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`REFERRAL ${referral.referral_status.toUpperCase()}`, 18, yPos + 6.5);

  // Footer
  yPos = pageHeight - 15;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.2);
  doc.line(15, yPos, pageWidth - 15, yPos);

  doc.setTextColor(...lightText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Generated: ${formattedDate} | ${formattedTime}`, 18, yPos + 5);
  
  doc.setTextColor(180, 185, 195);
  doc.text('MediLab Referral Document | Official Medical Referral', pageWidth - 90, yPos + 5);
  
  doc.setFontSize(6);
  doc.text(`Page 1 of 1`, pageWidth / 2 - 3, pageHeight - 2);

  doc.save(`MediLab-Medical-Referral-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateHealthProfilePDF = async (profileData, allergies, chronicDiseases, medications, pastHistory, familyHistory, lifestyleHistory, freeTextNotes = [], voiceNotes = []) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Load logo image
  const logoBase64 = await loadImageAsBase64('/images/logo1.png');
  
  // Load patient photo if available
  let photoBase64 = null;
  if (profileData?.photo) {
    // If photo is already a data URL (from FileReader), use it directly
    if (profileData.photo.startsWith('data:')) {
      photoBase64 = profileData.photo;
    } else {
      // Otherwise, try to load it as a file path
      photoBase64 = await loadImageAsBase64(profileData.photo);
    }
  }

  // Colors
  const brandColor = [14, 120, 107];
  const lightBrand = [232, 245, 242];
  const darkText = [20, 25, 35];
  const lightText = [100, 110, 130];
  const borderColor = [200, 210, 220];
  
  let yPos = 0;

  // Helper function to check if object has meaningful data
  const hasData = (obj) => {
    if (!obj) return false;
    if (typeof obj !== 'object') return !!obj;
    return Object.values(obj).some(val => val && val !== false && val !== '' && val !== 'No' && val !== 'Never');
  };

  const drawPageHeader = () => {
    // White background for entire page
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top accent bar
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, pageWidth, 8, 'F');

    // Header section with logo area
    doc.setFillColor(...lightBrand);
    doc.rect(0, 8, pageWidth, 35, 'F');

    // Add logo image if available
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 12, 18, 25);
    }

    // Hospital name and title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColor);
    doc.setFontSize(16);
    doc.text('MEDILAB', 36, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightText);
    doc.setFontSize(9);
    doc.text('Healthcare System', 36, 32);

    // Document title on right
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.setFontSize(14);
    doc.text('HEALTH PROFILE RECORD', pageWidth - 95, 25);

    // Document date/time on right
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightText);
    doc.setFontSize(8);
    doc.text(`Date: ${formattedDate}`, pageWidth - 95, 32);
    doc.text(`Time: ${formattedTime}`, pageWidth - 95, 36);

    yPos = 48;
  };

  const addSectionTitle = (title) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      drawPageHeader();
    }
    
    doc.setFillColor(...brandColor);
    doc.rect(15, yPos, pageWidth - 30, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, 18, yPos + 5);
    yPos += 10;
    return yPos;
  };

  // Draw initial header
  drawPageHeader();

  // PATIENT PHOTO AND BASIC INFO SECTION
  let photoYPos = 48;
  
  // Add patient photo if available
  if (photoBase64) {
    // Determine image format from data URL or use default
    let imageFormat = 'JPG';
    if (photoBase64.includes('data:image/png')) {
      imageFormat = 'PNG';
    } else if (photoBase64.includes('data:image/jpeg') || photoBase64.includes('data:image/jpg')) {
      imageFormat = 'JPEG';
    }
    
    doc.setLineWidth(0.2);
    doc.setDrawColor(...brandColor);
    doc.rect(15, photoYPos, 30, 30, 'D');
    try {
      doc.addImage(photoBase64, imageFormat, 15.5, photoYPos + 0.5, 29, 29);
      photoYPos += 35;
    } catch (err) {
      console.error('Error adding photo to PDF:', err);
      photoYPos += 0; // Skip photo if there's an error
    }
  }
  
  // Patient name and ID in a box
  doc.setFillColor(...lightBrand);
  doc.rect(photoBase64 ? (15 + 35) : 15, photoYPos - 35, photoBase64 ? (pageWidth - 50) : (pageWidth - 30), 30, 'F');
  
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${profileData?.full_name || 'N/A'}`, photoBase64 ? 52 : 18, photoYPos - 28);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.setFontSize(9);
  doc.text(`Member ID: ${profileData?.member_id || 'N/A'}`, photoBase64 ? 52 : 18, photoYPos - 22);
  doc.text(`DOB: ${profileData?.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : 'N/A'}`, photoBase64 ? 52 : 18, photoYPos - 17);
  doc.text(`Gender: ${profileData?.gender || 'N/A'} | Contact: ${profileData?.contact_number || 'N/A'}`, photoBase64 ? 52 : 18, photoYPos - 12);
  
  yPos = photoYPos;

  // PERSONAL INFORMATION SECTION - Two Column Layout
  yPos += 8;
  yPos = addSectionTitle('PERSONAL & CONTACT DETAILS');
  
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  
  // Left column
  const col1X = 18;
  const col2X = pageWidth / 2 + 5;
  const labelFont = 7;
  const valueFont = 8.5;
  
  // Contact Number (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('CONTACT NUMBER', col1X, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  yPos += 3.5;
  doc.text(profileData?.contact_number || 'N/A', col1X, yPos);
  
  // NIC (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('NIC', col2X, yPos - 3.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  doc.text(profileData?.nic || 'N/A', col2X, yPos);
  
  // Address (Full width, below)
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('ADDRESS', col1X, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  yPos += 3.5;
  const addressLines = doc.splitTextToSize(profileData?.address || 'N/A', pageWidth - 36);
  doc.text(addressLines, col1X, yPos);
  yPos += (addressLines.length * 3.5);
  
  // District and GN Division
  yPos += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('DISTRICT', col1X, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  yPos += 3.5;
  doc.text(profileData?.district || 'N/A', col1X, yPos);
  
  // GN Division (Right side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('GN DIVISION', col2X, yPos - 3.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  doc.text(profileData?.gn_division || 'N/A', col2X, yPos);

  // HEALTH METRICS SECTION - Card-based layout
  yPos += 10;
  yPos = addSectionTitle('HEALTH METRICS');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  
  // Create info cards with light background
  const cardHeight = 14;
  const cardSpacing = 16;
  
  // Card 1: Height & Weight
  doc.setFillColor(...lightBrand);
  doc.rect(col1X, yPos, 75, cardHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('HEIGHT', col1X + 3, yPos + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  doc.text(`${profileData?.height || 'N/A'} cm`, col1X + 3, yPos + 7);
  
  // Card 2: Weight
  doc.setFillColor(...lightBrand);
  doc.rect(col2X, yPos, 75, cardHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('WEIGHT', col2X + 3, yPos + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  doc.text(`${profileData?.weight || 'N/A'} kg`, col2X + 3, yPos + 7);
  
  yPos += cardSpacing;
  
  // Card 3: Blood Group
  doc.setFillColor(...lightBrand);
  doc.rect(col1X, yPos, 75, cardHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('BLOOD GROUP', col1X + 3, yPos + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  doc.text(profileData?.blood_group || 'Not specified', col1X + 3, yPos + 7);
  
  // Card 4: Disability Status
  doc.setFillColor(...lightBrand);
  doc.rect(col2X, yPos, 75, cardHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(labelFont);
  doc.setTextColor(...brandColor);
  doc.text('DISABILITY STATUS', col2X + 3, yPos + 3.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(valueFont);
  doc.text(profileData?.disability_status || 'No', col2X + 3, yPos + 7);
  
  yPos += cardSpacing;

  // ALLERGIES SECTION
  if (allergies && allergies.length > 0) {
    yPos += 8;
    yPos = addSectionTitle('ALLERGIES');
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    
    allergies.forEach((allergy, index) => {
      if (yPos > pageHeight - 15) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Handle both field naming conventions
      const allergyType = allergy.allergy_type || allergy.type || 'Unknown';
      const allergenName = allergy.allergen_name || 'Unknown';
      const severity = allergy.severity || 'Unknown';
      
      // Background for each entry
      doc.setFillColor(245, 250, 248);
      doc.rect(18, yPos - 1.5, pageWidth - 36, 11, 'F');
      
      // Title with icon-like bullet
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColor);
      doc.text(`${index + 1}. ${allergenName}`, 21, yPos + 1.5);
      
      // Details below
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.setFontSize(6.5);
      doc.text(`Type: ${allergyType}    |    Severity: ${severity}`, 24, yPos + 5);
      
      yPos += 12;
    });
  }

  // CHRONIC DISEASES SECTION
  if (chronicDiseases && chronicDiseases.length > 0) {
    yPos += 6;
    yPos = addSectionTitle('CHRONIC DISEASES');
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    
    chronicDiseases.forEach((disease, index) => {
      if (yPos > pageHeight - 15) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Handle both field naming conventions
      const diseaseName = disease.disease_name || disease.condition || 'Unknown';
      const diseaseYear = disease.since_year || disease.onset_year || 'Unknown';
      const onMedication = disease.currently_on_medication !== undefined ? disease.currently_on_medication : disease.on_medication;
      
      // Background for each entry
      doc.setFillColor(245, 250, 248);
      doc.rect(18, yPos - 1.5, pageWidth - 36, 11, 'F');
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColor);
      doc.text(`${index + 1}. ${diseaseName}`, 21, yPos + 1.5);
      
      // Details below
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.setFontSize(6.5);
      doc.text(`Since: ${diseaseYear}    |    On Medication: ${onMedication ? 'Yes' : 'No'}`, 24, yPos + 5);
      
      yPos += 12;
    });
  }

  // CURRENT MEDICATIONS SECTION
  if (medications && Array.isArray(medications) && medications.length > 0) {
    const validMeds = medications.filter(med => med && med.medicine_name);
    if (validMeds.length > 0) {
      yPos += 6;
      yPos = addSectionTitle('CURRENT MEDICATIONS');
      
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      
      validMeds.forEach((med, index) => {
        if (yPos > pageHeight - 15) {
          doc.addPage();
          drawPageHeader();
        }
        
        // Background for each entry
        doc.setFillColor(245, 250, 248);
        doc.rect(18, yPos - 1.5, pageWidth - 36, 14, 'F');
        
        // Title
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...brandColor);
        doc.text(`${index + 1}. ${med.medicine_name}`, 21, yPos + 1.5);
        
        // Details
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...lightText);
        doc.setFontSize(6.5);
        doc.text(`Dosage: ${med.dosage}    |    Reason: ${med.reason}`, 24, yPos + 5);
        if (med.prescribed_by) {
          doc.text(`Prescribed by: ${med.prescribed_by}`, 24, yPos + 8.5);
        }
        
        yPos += 15;
      });
    }
  }

  // PAST MEDICAL HISTORY SECTION
  const hasPastHistory = pastHistory && (
    pastHistory.surgeries || 
    pastHistory.has_admissions || 
    pastHistory.has_serious_injuries ||
    pastHistory.blood_transfusion ||
    pastHistory.tuberculosis
  );
  
  if (hasPastHistory) {
    yPos += 6;
    yPos = addSectionTitle('PAST MEDICAL HISTORY');
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    const historyItems = [];
    if (pastHistory.surgeries) {
      historyItems.push(`Surgeries: ${pastHistory.surgery_location?.join(', ') || 'Recorded'}`);
    }
    if (pastHistory.has_admissions) {
      historyItems.push(`Hospital Admissions: ${pastHistory.hospital_admissions || 'Recorded'}`);
    }
    if (pastHistory.has_serious_injuries) {
      historyItems.push(`Serious Injuries: ${pastHistory.serious_injuries || 'Recorded'}`);
    }
    if (pastHistory.blood_transfusion) {
      historyItems.push('Blood Transfusion: Yes');
    }
    if (pastHistory.tuberculosis) {
      historyItems.push('Tuberculosis History: Yes');
    }
    
    historyItems.forEach((item, index) => {
      if (yPos > pageHeight - 12) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Background
      doc.setFillColor(245, 250, 248);
      doc.rect(18, yPos - 1.5, pageWidth - 36, 8, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.setFontSize(8);
      doc.text(`• ${item}`, 22, yPos + 2);
      
      yPos += 9;
    });
  }

  // FAMILY HISTORY SECTION
  const hasFamilyHistory = familyHistory && (
    familyHistory.diabetes || 
    familyHistory.heart_disease || 
    (familyHistory.genetic_disorders && familyHistory.genetic_disorders.length > 0) ||
    !familyHistory.no_known_history
  );
  
  if (hasFamilyHistory) {
    yPos += 6;
    yPos = addSectionTitle('FAMILY HEALTH HISTORY');
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    const familyItems = [];
    if (familyHistory.diabetes) {
      familyItems.push('Diabetes Mellitus');
    }
    if (familyHistory.heart_disease) {
      familyItems.push('Heart Disease');
    }
    if (familyHistory.genetic_disorders && familyHistory.genetic_disorders.length > 0) {
      familyHistory.genetic_disorders.forEach(disorder => {
        if (disorder) familyItems.push(disorder);
      });
    }
    if (familyHistory.no_known_history) {
      familyItems.push('No Known Family History');
    }
    
    familyItems.forEach((item, index) => {
      if (yPos > pageHeight - 12) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Background
      doc.setFillColor(245, 250, 248);
      doc.rect(18, yPos - 1.5, pageWidth - 36, 8, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.setFontSize(8);
      doc.text(`• ${item}`, 22, yPos + 2);
      
      yPos += 9;
    });
  }

  // LIFESTYLE INFORMATION SECTION
  if (lifestyleHistory && Array.isArray(lifestyleHistory) && lifestyleHistory.length > 0) {
    yPos += 6;
    yPos = addSectionTitle('LIFESTYLE INFORMATION');
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    
    lifestyleHistory.forEach((lifestyle, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Background
      doc.setFillColor(245, 250, 248);
      const entryHeight = lifestyle.notes ? 20 : 16;
      doc.rect(18, yPos - 1.5, pageWidth - 36, entryHeight, 'F');
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColor);
      doc.text(`${index + 1}. ${lifestyle.occupation || 'Lifestyle Entry'}`, 21, yPos + 1.5);
      
      // Details
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.setFontSize(6.5);
      const detailsY = yPos + 5;
      doc.text(`Smoking: ${lifestyle.smoking || 'N/A'}    |    Alcohol: ${lifestyle.alcohol || 'N/A'}`, 24, detailsY);
      
      if (lifestyle.chemical_exposure) {
        doc.text('Chemical Exposure: Yes', 24, detailsY + 3.5);
      }
      
      if (lifestyle.notes) {
        const notesLines = doc.splitTextToSize(`Notes: ${lifestyle.notes}`, pageWidth - 50);
        doc.text(notesLines, 24, detailsY + (lifestyle.chemical_exposure ? 7 : 3.5));
        yPos += notesLines.length * 3.5;
      }
      
      yPos += entryHeight + 2;
    });
  }

  // ADDITIONAL NOTES SECTION (Text Notes)
  if (freeTextNotes && Array.isArray(freeTextNotes) && freeTextNotes.length > 0) {
    yPos += 6;
    yPos = addSectionTitle('ADDITIONAL NOTES');
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    freeTextNotes.forEach((note, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Background
      doc.setFillColor(245, 250, 248);
      const noteContent = note.content || note.text || note || '';
      const noteLines = doc.splitTextToSize(noteContent, pageWidth - 50);
      const noteHeight = 10 + (noteLines.length * 3.5);
      doc.rect(18, yPos - 1.5, pageWidth - 36, noteHeight, 'F');
      
      // Title with speaker
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColor);
      doc.text(`${index + 1}. ${note.speaker || 'Additional Note'}`, 21, yPos + 1.5);
      
      // Content
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.setFontSize(7);
      doc.text(noteLines, 24, yPos + 5);
      
      // Date if available
      if (note.date) {
        doc.setTextColor(...lightText);
        doc.setFontSize(6);
        doc.text(`Date: ${new Date(note.date).toLocaleDateString()}`, 24, yPos + noteHeight - 2);
      }
      
      yPos += noteHeight + 2;
    });
  }

  // VOICE NOTES SECTION
  if (voiceNotes && Array.isArray(voiceNotes) && voiceNotes.length > 0) {
    yPos += 6;
    yPos = addSectionTitle('VOICE NOTES');
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    voiceNotes.forEach((voiceNote, index) => {
      if (yPos > pageHeight - 15) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Background
      doc.setFillColor(245, 250, 248);
      doc.rect(18, yPos - 1.5, pageWidth - 36, 12, 'F');
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColor);
      const voiceTitle = voiceNote.title || voiceNote.speaker || `Voice Note ${index + 1}`;
      doc.text(`${index + 1}. ${voiceTitle}`, 21, yPos + 1.5);
      
      // Metadata
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.setFontSize(6.5);
      const speaker = voiceNote.speaker ? `Speaker: ${voiceNote.speaker}` : '';
      const duration = voiceNote.duration ? `Duration: ${voiceNote.duration}s` : '';
      const metaInfo = [speaker, duration].filter(Boolean).join(' | ');
      if (metaInfo) doc.text(metaInfo, 24, yPos + 5);
      
      if (voiceNote.date) {
        doc.text(`Date: ${new Date(voiceNote.date).toLocaleDateString()}`, 24, yPos + 8.5);
      }
      
      yPos += 13;
    });
  }

  // Footer
  yPos = pageHeight - 15;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.2);
  doc.line(15, yPos, pageWidth - 15, yPos);

  doc.setTextColor(...lightText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Generated: ${formattedDate} | ${formattedTime}`, 18, yPos + 5);
  
  doc.setTextColor(180, 185, 195);
  doc.text('MediLab Health Profile | Confidential Patient Record', pageWidth - 90, yPos + 5);
  
  doc.setFontSize(6);
  const totalPages = doc.internal.pages.length - 1;
  doc.text(`Page ${totalPages} of ${totalPages}`, pageWidth / 2 - 10, pageHeight - 2);

  doc.save(`MediLab-Health-Profile-${profileData?.full_name || 'Patient'}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateHouseholdPDF = async (householdData, membersList = [], healthInfo = {}) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Load logo image
  const logoBase64 = await loadImageAsBase64('/images/logo1.png');

  // Colors
  const brandColor = [14, 120, 107];
  const lightBrand = [232, 245, 242];
  const darkText = [20, 25, 35];
  const lightText = [100, 110, 130];
  const borderColor = [200, 210, 220];
  
  let yPos = 0;

  const drawPageHeader = () => {
    // White background for entire page
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top accent bar
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, pageWidth, 8, 'F');

    // Header section with logo area
    doc.setFillColor(...lightBrand);
    doc.rect(0, 8, pageWidth, 35, 'F');

    // Add logo image if available
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 12, 18, 25);
    }

    // Hospital name and title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColor);
    doc.setFontSize(16);
    doc.text('MEDILAB', 36, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightText);
    doc.setFontSize(9);
    doc.text('Healthcare System', 36, 32);

    // Document title on right
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.setFontSize(14);
    doc.text('HOUSEHOLD RECORD', pageWidth - 95, 25);

    // Document date/time on right
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightText);
    doc.setFontSize(8);
    doc.text(`Date: ${formattedDate}`, pageWidth - 95, 32);
    doc.text(`Time: ${formattedTime}`, pageWidth - 95, 36);

    yPos = 48;
  };

  const addSectionTitle = (title) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      drawPageHeader();
    }
    
    doc.setFillColor(...brandColor);
    doc.rect(15, yPos, pageWidth - 30, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, 18, yPos + 5);
    yPos += 10;
    return yPos;
  };

  // Draw initial header
  drawPageHeader();

  // HOUSEHOLD REGISTRATION SECTION
  yPos = addSectionTitle('HOUSEHOLD REGISTRATION');
  
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  
  const col1X = 18;
  const col2X = pageWidth / 2 + 5;
  
  // Head Member Name (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('HOUSEHOLD HEAD', col1X, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  yPos += 3.5;
  doc.text(householdData?.head_member_name || 'N/A', col1X, yPos);
  
  // Household ID (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('HOUSEHOLD ID', col2X, yPos - 3.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  doc.text(householdData?.household_id || 'N/A', col2X, yPos);
  
  // Contact Info
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('PRIMARY CONTACT', col1X, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  yPos += 3.5;
  doc.text(householdData?.primary_contact_number || 'N/A', col1X, yPos);
  
  // Secondary Contact (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('SECONDARY CONTACT', col2X, yPos - 3.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  doc.text(householdData?.secondary_contact_number || 'N/A', col2X, yPos);
  
  // Address (Full width)
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('ADDRESS', col1X, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  yPos += 3.5;
  const addressLines = doc.splitTextToSize(householdData?.address || 'N/A', pageWidth - 36);
  doc.text(addressLines, col1X, yPos);
  yPos += (addressLines.length * 3.5);
  
  // Location Details
  yPos += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('VILLAGE', col1X, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  yPos += 3.5;
  doc.text(householdData?.village_name || 'N/A', col1X, yPos);
  
  // GN Division
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('GN DIVISION', col2X, yPos - 3.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  doc.text(householdData?.gn_division || 'N/A', col2X, yPos);
  
  // District and Province
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('DISTRICT', col1X, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  yPos += 3.5;
  doc.text(householdData?.district || 'N/A', col1X, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  doc.text('PROVINCE', col2X, yPos - 3.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.setFontSize(8.5);
  doc.text(householdData?.province || 'N/A', col2X, yPos);

  // HOUSEHOLD MEMBERS SECTION
  if (membersList && Array.isArray(membersList) && membersList.length > 0) {
    yPos += 10;
    yPos = addSectionTitle(`HOUSEHOLD MEMBERS (${membersList.length})`);
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    
    membersList.forEach((member, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Background for each entry
      doc.setFillColor(245, 250, 248);
      doc.rect(18, yPos - 1.5, pageWidth - 36, 15, 'F');
      
      // Name as title
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...brandColor);
      doc.text(`${index + 1}. ${member.full_name || 'N/A'} ${member.isHead ? '(Head)' : ''}`, 21, yPos + 1.5);
      
      // Details
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.setFontSize(6.5);
      const gender = member.gender || 'N/A';
      const dob = member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A';
      const relationship = member.relationship || 'N/A';
      doc.text(`Gender: ${gender} | DOB: ${dob}`, 24, yPos + 5.5);
      doc.text(`Relationship: ${relationship}`, 24, yPos + 9);
      
      yPos += 16;
    });
  }

  // HOUSEHOLD HEALTH INFORMATION SECTION
  if (healthInfo && Object.keys(healthInfo).some(key => healthInfo[key])) {
    yPos += 6;
    yPos = addSectionTitle('HOUSEHOLD HEALTH INFORMATION');
    
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    const healthItems = [];
    
    if (healthInfo.water_source) {
      healthItems.push(`Water Source: ${healthInfo.water_source}`);
    }
    if (healthInfo.well_water_tested) {
      healthItems.push(`Well Water Tested: ${healthInfo.well_water_tested}`);
    }
    if (healthInfo.ckdu_exposure_area) {
      healthItems.push(`CKDu Exposure Area: ${healthInfo.ckdu_exposure_area}`);
    }
    if (healthInfo.sanitation_type) {
      healthItems.push(`Sanitation Type: ${healthInfo.sanitation_type}`);
    }
    if (healthInfo.waste_disposal) {
      healthItems.push(`Waste Disposal: ${healthInfo.waste_disposal}`);
    }
    if (healthInfo.dengue_risk) {
      healthItems.push('Dengue Risk: Yes');
    }
    if (healthInfo.pesticide_exposure) {
      healthItems.push('Pesticide Exposure: Yes');
    }
    
    healthItems.forEach((item, index) => {
      if (yPos > pageHeight - 12) {
        doc.addPage();
        drawPageHeader();
      }
      
      // Background
      doc.setFillColor(245, 250, 248);
      doc.rect(18, yPos - 1.5, pageWidth - 36, 8, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.setFontSize(8);
      doc.text(`• ${item}`, 22, yPos + 2);
      
      yPos += 9;
    });

    // Chronic Diseases in Area
    if (healthInfo.chronic_diseases && typeof healthInfo.chronic_diseases === 'object') {
      const diseases = [];
      if (healthInfo.chronic_diseases.diabetes) diseases.push('Diabetes');
      if (healthInfo.chronic_diseases.hypertension) diseases.push('Hypertension');
      if (healthInfo.chronic_diseases.kidney_disease) diseases.push('Kidney Disease');
      if (healthInfo.chronic_diseases.asthma) diseases.push('Asthma');
      if (healthInfo.chronic_diseases.heart_disease) diseases.push('Heart Disease');
      if (healthInfo.chronic_diseases.other) diseases.push(`Other: ${healthInfo.chronic_diseases.other}`);
      if (healthInfo.chronic_diseases.none) diseases.push('No Known Chronic Diseases');
      
      if (diseases.length > 0) {
        yPos += 6;
        yPos = addSectionTitle('AREA CHRONIC DISEASE HISTORY');
        
        diseases.forEach((disease, index) => {
          if (yPos > pageHeight - 12) {
            doc.addPage();
            drawPageHeader();
          }
          
          doc.setFillColor(245, 250, 248);
          doc.rect(18, yPos - 1.5, pageWidth - 36, 8, 'F');
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...darkText);
          doc.setFontSize(8);
          doc.text(`• ${disease}`, 22, yPos + 2);
          
          yPos += 9;
        });
      }
    }
  }

  // Footer
  yPos = pageHeight - 15;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.2);
  doc.line(15, yPos, pageWidth - 15, yPos);

  doc.setTextColor(...lightText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Generated: ${formattedDate} | ${formattedTime}`, 18, yPos + 5);
  
  doc.setTextColor(180, 185, 195);
  doc.text('MediLab Household Record | Confidential', pageWidth - 90, yPos + 5);
  
  doc.setFontSize(6);
  const totalPages = doc.internal.pages.length - 1;
  doc.text(`Page ${totalPages} of ${totalPages}`, pageWidth / 2 - 10, pageHeight - 2);

  doc.save(`MediLab-Household-${householdData?.head_member_name || 'Household'}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateEmergencyContactPDF = async (userData, emergencyContacts = []) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Load logo image
  const logoBase64 = await loadImageAsBase64('/images/logo1.png');

  // Colors
  const brandColor = [14, 120, 107];
  const lightBrand = [232, 245, 242];
  const darkText = [20, 25, 35];
  const lightText = [100, 110, 130];
  const borderColor = [200, 210, 220];
  
  let yPos = 0;

  // ===== PAGE HEADER (matching household style) =====
  // White background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header background
  doc.setFillColor(...lightBrand);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 15, 5, 22, 22);
  }

  // MediLab branding on left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...brandColor);
  doc.text('MEDILAB', 42, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...lightText);
  doc.text('Healthcare System', 42, 24);

  // Document title on right - with proper alignment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...darkText);
  doc.text('EMERGENCY CONTACTS', pageWidth - 15, 17, { align: 'right' });

  // Date and time on right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...lightText);
  doc.text(`Date: ${formattedDate}`, pageWidth - 15, 26, { align: 'right' });
  doc.text(`Time: ${formattedTime}`, pageWidth - 15, 32, { align: 'right' });

  yPos = 50;

  // ===== LOGGED-IN USER INFORMATION SECTION =====
  // Section title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...brandColor);
  doc.text('Primary Patient Information', 15, yPos);

  yPos += 7;

  // User info card
  doc.setFillColor(...lightBrand);
  doc.rect(15, yPos - 3, pageWidth - 30, 28, 'F');

  // Draw border
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos - 3, pageWidth - 30, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  // Left column
  doc.setTextColor(...lightText);
  doc.text('Name:', 20, yPos + 2);
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.text(userData?.full_name || 'Not provided', 45, yPos + 2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.text('Email:', 20, yPos + 8);
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.text(userData?.email_address || userData?.email || 'Not provided', 45, yPos + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.text('Phone:', 20, yPos + 14);
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.text(userData?.contact_number || 'Not provided', 45, yPos + 14);

  // Right column
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.text('Address:', 105, yPos + 2);
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  const addressText = userData?.address || 'Not provided';
  const addressLines = doc.splitTextToSize(addressText, 55);
  doc.text(addressLines, 130, yPos + 2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightText);
  doc.text('Member ID:', 105, yPos + 14);
  doc.setTextColor(...brandColor);
  doc.setFont('helvetica', 'bold');
  doc.text(userData?.member_id || userData?.systemId || 'Not provided', 130, yPos + 14);

  yPos += 35;

  // ===== EMERGENCY CONTACTS SECTION =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...brandColor);
  doc.text('Emergency Contacts List', 15, yPos);

  yPos += 7;

  if (emergencyContacts && emergencyContacts.length > 0) {
    emergencyContacts.forEach((contact, index) => {
      // Check if new page is needed
      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = 15;

        // Repeat header on new page
        doc.setFillColor(...lightBrand);
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...brandColor);
        doc.text('Emergency Contacts (continued)', 15, 8);
        yPos = 20;
      }

      // Contact card background - larger for all details
      doc.setFillColor(248, 250, 251);
      doc.rect(15, yPos - 2, pageWidth - 30, 68, 'F');

      // Border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.4);
      doc.rect(15, yPos - 2, pageWidth - 30, 68);

      // Contact number badge
      doc.setFillColor(...brandColor);
      doc.circle(20, yPos + 6, 2.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}`, 19.5, yPos + 7.5);

      // ===== BASIC INFORMATION =====
      doc.setTextColor(...brandColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('BASIC INFORMATION', 28, yPos + 2);

      // Name and Relationship - Side by side
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...lightText);
      doc.text('Full Name:', 28, yPos + 8);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      doc.text(contact.full_name || '—', 60, yPos + 8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.text('Relationship:', 115, yPos + 8);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      doc.text(contact.relationship || '—', 150, yPos + 8);

      // Priority Badge
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.setFontSize(6);
      doc.text('Priority:', 28, yPos + 13);
      
      if (contact.contact_priority) {
        doc.setFillColor(...brandColor);
        const priorityText = contact.contact_priority.toUpperCase();
        const textWidth = doc.getStringUnitWidth(priorityText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.rect(60, yPos + 10.2, textWidth + 3, 3.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.text(priorityText, 61, yPos + 12.5);
      }

      // Phone numbers
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...lightText);
      doc.text('Primary Phone:', 115, yPos + 13);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      doc.text(contact.primary_phone || '—', 150, yPos + 13);

      if (contact.secondary_phone) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...lightText);
        doc.text('Secondary Phone:', 28, yPos + 18);
        doc.setTextColor(...darkText);
        doc.setFont('helvetica', 'bold');
        doc.text(contact.secondary_phone, 65, yPos + 18);
      }

      // ===== LOCATION DETAILS =====
      yPos += (contact.secondary_phone ? 23 : 20);
      doc.setTextColor(...brandColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('LOCATION DETAILS', 28, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...lightText);
      doc.text('Address:', 28, yPos + 6);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      const addressLines = doc.splitTextToSize(contact.address || '—', 140);
      doc.text(addressLines, 65, yPos + 6);

      let locationY = yPos + 6 + (addressLines.length * 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.setFontSize(6.5);
      doc.text('GN Division:', 28, locationY + 3);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      doc.text(contact.gn_division || '—', 65, locationY + 3);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.text('Landmarks:', 115, locationY + 3);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      const landmarkLines = doc.splitTextToSize(contact.landmarks || '—', 70);
      doc.text(landmarkLines, 150, locationY + 3);

      // ===== AVAILABILITY & PERMISSIONS =====
      locationY += 8;
      doc.setTextColor(...brandColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('AVAILABILITY & PERMISSIONS', 28, locationY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...lightText);
      doc.text('24/7 Available:', 28, locationY + 6);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      doc.text(contact.available_24_7 ? 'Yes' : 'No', 65, locationY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...lightText);
      doc.text('Best Time:', 115, locationY + 6);
      doc.setTextColor(...darkText);
      doc.setFont('helvetica', 'bold');
      doc.text(contact.best_time_to_contact || '—', 150, locationY + 6);

      // Permission checkboxes
      doc.setFontSize(6);
      const permissions = [
        { label: 'View Medical Results', value: contact.receive_medical_results },
        { label: 'Legal Decision Maker', value: contact.decision_permission },
        { label: 'Collect Reports', value: contact.collect_reports_permission }
      ];

      let permY = locationY + 11;
      permissions.forEach((perm) => {
        // Checkbox
        const bgColor = perm.value ? [...brandColor] : [255, 255, 255];
        const borderColor2 = perm.value ? [...brandColor] : [200, 200, 200];
        
        doc.setFillColor(...bgColor);
        doc.setDrawColor(...borderColor2);
        doc.setLineWidth(0.3);
        doc.rect(28, permY - 2, 3, 3, 'FD');

        // Checkmark if true
        if (perm.value) {
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(2.5);
          doc.text('✓', 29.2, permY - 0.5);
        }

        // Label
        doc.setTextColor(...darkText);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.text(perm.label, 33, permY);

        permY += 5;
      });

      yPos += 75;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...lightText);
    doc.text('No emergency contacts have been added yet.', 20, yPos);
    yPos += 15;
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 10;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.2);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setTextColor(...lightText);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('MediLab Emergency Contacts | Confidential Patient Record', 18, footerY + 4);

  doc.save(`MediLab-Emergency-Contacts-${userData?.full_name || 'Patient'}-${new Date().toISOString().split('T')[0]}.pdf`);
};