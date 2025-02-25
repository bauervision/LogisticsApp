import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRequestContext } from "../context/DataContext";
import RequestContent from "@/components/Requests/RequestContent";
import { Switch } from "@/components/ui/switch";
import { RequestCalendar } from "@/components/Requests/RequestCalendar";
import { Combobox } from "@/components/Requests/ComboBox";
import { statuses } from "@/components/Requests/requestPages/requestData";
import { RequestComment } from "@/components/Requests/RequestComment";
import { RequestCommentPopover } from "@/components/Requests/RequestsCommentPopover";
import RequestToast, { showToast } from "@/components/Requests/RequestToast";
import { useFetchWithToast } from "@/hooks/fetchWithToast";
import OrderForm from "./OrderForm";
import { useEffect, useMemo, useState } from "react";
import { RequestItem, useSchema } from "../context/SchemaContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCTS } from "../constants";
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { AccessRole } from "../constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RequestTabs() {
  const { selectedRow } = useRequestContext();
  const { rowData, setRowData } = useSchema();
  const { fetchWithToast } = useFetchWithToast();
  const { user } = useUser();
  const router = useRouter();

  // Local state for the order to allow modifications
  const [order, setOrder] = useState<Record<string, any>>(selectedRow ?? {});

  // Initialize items from order.requestedItems (or an empty array if not defined).
  const [items, setItems] = useState<RequestItem[]>(order.requestedItems || []);

  // State to control the delete confirmation dialog.
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sync items back into the order whenever items change.
  useEffect(() => {
    setOrder((prev) => ({ ...prev, requestedItems: items }));
  }, [items]);

  useEffect(() => {
    if (selectedRow) {
      setItems(selectedRow["Requested Items"] || []);
    }
  }, [selectedRow]);

  // Handlers for Requested Items.
  const handleRequestItemChange = (
    index: number,
    key: keyof RequestItem,
    value: any
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [key]: value };
      return newItems;
    });
  };

  const handleRemoveRequestItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRequestItem = () => {
    setItems((prev) => [...prev, { product: "", price: 0, amount: 1 }]);
  };

  const totalCost = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.amount || 0),
    0
  );

  if (!selectedRow) {
    return <div>NoData</div>;
  }

  const handleRequestSave = async (newStatus?: string) => {
    const result = await fetchWithToast("test");
  };

  const handleCommentChange = (text: string) => {
    console.log(text);
  };

  // New handler to save only the items back to context.
  const handleSaveItems = () => {
    if (rowData) {
      // Update the current order's "Requested Items" in the rowData array.
      const updatedRowData = rowData.map((orderItem) =>
        orderItem.id === order.id
          ? { ...orderItem, "Requested Items": items }
          : orderItem
      );
      setRowData(updatedRowData);
      showToast("Items saved successfully", "success");
    }
  };

  // This handler updates the order state when a field changes.
  const handleFieldChange = (fieldName: string, value: any) => {
    setOrder((prev: any) => ({ ...prev, [fieldName]: value }));
  };

  const { workflowName, progress } = useMemo(() => {
    const workflow = selectedRow.workflow;
    // Use the workflow's name if available, otherwise fall back to the "Request Workflow" field.
    const name = workflow?.name || selectedRow["Request Workflow"] || "";
    const currentStep =
      workflow?.currentStep || selectedRow["Request Status"] || "";
    // Get the ordered steps from the workflow.
    const steps: string[] = workflow?.orderedSteps || [];

    if (steps.length > 0) {
      const totalSteps = steps.length;
      const currentIndex = steps.findIndex((step) => step === currentStep);
      if (currentIndex === -1) return { workflowName: name, progress: 0 };
      // Force 100% if at the last step.
      if (currentIndex === totalSteps - 1)
        return { workflowName: name, progress: 100 };
      const progressPercent = Math.round((currentIndex / totalSteps) * 100);
      return { workflowName: name, progress: progressPercent };
    }
    return { workflowName: name, progress: 0 };
  }, [selectedRow]);

  // Determine if there are any comments to display.
  const hasComments = selectedRow.comments && selectedRow.comments.length > 0;

  // Delete request handler – only available for ADMIN and SUPER_ADMIN
  const handleDeleteRequest = () => {
    // Remove the current order from rowData.
    if (rowData) {
      const updatedRowData = rowData.filter(
        (orderItem) => orderItem.id !== order.id
      );
      setRowData(updatedRowData);
      showToast("Request deleted successfully", "success");
      // Close the dialog and redirect back to "/request-tracker"
      setIsDeleteDialogOpen(false);
      router.push("/request-tracker");
    }
  };

  // Evaluate if the user has access to delete a request.
  const canDelete =
    user &&
    (user.role === AccessRole.SUPER_ADMIN || user.role === AccessRole.ADMIN);

  return (
    <>
      {canDelete && (
        <div className="mb-4">
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this request? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteRequest}>
                  Delete Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <Tabs defaultValue="info" className="mx-6">
        <RequestToast />
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="info">Request Information</TabsTrigger>
          <TabsTrigger value="docs" disabled={false}>
            Documents
          </TabsTrigger>
          <TabsTrigger value="items">Request Line Items</TabsTrigger>
          <TabsTrigger value="orders" disabled>
            Orders
          </TabsTrigger>
          <TabsTrigger value="ship" disabled>
            Shipments
          </TabsTrigger>
          <TabsTrigger value="forms" disabled>
            Forms
          </TabsTrigger>
          <TabsTrigger value="comments" disabled={!hasComments}>
            Status Comments
          </TabsTrigger>
        </TabsList>

        {/* Request Information Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              {/* Progress Bar with Text Inside */}
              <div className="relative w-full bg-gray-200 rounded h-8">
                <div
                  className="bg-blue-600 h-8 rounded"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  {workflowName}: {progress}%
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Render dynamic order fields */}
              <OrderForm order={order} onFieldChange={handleFieldChange} />
              <Button
                type="button"
                variant="default"
                className="bg-blue-800 text-white mt-4"
                onClick={() => handleRequestSave()}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requested Items Tab */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Requested Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <fieldset className="md:col-span-2 border p-4 rounded-md">
                <legend className="px-2 font-semibold text-lg">
                  Requested Items
                </legend>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-2 mb-2 items-center"
                  >
                    {/* Product Dropdown */}
                    <div className="flex-1">
                      <Label className="text-sm">Product</Label>
                      <Select
                        value={item.product || undefined}
                        onValueChange={(value) => {
                          const selectedProduct = PRODUCTS.find(
                            (prod) => prod.product === value
                          );
                          handleRequestItemChange(index, "product", value);
                          if (selectedProduct) {
                            // Auto-populate the price when a product is selected.
                            handleRequestItemChange(
                              index,
                              "price",
                              selectedProduct.price
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCTS.map((prod) => (
                            <SelectItem key={prod.product} value={prod.product}>
                              {prod.product}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Price Display */}
                    <div className="flex-1">
                      <Label className="text-sm">Price</Label>
                      <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(item.price || 0)}
                      </div>
                    </div>
                    {/* Amount Input */}
                    <div className="flex-1">
                      <Label className="text-sm">Amount</Label>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          handleRequestItemChange(
                            index,
                            "amount",
                            parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </div>
                    {/* Line Total Display */}
                    <div className="flex-1">
                      <Label className="text-sm">Line Total</Label>
                      <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format((item.price || 0) * (item.amount || 0))}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => handleRemoveRequestItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={handleAddRequestItem}
                  className="mt-2"
                >
                  Add Request Item
                </Button>
                {/* Total Amount Field */}
                <div className="mt-4">
                  <Label className="text-sm">Total Amount</Label>
                  <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(totalCost)}
                  </div>
                </div>
              </fieldset>
              {/* Save Items Button */}
              <Button
                type="button"
                onClick={handleSaveItems}
                className="bg-green-600 text-white mt-4"
              >
                Save Items
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>All documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="gap-4 py-8 requestBG pb-20">
                  <Label htmlFor="current">Current Documents</Label>
                  <div>Document Table Here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Orders for requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="gap-4 py-8 requestBG pb-20">
                  <Label htmlFor="current">Current Status</Label>
                  <div>Status Data Here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="ship">
          <Card>
            <CardHeader>
              <CardTitle>Shipments</CardTitle>
              <CardDescription>Shipments requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="gap-4 py-8 requestBG pb-20">
                  <Label htmlFor="current">Current Status</Label>
                  <div>Status Data Here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Forms</CardTitle>
              <CardDescription>Forms for requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="gap-4 py-8 requestBG pb-20">
                  <Label htmlFor="current">Current Status</Label>
                  <div>Status Data Here</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>All comments for requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasComments ? (
                <ol className="list-decimal list-inside">
                  {selectedRow.comments.map(
                    (comment: string, index: number) => (
                      <li key={index}>{comment}</li>
                    )
                  )}
                </ol>
              ) : (
                <p>No comments available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
