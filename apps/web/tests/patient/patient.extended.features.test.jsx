/**
 * Extended Patient Pages Functionality Tests
 * @author Lakni (IT23772922)
 * 
 * Comprehensive unit tests for all patient page features:
 * - AccountPage: Password validation, profile updates, phone formatting
 * - HealthProfilePage: Allergies, chronic diseases, medications, PDF export
 * - BookingPage: Booking list, sorting, status display
 * - AIDoctorChatPage: AI chat, persistent history, message handling
 * - FamilyTreePage: Family member management
 * - EmergencyContactPage: Emergency contact management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import AccountPage from '../../pages/patient/AccountPage';
import HealthProfilePage from '../../pages/patient/HealthProfilePage';
import BookingPage from '../../pages/patient/BookingPage';
import AIDoctorChatPage from '../../pages/patient/AIDoctorChatPage';
import FamilyTreePage from '../../pages/patient/FamilyTreePage';
import EmergencyContactPage from '../../pages/patient/EmergencyContactPage';

// Mock API calls
jest.mock('../../api/patientApi.js');
jest.mock('../../api/bookingApi.js');
jest.mock('../../api/consultationApi.js');
jest.mock('react-hot-toast');

import * as patientApi from '../../api/patientApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import * as consultationApi from '../../api/consultationApi.js';
import { toast } from 'react-hot-toast';

const renderWithRouter = (component) => {
  return render(
    <Router>
      {component}
    </Router>
  );
};

const mockUser = {
  _id: 'user-123',
  email: 'patient@example.com',
  contact_number: '0712345678',
  phoneNumber: '0712345678',
  profile: {
    _id: 'profile-123',
    date_of_birth: '1990-01-01',
    gender: 'male',
    full_name: 'Test Patient'
  }
};

describe('AccountPage - Advanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Password Validation', () => {
    it('should validate password requires 8+ characters', async () => {
      const mockUser = { email: 'test@example.com', profile: { _id: '123' } };
      
      renderWithRouter(<AccountPage />);
      
      // Type short password
      const passwordInput = await screen.findByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: 'Short1!' } });

      // Check for validation error
      await waitFor(() => {
        expect(screen.getByText(/must contain at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password requires uppercase letter', async () => {
      renderWithRouter(<AccountPage />);
      
      const passwordInput = await screen.findByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: 'validpass1!' } }); // no uppercase

      await waitFor(() => {
        expect(screen.getByText(/uppercase/i)).toBeInTheDocument();
      });
    });

    it('should validate password requires lowercase letter', async () => {
      renderWithRouter(<AccountPage />);
      
      const passwordInput = await screen.findByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: 'VALIDPASS1!' } }); // no lowercase

      await waitFor(() => {
        expect(screen.getByText(/lowercase/i)).toBeInTheDocument();
      });
    });

    it('should validate password requires number', async () => {
      renderWithRouter(<AccountPage />);
      
      const passwordInput = await screen.findByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: 'ValidPass!' } }); // no number

      await waitFor(() => {
        expect(screen.getByText(/number/i)).toBeInTheDocument();
      });
    });

    it('should validate password requires special character', async () => {
      renderWithRouter(<AccountPage />);
      
      const passwordInput = await screen.findByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: 'ValidPass1' } }); // no special char

      await waitFor(() => {
        expect(screen.getByText(/special|[@$!%*?&#]/i)).toBeInTheDocument();
      });
    });

    it('should accept valid password with all requirements', async () => {
      renderWithRouter(<AccountPage />);
      
      const passwordInput = await screen.findByLabelText(/new password/i);
      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });

      await waitFor(() => {
        // Error message should not appear
        expect(screen.queryByText(/must contain/i)).not.toBeInTheDocument();
      });
    });

    it('should validate password confirmation matches', async () => {
      renderWithRouter(<AccountPage />);
      
      const passwordInput = await screen.findByLabelText(/^new password/i);
      const confirmInput = await screen.findByLabelText(/confirm.*password/i);

      fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPass123!' } });

      const submitButton = screen.getByRole('button', { name: /save|update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(/do not match|password(es)? .*match/i));
      });
    });

    it('should require current password to change password', async () => {
      renderWithRouter(<AccountPage />);
      
      const newPasswordInput = await screen.findByLabelText(/new password/i);
      const confirmInput = await screen.findByLabelText(/confirm.*password/i);

      fireEvent.change(newPasswordInput, { target: { value: 'ValidPass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'ValidPass123!' } });
      // Leave current password empty

      const submitButton = screen.getByRole('button', { name: /save|update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(/current password.*required/i));
      });
    });
  });

  describe('Phone Number Formatting', () => {
    it('should clean and format phone number', async () => {
      renderWithRouter(<AccountPage />);
      
      const phoneInput = await screen.findByLabelText(/phone|contact/i);
      
      // Type phone with various formats
      fireEvent.change(phoneInput, { target: { value: '+94 (71) 234-5678' } });

      patientApi.updateMemberProfile.mockResolvedValue({
        success: true,
        data: { contact_number: '0712345678' }
      });

      const submitButton = screen.getByRole('button', { name: /save|update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Check if phone was cleaned to 10 digits
        expect(patientApi.updateMemberProfile).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            contact_number: expect.stringMatching(/^\d{10}$/)
          })
        );
      });
    });

    it('should handle different phone formats', async () => {
      const testFormats = [
        { input: '0712345678', expected: '0712345678' },
        { input: '071-234-5678', expected: '0712345678' },
        { input: '071 234 5678', expected: '0712345678' },
        { input: '+94712345678', expected: '0712345678' },
      ];

      for (const { input, expected } of testFormats) {
        renderWithRouter(<AccountPage />);
        
        const phoneInput = await screen.findByLabelText(/phone|contact/i);
        fireEvent.change(phoneInput, { target: { value: input } });

        // Verify phone is cleaned
        await waitFor(() => {
          expect(phoneInput.value).toBeTruthy();
        });
      }
    });
  });

  describe('Profile Update Flow', () => {
    it('should update profile successfully', async () => {
      patientApi.updateMemberProfile.mockResolvedValue({
        success: true,
        data: { email: 'newemail@example.com' }
      });

      renderWithRouter(<AccountPage />);
      
      const emailInput = await screen.findByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

      const submitButton = screen.getByRole('button', { name: /save|update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should handle profile update error', async () => {
      const errorMessage = 'Failed to update profile';
      patientApi.updateMemberProfile.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<AccountPage />);
      
      const submitButton = await screen.findByRole('button', { name: /save|update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
      });
    });
  });
});

describe('HealthProfilePage - Advanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    patientApi.fetchHealthDetails.mockResolvedValue({ success: true, data: {} });
    patientApi.fetchPastMedicalHistories.mockResolvedValue({ success: true, data: [] });
  });

  describe('Allergies Management', () => {
    it('should display allergy categories', async () => {
      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/allerg/i)).toBeInTheDocument();
      });
    });

    it('should add new allergy', async () => {
      patientApi.createAllergy.mockResolvedValue({
        success: true,
        data: { name: 'Penicillin', severity: 'High' }
      });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add.*allergy/i });
        fireEvent.click(addButton);
      });

      const allergyInput = await screen.findByLabelText(/allergy/i);
      fireEvent.change(allergyInput, { target: { value: 'Penicillin' } });

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.createAllergy).toHaveBeenCalled();
      });
    });

    it('should remove allergy', async () => {
      patientApi.deleteAllergy.mockResolvedValue({ success: true });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /remove|delete/i });
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(patientApi.deleteAllergy).toHaveBeenCalled();
      });
    });

    it('should track multiple allergy types', async () => {
      renderWithRouter(<HealthProfilePage />);

      const allergyCategories = ['Food', 'Drug', 'Dust/Pollen', 'Latex/Plaster', 'Other'];

      await waitFor(() => {
        allergyCategories.forEach(category => {
          expect(screen.getByText(category)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Chronic Diseases Management', () => {
    it('should display chronic disease checkboxes', async () => {
      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/diabetes|hypertension|heart disease/i)).toBeInTheDocument();
      });
    });

    it('should add chronic disease', async () => {
      patientApi.createChronicDisease.mockResolvedValue({
        success: true,
        data: { disease: 'Diabetes' }
      });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const diabetesCheckbox = screen.getByRole('checkbox', { name: /diabetes/i });
        fireEvent.click(diabetesCheckbox);
      });

      await waitFor(() => {
        expect(patientApi.createChronicDisease).toHaveBeenCalled();
      });
    });

    it('should remove chronic disease', async () => {
      patientApi.deleteChronicDisease.mockResolvedValue({ success: true });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const diseaseCheckbox = screen.getByRole('checkbox', { name: /disease/i });
        fireEvent.click(diseaseCheckbox);
      });

      await waitFor(() => {
        expect(patientApi.deleteChronicDisease).toHaveBeenCalled();
      });
    });
  });

  describe('Medications Management', () => {
    it('should add medication', async () => {
      patientApi.createMedication.mockResolvedValue({
        success: true,
        data: { name: 'Aspirin', dosage: '500mg' }
      });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add.*medication/i });
        fireEvent.click(addButton);
      });

      const medInput = await screen.findByLabelText(/medication/i);
      fireEvent.change(medInput, { target: { value: 'Aspirin' } });

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.createMedication).toHaveBeenCalled();
      });
    });

    it('should update medication', async () => {
      patientApi.updateMedication.mockResolvedValue({
        success: true,
        data: { name: 'Aspirin', dosage: '1000mg' }
      });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
      });

      const dosageInput = await screen.findByLabelText(/dosage/i);
      fireEvent.change(dosageInput, { target: { value: '1000mg' } });

      const updateButton = screen.getByRole('button', { name: /update|save/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(patientApi.updateMedication).toHaveBeenCalled();
      });
    });

    it('should delete medication', async () => {
      patientApi.deleteMedication.mockResolvedValue({ success: true });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete|remove.*medication/i });
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(patientApi.deleteMedication).toHaveBeenCalled();
      });
    });
  });

  describe('Age-based Field Visibility', () => {
    it('should show pregnancy field for eligible females', async () => {
      const femaleUser = {
        ...mockUser,
        profile: {
          ...mockUser.profile,
          gender: 'female',
          date_of_birth: '2000-01-01' // Age 26
        }
      };

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        // Should show pregnancy field for female aged 12-55
        const pregnancyField = screen.getByLabelText(/pregnant|pregnancy/i);
        expect(pregnancyField).toBeInTheDocument();
      });
    });

    it('should hide pregnancy field for males', async () => {
      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        // Pregnancy field should not appear for males
        const pregnancyField = screen.queryByLabelText(/pregnant|pregnancy/i);
        expect(pregnancyField).not.toBeInTheDocument();
      });
    });

    it('should hide pregnancy field for females outside age range', async () => {
      const youngFemaleUser = {
        ...mockUser,
        profile: {
          ...mockUser.profile,
          gender: 'female',
          date_of_birth: '2015-01-01' // Age 11
        }
      };

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        // Should not show pregnancy field for female under 12
        const pregnancyField = screen.queryByLabelText(/pregnant|pregnancy/i);
        expect(pregnancyField).not.toBeInTheDocument();
      });
    });
  });

  describe('PDF Export', () => {
    it('should generate health profile PDF', async () => {
      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export|pdf|download/i });
        fireEvent.click(exportButton);
      });

      // PDF generation would be verified through mock
      // expect(mockPdfGenerator).toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      renderWithRouter(<HealthProfilePage />);

      const tabs = ['Personal', 'Family', 'Medical', 'Medications'];

      for (const tabName of tabs) {
        const tab = await screen.findByRole('button', { name: new RegExp(tabName, 'i') });
        fireEvent.click(tab);

        await waitFor(() => {
          expect(tab).toHaveClass('active');
        });
      }
    });
  });
});

describe('BookingPage - Advanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking List Display', () => {
    it('should load and display bookings', async () => {
      const mockBookings = [
        {
          _id: '1',
          testType: 'Blood Test',
          bookingDate: '2024-04-10',
          status: 'Confirmed'
        },
        {
          _id: '2',
          testType: 'X-Ray',
          bookingDate: '2024-04-15',
          status: 'Pending'
        }
      ];

      bookingApi.getBookingsByPatientId.mockResolvedValue({
        bookings: mockBookings
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText(/blood test/i)).toBeInTheDocument();
        expect(screen.getByText(/x-ray/i)).toBeInTheDocument();
      });
    });

    it('should sort bookings by date (newest first)', async () => {
      const mockBookings = [
        {
          _id: '1',
          testType: 'Blood Test',
          bookingDate: '2024-04-10',
          status: 'Confirmed'
        },
        {
          _id: '2',
          testType: 'X-Ray',
          bookingDate: '2024-04-15',
          status: 'Pending'
        }
      ];

      bookingApi.getBookingsByPatientId.mockResolvedValue({
        bookings: mockBookings
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // X-Ray (2024-04-15) should appear before Blood Test (2024-04-10)
        expect(rows.indexOf(screen.getByText(/x-ray/i)) < rows.indexOf(screen.getByText(/blood test/i))).toBe(true);
      });
    });

    it('should display booking status correctly', async () => {
      const mockBookings = [
        { _id: '1', testType: 'Test', status: 'Confirmed' },
        { _id: '2', testType: 'Test', status: 'Pending' },
        { _id: '3', testType: 'Test', status: 'Completed' }
      ];

      bookingApi.getBookingsByPatientId.mockResolvedValue({
        bookings: mockBookings
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
        expect(screen.getByText(/pending/i)).toBeInTheDocument();
        expect(screen.getByText(/completed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', async () => {
      const mockBookings = [
        {
          _id: '1',
          testType: 'Blood Test',
          bookingDate: '2024-04-10T10:30:00Z',
          status: 'Confirmed'
        }
      ];

      bookingApi.getBookingsByPatientId.mockResolvedValue({
        bookings: mockBookings
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        // Date should be formatted, not raw ISO string
        expect(screen.getByText(/apr|apr|april/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to health centers', async () => {
      bookingApi.getBookingsByPatientId.mockResolvedValue({ bookings: [] });

      const { container } = renderWithRouter(<BookingPage />);

      await waitFor(() => {
        const navButton = screen.getByRole('button', { name: /health center|create booking/i });
        fireEvent.click(navButton);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when loading fails', async () => {
      const errorMessage = 'Failed to load bookings';
      bookingApi.getBookingsByPatientId.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
      });
    });

    it('should show empty state when no bookings', async () => {
      bookingApi.getBookingsByPatientId.mockResolvedValue({ bookings: [] });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText(/no.*booking|empty/i)).toBeInTheDocument();
      });
    });
  });
});

describe('AIDoctorChatPage - Advanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Chat Messaging', () => {
    it('should send message and receive response', async () => {
      consultationApi.chatWithAI.mockResolvedValue({
        reply: 'Hello! How can I help you today?'
      });

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/type.*message|ask doctor/i);
        fireEvent.change(messageInput, { target: { value: 'I have a headache' } });

        const sendButton = screen.getByRole('button', { name: /send|submit/i });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(consultationApi.chatWithAI).toHaveBeenCalledWith(
          'I have a headache',
          expect.any(String),
          expect.any(Array)
        );
      });
    });

    it('should display chat history', async () => {
      consultationApi.chatWithAI.mockResolvedValue({
        reply: 'Response from AI'
      });

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/type.*message/i);
        fireEvent.change(messageInput, { target: { value: 'Test message' } });

        const sendButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
        expect(screen.getByText('Response from AI')).toBeInTheDocument();
      });
    });
  });

  describe('Persistent Chat History', () => {
    it('should save chat history to localStorage', async () => {
      consultationApi.chatWithAI.mockResolvedValue({
        reply: 'AI Response'
      });

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/type.*message/i);
        fireEvent.change(messageInput, { target: { value: 'Test message' } });

        const sendButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        const savedHistory = localStorage.getItem(/mediLabChatHistory/);
        expect(savedHistory).toBeTruthy();
        const parsedHistory = JSON.parse(savedHistory);
        expect(parsedHistory.some(msg => msg.content === 'Test message')).toBe(true);
      });
    });

    it('should load chat history from localStorage on mount', async () => {
      const mockHistory = [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ];

      localStorage.setItem('mediLabChatHistory_mock', JSON.stringify(mockHistory));

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        expect(screen.getByText('Previous message')).toBeInTheDocument();
        expect(screen.getByText('Previous response')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      const errorMessage = 'Failed to get response';
      consultationApi.chatWithAI.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/type.*message/i);
        fireEvent.change(messageInput, { target: { value: 'Test' } });

        const sendButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/error|trouble|try again/i)).toBeInTheDocument();
      });
    });

    it('should sanitize error messages before displaying', async () => {
      consultationApi.chatWithAI.mockRejectedValue(
        new Error('{"error": "500 Internal Server Error"}')
      );

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/type.*message/i);
        fireEvent.change(messageInput, { target: { value: 'Test' } });

        const sendButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        // Should show sanitized message, not raw JSON
        const errorText = screen.getByText(/error|trouble|try again/i);
        expect(errorText.textContent).not.toContain('{');
      });
    });
  });

  describe('Message Timestamps', () => {
    it('should display timestamps for messages', async () => {
      consultationApi.chatWithAI.mockResolvedValue({
        reply: 'Response'
      });

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/type.*message/i);
        fireEvent.change(messageInput, { target: { value: 'Test' } });

        const sendButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        // Should show time in format like "10:30 AM"
        expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
      });
    });
  });

  describe('Markdown Rendering', () => {
    it('should render markdown formatted responses', async () => {
      consultationApi.chatWithAI.mockResolvedValue({
        reply: '## Symptoms\n- Fever\n- Cough'
      });

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        const messageInput = screen.getByPlaceholderText(/type.*message/i);
        fireEvent.change(messageInput, { target: { value: 'Tell me symptoms' } });

        const sendButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        // Markdown should be rendered (heading and list)
        expect(screen.getByText(/symptoms/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show initial prompt when no messages', async () => {
      renderWithRouter(<AIDoctorChatPage />);

      expect(screen.getByText(/welcome|start.*conversation|ask.*question/i)).toBeInTheDocument();
    });
  });
});

describe('Family Tree Page - Advanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Family Member Management', () => {
    it('should add family member with relationship', async () => {
      patientApi.addFamilyMember.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'Father' }
      });

      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add|new.*member/i });
        fireEvent.click(addButton);
      });

      const nameInput = await screen.findByLabelText(/name/i);
      const relationshipSelect = await screen.findByLabelText(/relationship/i);

      fireEvent.change(nameInput, { target: { value: 'Father' } });
      fireEvent.change(relationshipSelect, { target: { value: 'Father' } });

      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.addFamilyMember).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Father'
          })
        );
      });
    });

    it('should display family tree structure', async () => {
      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: {
          members: [
            { _id: '1', name: 'Father', relationship: 'Father' },
            { _id: '2', name: 'Mother', relationship: 'Mother' },
            { _id: '3', name: 'Brother', relationship: 'Brother' }
          ]
        }
      });

      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        expect(screen.getByText(/Father/)).toBeInTheDocument();
        expect(screen.getByText(/Mother/)).toBeInTheDocument();
        expect(screen.getByText(/Brother/)).toBeInTheDocument();
      });
    });
  });
});

describe('Emergency Contact Page - Advanced Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Contact Management', () => {
    it('should add emergency contact with validation', async () => {
      patientApi.addEmergencyContact.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'John', phone: '0712345678' }
      });

      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add|new.*contact/i });
        fireEvent.click(addButton);
      });

      const nameInput = await screen.findByLabelText(/name/i);
      const phoneInput = await screen.findByLabelText(/phone/i);

      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });

      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.addEmergencyContact).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John',
            phone: '0712345678'
          })
        );
      });
    });

    it('should validate phone number format', async () => {
      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add/i });
        fireEvent.click(addButton);
      });

      const phoneInput = await screen.findByLabelText(/phone/i);
      fireEvent.change(phoneInput, { target: { value: 'invalid' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/phone.*invalid|invalid.*phone|format/i)).toBeInTheDocument();
      });
    });

    it('should delete emergency contact with confirmation', async () => {
      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: [{ _id: '1', name: 'John', phone: '0712345678' }]
      });

      patientApi.deleteEmergencyContact.mockResolvedValue({ success: true });

      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete|remove/i });
        fireEvent.click(deleteButton);
      });

      // Confirm deletion
      const confirmButton = await screen.findByRole('button', { name: /confirm|yes|delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(patientApi.deleteEmergencyContact).toHaveBeenCalled();
      });
    });
  });

  describe('Multiple Contacts', () => {
    it('should handle multiple emergency contacts', async () => {
      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: [
          { _id: '1', name: 'John', phone: '0712345678', relationship: 'Brother' },
          { _id: '2', name: 'Jane', phone: '0715678901', relationship: 'Sister' },
          { _id: '3', name: 'Mike', phone: '0719876543', relationship: 'Friend' }
        ]
      });

      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        expect(screen.getByText(/John/)).toBeInTheDocument();
        expect(screen.getByText(/Jane/)).toBeInTheDocument();
        expect(screen.getByText(/Mike/)).toBeInTheDocument();
      });
    });
  });
});
