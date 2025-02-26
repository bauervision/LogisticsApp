// WorkflowComponent.tsx
import React, { useState, useEffect, useRef, memo } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useWorkflow } from "@/app/context/WorkflowContext";
import workflow from "@/app/workflow-engine/workflow";
import { useUser } from "@/app/context/UserContext";
import { AccessRole, USERS } from "@/app/constants"; // Import USERS here
import RequestToast, { showToast } from "../Requests/RequestToast";

const WorkflowComponent: React.FC = memo(() => {
  const {
    state,
    dispatch,
    addItem,
    saveWorkflow,
    deleteWorkflow,
    unloadWorkflow,
    setLoading,
    loading,
    currentWorkflowName,
    setCurrentWorkflowName,
    getSavedWorkflows,
  } = useWorkflow();

  const { user } = useUser();
  const [newItemName, setNewItemName] = useState<string>("");
  const [newWorkflowName, setNewWorkflowName] = useState<string>("");
  const [workflowKey, setWorkflowKey] = useState<string>("");
  const [workflowDescription, setWorkflowDescription] = useState<string>("");

  const [itemRefs, setItemRefs] = useState<
    Record<string, React.RefObject<HTMLInputElement>>
  >({});

  // Track the editing item and dialog state
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  // Track items that were newly inserted and need a name save
  const [unsavedItems, setUnsavedItems] = useState<Set<string>>(new Set());

  // Track items whose names have been modified from their original names
  const [changedItems, setChangedItems] = useState<Set<string>>(new Set());

  // Store the original name of each item at load or creation time
  const [originalItemNames, setOriginalItemNames] = useState<
    Record<string, string>
  >({});

  const inputRef = useRef<HTMLInputElement>(null);

  // Track if we need to save after performing certain actions
  const [needsSave, setNeedsSave] = useState(false);

  // Track collapsed items
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Toggle collapse state for an item
  const toggleCollapse = (itemId: string) => {
    setCollapsedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(itemId)) {
        updated.delete(itemId); // Expand if collapsed
      } else {
        updated.add(itemId); // Collapse if expanded
      }
      return updated;
    });
  };

  const handleSaveWorkflow = () => {
    if (currentWorkflowName) {
      saveWorkflow(currentWorkflowName);
      setTimeout(() => null, 2000);
      showToast("Workflow Saved successfully", "success");
      getSavedWorkflows();
    } else {
      setTimeout(() => null, 500);
      showToast("Workflow Requires a Name!", "error");
    }
  };

  const handleDeleteWorkflow = () => {
    if (currentWorkflowName) {
      deleteWorkflow(currentWorkflowName);
      setCurrentWorkflowName("");
      setWorkflowKey("");
      setWorkflowDescription("");
      setNewWorkflowName("");
      setTimeout(() => null, 2000);
      showToast("Workflow Deleted successfully", "success");
      setIsDeleteDialogOpen(false); // Close the dialog
    }
  };

  const handleOpenDeleteDialog = () => {
    if (currentWorkflowName) {
      setIsDeleteDialogOpen(true); // Open the dialog
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false); // Close the dialog without deleting
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      setTimeout(() => null, 500);
      showToast("Item Requires a Name!", "error");
      return;
    }
    console.log("handleAddItem called");
    addItem(newItemName);
    setNewItemName("");
    setNeedsSave(true);
  };

  const handleTransition = (itemId: string, action: string) => {
    dispatch({ type: "transition", itemId, action });
    setNeedsSave(true); // State changed, might need saving
  };

  const handleInsertAfter = (itemId: string) => {
    const newId = `item-${Date.now()}`;
    dispatch({ type: "insertAfter", itemId, newItemId: newId, name: "" });
    setUnsavedItems((prev) => new Set(prev).add(newId));

    setItemRefs((prev) => ({
      ...prev,
      [newId]: React.createRef(),
    }));

    setTimeout(() => {
      itemRefs[newId]?.current?.focus();
    }, 0);
    setNeedsSave(true);
  };

  const handleDeleteStep = (itemId: string) => {
    dispatch({ type: "deleteStep", itemId });
    if (unsavedItems.has(itemId)) {
      setUnsavedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
    if (changedItems.has(itemId)) {
      setChangedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
    setNeedsSave(true);
  };

  const handleRemoveAllBelow = (itemId: string) => {
    dispatch({ type: "removeAllBelow", itemId });
    setNeedsSave(true);
  };

  const handleCreateNewWorkflow = () => {
    if (newWorkflowName.trim()) {
      const newWorkflowState = {
        rootItem: undefined, // No root item initially
        name: "New Workflow",
        items: {}, // Empty items list
        workflowKey: workflowKey.trim(),
        workflowDescription: workflowDescription.trim(),
      };

      // Dispatch action to initialize the workflow state with metadata
      dispatch({
        type: "loadWorkflow",
        workflowState: newWorkflowState,
      });

      setCurrentWorkflowName(newWorkflowName); // Set the current workflow name
      saveWorkflow(newWorkflowName); // Save the workflow immediately

      // Sync local state to the new workflow metadata
      setWorkflowKey(newWorkflowState.workflowKey);
      setWorkflowDescription(newWorkflowState.workflowDescription);

      setNeedsSave(true); // Mark as needing save

      // Clear the input fields for future workflow creation
      setNewWorkflowName("");
    } else {
      alert("Workflow requires a name!");
    }
  };

  const handleUnloadWorkflow = () => {
    unloadWorkflow();
    setWorkflowKey("");
    setWorkflowDescription("");
    setNewWorkflowName("");
  };

  useEffect(() => {
    if (state.rootItem && loading) {
      setLoading(false);
    }
  }, [state.rootItem, loading, setLoading]);

  const handleUpdateName = (itemId: string, newName: string) => {
    dispatch({ type: "updateName", itemId, name: newName });
    setNeedsSave(true);

    const originalName = originalItemNames[itemId] || "";
    const trimmedName = newName.trim();

    if (unsavedItems.has(itemId)) {
      // For unsaved items, simply updating the name is fine.
      return;
    }

    if (trimmedName.length > 0 && trimmedName !== originalName) {
      setChangedItems((prev) => new Set(prev).add(itemId));
    } else {
      setChangedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
  };

  const handleSaveItemName = (itemId: string) => {
    if (unsavedItems.has(itemId)) {
      setUnsavedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
    if (changedItems.has(itemId)) {
      setChangedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
    const updatedItems = { ...originalItemNames };
    updatedItems[itemId] = state.items[itemId].name;
    setOriginalItemNames(updatedItems);
    setNeedsSave(true);
  };

  useEffect(() => {
    if (needsSave && currentWorkflowName && state.rootItem) {
      console.log(
        "State changed, saving workflow:",
        currentWorkflowName,
        state
      );

      const newOriginals = { ...originalItemNames };
      for (const [id, item] of Object.entries(state.items)) {
        if (!newOriginals[id]) {
          newOriginals[id] = item.name;
        }
      }
      setOriginalItemNames(newOriginals);

      saveWorkflow(currentWorkflowName);
      setNeedsSave(false);
    }
  }, [state, currentWorkflowName, needsSave, saveWorkflow, originalItemNames]);

  const handleEditClick = (itemId: string) => {
    const item = state.items[itemId];
    if (item) {
      setEditingItem(itemId);
      setEditData({ ...item });
      setIsDialogOpen(true);
    }
  };

  const handleEditChange = (key: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      dispatch({ type: "updateItem", itemId: editingItem, data: editData });
      saveWorkflow(currentWorkflowName);
      setEditingItem(null);
      setEditData({});
      setIsDialogOpen(false);
      setNeedsSave(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditData({});
    setIsDialogOpen(false);
  };

  const handleWorkflowKeyChange = (key: string) => {
    setWorkflowKey(key);
    dispatch({ type: "updateWorkflowMetadata", key });
  };

  const handleWorkflowDescriptionChange = (description: string) => {
    setWorkflowDescription(description);
    dispatch({ type: "updateWorkflowMetadata", description });
  };

  const handleAddFirstItem = () => {
    const rootItemId = `root-${Date.now()}`;
    dispatch({
      type: "initialize",
      itemId: rootItemId,
      name: newItemName.trim(),
    });
    setNewItemName("");
    setNeedsSave(true);
  };

  const renderItem = (itemId: string): JSX.Element => {
    if (!state.items || !state.items[itemId]) return <></>;
    const item = state.items[itemId];
    const isCollapsed = collapsedItems.has(item.id);
    const isUnsaved = unsavedItems.has(item.id);
    const isChanged = changedItems.has(item.id);
    const trimmedName = item.name.trim();
    const showSaveName = (isUnsaved || isChanged) && trimmedName.length > 0;

    return (
      <li key={item.id} className="mb-4 p-4 border border-gray-300 rounded-md">
        <div className="flex space-x-4 items-center">
          <button
            onClick={() => toggleCollapse(item.id)}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? "▶" : "▼"}
          </button>
          <input
            ref={itemRefs[item.id]}
            type="text"
            value={item.name}
            onChange={(e) => handleUpdateName(item.id, e.target.value)}
            placeholder="Enter item name"
            className="p-2 border border-gray-300 rounded-md"
          />
          <p className="text-lg">
            {/* If nextApprover is set, display it */}
            {item.nextApprover ? (
              <>
                {" "}
                - Next Approver:{" "}
                <span className="font-semibold">{item.nextApprover}</span>
              </>
            ) : (
              <>Needs Approver Assigned</>
            )}
          </p>
          {showSaveName && (
            <button
              onClick={() => handleSaveItemName(item.id)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition whitespace-nowrap"
            >
              Save Name
            </button>
          )}
        </div>
        <div className="flex flex-wrap space-x-2 mt-2">
          {/* {Object.keys(workflow.states[item.currentState].on).map((action) => (
            <div
              key={action}
              //onClick={() => handleTransition(item.id, action)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition whitespace-nowrap"
            >
              {action}
            </div>
          ))} */}

          {user.role !== AccessRole.USER && (
            <>
              <button
                onClick={() => handleEditClick(item.id)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleInsertAfter(item.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition whitespace-nowrap"
              >
                Insert After
              </button>
              <button
                onClick={() => handleDeleteStep(item.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition whitespace-nowrap"
              >
                Delete Step
              </button>
              <button
                onClick={() => handleRemoveAllBelow(item.id)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition whitespace-nowrap"
              >
                Remove All Below
              </button>
            </>
          )}
        </div>
        {!isCollapsed && item.children.length > 0 && (
          <ul className="pl-5 list-disc">
            {item.children.map((childId) => renderItem(childId))}
          </ul>
        )}
      </li>
    );
  };

  // useEffect(() => {
  //   console.log(
  //     "Syncing metadata:",
  //     state.workflowKey,
  //     state.workflowDescription
  //   );

  //   if (state.workflowKey !== workflowKey) {
  //     setWorkflowKey(state.workflowKey || ""); // Sync workflowKey
  //   }

  //   if (state.workflowDescription !== workflowDescription) {
  //     setWorkflowDescription(state.workflowDescription || ""); // Sync workflowDescription
  //   }
  // }, [
  //   state.workflowKey,
  //   state.workflowDescription,
  //   workflowKey,
  //   workflowDescription,
  // ]);

  return (
    <div className="p-6 mx-4 bg-slate-200 rounded-xl shadow-md space-y-4 ">
      <RequestToast />
      {/* Delete Workflow Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workflow? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={handleDeleteWorkflow}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Delete
            </button>
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Modify the details for this workflow item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={editData.name || ""}
                onChange={(e) => handleEditChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>

            {/* New Dropdown for Next Approver */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Next Approver
              </label>
              <select
                value={editData.nextApprover || ""}
                onChange={(e) =>
                  handleEditChange("nextApprover", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="">Select Next Approver</option>
                {USERS.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restrict "Create New Workflow" based on user role */}
      {user.role !== AccessRole.USER && !currentWorkflowName && (
        <div>
          <h3 className="block text-lg font-medium text-gray-700 text-center pb-4">
            Create a New Workflow
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label
                htmlFor="workflow-key"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Workflow Key
              </label>
              <input
                id="workflow-key"
                type="text"
                value={workflowKey}
                onChange={(e) => handleWorkflowKeyChange(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
                placeholder="Enter workflow key"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="workflow-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Workflow Name
              </label>
              <input
                id="workflow-name"
                type="text"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
                placeholder="Enter name for new workflow"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="workflow-description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Workflow Description
              </label>
              <input
                type="text"
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) =>
                  handleWorkflowDescriptionChange(e.target.value)
                }
                className="border border-gray-300 rounded-lg p-2 w-full"
                placeholder="Enter workflow description"
              />
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleCreateNewWorkflow}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition whitespace-nowrap"
              >
                Create New Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing a Workflow */}
      {currentWorkflowName && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{currentWorkflowName}</h1>
            <div className="flex space-y-4 border space-x-4">
              <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700">
                  Workflow Key:
                </label>
                <input
                  type="text"
                  value={workflowKey}
                  onChange={(e) => setWorkflowKey(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2"
                  placeholder="Enter workflow key here"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description:
                </label>
                <input
                  type="text"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2"
                  placeholder="Enter description"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {user.role !== AccessRole.USER && (
                <>
                  <button
                    onClick={handleSaveWorkflow}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleOpenDeleteDialog}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={handleUnloadWorkflow}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Unload
              </button>
            </div>
          </div>

          {/* Workflow Body */}
          <div className="mb-4">
            <div>
              {state.rootItem?.length === 0 && (
                <div className="text-center">
                  <p className="text-gray-500 mb-2">
                    No items in this workflow yet. Start by adding one!
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Item Name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  placeholder="Enter name for new item"
                />
                <button
                  onClick={handleAddFirstItem}
                  disabled={!newItemName.trim()}
                  className={`p-2 mt-2 rounded-md ${
                    newItemName.trim()
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Add Item
                </button>
              </div>
            </div>

            {state.rootItem && <ul>{renderItem(state.rootItem)}</ul>}
          </div>
        </>
      )}

      {user.role === AccessRole.USER && !currentWorkflowName && (
        <p className="text-center text-gray-500">
          You do not have permission to create new workflows. Please select an
          existing workflow to view.
        </p>
      )}
    </div>
  );
});

export default WorkflowComponent;
