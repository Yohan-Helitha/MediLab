import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Auth from './auth.model.js';
import Member from '../patient/models/Member.js';
import HealthOfficer from './healthOfficer.model.js';
import mongoose from 'mongoose';

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
   * Register a new patient
   */
  async registerPatient(registrationData) {
    const { full_name, email, contact_number, password } = registrationData;

    // Check if auth record already exists
    const existingAuth = await Auth.findOne({ email });
    if (existingAuth) {
      throw new Error('A user with this email already exists');
    }

    const passwordHash = await this.hashPassword(password);

    // 1. Create Profile (Member)
    const patientProfile = new Member({
      full_name,
      email,
      contact_number,
      address: 'Not Provided',
      gn_division: 'Not Provided',
      district: 'Not Provided',
      password_hash: passwordHash, // Mirroring for legacy code
      date_of_birth: new Date('2000-01-01'),
      gender: 'OTHER'
    });
    await patientProfile.save();

    // 2. Create Auth Record (Master Credentials)
    const authRecord = new Auth({
      email,
      passwordHash,
      role: 'patient',
      systemId: patientProfile.member_id,
      profileId: patientProfile._id,
      onModel: 'Member'
    });
    await authRecord.save();

    const token = this.generateToken({
      id: authRecord._id,
      systemId: patientProfile.member_id,
      profileId: patientProfile._id,
      userType: 'patient',
      fullName: patientProfile.full_name
    });

    return { 
      user: { 
        email: authRecord.email, 
        role: authRecord.role, 
        systemId: patientProfile.member_id, 
        isProfileComplete: patientProfile.isProfileComplete || false,
        profile: patientProfile 
      }, 
      token 
    };
  }

  /**
   * Register a new health officer
   */
  async registerHealthOfficer(registrationData) {
    const { fullName, email, contactNumber, password, role } = registrationData;

    // Check if auth record already exists
    const existingAuth = await Auth.findOne({ email });
    if (existingAuth) {
      throw new Error('A user with this email already exists');
    }

    const passwordHash = await this.hashPassword(password);

    // 1. Create Profile (HealthOfficer)
    const officerProfile = new HealthOfficer({
      fullName,
      email,
      contactNumber,
      role,
      username: email,
      passwordHash: passwordHash // Mirroring for legacy code
    });
    await officerProfile.save();

    // 2. Create Auth Record (Master Credentials)
    const authRecord = new Auth({
      email,
      passwordHash,
      role: role,
      systemId: officerProfile.employeeId,
      profileId: officerProfile._id,
      onModel: 'HealthOfficer'
    });
    await authRecord.save();

    const token = this.generateToken({
      id: authRecord._id,
      systemId: officerProfile.employeeId,
      profileId: officerProfile._id,
      userType: 'staff',
      role: authRecord.role,
      fullName: officerProfile.fullName
    });

    return { 
      user: { 
        email: authRecord.email, 
        role: authRecord.role, 
        userType: officerProfile.role === 'patient' ? 'patient' : 'staff',
        systemId: officerProfile.employeeId, 
        profile: officerProfile 
      }, 
      token 
    };
  }

  /**
   * Universal Login (Patient or Staff)
   */
  async login(credentials) {
    const { identifier, password } = credentials;

    // 1. Find the Auth record using email, systemId (Employee ID / Member ID), or contact number (via profile)
    let authRecord = await Auth.findOne({ 
      $or: [
        { email: identifier },
        { systemId: identifier }
      ]
    });

    if (!authRecord) {
      throw new Error('Invalid credentials');
    }

    // 2. Validate password
    const isPasswordValid = await this.comparePassword(password, authRecord.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 3. Dynamically fetch the linked profile (Member or HealthOfficer)
    const ProfileModel = mongoose.model(authRecord.onModel);
    const profile = await ProfileModel.findById(authRecord.profileId);
    if (!profile) {
      throw new Error('Profile not found for this user');
    }

    // 4. Generate token with unified payload
    const token = this.generateToken({
      id: authRecord._id,
      systemId: authRecord.systemId,
      profileId: authRecord.profileId,
      userType: authRecord.onModel === 'Member' ? 'patient' : 'staff',
      role: authRecord.role,
      fullName: profile.full_name || profile.fullName
    });

    return { 
      user: { 
        email: authRecord.email, 
        role: authRecord.role, 
        userType: authRecord.onModel === 'Member' ? 'patient' : 'staff',
        systemId: authRecord.systemId,
        firstName: profile.full_name?.split(' ')[0] || profile.fullName?.split(' ')[0],
        isProfileComplete: profile.isProfileComplete || false,
        profile 
      }, 
      token 
    };
  }

  /**
   * Health Officer specific Login (Aliased for backward compatibility)
   */
  async loginHealthOfficer(credentials) {
    return this.login(credentials);
  }

  /**
   * Patient specific Login (Aliased for backward compatibility)
   */
  async loginPatient(credentials) {
    return this.login(credentials);
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
    const authRecord = await Auth.findById(decoded.id);
    if (!authRecord) {
      throw new Error('User not found');
    }

    const ProfileModel = mongoose.model(authRecord.onModel);
    const profile = await ProfileModel.findById(authRecord.profileId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }

    return { user: profile, userType: authRecord.onModel === 'Member' ? 'patient' : 'healthOfficer', role: authRecord.role };
  }

  /**
   * Legacy login methods for backward compatibility with controller
   */
  async loginPatient(credentials) {
    return this.login(credentials);
  }

  async loginHealthOfficer(credentials) {
    return this.login(credentials);
  }

  /**
   * Update user profile and security settings
   */
  async updateProfile(decodedUser, updateData) {
    const { email, contact_number, currentPassword, newPassword } = updateData;

    // 1. Find the Auth record
    const authRecord = await Auth.findById(decodedUser.id);
    if (!authRecord) {
      throw new Error('User not found');
    }

    // 2. Fetch the Profile
    const ProfileModel = mongoose.model(authRecord.onModel);
    const profile = await ProfileModel.findById(authRecord.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // 3. Handle Password Change (if requested)
    if (newPassword) {
      if (!currentPassword) {
        throw new Error('Current password is required to set a new one');
      }

      const isMatch = await this.comparePassword(currentPassword, authRecord.passwordHash);
      if (!isMatch) {
        throw new Error('Incorrect current password');
      }

      const newHash = await this.hashPassword(newPassword);
      authRecord.passwordHash = newHash;
      
      // Update password_hash in Profile too if it exists (for compatibility)
      if (profile.password_hash !== undefined) {
        profile.password_hash = newHash;
      }
    }

    // 4. Update Email & Contact Number
    if (email && email !== authRecord.email) {
      const emailExists = await Auth.findOne({ email, _id: { $ne: authRecord._id } });
      if (emailExists) {
        throw new Error('This email is already taken');
      }
      authRecord.email = email;
      profile.email = email;
    }

    if (contact_number) {
      profile.contact_number = contact_number;
    }

    // 5. Save changes
    await authRecord.save();
    await profile.save();

    return {
      email: authRecord.email,
      role: authRecord.role,
      userType: authRecord.onModel === 'Member' ? 'patient' : 'staff',
      systemId: authRecord.systemId,
      profile: profile
    };
  }
}

export default new AuthService();
