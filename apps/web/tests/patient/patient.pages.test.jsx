/**
 * Frontend Patient Pages Unit Tests
 * Tests for patient-related pages and components
 * Uses React Testing Library for component testing
 * @author Lakni (IT23772922)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import AccountPage from '../../pages/patient/AccountPage';
import HealthProfilePage from '../../pages/patient/HealthProfilePage';
import BookingPage from '../../pages/patient/BookingPage';
import FamilyTreePage from '../../pages/patient/FamilyTreePage';
import EmergencyContactPage from '../../pages/patient/EmergencyContactPage';

// Mock the API calls
jest.mock('../../api/patientApi.js');
jest.mock('../../api/bookingApi.js');
import * as patientApi from '../../api/patientApi.js';
import * as bookingApi from '../../api/bookingApi.js';

const renderWithRouter = (component) => {
  return render(
    <Router>
      {component}
    </Router>
  );
};

describe('AccountPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  describe('Rendering', () => {
    it('should render account page with user information', async () => {
      const mockUserData = {
        success: true,
        data: {
          _id: '123',
          full_name: 'Test User',
          email: 'test@example.com',
          contact_number: '0712345678',
          date_of_birth: '1990-01-01'
        }
      };

      patientApi.getUserProfile.mockResolvedValue(mockUserData);

      renderWithRouter(<AccountPage />);

      await waitFor(() => {
        expect(screen.getByText(/account|profile/i)).toBeInTheDocument();
      });
    });

    it('should display user profile information', async () => {
      const mockUserData = {
        success: true,
        data: {
          full_name: 'Test User',
          email: 'test@example.com',
          contact_number: '0712345678'
        }
      };

      patientApi.getUserProfile.mockResolvedValue(mockUserData);

      renderWithRouter(<AccountPage />);

      await waitFor(() => {
        expect(screen.getByText(/Test User/)).toBeInTheDocument();
      });
    });

    it('should render edit profile button', async () => {
      patientApi.getUserProfile.mockResolvedValue({
        success: true,
        data: { full_name: 'Test User' }
      });

      renderWithRouter(<AccountPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit|update|modify/i })).toBeInTheDocument();
      });
    });
  });

  describe('Profile Editing', () => {
    it('should open edit profile form when edit button is clicked', async () => {
      patientApi.getUserProfile.mockResolvedValue({
        success: true,
        data: { full_name: 'Test User', email: 'test@example.com' }
      });

      renderWithRouter(<AccountPage />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/name|full name/i)).toBeInTheDocument();
      });
    });

    it('should update profile with valid data', async () => {
      patientApi.getUserProfile.mockResolvedValue({
        success: true,
        data: { full_name: 'Test User', email: 'test@example.com' }
      });

      patientApi.updateProfile.mockResolvedValue({
        success: true,
        data: { full_name: 'Updated User', email: 'test@example.com' }
      });

      renderWithRouter(<AccountPage />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
      });

      const nameInput = await screen.findByLabelText(/name|full name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated User' } });

      const saveButton = screen.getByRole('button', { name: /save|update|submit/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(patientApi.updateProfile).toHaveBeenCalled();
      });
    });

    it('should show error message on update failure', async () => {
      patientApi.getUserProfile.mockResolvedValue({
        success: true,
        data: { full_name: 'Test User' }
      });

      patientApi.updateProfile.mockRejectedValue(
        new Error('Update failed')
      );

      renderWithRouter(<AccountPage />);

      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);
      });

      const saveButton = await screen.findByRole('button', { name: /save|update/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/update.*failed|error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should display loading state while fetching data', () => {
      patientApi.getUserProfile.mockImplementation(() => new Promise(() => { }));

      renderWithRouter(<AccountPage />);

      expect(screen.getByText(/loading|fetching/i)).toBeInTheDocument();
    });

    it('should display error message when API fails', async () => {
      patientApi.getUserProfile.mockRejectedValue(
        new Error('Failed to load profile')
      );

      renderWithRouter(<AccountPage />);

      await waitFor(() => {
        expect(screen.getByText(/failed|error/i)).toBeInTheDocument();
      });
    });
  });
});

describe('HealthProfilePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  describe('Rendering', () => {
    it('should render health profile page', async () => {
      const mockHealthData = {
        success: true,
        data: {
          blood_type: 'O+',
          height: 180,
          weight: 75,
          allergies: []
        }
      };

      patientApi.getHealthProfile.mockResolvedValue(mockHealthData);

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/health.*profile|medical.*profile/i)).toBeInTheDocument();
      });
    });

    it('should display health information', async () => {
      const mockHealthData = {
        success: true,
        data: {
          blood_type: 'O+',
          height: 180,
          weight: 75
        }
      };

      patientApi.getHealthProfile.mockResolvedValue(mockHealthData);

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/O\+|180|75/)).toBeInTheDocument();
      });
    });

    it('should display allergies list', async () => {
      const mockHealthData = {
        success: true,
        data: {
          allergies: [
            { name: 'Penicillin', severity: 'High' },
            { name: 'Peanuts', severity: 'Medium' }
          ]
        }
      };

      patientApi.getHealthProfile.mockResolvedValue(mockHealthData);

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/Penicillin/)).toBeInTheDocument();
        expect(screen.getByText(/Peanuts/)).toBeInTheDocument();
      });
    });
  });

  describe('Health Data Management', () => {
    it('should add new allergy', async () => {
      patientApi.getHealthProfile.mockResolvedValue({
        success: true,
        data: { allergies: [] }
      });

      patientApi.addAllergy.mockResolvedValue({
        success: true,
        data: { allergies: [{ name: 'Aspirin', severity: 'Low' }] }
      });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add|new.*allergy/i });
        fireEvent.click(addButton);
      });

      const allergyInput = await screen.findByLabelText(/allergy|substance/i);
      fireEvent.change(allergyInput, { target: { value: 'Aspirin' } });

      const submitButton = screen.getByRole('button', { name: /add|submit|save/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.addAllergy).toHaveBeenCalled();
      });
    });

    it('should remove allergy', async () => {
      const mockHealthData = {
        success: true,
        data: {
          allergies: [{ _id: '123', name: 'Penicillin' }]
        }
      };

      patientApi.getHealthProfile.mockResolvedValue(mockHealthData);
      patientApi.removeAllergy.mockResolvedValue({ success: true });

      renderWithRouter(<HealthProfilePage />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /remove|delete|remove.*penicillin/i });
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(patientApi.removeAllergy).toHaveBeenCalled();
      });
    });
  });
});

describe('BookingPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  describe('Rendering', () => {
    it('should render booking page', async () => {
      const mockBookings = {
        success: true,
        data: []
      };

      bookingApi.getBookings.mockResolvedValue(mockBookings);

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText(/booking|appointment/i)).toBeInTheDocument();
      });
    });

    it('should display list of bookings', async () => {
      const mockBookings = {
        success: true,
        data: [
          {
            _id: '1',
            test_type: 'Blood Test',
            booking_date: '2024-04-10',
            status: 'Confirmed'
          },
          {
            _id: '2',
            test_type: 'X-Ray',
            booking_date: '2024-04-15',
            status: 'Pending'
          }
        ]
      };

      bookingApi.getBookings.mockResolvedValue(mockBookings);

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText(/Blood Test/)).toBeInTheDocument();
        expect(screen.getByText(/X-Ray/)).toBeInTheDocument();
      });
    });

    it('should show empty state when no bookings', async () => {
      bookingApi.getBookings.mockResolvedValue({
        success: true,
        data: []
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        expect(screen.getByText(/no.*booking|empty/i)).toBeInTheDocument();
      });
    });
  });

  describe('Booking Creation', () => {
    it('should open booking form when create button is clicked', async () => {
      bookingApi.getBookings.mockResolvedValue({
        success: true,
        data: []
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create|new.*booking|book/i });
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/test|service/i)).toBeInTheDocument();
      });
    });

    it('should create booking with valid data', async () => {
      bookingApi.getBookings.mockResolvedValue({
        success: true,
        data: []
      });

      bookingApi.createBooking.mockResolvedValue({
        success: true,
        data: { _id: '123', test_type: 'Blood Test' }
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create|book/i });
        fireEvent.click(createButton);
      });

      const testInput = await screen.findByLabelText(/test|service/i);
      fireEvent.change(testInput, { target: { value: 'Blood Test' } });

      const submitButton = screen.getByRole('button', { name: /submit|create|book/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(bookingApi.createBooking).toHaveBeenCalled();
      });
    });
  });

  describe('Booking Management', () => {
    it('should cancel a booking', async () => {
      const mockBookings = {
        success: true,
        data: [
          {
            _id: '1',
            test_type: 'Blood Test',
            status: 'Confirmed'
          }
        ]
      };

      bookingApi.getBookings.mockResolvedValue(mockBookings);
      bookingApi.cancelBooking.mockResolvedValue({ success: true });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);
      });

      // Confirm cancellation
      const confirmButton = await screen.findByRole('button', { name: /confirm|yes/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(bookingApi.cancelBooking).toHaveBeenCalled();
      });
    });

    it('should reschedule a booking', async () => {
      const mockBookings = {
        success: true,
        data: [
          {
            _id: '1',
            test_type: 'Blood Test',
            booking_date: '2024-04-10'
          }
        ]
      };

      bookingApi.getBookings.mockResolvedValue(mockBookings);
      bookingApi.rescheduleBooking.mockResolvedValue({
        success: true,
        data: { booking_date: '2024-04-20' }
      });

      renderWithRouter(<BookingPage />);

      await waitFor(() => {
        const rescheduleButton = screen.getByRole('button', { name: /reschedule|change.*date/i });
        fireEvent.click(rescheduleButton);
      });

      const dateInput = await screen.findByLabelText(/date/i);
      fireEvent.change(dateInput, { target: { value: '2024-04-20' } });

      const submitButton = screen.getByRole('button', { name: /submit|save/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(bookingApi.rescheduleBooking).toHaveBeenCalled();
      });
    });
  });
});

describe('FamilyTreePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  describe('Rendering', () => {
    it('should render family tree page', async () => {
      const mockFamily = {
        success: true,
        data: {
          members: []
        }
      };

      patientApi.getFamilyMembers.mockResolvedValue(mockFamily);

      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        expect(screen.getByText(/family|tree|member/i)).toBeInTheDocument();
      });
    });

    it('should display family members', async () => {
      const mockFamily = {
        success: true,
        data: {
          members: [
            { _id: '1', name: 'Father', relationship: 'Father' },
            { _id: '2', name: 'Mother', relationship: 'Mother' }
          ]
        }
      };

      patientApi.getFamilyMembers.mockResolvedValue(mockFamily);

      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        expect(screen.getByText(/Father/)).toBeInTheDocument();
        expect(screen.getByText(/Mother/)).toBeInTheDocument();
      });
    });
  });

  describe('Family Member Management', () => {
    it('should add new family member', async () => {
      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: { members: [] }
      });

      patientApi.addFamilyMember.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'Brother' }
      });

      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add|new.*member/i });
        fireEvent.click(addButton);
      });

      const nameInput = await screen.findByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'Brother' } });

      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.addFamilyMember).toHaveBeenCalled();
      });
    });

    it('should remove family member', async () => {
      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: {
          members: [{ _id: '1', name: 'Sister', relationship: 'Sister' }]
        }
      });

      patientApi.removeFamilyMember.mockResolvedValue({ success: true });

      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /remove|delete/i });
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(patientApi.removeFamilyMember).toHaveBeenCalled();
      });
    });
  });
});

describe('EmergencyContactPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  describe('Rendering', () => {
    it('should render emergency contact page', async () => {
      const mockContacts = {
        success: true,
        data: []
      };

      patientApi.getEmergencyContacts.mockResolvedValue(mockContacts);

      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        expect(screen.getByText(/emergency|contact/i)).toBeInTheDocument();
      });
    });

    it('should display emergency contacts', async () => {
      const mockContacts = {
        success: true,
        data: [
          { _id: '1', name: 'John', phone: '0712345678', relationship: 'Brother' },
          { _id: '2', name: 'Jane', phone: '0715678901', relationship: 'Sister' }
        ]
      };

      patientApi.getEmergencyContacts.mockResolvedValue(mockContacts);

      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        expect(screen.getByText(/John/)).toBeInTheDocument();
        expect(screen.getByText(/Jane/)).toBeInTheDocument();
      });
    });
  });

  describe('Emergency Contact Management', () => {
    it('should add emergency contact', async () => {
      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: []
      });

      patientApi.addEmergencyContact.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'Emergency Contact' }
      });

      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        const addButton = screen.getByRole('button', { name: /add|new.*contact/i });
        fireEvent.click(addButton);
      });

      const nameInput = await screen.findByLabelText(/name/i);
      const phoneInput = screen.getByLabelText(/phone/i);

      fireEvent.change(nameInput, { target: { value: 'Emergency Contact' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });

      const submitButton = screen.getByRole('button', { name: /add|submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.addEmergencyContact).toHaveBeenCalled();
      });
    });
  });
});
