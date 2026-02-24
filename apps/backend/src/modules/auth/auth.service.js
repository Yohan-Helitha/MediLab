import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Member from '../patient/models/Member.js';
import HealthOfficer from './healthOfficer.model.js';

class AuthService {
  /**
   * Generate JWT token
   */
  generateToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compare passwords
   */
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Register a new patient (member)
   */
  async registerPatient(registrationData) {
    const {
      household_id,
      full_name,
      address,
      contact_number,
      nic,
      password,
      date_of_birth,
      gender,
      gn_division,
      district,
      photo,
      disability_status,
      pregnancy_status
    } = registrationData;

    // Check if patient with this NIC already exists
    if (nic) {
      const existingPatient = await Member.findOne({ nic });
      if (existingPatient) {
        throw new Error('A patient with this NIC already exists');
      }
    }

    // Check if contact number already exists
    const existingContact = await Member.findOne({ contact_number });
    if (existingContact) {
      throw new Error('A patient with this contact number already exists');
    }

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Create new patient
    const patient = new Member({
      household_id,
      full_name,
      address,
      contact_number,
      nic,
      password_hash,
      date_of_birth,
      gender,
      gn_division,
      district,
      photo,
      disability_status,
      pregnancy_status
    });

    await patient.save();

    // Generate token
    const token = this.generateToken({
      id: patient._id,
      member_id: patient.member_id,
      userType: 'patient',
      full_name: patient.full_name
    });

    // Return patient data without password
    const patientData = patient.toObject();
    delete patientData.password_hash;

    return {
      patient: patientData,
      token
    };
  }

  /**
   * Login patient (member)
   */
  async loginPatient(credentials) {
    const { identifier, password } = credentials; // identifier can be member_id, nic, or contact_number

    // Find patient by member_id, nic, or contact_number
    const patient = await Member.findOne({
      $or: [
        { member_id: identifier },
        { nic: identifier },
        { contact_number: identifier }
      ]
    });

    if (!patient) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, patient.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      id: patient._id,
      member_id: patient.member_id,
      userType: 'patient',
      full_name: patient.full_name
    });

    // Return patient data without password
    const patientData = patient.toObject();
    delete patientData.password_hash;

    return {
      patient: patientData,
      token
    };
  }

  /**
   * Register a new health officer
   */
  async registerHealthOfficer(registrationData) {
    const {
      fullName,
      gender,
      employeeId,
      contactNumber,
      email,
      assignedArea,
      role,
      username,
      password
    } = registrationData;

    // Check if health officer with this employee ID already exists
    const existingEmployee = await HealthOfficer.findOne({ employeeId });
    if (existingEmployee) {
      throw new Error('A health officer with this employee ID already exists');
    }

    // Check if email already exists
    const existingEmail = await HealthOfficer.findOne({ email });
    if (existingEmail) {
      throw new Error('A health officer with this email already exists');
    }

    // Check if username already exists
    const existingUsername = await HealthOfficer.findOne({ username });
    if (existingUsername) {
      throw new Error('This username is already taken');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create new health officer
    const healthOfficer = new HealthOfficer({
      fullName,
      gender,
      employeeId,
      contactNumber,
      email,
      assignedArea,
      role,
      username,
      passwordHash,
      isActive: true
    });

    await healthOfficer.save();

    // Generate token
    const token = this.generateToken({
      id: healthOfficer._id,
      employeeId: healthOfficer.employeeId,
      userType: 'healthOfficer',
      role: healthOfficer.role,
      fullName: healthOfficer.fullName
    });

    // Return health officer data without password
    const officerData = healthOfficer.toObject();
    delete officerData.passwordHash;

    return {
      healthOfficer: officerData,
      token
    };
  }

  /**
   * Login health officer
   */
  async loginHealthOfficer(credentials) {
    const { identifier, password } = credentials; // identifier can be employeeId, email, or username

    // Find health officer by employeeId, email, or username
    const healthOfficer = await HealthOfficer.findOne({
      $or: [
        { employeeId: identifier },
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!healthOfficer) {
      throw new Error('Invalid credentials');
    }

    // Check if account is active
    if (!healthOfficer.isActive) {
      throw new Error('Your account has been deactivated. Please contact the administrator.');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, healthOfficer.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      id: healthOfficer._id,
      employeeId: healthOfficer.employeeId,
      userType: 'healthOfficer',
      role: healthOfficer.role,
      fullName: healthOfficer.fullName
    });

    // Return health officer data without password
    const officerData = healthOfficer.toObject();
    delete officerData.passwordHash;

    return {
      healthOfficer: officerData,
      token
    };
  }

  /**
   * Verify token and return user data
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
      );
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user profile by token
   */
  async getUserProfile(decoded) {
    if (decoded.userType === 'patient') {
      const patient = await Member.findById(decoded.id).select('-password_hash');
      if (!patient) {
        throw new Error('Patient not found');
      }
      return { user: patient, userType: 'patient' };
    } else if (decoded.userType === 'healthOfficer') {
      const healthOfficer = await HealthOfficer.findById(decoded.id).select('-passwordHash');
      if (!healthOfficer) {
        throw new Error('Health officer not found');
      }
      if (!healthOfficer.isActive) {
        throw new Error('Account is deactivated');
      }
      return { user: healthOfficer, userType: 'healthOfficer' };
    } else {
      throw new Error('Invalid user type');
    }
  }
}

export default new AuthService();
