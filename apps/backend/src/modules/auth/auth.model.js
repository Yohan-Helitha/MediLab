/**
 * Auth Models - Central export point
 * 
 * This file re-exports the user models used for authentication.
 * There's no separate "Auth" model because authentication works with
 * existing user entities: Members (patients) and HealthOfficers.
 */

import Member from '../patient/models/Member.js';
import HealthOfficer from './healthOfficer.model.js';

export { Member, HealthOfficer };
