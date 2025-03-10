"use client";
import React, { useState, useMemo, useCallback, useRef } from "react";
import RequestsLayout from "../../RequestsLayout";
import { Button } from "@/components/ui/button";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { USERS, AccessRole, User } from "@/app/constants"; // adjust the import path as needed

function AdminUserManagementPage() {
  // Local state for managing users
  const [users, setUsers] = useState<User[]>(USERS);
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<AccessRole>(AccessRole.USER);

  // Handler for adding a new user
  const handleAddUser = () => {
    if (!newUserName.trim()) {
      // Optionally, show an error message
      return;
    }
    const newUser: User = {
      name: newUserName.trim(),
      role: newUserRole,
    };
    setUsers([...users, newUser]);
    setNewUserName("");
    setNewUserRole(AccessRole.USER);
  };

  // Define grid column definitions
  const columnDefs: ColDef<User>[] = useMemo(
    () => [
      { headerName: "Name", field: "name", sortable: true, filter: true },
      { headerName: "Role", field: "role", sortable: true, filter: true },
    ],
    []
  );

  const availableRoles = useMemo(
    () => Object.values(AccessRole).filter((role) => role !== AccessRole.GUEST),
    []
  );

  const gridApiRef = useRef<any>(null);
  const onGridReady = useCallback((params: any) => {
    gridApiRef.current = params.api;
  }, []);

  return (
    <RequestsLayout title="Catēna Administration">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>

        {/* New User Creation Form */}
        <div className="mb-6 border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Create New User</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <input
              type="text"
              placeholder="Enter user name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as AccessRole)}
              className="border p-2 rounded"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <Button onClick={handleAddUser} className="bg-blue-800 text-white">
              Add User
            </Button>
          </div>
        </div>

        {/* User List Table */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Current Users</h2>
          <div
            className="ag-theme-quartz mx-auto"
            style={{ height: "400px", width: "90%" }}
          >
            <AgGridReact<User>
              rowData={users}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              pagination={true}
              paginationPageSize={10}
            />
          </div>
        </div>
      </div>
    </RequestsLayout>
  );
}

export default AdminUserManagementPage;
