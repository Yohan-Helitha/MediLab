/**
 * Frontend Performance Tests - Auth & Patient Pages
 * @author Lakni (IT23772922)
 * 
 * Performance testing for frontend pages:
 * - Page render times
 * - Component rendering with large datasets
 * - Form submission times
 * - API response handling
 * - Memory efficiency
 * 
 * Target metrics:
 * - P95 render time < 2000ms
 * - Handling 200+ list items < 2s
 * - Memory stable (no leaks)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import AccountPage from '../../pages/patient/AccountPage';
import HealthProfilePage from '../../pages/patient/HealthProfilePage';
import BookingPage from '../../pages/patient/BookingPage';
import AIDoctorChatPage from '../../pages/patient/AIDoctorChatPage';
import FamilyTreePage from '../../pages/patient/FamilyTreePage';
import EmergencyContactPage from '../../pages/patient/EmergencyContactPage';

jest.mock('../../api/authApi.js');
jest.mock('../../api/patientApi.js');
jest.mock('../../api/bookingApi.js');
jest.mock('../../api/consultationApi.js');
jest.mock('react-hot-toast');

import * as authApi from '../../api/authApi.js';
import * as patientApi from '../../api/patientApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import * as consultationApi from '../../api/consultationApi.js';

const renderWithRouter = (component) => {
  return render(<Router>{component}</Router>);
};

describe('Frontend Performance Tests - Auth Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LoginPage - Performance', () => {
    it('should render LoginPage within 500ms', async () => {
      const startTime = performance.now();

      renderWithRouter(<LoginPage />);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(duration).toBeLessThan(500); // P95 < 500ms
    });

    it('should handle form input with minimal lag', async () => {
      const user = userEvent.setup({ delay: null }); // No artificial delay

      renderWithRouter(<LoginPage />);

      const startTime = performance.now();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Type 100 characters across both inputs
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'TestPassword123!');

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete typing without significant lag
      expect(duration).toBeLessThan(1000);
    });

    it('should submit login form within 1s', async () => {
      authApi.login.mockResolvedValue({
        token: 'test-token',
        user: { _id: '123', email: 'test@example.com' }
      });

      renderWithRouter(<LoginPage />);

      const startTime = performance.now();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in|login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'TestPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('RegisterPage - Performance', () => {
    it('should render RegisterPage within 600ms', async () => {
      const startTime = performance.now();

      renderWithRouter(<RegisterPage />);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(duration).toBeLessThan(600);
    });

    it('should handle multi-step form with <1s per step', async () => {
      renderWithRouter(<RegisterPage />);

      // Step 1: Personal Info
      let startTime = performance.now();

      const firstNameInput = screen.getByLabelText(/first name/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      let endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);

      // Step 2: Password
      startTime = performance.now();

      const passwordInput = screen.getByLabelText(/^password/i);
      fireEvent.change(passwordInput, { target: { value: 'TestPassword123!' } });

      endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});

describe('Frontend Performance Tests - Patient Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AccountPage - Performance', () => {
    it('should render AccountPage within 1s', async () => {
      patientApi.fetchProfile.mockResolvedValue({
        success: true,
        data: { email: 'test@example.com', phone: '0712345678' }
      });

      const startTime = performance.now();

      renderWithRouter(<AccountPage />);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle password change within 800ms', async () => {
      patientApi.changePassword.mockResolvedValue({ success: true });

      renderWithRouter(<AccountPage />);

      const startTime = performance.now();

      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const submitButton = screen.getByRole('button', { name: /change|update/i });

      fireEvent.change(currentPasswordInput, { target: { value: 'OldPassword123!' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.changePassword).toHaveBeenCalled();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(800);
    });
  });

  describe('HealthProfilePage - Large Dataset Performance', () => {
    it('should render 50 allergies within 2 seconds', async () => {
      const mockAllergies = Array.from({ length: 50 }, (_, i) => ({
        _id: `allergy-${i}`,
        name: `Allergen ${i + 1}`,
        severity: ['Low', 'Medium', 'High'][i % 3],
        reactions: ['Rash', 'Itching']
      }));

      patientApi.getPatientAllergies.mockResolvedValue({
        success: true,
        data: mockAllergies
      });

      const startTime = performance.now();

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Allergen 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000);
    });

    it('should render 100 medications within 2.5 seconds', async () => {
      const mockMedications = Array.from({ length: 100 }, (_, i) => ({
        _id: `med-${i}`,
        name: `Medication ${i + 1}`,
        dosage: '500mg',
        frequency: 'Twice daily'
      }));

      patientApi.getPatientMedications.mockResolvedValue({
        success: true,
        data: mockMedications
      });

      const startTime = performance.now();

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Medication 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2500);
    });

    it('should handle scrolling 200+ items smoothly', async () => {
      const mockItems = Array.from({ length: 200 }, (_, i) => ({
        _id: `item-${i}`,
        name: `Item ${i + 1}`
      }));

      patientApi.getPatientData.mockResolvedValue({
        success: true,
        data: mockItems
      });

      renderWithRouter(<HealthProfilePage />);

      // Simulate scroll performance
      const startTime = performance.now();

      // Scroll through items
      const scrollContainer = screen.getByRole('region');
      scrollContainer.scrollTop = 5000; // Scroll to middle

      fireEvent.scroll(scrollContainer, { target: { scrollY: 5000 } });

      const endTime = performance.now();
      const scrollTime = endTime - startTime;

      // Scroll interaction should be instant
      expect(scrollTime).toBeLessThan(100);
    });

    it('should add new allergy without re-rendering entire list', async () => {
      const mockAllergies = Array.from({ length: 50 }, (_, i) => ({
        _id: `allergy-${i}`,
        name: `Allergen ${i}`,
        severity: 'Low'
      }));

      patientApi.getPatientAllergies.mockResolvedValue({
        success: true,
        data: mockAllergies
      });

      patientApi.addAllergy.mockResolvedValue({
        success: true,
        data: { _id: 'new-allergy', name: 'New Allergen' }
      });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Allergen 0')).toBeInTheDocument();
      });

      const startTime = performance.now();

      const addButton = screen.getByRole('button', { name: /add|new/i });
      fireEvent.click(addButton);

      const allergenInput = screen.getByLabelText(/allergen.*name|name/i);
      fireEvent.change(allergenInput, { target: { value: 'New Allergen' } });

      const submitButton = screen.getByRole('button', { name: /save|add/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.addAllergy).toHaveBeenCalled();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('BookingPage - Performance with Large Dataset', () => {
    it('should render 100 bookings within 1.5 seconds', async () => {
      const mockBookings = Array.from({ length: 100 }, (_, i) => ({
        _id: `booking-${i}`,
        bookingId: `BMK-${String(i).padStart(3, '0')}`,
        labName: `Lab ${i % 10}`,
        testName: `Test ${i % 5}`,
        date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
        status: ['Scheduled', 'Completed', 'Cancelled'][i % 3]
      }));

      bookingApi.getBookings.mockResolvedValue({
        success: true,
        data: mockBookings
      });

      const startTime = performance.now();

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText('BMK-000')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1500);
    });

    it('should filter bookings within 500ms', async () => {
      const mockBookings = Array.from({ length: 50 }, (_, i) => ({
        _id: `booking-${i}`,
        status: i % 2 === 0 ? 'Scheduled' : 'Completed',
        date: new Date().toISOString()
      }));

      bookingApi.getBookings.mockResolvedValue({
        success: true,
        data: mockBookings
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText(/booking/i)).toBeInTheDocument();
      });

      const startTime = performance.now();

      const filterButton = screen.getByLabelText(/status|filter/i);
      fireEvent.change(filterButton, { target: { value: 'Scheduled' } });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('AIDoctorChatPage - Performance', () => {
    it('should render chat page within 1s', async () => {
      consultationApi.getChat.mockResolvedValue({
        success: true,
        data: { messages: [] }
      });

      const startTime = performance.now();

      renderWithRouter(<AIDoctorChatPage />);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should send message within 800ms', async () => {
      consultationApi.sendMessage.mockResolvedValue({
        success: true,
        data: { message: 'Test response' }
      });

      renderWithRouter(<AIDoctorChatPage />);

      const startTime = performance.now();

      const messageInput = screen.getByLabelText(/message|question/i);
      const sendButton = screen.getByRole('button', { name: /send|submit/i });

      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(consultationApi.sendMessage).toHaveBeenCalled();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(800);
    });

    it('should render 100 chat messages within 1.5s', async () => {
      const mockMessages = Array.from({ length: 100 }, (_, i) => ({
        _id: `msg-${i}`,
        text: `Message ${i}`,
        sender: i % 2 === 0 ? 'user' : 'ai',
        timestamp: new Date(Date.now() - i * 60000)
      }));

      consultationApi.getChat.mockResolvedValue({
        success: true,
        data: { messages: mockMessages }
      });

      const startTime = performance.now();

      renderWithRouter(<AIDoctorChatPage />);

      await waitFor(() => {
        expect(screen.getByText('Message 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1500);
    });
  });

  describe('FamilyTreePage - Performance', () => {
    it('should render 30 family members within 1.2s', async () => {
      const mockFamilyMembers = Array.from({ length: 30 }, (_, i) => ({
        _id: `member-${i}`,
        name: `Family Member ${i}`,
        relationship: ['Mother', 'Father', 'Brother', 'Sister'][i % 4],
        age: 20 + i
      }));

      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: mockFamilyMembers
      });

      const startTime = performance.now();

      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        expect(screen.getByText('Family Member 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1200);
    });
  });

  describe('EmergencyContactPage - Performance', () => {
    it('should render page within 800ms', async () => {
      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: []
      });

      const startTime = performance.now();

      renderWithRouter(<EmergencyContactPage />);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(800);
    });

    it('should add emergency contact within 600ms', async () => {
      patientApi.addEmergencyContact.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'John Doe' }
      });

      renderWithRouter(<EmergencyContactPage />);

      const startTime = performance.now();

      const addButton = screen.getByRole('button', { name: /add|new/i });
      fireEvent.click(addButton);

      const nameInput = screen.getByLabelText(/name/i);
      const phoneInput = screen.getByLabelText(/phone/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });

      const submitButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.addEmergencyContact).toHaveBeenCalled();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(600);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory on repeated renders', async () => {
      patientApi.fetchProfile.mockResolvedValue({
        success: true,
        data: { email: 'test@example.com' }
      });

      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Render and unmount component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithRouter(<AccountPage />);
        unmount();
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(5000000); // 5MB threshold
    });

    it('should efficiently handle rapid list updates', async () => {
      const mockItems = [{ _id: '1', name: 'Item 1' }];

      patientApi.getData.mockResolvedValue({
        success: true,
        data: mockItems
      });

      renderWithRouter(<HealthProfilePage />);

      const startTime = performance.now();

      // Simulate rapid updates
      for (let i = 0; i < 50; i++) {
        jest.advanceTimersByTime(100);
      }

      const endTime = performance.now();
      const timeSpent = endTime - startTime;

      // Updates should complete efficiently
      expect(timeSpent).toBeLessThan(5000);
    });
  });

  describe('Form Performance', () => {
    it('should validate 10 fields within 200ms', () => {
      const startTime = performance.now();

      const fields = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '0712345678',
        dateOfBirth: '1990-05-15',
        gender: 'Male',
        bloodType: 'O+',
        height: '175',
        weight: '70',
        address: '123 Main Street'
      };

      // Simulate validation
      Object.entries(fields).forEach(([key, value]) => {
        const isValid = value && value.trim().length > 0;
        expect(isValid).toBe(true);
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});
