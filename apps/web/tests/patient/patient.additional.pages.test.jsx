/**
 * Comprehensive Tests for Additional Patient Pages
 * @author Lakni (IT23772922)
 * 
 * Tests for:
 * - FamilyTreePage: Family member management and relationships
 * - EmergencyContactPage: Emergency contact CRUD operations  
 * - HealthReportsPage: Lab reports viewing and downloading
 * - HouseholdRegistrationPage: Household data management
 * - SymptomCheckerPage: Symptom assessment and analysis
 * - VisitReferralPage: Medical visit referral management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock imports
jest.mock('../../api/patientApi.js');
jest.mock('../../api/bookingApi.js');
jest.mock('react-hot-toast');

import * as patientApi from '../../api/patientApi.js';
import * as bookingApi from '../../api/bookingApi.js';
import { toast } from 'react-hot-toast';

const renderWithRouter = (component) => {
  return render(<Router>{component}</Router>);
};

// Note: These tests assume the page components exist and are exported
// If importing fails, these tests will be skipped in actual execution

describe('FamilyTreePage - Family Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Family Member Display', () => {
    it('should load and display family tree', async () => {
      const mockFamilyMembers = [
        { _id: '1', name: 'Father', age: 65, relationship: 'Father', healthStatus: 'Good' },
        { _id: '2', name: 'Mother', age: 63, relationship: 'Mother', healthStatus: 'Stable' },
        { _id: '3', name: 'Sister', age: 28, relationship: 'Sister', healthStatus: 'Excellent' }
      ];

      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: { members: mockFamilyMembers }
      });

      const FamilyTreePage = require('../../pages/patient/FamilyTreePage').default;
      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        expect(screen.getByText(/Father/)).toBeInTheDocument();
        expect(screen.getByText(/Mother/)).toBeInTheDocument();
        expect(screen.getByText(/Sister/)).toBeInTheDocument();
      });
    });

    it('should display empty state when no family members', async () => {
      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: { members: [] }
      });

      const FamilyTreePage = require('../../pages/patient/FamilyTreePage').default;
      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        expect(screen.getByText(/no.*family|add.*member/i)).toBeInTheDocument();
      });
    });
  });

  describe('Add Family Member', () => {
    it('should add family member with relationship', async () => {
      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: { members: [] }
      });

      patientApi.addFamilyMember.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'Father', relationship: 'Father' }
      });

      const FamilyTreePage = require('../../pages/patient/FamilyTreePage').default;
      renderWithRouter(<FamilyTreePage />);

      const addButton = await screen.findByRole('button', { name: /add|new/i });
      fireEvent.click(addButton);

      const nameInput = await screen.findByLabelText(/name/i);
      const relationshipSelect = await screen.findByLabelText(/relationship/i);

      fireEvent.change(nameInput, { target: { value: 'Father' } });
      fireEvent.change(relationshipSelect, { target: { value: 'Father' } });

      const submitButton = screen.getByRole('button', { name: /add|save|submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.addFamilyMember).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Father' })
        );
      });
    });

    it('should validate family member name is required', async () => {
      const FamilyTreePage = require('../../pages/patient/FamilyTreePage').default;
      renderWithRouter(<FamilyTreePage />);

      const addButton = await screen.findByRole('button', { name: /add/i });
      fireEvent.click(addButton);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name.*required|enter.*name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Family Member', () => {
    it('should edit family member details', async () => {
      const mockMembers = [
        { _id: '1', name: 'Father', age: 65, relationship: 'Father' }
      ];

      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: { members: mockMembers }
      });

      patientApi.updateFamilyMember.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'Father', age: 66, relationship: 'Father' }
      });

      const FamilyTreePage = require('../../pages/patient/FamilyTreePage').default;
      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        expect(screen.getByText(/Father/)).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      const ageInput = await screen.findByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '66' } });

      const updateButton = screen.getByRole('button', { name: /update|save/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(patientApi.updateFamilyMember).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Family Member', () => {
    it('should delete family member with confirmation', async () => {
      const mockMembers = [
        { _id: '1', name: 'Father', relationship: 'Father' }
      ];

      patientApi.getFamilyMembers.mockResolvedValue({
        success: true,
        data: { members: mockMembers }
      });

      patientApi.deleteFamilyMember.mockResolvedValue({ success: true });

      const FamilyTreePage = require('../../pages/patient/FamilyTreePage').default;
      renderWithRouter(<FamilyTreePage />);

      await waitFor(() => {
        expect(screen.getByText(/Father/)).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete|remove/i });
      fireEvent.click(deleteButton);

      const confirmButton = await screen.findByRole('button', { name: /confirm|yes|delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(patientApi.deleteFamilyMember).toHaveBeenCalledWith('1');
      });
    });
  });
});

describe('EmergencyContactPage - Emergency Contact Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display Emergency Contacts', () => {
    it('should load and display emergency contacts', async () => {
      const mockContacts = [
        { _id: '1', name: 'John Doe', phone: '0712345678', relationship: 'Brother' },
        { _id: '2', name: 'Jane Smith', phone: '0715678901', relationship: 'Sister' }
      ];

      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: mockContacts
      });

      const EmergencyContactPage = require('../../pages/patient/EmergencyContactPage').default;
      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      });
    });

    it('should display phone numbers correctly', async () => {
      const mockContacts = [
        { _id: '1', name: 'John', phone: '0712345678', relationship: 'Brother' }
      ];

      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: mockContacts
      });

      const EmergencyContactPage = require('../../pages/patient/EmergencyContactPage').default;
      renderWithRouter(<EmergencyContactPage />);

      await waitFor(() => {
        expect(screen.getByText(/0712345678/)).toBeInTheDocument();
      });
    });
  });

  describe('Add Emergency Contact', () => {
    it('should add new emergency contact', async () => {
      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: []
      });

      patientApi.addEmergencyContact.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'John', phone: '0712345678', relationship: 'Brother' }
      });

      const EmergencyContactPage = require('../../pages/patient/EmergencyContactPage').default;
      renderWithRouter(<EmergencyContactPage />);

      const addButton = await screen.findByRole('button', { name: /add|new/i });
      fireEvent.click(addButton);

      const nameInput = await screen.findByLabelText(/name/i);
      const phoneInput = await screen.findByLabelText(/phone/i);
      const relationshipInput = await screen.findByLabelText(/relationship/i);

      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });
      fireEvent.change(relationshipInput, { target: { value: 'Brother' } });

      const submitButton = screen.getByRole('button', { name: /add|save|submit/i });
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
      const EmergencyContactPage = require('../../pages/patient/EmergencyContactPage').default;
      renderWithRouter(<EmergencyContactPage />);

      const addButton = await screen.findByRole('button', { name: /add/i });
      fireEvent.click(addButton);

      const phoneInput = await screen.findByLabelText(/phone/i);
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/phone.*invalid|invalid.*phone|format/i)).toBeInTheDocument();
      });
    });

    it('should require at least one emergency contact', async () => {
      const EmergencyContactPage = require('../../pages/patient/EmergencyContactPage').default;
      renderWithRouter(<EmergencyContactPage />);

      const form = screen.getByRole('form', { name: /contact|emergency/i });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/at least one.*contact|add.*contact/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Emergency Contact', () => {
    it('should edit emergency contact', async () => {
      const mockContacts = [
        { _id: '1', name: 'John', phone: '0712345678', relationship: 'Brother' }
      ];

      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: mockContacts
      });

      patientApi.updateEmergencyContact.mockResolvedValue({
        success: true,
        data: { _id: '1', name: 'John', phone: '0719876543', relationship: 'Brother' }
      });

      const EmergencyContactPage = require('../../pages/patient/EmergencyContactPage').default;
      renderWithRouter(<EmergencyContactPage />);

      const editButton = await screen.findByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      const phoneInput = await screen.findByLabelText(/phone/i);
      fireEvent.change(phoneInput, { target: { value: '0719876543' } });

      const updateButton = screen.getByRole('button', { name: /update|save/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(patientApi.updateEmergencyContact).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Emergency Contact', () => {
    it('should delete emergency contact', async () => {
      const mockContacts = [
        { _id: '1', name: 'John', phone: '0712345678', relationship: 'Brother' }
      ];

      patientApi.getEmergencyContacts.mockResolvedValue({
        success: true,
        data: mockContacts
      });

      patientApi.deleteEmergencyContact.mockResolvedValue({ success: true });

      const EmergencyContactPage = require('../../pages/patient/EmergencyContactPage').default;
      renderWithRouter(<EmergencyContactPage />);

      const deleteButton = await screen.findByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const confirmButton = await screen.findByRole('button', { name: /confirm|yes/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(patientApi.deleteEmergencyContact).toHaveBeenCalledWith('1');
      });
    });
  });
});

describe('HealthReportsPage - Lab Reports & Results', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display Health Reports', () => {
    it('should load and display health reports', async () => {
      const mockReports = [
        {
          _id: '1',
          testName: 'Blood Test',
          testDate: '2024-04-10',
          status: 'Completed',
          filePath: 'path/to/report.pdf'
        },
        {
          _id: '2',
          testName: 'X-Ray',
          testDate: '2024-04-05',
          status: 'Completed',
          filePath: 'path/to/xray.pdf'
        }
      ];

      patientApi.getHealthReports.mockResolvedValue({
        success: true,
        data: mockReports
      });

      const HealthReportsPage = require('../../pages/patient/HealthReportsPage').default;
      renderWithRouter(<HealthReportsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Blood Test/)).toBeInTheDocument();
        expect(screen.getByText(/X-Ray/)).toBeInTheDocument();
      });
    });

    it('should filter reports by status', async () => {
      const mockReports = [
        { _id: '1', testName: 'Test 1', status: 'Completed' },
        { _id: '2', testName: 'Test 2', status: 'Pending' },
        { _id: '3', testName: 'Test 3', status: 'Completed' }
      ];

      patientApi.getHealthReports.mockResolvedValue({
        success: true,
        data: mockReports
      });

      const HealthReportsPage = require('../../pages/patient/HealthReportsPage').default;
      renderWithRouter(<HealthReportsPage />);

      await waitFor(() => {
        const statusFilter = screen.getByLabelText(/status|filter/i);
        fireEvent.change(statusFilter, { target: { value: 'Completed' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/Test 1/)).toBeInTheDocument();
        expect(screen.queryByText(/Test 2/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Download Reports', () => {
    it('should download health report PDF', async () => {
      const mockReports = [
        {
          _id: '1',
          testName: 'Blood Test',
          filePath: 'path/to/report.pdf',
          status: 'Completed'
        }
      ];

      patientApi.getHealthReports.mockResolvedValue({
        success: true,
        data: mockReports
      });

      patientApi.downloadReport.mockResolvedValue({
        success: true,
        data: new Blob(['PDF content'], { type: 'application/pdf' })
      });

      const HealthReportsPage = require('../../pages/patient/HealthReportsPage').default;
      renderWithRouter(<HealthReportsPage />);

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /download|view/i });
        fireEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(patientApi.downloadReport).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Report Details', () => {
    it('should display report details when clicked', async () => {
      const mockReports = [
        {
          _id: '1',
          testName: 'Blood Test',
          testDate: '2024-04-10',
          status: 'Completed',
          notes: 'All values normal'
        }
      ];

      patientApi.getHealthReports.mockResolvedValue({
        success: true,
        data: mockReports
      });

      const HealthReportsPage = require('../../pages/patient/HealthReportsPage').default;
      renderWithRouter(<HealthReportsPage />);

      await waitFor(() => {
        const reportItem = screen.getByText(/Blood Test/);
        fireEvent.click(reportItem);
      });

      await waitFor(() => {
        expect(screen.getByText(/All values normal/)).toBeInTheDocument();
      });
    });
  });
});

describe('HouseholdRegistrationPage - Household Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display Household Information', () => {
    it('should load household data', async () => {
      const mockHousehold = {
        _id: '1',
        head: 'John Doe',
        address: '123 Main St',
        members: 4,
        sector: 'Sector 1'
      };

      patientApi.getHouseholdData.mockResolvedValue({
        success: true,
        data: mockHousehold
      });

      const HouseholdRegistrationPage = require('../../pages/patient/HouseholdRegistrationPage').default;
      renderWithRouter(<HouseholdRegistrationPage />);

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Household Information', () => {
    it('should edit household data', async () => {
      const mockHousehold = {
        _id: '1',
        head: 'John Doe',
        address: '123 Main St',
        members: 4
      };

      patientApi.getHouseholdData.mockResolvedValue({
        success: true,
        data: mockHousehold
      });

      patientApi.updateHouseholdData.mockResolvedValue({
        success: true,
        data: { ...mockHousehold, members: 5 }
      });

      const HouseholdRegistrationPage = require('../../pages/patient/HouseholdRegistrationPage').default;
      renderWithRouter(<HouseholdRegistrationPage />);

      const editButton = await screen.findByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      const membersInput = await screen.findByLabelText(/members/i);
      fireEvent.change(membersInput, { target: { value: '5' } });

      const saveButton = screen.getByRole('button', { name: /save|update/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(patientApi.updateHouseholdData).toHaveBeenCalled();
      });
    });

    it('should validate required household fields', async () => {
      const HouseholdRegistrationPage = require('../../pages/patient/HouseholdRegistrationPage').default;
      renderWithRouter(<HouseholdRegistrationPage />);

      const editButton = await screen.findByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      const headInput = await screen.findByLabelText(/head.*household/i);
      fireEvent.change(headInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/head.*required|enter.*head/i)).toBeInTheDocument();
      });
    });
  });
});

describe('SymptomCheckerPage - Symptom Assessment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Symptom Selection', () => {
    it('should display symptom selection interface', async () => {
      const SymptomCheckerPage = require('../../pages/patient/SymptomCheckerPage').default;
      renderWithRouter(<SymptomCheckerPage />);

      expect(screen.getByText(/symptoms|select|check/i)).toBeInTheDocument();
    });

    it('should allow multiple symptom selection', async () => {
      const SymptomCheckerPage = require('../../pages/patient/SymptomCheckerPage').default;
      renderWithRouter(<SymptomCheckerPage />);

      const symptomCheckboxes = await screen.findAllByRole('checkbox');
      expect(symptomCheckboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Symptom Analysis', () => {
    it('should analyze selected symptoms', async () => {
      patientApi.analyzeSymptoms.mockResolvedValue({
        success: true,
        data: {
          possibleConditions: [
            { name: 'Common Cold', likelihood: '80%' },
            { name: 'Allergies', likelihood: '15%' }
          ],
          recommendation: 'See a doctor'
        }
      });

      const SymptomCheckerPage = require('../../pages/patient/SymptomCheckerPage').default;
      renderWithRouter(<SymptomCheckerPage />);

      const analyzeButton = await screen.findByRole('button', { name: /analyze|check|diagnose/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Common Cold/i)).toBeInTheDocument();
        expect(screen.getByText(/80%/)).toBeInTheDocument();
      });
    });

    it('should display recommendations', async () => {
      patientApi.analyzeSymptoms.mockResolvedValue({
        success: true,
        data: {
          recommendation: 'Please consult a healthcare professional'
        }
      });

      const SymptomCheckerPage = require('../../pages/patient/SymptomCheckerPage').default;
      renderWithRouter(<SymptomCheckerPage />);

      const analyzeButton = await screen.findByRole('button', { name: /analyze/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/consult.*healthcare/i)).toBeInTheDocument();
      });
    });

    it('should handle no symptoms selected error', async () => {
      const SymptomCheckerPage = require('../../pages/patient/SymptomCheckerPage').default;
      renderWithRouter(<SymptomCheckerPage />);

      const analyzeButton = await screen.findByRole('button', { name: /analyze/i });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/select.*symptoms|choose.*symptoms|no.*symptoms/i)).toBeInTheDocument();
      });
    });
  });

  describe('Symptom History', () => {
    it('should save symptom analysis history', async () => {
      patientApi.saveSymptomAnalysis.mockResolvedValue({
        success: true,
        data: { _id: '1' }
      });

      const SymptomCheckerPage = require('../../pages/patient/SymptomCheckerPage').default;
      renderWithRouter(<SymptomCheckerPage />);

      const saveButton = await screen.findByRole('button', { name: /save|history/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(patientApi.saveSymptomAnalysis).toHaveBeenCalled();
      });
    });
  });
});

describe('VisitReferralPage - Medical Referral Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display Referrals', () => {
    it('should load and display visit referrals', async () => {
      const mockReferrals = [
        {
          _id: '1',
          referredFrom: 'Dr. Smith',
          referredTo: 'Specialist',
          date: '2024-04-10',
          status: 'Active'
        }
      ];

      patientApi.getVisitReferrals.mockResolvedValue({
        success: true,
        data: mockReferrals
      });

      const VisitReferralPage = require('../../pages/patient/VisitReferralPage').default;
      renderWithRouter(<VisitReferralPage />);

      await waitFor(() => {
        expect(screen.getByText(/Dr. Smith/)).toBeInTheDocument();
      });
    });

    it('should filter referrals by status', async () => {
      const mockReferrals = [
        { _id: '1', referredTo: 'Specialist', status: 'Active' },
        { _id: '2', referredTo: 'General', status: 'Completed' }
      ];

      patientApi.getVisitReferrals.mockResolvedValue({
        success: true,
        data: mockReferrals
      });

      const VisitReferralPage = require('../../pages/patient/VisitReferralPage').default;
      renderWithRouter(<VisitReferralPage />);

      const statusFilter = await screen.findByLabelText(/status|filter/i);
      fireEvent.change(statusFilter, { target: { value: 'Active' } });

      await waitFor(() => {
        expect(screen.getByText(/Specialist/)).toBeInTheDocument();
      });
    });
  });

  describe('Create Referral', () => {
    it('should create new visit referral', async () => {
      patientApi.createVisitReferral.mockResolvedValue({
        success: true,
        data: { _id: '1', referredTo: 'Cardiologist' }
      });

      const VisitReferralPage = require('../../pages/patient/VisitReferralPage').default;
      renderWithRouter(<VisitReferralPage />);

      const createButton = await screen.findByRole('button', { name: /create|new|add/i });
      fireEvent.click(createButton);

      const referToInput = await screen.findByLabelText(/referred.*to|specialist/i);
      fireEvent.change(referToInput, { target: { value: 'Cardiologist' } });

      const submitButton = screen.getByRole('button', { name: /submit|create/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(patientApi.createVisitReferral).toHaveBeenCalled();
      });
    });
  });

  describe('Track Referral Status', () => {
    it('should update referral status', async () => {
      const mockReferrals = [
        { _id: '1', status: 'Active', referredTo: 'Specialist' }
      ];

      patientApi.getVisitReferrals.mockResolvedValue({
        success: true,
        data: mockReferrals
      });

      patientApi.updateReferralStatus.mockResolvedValue({
        success: true,
        data: { _id: '1', status: 'Completed' }
      });

      const VisitReferralPage = require('../../pages/patient/VisitReferralPage').default;
      renderWithRouter(<VisitReferralPage />);

      const statusButton = await screen.findByRole('button', { name: /active|status/i });
      fireEvent.click(statusButton);

      const completeButton = screen.getByRole('button', { name: /complete|mark.*complete/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(patientApi.updateReferralStatus).toHaveBeenCalledWith('1', 'Completed');
      });
    });
  });
});
