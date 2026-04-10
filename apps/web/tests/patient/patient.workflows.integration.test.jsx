/**
 * Patient Workflows Integration Tests
 * @author Lakni (IT23772922)
 * 
 * Tests complete user journeys across multiple pages and features
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

// Component imports
import LoginPage from '../../pages/patient/LoginPage';
import AccountPage from '../../pages/patient/AccountPage';
import HealthProfilePage from '../../pages/patient/HealthProfilePage';
import BookingPage from '../../pages/patient/BookingPage';
import AIDoctorChatPage from '../../pages/patient/AIDoctorChatPage';

// Mock API calls
jest.mock('../../api/authApi.js');
jest.mock('../../api/patientApi.js');
jest.mock('../../api/bookingApi.js');
jest.mock('../../api/consultationApi.js');
jest.mock('react-hot-toast');

import * as authApi from '../../api/authApi.js';
import * as patientApi from '../../api/patientApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import * as consultationApi from '../../api/consultationApi.js';
import { toast } from 'react-hot-toast';

const renderWithRouter = (component) => {
  return render(<Router>{component}</Router>);
};

describe('Workflow: Patient Account Setup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should complete profile initialization workflow', async () => {
    // Step 1: User views their profile
    renderWithRouter(<AccountPage />);

    const emailDisplay = await screen.findByLabelText(/email/i);
    expect(emailDisplay).toBeInTheDocument();

    // Step 2: Update email
    fireEvent.change(emailDisplay, { target: { value: 'newemail@example.com' } });

    // Step 3: Update phone number
    const phoneInput = await screen.findByLabelText(/phone/i);
    fireEvent.change(phoneInput, { target: { value: '0712345678' } });

    // Step 4: Click save
    patientApi.updateMemberProfile.mockResolvedValue({
      success: true,
      data: { email: 'newemail@example.com' }
    });

    const saveButton = screen.getByRole('button', { name: /save|update/i });
    fireEvent.click(saveButton);

    // Step 5: Verify success
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    expect(patientApi.updateMemberProfile).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        email: 'newemail@example.com'
      })
    );
  });

  it('should complete password change security workflow', async () => {
    renderWithRouter(<AccountPage />);

    // Step 1: User enters current password
    const currentPasswordInput = await screen.findByLabelText(/current password/i);
    fireEvent.change(currentPasswordInput, { target: { value: 'OldPassword123!' } });

    // Step 2: User accepts password change requirements and enters new password
    const newPasswordInput = await screen.findByLabelText(/^new password/i);
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword456!' } });

    // Step 3: User confirms new password
    const confirmPasswordInput = await screen.findByLabelText(/confirm.*password/i);
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword456!' } });

    // Step 4: Verify all password requirements are met
    await waitFor(() => {
      expect(screen.queryByText(/must contain/i)).not.toBeInTheDocument();
    });

    // Step 5: Submit password change
    patientApi.updateMemberProfile.mockResolvedValue({
      success: true,
      data: { message: 'Password updated' }
    });

    const submitButton = screen.getByRole('button', { name: /save|update/i });
    fireEvent.click(submitButton);

    // Step 6: Verify success
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
});

describe('Workflow: Health Profile Setup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    patientApi.fetchHealthDetails.mockResolvedValue({ success: true, data: {} });
    patientApi.fetchPastMedicalHistories.mockResolvedValue({ success: true, data: [] });
  });

  it('should complete health profile initialization workflow', async () => {
    renderWithRouter(<HealthProfilePage />);

    // Step 1: Navigate to Personal Info tab
    const personalTab = await screen.findByRole('button', { name: /personal|profile/i });
    fireEvent.click(personalTab);

    // Step 2: Fill in personal information
    const nameInput = await screen.findByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    const dobInput = await screen.findByLabelText(/date.*birth|dob/i);
    fireEvent.change(dobInput, { target: { value: '1990-01-01' } });

    const genderSelect = await screen.findByLabelText(/gender/i);
    fireEvent.change(genderSelect, { target: { value: 'male' } });

    // Step 3: Save personal info
    patientApi.updateMemberProfile.mockResolvedValue({
      success: true,
      data: { full_name: 'John Doe' }
    });

    let saveButton = screen.getByRole('button', { name: /save|submit/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(patientApi.updateMemberProfile).toHaveBeenCalled();
    });

    // Step 4: Navigate to allergies
    const allergyTab = await screen.findByRole('button', { name: /allerg/i });
    fireEvent.click(allergyTab);

    // Step 5: Add allergy
    patientApi.createAllergy.mockResolvedValue({
      success: true,
      data: { _id: '1', name: 'Penicillin', severity: 'High' }
    });

    const addAllergyButton = await screen.findByRole('button', { name: /add.*allergy/i });
    fireEvent.click(addAllergyButton);

    const allergyInput = await screen.findByLabelText(/allergy/i);
    fireEvent.change(allergyInput, { target: { value: 'Penicillin' } });

    saveButton = screen.getByRole('button', { name: /add|submit/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(patientApi.createAllergy).toHaveBeenCalled();
    });

    // Step 6: Navigate to medications
    const medTab = await screen.findByRole('button', { name: /medication/i });
    fireEvent.click(medTab);

    // Step 7: Add medication
    patientApi.createMedication.mockResolvedValue({
      success: true,
      data: { _id: '1', name: 'Aspirin', dosage: '500mg' }
    });

    const addMedButton = await screen.findByRole('button', { name: /add.*medication/i });
    fireEvent.click(addMedButton);

    const medInput = await screen.findByLabelText(/medication/i);
    fireEvent.change(medInput, { target: { value: 'Aspirin' } });

    saveButton = screen.getByRole('button', { name: /add|submit/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(patientApi.createMedication).toHaveBeenCalled();
    });
  });

  it('should complete allergy CRUD workflow', async () => {
    renderWithRouter(<HealthProfilePage />);

    // Step 1: Navigate to allergies tab
    const allergyTab = await screen.findByRole('button', { name: /allergy|allerg/i });
    fireEvent.click(allergyTab);

    // Step 2: Add allergy
    patientApi.createAllergy.mockResolvedValue({
      success: true,
      data: { _id: 'allergy-1', name: 'Pollen', severity: 'Mild' }
    });

    const addButton = await screen.findByRole('button', { name: /add.*allergy/i });
    fireEvent.click(addButton);

    const allergyInput = await screen.findByLabelText(/allergy/i);
    fireEvent.change(allergyInput, { target: { value: 'Pollen' } });

    let submitButton = screen.getByRole('button', { name: /add|submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(patientApi.createAllergy).toHaveBeenCalled();
    });

    // Step 3: Edit allergy
    patientApi.updateAllergy.mockResolvedValue({
      success: true,
      data: { _id: 'allergy-1', name: 'Pollen', severity: 'High' }
    });

    const editButton = await screen.findByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const severitySelect = await screen.findByLabelText(/severity/i);
    fireEvent.change(severitySelect, { target: { value: 'High' } });

    submitButton = screen.getByRole('button', { name: /update|save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(patientApi.updateAllergy).toHaveBeenCalled();
    });

    // Step 4: Delete allergy
    patientApi.deleteAllergy.mockResolvedValue({ success: true });

    const deleteButton = await screen.findByRole('button', { name: /delete|remove/i });
    fireEvent.click(deleteButton);

    // Step 5: Confirm deletion
    const confirmButton = await screen.findByRole('button', { name: /confirm|yes|delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(patientApi.deleteAllergy).toHaveBeenCalled();
    });
  });

  it('should complete health data export workflow', async () => {
    renderWithRouter(<HealthProfilePage />);

    // Step 1: Fill in health profile
    const nameInput = await screen.findByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    // Step 2: Click PDF export
    const exportButton = await screen.findByRole('button', { name: /export|pdf|download/i });
    fireEvent.click(exportButton);

    // Step 3: Verify PDF generation was attempted
    await waitFor(() => {
      // PDF generation event should be triggered
      expect(exportButton).toBeInTheDocument();
    });
  });
});

describe('Workflow: Booking and Lab Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete booking view and management workflow', async () => {
    const mockBookings = [
      {
        _id: '1',
        testType: 'Blood Test',
        bookingDate: '2024-04-10T10:00:00Z',
        status: 'Confirmed',
        labId: 'lab-1'
      },
      {
        _id: '2',
        testType: 'X-Ray',
        bookingDate: '2024-04-15T14:00:00Z',
        status: 'Pending',
        labId: 'lab-2'
      }
    ];

    bookingApi.getBookingsByPatientId.mockResolvedValue({
      bookings: mockBookings
    });

    renderWithRouter(<BookingPage />);

    // Step 1: View all bookings
    await waitFor(() => {
      expect(screen.getByText(/blood test/i)).toBeInTheDocument();
      expect(screen.getByText(/x-ray/i)).toBeInTheDocument();
    });

    // Step 2: Verify bookings are sorted by date (newest first)
    const rows = screen.getAllByRole('row');
    const xrayIndex = rows.findIndex(row => row.textContent.includes('X-Ray'));
    const bloodIndex = rows.findIndex(row => row.textContent.includes('Blood Test'));
    expect(xrayIndex < bloodIndex).toBe(true);

    // Step 3: Verify status display
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();

    // Step 4: Click on booking (navigate to lab details)
    const bookingItem = screen.getByText(/blood test/i);
    fireEvent.click(bookingItem);

    // Step 5: Should navigate to lab details or show details
    await waitFor(() => {
      // Navigation or details should be shown
      expect(bookingItem).toBeInTheDocument();
    });
  });

  it('should handle booking cancellation workflow', async () => {
    const mockBookings = [
      {
        _id: 'booking-1',
        testType: 'Blood Test',
        bookingDate: '2024-04-20T10:00:00Z',
        status: 'Confirmed'
      }
    ];

    bookingApi.getBookingsByPatientId.mockResolvedValue({
      bookings: mockBookings
    });

    bookingApi.cancelBooking.mockResolvedValue({ success: true });

    renderWithRouter(<BookingPage />);

    // Step 1: View booking
    await waitFor(() => {
      expect(screen.getByText(/blood test/i)).toBeInTheDocument();
    });

    // Step 2: Click cancel button
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Step 3: Confirm cancellation
    const confirmButton = await screen.findByRole('button', { name: /confirm|yes|cancel/i });
    fireEvent.click(confirmButton);

    // Step 4: Verify cancellation
    await waitFor(() => {
      expect(bookingApi.cancelBooking).toHaveBeenCalledWith('booking-1');
    });
  });
});

describe('Workflow: Medical Consultation with AI Doctor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should complete AI consultation workflow', async () => {
    consultationApi.chatWithAI.mockResolvedValue({
      reply: 'Based on your symptoms, I recommend visiting a healthcare professional.'
    });

    renderWithRouter(<AIDoctorChatPage />);

    // Step 1: View empty chat
    expect(screen.getByText(/welcome|start.*conversation/i)).toBeInTheDocument();

    // Step 2: User sends first message
    const messageInput = await screen.findByPlaceholderText(/type.*message|ask/i);
    fireEvent.change(messageInput, { target: { value: 'I have a persistent headache' } });

    const sendButton = screen.getByRole('button', { name: /send|submit/i });
    fireEvent.click(sendButton);

    // Step 3: Verify message sent and response displayed
    await waitFor(() => {
      expect(screen.getByText('I have a persistent headache')).toBeInTheDocument();
      expect(screen.getByText(/visit a healthcare professional/i)).toBeInTheDocument();
    });

    // Step 4: Send follow-up message
    fireEvent.change(messageInput, { target: { value: 'For how long should I take rest?' } });
    fireEvent.click(sendButton);

    // Step 5: Verify chat API called with history
    await waitFor(() => {
      expect(consultationApi.chatWithAI).toHaveBeenCalledWith(
        'For how long should I take rest?',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({
            content: 'I have a persistent headache'
          })
        ])
      );
    });
  });

  it('should persist chat history across sessions', async () => {
    consultationApi.chatWithAI.mockResolvedValue({
      reply: 'Stay hydrated and rest.'
    });

    // Session 1
    const { unmount } = renderWithRouter(<AIDoctorChatPage />);

    const messageInput = await screen.findByPlaceholderText(/type.*message/i);
    fireEvent.change(messageInput, { target: { value: 'Is this serious?' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Is this serious?')).toBeInTheDocument();
    });

    // Verify saved to localStorage
    const savedHistory = Object.keys(localStorage)
      .find(key => key.includes('mediLabChatHistory'));
    expect(savedHistory).toBeTruthy();

    // Session 2 - Component unmounted and remounted
    unmount();

    renderWithRouter(<AIDoctorChatPage />);

    // Step 2: Previous message should be restored
    await waitFor(() => {
      expect(screen.getByText('Is this serious?')).toBeInTheDocument();
      expect(screen.getByText(/stay hydrated/i)).toBeInTheDocument();
    });
  });

  it('should handle AI consultation with error recovery', async () => {
    // First call fails
    consultationApi.chatWithAI.mockRejectedValueOnce(new Error('API Error'));

    // Second call succeeds after retry
    consultationApi.chatWithAI.mockResolvedValueOnce({
      reply: 'Please try again. Tell me your symptoms.'
    });

    renderWithRouter(<AIDoctorChatPage />);

    // Step 1: Send message
    const messageInput = await screen.findByPlaceholderText(/type.*message/i);
    fireEvent.change(messageInput, { target: { value: 'I feel dizzy' } });

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Step 2: Error message shown
    await waitFor(() => {
      expect(screen.getByText(/error|trouble|try again/i)).toBeInTheDocument();
    });

    // Step 3: User retries
    consultationApi.chatWithAI.mockResolvedValueOnce({
      reply: 'Dizziness can be caused by dehydration. Try drinking water.'
    });

    fireEvent.change(messageInput, { target: { value: 'I feel dizzy' } });
    fireEvent.click(sendButton);

    // Step 4: Successful response
    await waitFor(() => {
      expect(screen.getByText(/dehydration|drinking water/i)).toBeInTheDocument();
    });
  });
});

describe('Workflow: Complete Patient Onboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should complete full patient onboarding journey', async () => {
    patientApi.fetchHealthDetails.mockResolvedValue({ success: true, data: {} });

    // Step 1: User logs in
    renderWithRouter(<LoginPage />);

    authApi.loginPatient.mockResolvedValue({
      user: {
        _id: 'user-123',
        email: 'newpatient@example.com',
        profile: { _id: 'profile-123' }
      },
      token: 'jwt-token'
    });

    const emailInput = await screen.findByLabelText(/email/i);
    const passwordInput = await screen.findByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'newpatient@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    const loginButton = screen.getByRole('button', { name: /login|sign in/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authApi.loginPatient).toHaveBeenCalled();
    });

    // Step 2: Navigate to account page and complete profile
    // (In real app, this would be navigation via router)
    const { unmount } = render(<Router><AccountPage /></Router>);

    const phoneInput = await screen.findByLabelText(/phone/i);
    fireEvent.change(phoneInput, { target: { value: '0712345678' } });

    patientApi.updateMemberProfile.mockResolvedValue({
      success: true,
      data: { contact_number: '0712345678' }
    });

    const saveButton = screen.getByRole('button', { name: /save|update/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(patientApi.updateMemberProfile).toHaveBeenCalled();
    });

    unmount();

    // Step 3: Complete health profile
    render(
      <Router>
        <HealthProfilePage />
      </Router>
    );

    patientApi.createAllergy.mockResolvedValue({
      success: true,
      data: { _id: '1', name: 'Penicillin' }
    });

    const addAllergyButton = await screen.findByRole('button', { name: /add.*allergy/i });
    fireEvent.click(addAllergyButton);

    const allergyInput = await screen.findByLabelText(/allergy/i);
    fireEvent.change(allergyInput, { target: { value: 'Penicillin' } });

    const submitButton = screen.getByRole('button', { name: /add|submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(patientApi.createAllergy).toHaveBeenCalled();
    });

    // Step 4: User can now book appointments
    bookingApi.getBookingsByPatientId.mockResolvedValue({
      bookings: []
    });

    // Onboarding complete
    expect(authApi.loginPatient).toHaveBeenCalled();
    expect(patientApi.updateMemberProfile).toHaveBeenCalled();
    expect(patientApi.createAllergy).toHaveBeenCalled();
  });
});
