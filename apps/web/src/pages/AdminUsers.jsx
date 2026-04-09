import React, { useEffect, useState } from "react";
import { fetchAdminUsers } from "../api/adminUsersApi";

const ROLE_OPTIONS = [
  "All",
  "Admin",
  "Lab_Technician",
  "MOH",
  "PHI",
  "Nurse",
  "Doctor",
  "HealthOfficer",
  "Staff",
];

const roleLabel = (r) => {
  if (!r) return "Unknown";
  return r.replace(/_/g, " ");
};

export default function AdminUsers() {
  const [selectedRole, setSelectedRole] = useState("All");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async (role) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAdminUsers({ role });
      setUsers(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(selectedRole);
  }, [selectedRole]);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="text-sm text-slate-500">Browse system users by role.</p>
      </div>

      <div className="mb-4 flex items-center space-x-2 overflow-x-auto">
        {ROLE_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedRole === r ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {roleLabel(r)}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm p-4">
        {isLoading && <div className="text-sm text-slate-500">Loading users...</div>}
        {error && <div className="text-sm text-rose-600">{error}</div>}

        {!isLoading && users.length === 0 && (
          <div className="text-sm text-slate-500">No users found for this role.</div>
        )}

        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 border-b">
                  <th className="py-2 pr-4">Full name</th>
                  <th className="py-2 pr-4">Gender</th>
                  <th className="py-2 pr-4">Contact number</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id || u.id || u.username} className="odd:bg-slate-50">
                    <td className="py-3 pr-4">{u.fullName || u.full_name || u.profileName || "-"}</td>
                    <td className="py-3 pr-4">{(u.gender || "").toString()}</td>
                    <td className="py-3 pr-4">{u.contactNumber || u.contact_number || "-"}</td>
                    <td className="py-3 pr-4">{u.email || "-"}</td>
                    <td className="py-3 pr-4">{roleLabel(u.role)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
