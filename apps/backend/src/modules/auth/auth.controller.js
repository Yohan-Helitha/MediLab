import authService from './auth.service.js';

class AuthController {
  /**
   * Register a new patient
   * POST /api/auth/patient/register
   */
  async registerPatient(req, res) {
    try {
      const result = await authService.registerPatient(req.body);
      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Login patient
   * POST /api/auth/patient/login
   */
  async loginPatient(req, res) {
    try {
      const result = await authService.loginPatient(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Register a new health officer
   * POST /api/auth/health-officer/register
   */
  async registerHealthOfficer(req, res) {
    try {
      const result = await authService.registerHealthOfficer(req.body);
      res.status(201).json({
        success: true,
        message: 'Health officer registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Login health officer
   * POST /api/auth/health-officer/login
   */
  async loginHealthOfficer(req, res) {
    try {
      const result = await authService.loginHealthOfficer(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/profile
   * Requires authentication middleware
   */
  async getProfile(req, res) {
    try {
      const result = await authService.getUserProfile(req.user);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Verify token
   * POST /api/auth/verify
   */
  async verifyToken(req, res) {
    try {
      const { token } = req.body;
      const decoded = await authService.verifyToken(token);
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: decoded
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Logout (client-side token removal)
   * POST /api/auth/logout
   */
  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.'
    });
  }
}

export default new AuthController();
