import { validationResult } from 'express-validator';
import authService from './auth.service.js';

/**
 * Handle validation errors from express-validator
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Verify JWT token from Authorization header
 * Adds decoded user data to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format. Use: Bearer <token>'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = await authService.verifyToken(token);
    
    // Attach user data to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Check if user is a patient
 */
export const isPatient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.userType !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This endpoint is only for patients.'
    });
  }

  next();
};

/**
 * Check if user is a health officer
 */
export const isHealthOfficer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.userType !== 'healthOfficer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This endpoint is only for health officers.'
    });
  }

  next();
};

/**
 * Check if user has specific role(s)
 * Usage: checkRole(['Admin', 'Lab_Technician'])
 */
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.userType !== 'healthOfficer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Role-based access is only for health officers.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if token is missing
 * Just adds user data to req.user if token is valid
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await authService.verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user data
    next();
  }
};
