/**
 * Test Type Validation
 *
 * RESPONSIBILITY CLARIFICATION (Feb 26, 2026):
 * TestType request validation is managed by the Lab Operations Component (Test Catalog Module).
 * This Test Management Component does not perform TestType CRUD operations.
 *
 * For TestType validation schemas, see Lab Operations Component.
 *
 * This module maintains only:
 * - testType.model.js: Shared data model with schema-level validation
 *
 * Integration:
 * - Result module uses TestType model for referencing test configurations
 * - Notification module uses TestType model for test information
 */

// No validation schemas in this file - TestType request validation is managed by Lab Operations Component
