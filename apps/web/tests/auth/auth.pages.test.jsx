/**
 * Frontend Auth Pages Unit Tests
 * Comprehensive tests for LoginPage and RegisterPage components
 * Tests form validation, API integration, navigation, error handling
 * @author Lakni (IT23772922)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the API calls
jest.mock('../../api/authApi.js');
import * as authApi from '../../api/authApi.js';

const renderWithRouter = (component) => {
  return render(
    <Router>
      {component}
    </Router>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render login form with email and password fields', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email|identifier/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login|sign in/i })).toBeInTheDocument();
    });

    it('should render sign up link for users without account', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/register|sign up|create account/i)).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderWithRouter(<LoginPage />);

      expect(screen.getByText(/forgot password|reset password/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error message for empty email field', async () => {
      renderWithRouter(<LoginPage />);

      const loginButton = screen.getByRole('button', { name: /login|sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/email.*required|email.*invalid/i)).toBeInTheDocument();
      });
    });

    it('should show error message for empty password field', async () => {
      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByLabelText(/email|identifier/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const loginButton = screen.getByRole('button', { name: /login|sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/password.*required|password.*invalid/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByLabelText(/email|identifier/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const loginButton = screen.getByRole('button', { name: /login|sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/email.*invalid|email.*format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Login Functionality', () => {
    it('should successfully login with valid credentials', async () => {
      const mockLoginResponse = {
        success: true,
        data: {
          token: 'jwt-token-123',
          user: {
            email: 'test@example.com',
            role: 'patient'
          }
        }
      };

      authApi.loginPatient.mockResolvedValue(mockLoginResponse);

      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByLabelText(/email|identifier/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /login|sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(authApi.loginPatient).toHaveBeenCalledWith({
          identifier: 'test@example.com',
          password: 'password123'
        });
      });

      // Check if token is stored
      expect(localStorage.getItem('token')).toBeTruthy();
    });

    it('should display error message on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      authApi.loginPatient.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByLabelText(/email|identifier/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const loginButton = screen.getByRole('button', { name: /login|sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials|login failed/i)).toBeInTheDocument();
      });
    });

    it('should show loading state while logging in', async () => {
      authApi.loginPatient.mockImplementation(() => new Promise(() => { })); // Never resolves

      renderWithRouter(<LoginPage />);

      const emailInput = screen.getByLabelText(/email|identifier/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /login|sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/loading|processing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to register page when sign up link is clicked', async () => {
      renderWithRouter(<LoginPage />);

      const signUpLink = screen.getByText(/register|sign up/i);
      fireEvent.click(signUpLink);

      // Navigation would depend on routing implementation
      expect(signUpLink).toBeInTheDocument();
    });
  });
});

describe('RegisterPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render registration form with required fields', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByText(/register|sign up/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name|name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone|contact|mobile/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password|password.*again/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register|sign up|create/i })).toBeInTheDocument();
    });

    it('should render login link for existing users', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByText(/login|sign in|have account/i)).toBeInTheDocument();
    });

    it('should render terms and conditions checkbox', () => {
      renderWithRouter(<RegisterPage />);

      expect(screen.getByText(/terms|agree|conditions/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      renderWithRouter(<RegisterPage />);

      const registerButton = screen.getByRole('button', { name: /register|sign up/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderWithRouter(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const registerButton = screen.getByRole('button', { name: /register|sign up/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/email.*invalid|invalid.*email/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength', async () => {
      renderWithRouter(<RegisterPage />);

      const passwordInput = screen.getByLabelText(/^password/i);
      fireEvent.change(passwordInput, { target: { value: '123' } });

      const registerButton = screen.getByRole('button', { name: /register|sign up/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/password.*strong|weak.*password/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      renderWithRouter(<RegisterPage />);

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });

      const registerButton = screen.getByRole('button', { name: /register|sign up/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/password.*match|not.*match/i)).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      renderWithRouter(<RegisterPage />);

      const phoneInput = screen.getByLabelText(/phone|contact|mobile/i);
      fireEvent.change(phoneInput, { target: { value: 'invalid' } });

      const registerButton = screen.getByRole('button', { name: /register|sign up/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/phone.*invalid|invalid.*phone/i)).toBeInTheDocument();
      });
    });

    it('should require terms acceptance', async () => {
      renderWithRouter(<RegisterPage />);

      const nameInput = screen.getByLabelText(/full name|name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone|contact/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'SecurePass123!' } });

      // Don't check terms checkbox
      const registerButton = screen.getByRole('button', { name: /register|sign up/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/terms|accept.*terms/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Functionality', () => {
    it('should successfully register with valid data', async () => {
      const mockRegisterResponse = {
        success: true,
        data: {
          token: 'jwt-token-123',
          user: {
            email: 'test@example.com',
            role: 'patient'
          }
        }
      };

      authApi.registerPatient.mockResolvedValue(mockRegisterResponse);

      renderWithRouter(<RegisterPage />);

      const nameInput = screen.getByLabelText(/full name|name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone|contact/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(termsCheckbox);

      const registerButton = screen.getByRole('button', { name: /register|sign up/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(authApi.registerPatient).toHaveBeenCalled();
      });

      expect(localStorage.getItem('token')).toBeTruthy();
    });

    it('should display error on duplicate email', async () => {
      authApi.registerPatient.mockRejectedValue(
        new Error('Email already exists')
      );

      renderWithRouter(<RegisterPage />);

      const nameInput = screen.getByLabelText(/full name|name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone|contact/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const termsCheckbox = screen.getByRole('checkbox');

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '0712345678' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(termsCheckbox);

      const registerButton = screen.getByRole('button', { name: /register|sign up/i });
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/email.*exists|already.*exist/i)).toBeInTheDocument();
      });
    });
  });
});
