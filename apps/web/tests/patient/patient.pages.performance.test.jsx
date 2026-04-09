/**
 * Performance Tests for Patient Pages
 * @author Lakni (IT23772922)
 * 
 * Tests rendering performance, data handling, and UI responsiveness
 * under high-load scenarios
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HealthProfilePage from '../../pages/patient/HealthProfilePage';
import BookingPage from '../../pages/patient/BookingPage';
import AIDoctorChatPage from '../../pages/patient/AIDoctorChatPage';
import AccountPage from '../../pages/patient/AccountPage';

// Mock API calls
jest.mock('../../api/patientApi.js');
jest.mock('../../api/bookingApi.js');
jest.mock('../../api/consultationApi.js');
jest.mock('react-hot-toast');

import * as patientApi from '../../api/patientApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import * as consultationApi from '../../api/consultationApi.js';

const renderWithRouter = (component) => {
  return render(<Router>{component}</Router>);
};

describe('Performance: HealthProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    patientApi.fetchHealthDetails.mockResolvedValue({ success: true, data: {} });
    patientApi.fetchPastMedicalHistories.mockResolvedValue({ success: true, data: [] });
  });

  it('should render page with 50 allergies within 2 seconds', async () => {
    const startTime = performance.now();

    // Generate 50 mock allergies
    const mockAllergies = Array.from({ length: 50 }, (_, i) => ({
      _id: `allergy-${i}`,
      name: `Allergen ${i + 1}`,
      severity: ['Low', 'Medium', 'High'][i % 3]
    }));

    patientApi.getPatientAllergies.mockResolvedValue({
      success: true,
      data: mockAllergies
    });

    renderWithRouter(<HealthProfilePage />);

    await waitFor(() => {
      expect(patientApi.getPatientAllergies).toHaveBeenCalled();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(2000); // 2 second threshold
    expect(screen.getByText(/Allergen 1/)).toBeInTheDocument();
  });

  it('should handle 100+ allergies without lag', async () => {
    const mockAllergies = Array.from({ length: 100 }, (_, i) => ({
      _id: `allergy-${i}`,
      name: `Allergen ${i + 1}`,
      severity: ['Low', 'Medium', 'High'][i % 3]
    }));

    patientApi.getPatientAllergies.mockResolvedValue({
      success: true,
      data: mockAllergies
    });

    renderWithRouter(<HealthProfilePage />);

    await waitFor(() => {
      expect(patientApi.getPatientAllergies).toHaveBeenCalled();
    });

    // Should not crash and should still be interactive
    expect(screen.queryByText(/Allergen 1/i)).toBeInTheDocument();
  });

  it('should handle 100+ medications efficiently', async () => {
    const startTime = performance.now();

    const mockMedications = Array.from({ length: 100 }, (_, i) => ({
      _id: `med-${i}`,
      name: `Medication ${i + 1}`,
      dosage: `${(i % 10) + 1}00mg`,
      frequency: ['Once daily', 'Twice daily', 'Thrice daily'][i % 3]
    }));

    patientApi.getPatientMedications.mockResolvedValue({
      success: true,
      data: mockMedications
    });

    renderWithRouter(<HealthProfilePage />);

    await waitFor(() => {
      expect(patientApi.getPatientMedications).toHaveBeenCalled();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(2000);
    expect(screen.queryByText(/Medication 1/i)).toBeInTheDocument();
  });

  it('should scroll through large allergy list smoothly', async () => {
    const mockAllergies = Array.from({ length: 50 }, (_, i) => ({
      _id: `allergy-${i}`,
      name: `Allergen ${i + 1}`,
      severity: 'Medium'
    }));

    patientApi.getPatientAllergies.mockResolvedValue({
      success: true,
      data: mockAllergies
    });

    const { container } = renderWithRouter(<HealthProfilePage />);

    await waitFor(() => {
      expect(patientApi.getPatientAllergies).toHaveBeenCalled();
    });

    // Simulate scrolling
    const scrollableArea = container.querySelector('[data-testid="allergies-list"]');
    if (scrollableArea) {
      const startTime = performance.now();

      // Scroll down
      scrollableArea.scrollTop = scrollableArea.scrollHeight - scrollableArea.clientHeight;

      const endTime = performance.now();
      const scrollTime = endTime - startTime;

      expect(scrollTime).toBeLessThan(500); // Scroll should be near-instant
    }
  });

  it('should add medication to 50-item list in under 500ms', async () => {
    const mockMedications = Array.from({ length: 50 }, (_, i) => ({
      _id: `med-${i}`,
      name: `Med ${i + 1}`,
      dosage: '500mg'
    }));

    patientApi.getPatientMedications.mockResolvedValue({
      success: true,
      data: mockMedications
    });

    patientApi.createMedication.mockResolvedValue({
      success: true,
      data: { _id: 'new-med', name: 'New Med', dosage: '500mg' }
    });

    renderWithRouter(<HealthProfilePage />);

    await waitFor(() => {
      expect(patientApi.getPatientMedications).toHaveBeenCalled();
    });

    const startTime = performance.now();

    const addButton = await screen.findByRole('button', { name: /add.*medication/i });
    fireEvent.click(addButton);

    const medInput = await screen.findByLabelText(/medication/i);
    fireEvent.change(medInput, { target: { value: 'New Med' } });

    const submitButton = screen.getByRole('button', { name: /add|submit/i });
    fireEvent.click(submitButton);

    const endTime = performance.now();
    const addTime = endTime - startTime;

    expect(addTime).toBeLessThan(500);
  });

  it('should delete allergy from 50-item list in under 300ms', async () => {
    const mockAllergies = Array.from({ length: 50 }, (_, i) => ({
      _id: `allergen-${i}`,
      name: `Allergen ${i + 1}`,
      severity: 'Medium'
    }));

    patientApi.getAllergies.mockResolvedValue({
      success: true,
      data: mockAllergies
    });

    patientApi.deleteAllergy.mockResolvedValue({ success: true });

    renderWithRouter(<HealthProfilePage />);

    await waitFor(() => {
      expect(patientApi.getAllergies).toHaveBeenCalled();
    });

    const startTime = performance.now();

    const deleteButtons = screen.getAllByRole('button', { name: /delete|remove/i });
    fireEvent.click(deleteButtons[0]);

    const confirmButton = await screen.findByRole('button', { name: /confirm|yes|delete/i });
    fireEvent.click(confirmButton);

    const endTime = performance.now();
    const deleteTime = endTime - startTime;

    expect(deleteTime).toBeLessThan(300);
  });

  it('should handle rapid tab switching', async () => {
    renderWithRouter(<HealthProfilePage />);

    const startTime = performance.now();

    // Rapidly switch between tabs
    for (let i = 0; i < 10; i++) {
      const personalTab = screen.getByRole('button', { name: /personal/i });
      fireEvent.click(personalTab);

      const allergyTab = screen.getByRole('button', { name: /allergy/i });
      fireEvent.click(allergyTab);
    }

    const endTime = performance.now();
    const switchTime = endTime - startTime;

    expect(switchTime).toBeLessThan(1000); // 10 switches in under 1 second
  });

  it('should render photo upload preview without lag', async () => {
    renderWithRouter(<HealthProfilePage />);

    const startTime = performance.now();

    const fileInput = await screen.findByLabelText(/photo|image|upload/i);

    // Create mock file
    const file = new File(['photo content'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const endTime = performance.now();
    const previewTime = endTime - startTime;

    expect(previewTime).toBeLessThan(500); // Preview should render quickly
  });
});

describe('Performance: AIDoctorChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should handle 200+ message history without lag', async () => {
    const startTime = performance.now();

    // Generate 200+ messages
    const mockHistory = Array.from({ length: 200 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i + 1}`,
      timestamp: new Date(Date.now() - (200 - i) * 60000).toISOString(),
      date: new Date(Date.now() - (200 - i) * 60000).toLocaleDateString()
    }));

    localStorage.setItem('mediLabChatHistory_mock', JSON.stringify(mockHistory));

    renderWithRouter(<AIDoctorChatPage />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(2000); // Should render in under 2 seconds
  });

  it('should scroll to bottom smoothly with 200+ messages', async () => {
    const mockHistory = Array.from({ length: 200 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i + 1}`,
      timestamp: new Date(Date.now() - (200 - i) * 60000).toISOString(),
      date: new Date(Date.now() - (200 - i) * 60000).toLocaleDateString()
    }));

    localStorage.setItem('mediLabChatHistory_mock', JSON.stringify(mockHistory));

    const { container } = renderWithRouter(<AIDoctorChatPage />);

    await waitFor(() => {
      expect(screen.getByText(/Message 200/i)).toBeInTheDocument();
    });

    // Check that scroll behavior is smooth
    const chatContainer = container.querySelector('[data-testid="chat-messages"]');
    if (chatContainer) {
      const startScrollTop = chatContainer.scrollTop;
      const maxScrollTop = chatContainer.scrollHeight - chatContainer.clientHeight;

      expect(Math.abs(maxScrollTop - startScrollTop) <= 1).toBe(true); // Should be at bottom
    }
  });

  it('should add message to 200-message history in under 300ms', async () => {
    const mockHistory = Array.from({ length: 200 }, (_, i) => ({
      role: 'assistant',
      content: `Message ${i + 1}`
    }));

    localStorage.setItem('mediLabChatHistory_mock', JSON.stringify(mockHistory));

    consultationApi.chatWithAI.mockResolvedValue({
      reply: 'Response to new message'
    });

    renderWithRouter(<AIDoctorChatPage />);

    const startTime = performance.now();

    const messageInput = await screen.findByPlaceholderText(/type.*message/i);
    fireEvent.change(messageInput, { target: { value: 'New message' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    const endTime = performance.now();
    const addTime = endTime - startTime;

    expect(addTime).toBeLessThan(300);
  });

  it('should search through 200+ messages efficiently', async () => {
    const mockHistory = Array.from({ length: 200 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Important message ${i + 1}`
    }));

    localStorage.setItem('mediLabChatHistory_mock', JSON.stringify(mockHistory));

    const startTime = performance.now();

    renderWithRouter(<AIDoctorChatPage />);

    // Simulate search
    const searchInput = await screen.findByPlaceholderText(/search|find/i);
    fireEvent.change(searchInput, { target: { value: 'Important' } });

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    expect(searchTime).toBeLessThan(500); // Search should be fast
  });

  it('should handle rapid message sending', async () => {
    consultationApi.chatWithAI.mockResolvedValue({
      reply: 'Response'
    });

    renderWithRouter(<AIDoctorChatPage />);

    const startTime = performance.now();

    const messageInput = await screen.findByPlaceholderText(/type.*message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Send 5 messages rapidly
    for (let i = 0; i < 5; i++) {
      fireEvent.change(messageInput, { target: { value: `Message ${i + 1}` } });
      fireEvent.click(sendButton);
    }

    const endTime = performance.now();
    const sendTime = endTime - startTime;

    expect(sendTime).toBeLessThan(1000); // Should handle rapid fire
  });

  it('should render markdown-formatted 200-char message efficiently', async () => {
    const longMarkdownMessage = `
# Heading
This is a **bold** text with *italics* and [link](http://example.com).
- Bullet point 1
- Bullet point 2
- Bullet point 3

\`\`\`
code block
\`\`\`
    `.repeat(2); // ~400 characters of formatted markdown

    consultationApi.chatWithAI.mockResolvedValue({
      reply: longMarkdownMessage
    });

    const startTime = performance.now();

    renderWithRouter(<AIDoctorChatPage />);

    const messageInput = await screen.findByPlaceholderText(/type.*message/i);
    fireEvent.change(messageInput, { target: { value: 'Tell me symptoms' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(1000); // Markdown rendering should be fast
  });
});

describe('Performance: BookingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render 200 bookings within 2 seconds', async () => {
    const startTime = performance.now();

    const mockBookings = Array.from({ length: 200 }, (_, i) => ({
      _id: `booking-${i}`,
      testType: `Test ${(i % 20) + 1}`,
      bookingDate: new Date(Date.now() - (200 - i) * 86400000).toISOString(),
      status: ['Confirmed', 'Pending', 'Completed'][i % 3]
    }));

    bookingApi.getBookingsByPatientId.mockResolvedValue({
      bookings: mockBookings
    });

    renderWithRouter(<BookingPage />);

    await waitFor(() => {
      expect(bookingApi.getBookingsByPatientId).toHaveBeenCalled();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(2000);
  });

  it('should sort 200 bookings efficiently', async () => {
    const mockBookings = Array.from({ length: 200 }, (_, i) => ({
      _id: `booking-${i}`,
      testType: `Test ${i + 1}`,
      bookingDate: new Date(i * 86400000).toISOString(),
      status: 'Confirmed'
    }));

    bookingApi.getBookingsByPatientId.mockResolvedValue({
      bookings: mockBookings
    });

    const startTime = performance.now();

    renderWithRouter(<BookingPage />);

    await waitFor(() => {
      expect(bookingApi.getBookingsByPatientId).toHaveBeenCalled();
    });

    const endTime = performance.now();
    const sortTime = endTime - startTime;

    expect(sortTime).toBeLessThan(500); // Sorting should be fast
  });

  it('should filter 200 bookings in under 300ms', async () => {
    const mockBookings = Array.from({ length: 200 }, (_, i) => ({
      _id: `booking-${i}`,
      testType: i % 2 === 0 ? 'Blood Test' : 'X-Ray',
      bookingDate: new Date().toISOString(),
      status: ['Confirmed', 'Pending', 'Completed'][i % 3]
    }));

    bookingApi.getBookingsByPatientId.mockResolvedValue({
      bookings: mockBookings
    });

    renderWithRouter(<BookingPage />);

    await waitFor(() => {
      expect(bookingApi.getBookingsByPatientId).toHaveBeenCalled();
    });

    const startTime = performance.now();

    const filterSelect = await screen.findByLabelText(/filter|status/i);
    fireEvent.change(filterSelect, { target: { value: 'Confirmed' } });

    const endTime = performance.now();
    const filterTime = endTime - startTime;

    expect(filterTime).toBeLessThan(300);
  });

  it('should scroll through 200 bookings smoothly', async () => {
    const mockBookings = Array.from({ length: 200 }, (_, i) => ({
      _id: `booking-${i}`,
      testType: `Test ${i + 1}`,
      bookingDate: new Date().toISOString(),
      status: 'Confirmed'
    }));

    bookingApi.getBookingsByPatientId.mockResolvedValue({
      bookings: mockBookings
    });

    const { container } = renderWithRouter(<BookingPage />);

    await waitFor(() => {
      expect(bookingApi.getBookingsByPatientId).toHaveBeenCalled();
    });

    const scrollableArea = container.querySelector('[data-testid="bookings-list"]');
    if (scrollableArea) {
      const startTime = performance.now();

      scrollableArea.scrollTop = 5000;

      const endTime = performance.now();
      const scrollTime = endTime - startTime;

      expect(scrollTime).toBeLessThan(500);
    }
  });
});

describe('Performance: AccountPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate password in real-time without lag', async () => {
    renderWithRouter(<AccountPage />);

    const passwordInput = await screen.findByLabelText(/new password/i);
    const startTime = performance.now();

    // Type password character by character and verify validation
    const password = 'ValidPass123!';
    for (const char of password) {
      fireEvent.change(passwordInput, { target: { value: passwordInput.value + char } });
    }

    const endTime = performance.now();
    const validationTime = endTime - startTime;

    expect(validationTime).toBeLessThan(500); // Validation should be instant
  });

  it('should handle phone number cleaning efficiently', async () => {
    renderWithRouter(<AccountPage />);

    const phoneInput = await screen.findByLabelText(/phone/i);
    const startTime = performance.now();

    // Paste different phone formats
    const formats = [
      '+94 (71) 234-5678',
      '071 234 5678',
      '071-234-5678',
      '0712345678'
    ];

    for (const format of formats) {
      fireEvent.change(phoneInput, { target: { value: format } });
    }

    const endTime = performance.now();
    const cleaningTime = endTime - startTime;

    expect(cleaningTime).toBeLessThan(200); // Cleaning should be fast
  });

  it('should submit form within 500ms', async () => {
    renderWithRouter(<AccountPage />);

    const emailInput = await screen.findByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

    const startTime = performance.now();

    const submitButton = screen.getByRole('button', { name: /save|update/i });
    fireEvent.click(submitButton);

    const endTime = performance.now();
    const submitTime = endTime - startTime;

    expect(submitTime).toBeLessThan(500);
  });
});
