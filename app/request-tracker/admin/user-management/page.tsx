"use client";
import React, { useState, useMemo, useCallback, useRef } from "react";
import RequestsLayout from "../../RequestsLayout";
import { Button } from "@/components/ui/button";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AccessRole, User } from "@/app/constants"; // adjust the import path as needed
import { useUserManagement } from "@/app/context/UserManagementContext";
import { Label } from "@/components/ui/label";

// Define a UserGroup interface.
interface UserGroup {
  name: string;
  userNames: string[];
}

function AdminUserManagementPage() {
  // Local state for managing users
  const { users, addUser } = useUserManagement();
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<AccessRole>(AccessRole.USER);

  // Handler for adding a new user
  const handleAddUser = () => {
    if (!newUserName.trim()) {
      // Optionally display an error message.
      return;
    }
    const newUser: User = {
      name: newUserName.trim(),
      role: newUserRole,
    };
    addUser(newUser);
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

  // *** User Group Module State ***
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState<string[]>(
    []
  );
  const [groups, setGroups] = useState<UserGroup[]>([]);

  // Handle change in the multi-select for user group assignment.
  const handleGroupUserSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const options = e.target.options;
    const selected: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedUsersForGroup(selected);
  };

  // Handler to add a new user group.
  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      // Optionally show an error message.
      return;
    }
    const newGroup: UserGroup = {
      name: newGroupName.trim(),
      userNames: selectedUsersForGroup,
    };
    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setSelectedUsersForGroup([]);
  };

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

        {/* User Group Module */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">User Groups</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Group Creation Form */}
            <div className="border p-4 rounded shadow flex-1">
              <h3 className="text-lg font-semibold mb-2">Create New Group</h3>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="border p-2 rounded"
                />
                <Label>Select Users to assign:</Label>
                <select
                  multiple
                  value={selectedUsersForGroup}
                  onChange={handleGroupUserSelectionChange}
                  className="border p-2 rounded h-32"
                >
                  {users.map((u) => (
                    <option key={u.name} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAddGroup}
                  className="bg-blue-800 text-white"
                >
                  Create Group
                </Button>
              </div>
            </div>

            {/* Existing Groups List */}
            <div
              className="border p-4 rounded shadow flex-1"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <h3 className="text-lg font-semibold mb-2">Existing Groups</h3>
              {groups.length > 0 ? (
                <ul className="space-y-2">
                  {groups.map((group, index) => (
                    <li key={index} className="border-b pb-2">
                      <p className="font-semibold">{group.name}</p>
                      <p className="text-sm">
                        Users: {group.userNames.join(", ") || "None"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No groups created yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequestsLayout>
  );
}

export default AdminUserManagementPage;
