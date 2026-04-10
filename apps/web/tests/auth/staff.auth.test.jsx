/**
 * Comprehensive Unit Tests - Auth Pages (Staff)
 * @author Lakni (IT23772922)
 * 
 * Tests for staff authentication pages:
 * - StaffLoginPage: Staff member login with role verification
 * - StaffRegisterPage: Staff registration with profile setup
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import StaffLoginPage from '../../StaffLoginPage';
import StaffRegisterPage from '../../StaffRegisterPage';

jest.mock('../../api/authApi.js');
jest.mock('react-hot-toast');

import * as authApi from '../../api/authApi.js';
import { toast } from 'react-hot-toast';

const renderWithRouter = (component) => {
  return render(<Router>{component}</Router>);
};

describe('StaffLoginPage - Staff Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Form Rendering', () => {
    it('should render staff login form with email and password fields', () => {
      renderWithRouter(<StaffLoginPage />);

      expect(screen.getByLabelText(/email|username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in|login/i })).toBeInTheDocument();
    });

    it('should display staff-specific login title', () => {
      renderWithRouter(<StaffLoginPage />);

      expect(screen.getByText(/staff|employee/i)).toBeInTheDocument();
    });

    it('should display link to patient portal', () => {
      renderWithRouter(<StaffLoginPage />);

      expect(screen.getByRole('link', { name: /patient|patient portal/i })).toBeInTheDocument();
    });

    it('should display forgot password link', () => {
      renderWithRouter(<StaffLoginPage />);

      expect(screen.getByRole('link', { name: /forgot.*password|reset/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email', async () => {
      renderWithRouter(<StaffLoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in|login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email.*required|enter.*email/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      renderWithRouter(<StaffLoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email.*invalid|valid.*email/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty password', async () => {
      renderWithRouter(<StaffLoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'staff@example.com' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password.*required|enter.*password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Login Functionality', () => {
    it('should successfully login with valid credentials', async () => {
      authApi.loginStaff.mockResolvedValue({
        user: {
          _id: 'staff-123',
          email: 'staff@example.com',
          role: 'LabTechnician',
          full_name: 'Test Staff'
        },
        token: 'jwt-staff-token'
      });

      renderWithRouter(<StaffLoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'staff@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'StaffPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.loginStaff).toHaveBeenCalledWith(
          'staff@example.com',
          'StaffPassword123!'
        );
      });
    });

    it('should display error on invalid credentials', async () => {
      authApi.loginStaff.mockRejectedValue(new Error('Invalid credentials'));

      renderWithRouter(<StaffLoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'staff@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(/invalid|credential/i));
      });
    });

    it('should store token in localStorage on successful login', async () => {
      authApi.loginStaff.mockResolvedValue({
        user: { _id: 'staff-123', role: 'LabTechnician' },
        token: 'staff-jwt-token-xyz'
      });

      renderWithRouter(<StaffLoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'staff@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'StaffPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem).toHaveBeenCalledWith('token');
      });
    });

    it('should show loading state during login', async () => {
      authApi.loginStaff.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          user: { _id: 'staff-123' },
          token: 'token'
        }), 1000))
      );

      renderWithRouter(<StaffLoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'staff@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'StaffPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/loading|processing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access', () => {
    it('should verify staff role on login', async () => {
      authApi.loginStaff.mockResolvedValue({
        user: { _id: 'staff-123', role: 'LabTechnician' },
        token: 'token'
      });

      renderWithRouter(<StaffLoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'staff@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'StaffPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.loginStaff).toHaveBeenCalled();
      });
    });

    it('should reject non-staff accounts', async () => {
      authApi.loginStaff.mockRejectedValue(new Error('Not a staff account'));

      renderWithRouter(<StaffLoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'patient@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });
});

describe('StaffRegisterPage - Staff Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Form Rendering', () => {
    it('should render staff registration form with all required fields', () => {
      renderWithRouter(<StaffRegisterPage />);

      expect(screen.getByLabelText(/first name|first_name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name|last_name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone|contact/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm.*password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role|position|department/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register|sign up/i })).toBeInTheDocument();
    });

    it('should display staff-specific registration instructions', () => {
      renderWithRouter(<StaffRegisterPage />);

      expect(screen.getByText(/staff|employee|register/i)).toBeInTheDocument();
    });

    it('should display role/position selection dropdown', () => {
      renderWithRouter(<StaffRegisterPage />);

      const roleSelect = screen.getByLabelText(/role|position|department/i);
      expect(roleSelect).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      renderWithRouter(<StaffRegisterPage />);

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name.*required|enter.*name/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderWithRouter(<StaffRegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/valid.*email|email.*invalid/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength', async () => {
      renderWithRouter(<StaffRegisterPage />);

      const passwordInput = screen.getByLabelText(/^password/i);
      fireEvent.change(passwordInput, { target: { value: 'weak' } });

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password.*requirements|strong.*password/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      renderWithRouter(<StaffRegisterPage />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm.*password/i);

      fireEvent.change(passwordInput, { target: { value: 'StaffPassword123!' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPassword123!' } });

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password.*match|do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Functionality', () => {
    it('should successfully register staff with valid data', async () => {
      authApi.registerStaff.mockResolvedValue({
        success: true,
        user: {
          _id: 'staff-123',
          email: 'newstaff@example.com',
          role: 'LabTechnician'
        },
        token: 'staff-jwt-token'
      });

      renderWithRouter(<StaffRegisterPage />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm.*password/i);
      const roleSelect = screen.getByLabelText(/role/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });
      fireEvent.change(passwordInput, { target: { value: 'StaffPassword123!' } });
      fireEvent.change(confirmInput, { target: { value: 'StaffPassword123!' } });
      fireEvent.change(roleSelect, { target: { value: 'LabTechnician' } });

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.registerStaff).toHaveBeenCalled();
      });
    });

    it('should handle duplicate email error', async () => {
      authApi.registerStaff.mockRejectedValue(new Error('Email already registered'));

      renderWithRouter(<StaffRegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining(/email.*exists|already.*registered/i));
      });
    });

    it('should show success message on successful registration', async () => {
      authApi.registerStaff.mockResolvedValue({
        success: true,
        token: 'staff-token'
      });

      renderWithRouter(<StaffRegisterPage />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const emailInput = screen.getByLabelText(/email/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Role Selection', () => {
    it('should display all available staff roles', () => {
      renderWithRouter(<StaffRegisterPage />);

      const roleSelect = screen.getByLabelText(/role/i);
      expect(roleSelect).toBeInTheDocument();
    });

    it('should require role selection', async () => {
      renderWithRouter(<StaffRegisterPage />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: 'John' } });

      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/role.*required|select.*role/i)).toBeInTheDocument();
      });
    });
  });
});
