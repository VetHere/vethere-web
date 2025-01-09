"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, ChevronRight, Edit2 } from "lucide-react";
import Link from "next/link";

interface Vet {
  vet_id: string;
  vet_name: string;
  vet_description: string;
  vet_rating: number;
  vet_open_hour: string;
  vet_close_hour: string;
  vet_address: string;
  vet_image?: string;
  vet_detail: {
    vet_phone_number: string;
    vet_latitude: string;
    vet_longitude: string;
  };
}

export default function CombinedVetClinic() {
  const [vets, setVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchVets = async () => {
    setIsLoading(true);
    setError(null);

    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/vet/admin", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch vets");

      const data = await response.json();
      if (data.meta.success) {
        const formattedClinics = data.data.map((vet: any) => ({
          vet_id: vet.vet_id,
          vet_name: vet.vet_name,
          vet_address: vet.vet_address,
          vet_description: vet.vet_description,
          vet_open_hour: vet.vet_open_hour,
          vet_close_hour: vet.vet_close_hour,
          vet_image: vet.vet_image,
          vet_rating: vet.vet_rating,
          vet_detail: {
            vet_phone_number: vet.vet_detail?.vet_phone_number,
            vet_latitude: vet.vet_detail?.vet_latitude,
            vet_longitude: vet.vet_detail?.vet_longitude,
          },
        }));
        setVets(formattedClinics);
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVets();
  }, []);

  const handleDelete = async (id: string) => {
    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/vet/admin", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ vet_id: id }),
      });
      const responseData = await response.json();
      console.log("Response:", responseData);

      if (!response.ok) throw new Error("Failed to delete vet");

      const data = await response.json();
      if (data.meta.success) {
        setVets(vets.filter((vet) => vet.vet_id !== id));
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while deleting"
      );
    }
  };

  const handleAddClinic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const form = event.currentTarget;
      const formData = new FormData();

      formData.append("vet_name", form.vet_name.value);
      formData.append("vet_address", form.vet_address.value);
      formData.append("vet_phone_number", form.vet_phone_number.value);
      formData.append("vet_description", form.vet_description.value);
      formData.append("vet_open_hour", `${form.vet_open_hour.value}:00`);
      formData.append("vet_close_hour", `${form.vet_close_hour.value}:00`);
      formData.append("vet_latitude", form.vet_latitude.value);
      formData.append("vet_longitude", form.vet_longitude.value);

      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) {
        formData.append("vet_image", imageFile);
      }

      console.log("Form data being sent:");
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      const response = await fetch("http://localhost:8000/vet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add clinic");
      }

      const data = await response.json();
      if (data.meta.success) {
        await fetchVets();
        setIsAddDialogOpen(false);
        form.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while adding new clinic"
      );
    }
  };

  const handleEdit = (vet: Vet) => {
    setSelectedVet(vet);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClinic = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);

    if (!selectedVet) return;

    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const form = event.currentTarget;
      const formData = new FormData();

      // Only append fields that have changed
      const fields = [
        "vet_name",
        "vet_address",
        "vet_description",
        "vet_phone_number",
        "vet_latitude",
        "vet_longitude",
      ];

      fields.forEach((field) => {
        const value = (form[field] as HTMLInputElement).value;
        if (value) formData.append(field, value);
      });

      // Handle time fields separately to add :00 for seconds
      const openHour = (form.vet_open_hour as HTMLInputElement).value;
      const closeHour = (form.vet_close_hour as HTMLInputElement).value;
      if (openHour) formData.append("vet_open_hour", `${openHour}:00`);
      if (closeHour) formData.append("vet_close_hour", `${closeHour}:00`);

      // Handle image file if selected
      const imageFile = editFileInputRef.current?.files?.[0];
      if (imageFile) {
        formData.append("vet_image", imageFile);
      }

      // Add vet_id to identify which record to update
      formData.append("vet_id", selectedVet.vet_id);

      const response = await fetch("http://localhost:8000/vet", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update clinic");
      }

      const data = await response.json();
      if (data.meta.success) {
        await fetchVets();
        setIsEditDialogOpen(false);
        setSelectedVet(null);
        if (editFileInputRef.current) {
          editFileInputRef.current.value = "";
        }
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating clinic"
      );
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vet Clinics</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Clinic</Button>
          </DialogTrigger>
          <DialogContent className="max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Clinic</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClinic} className="space-y-4">
              <div>
                <Label htmlFor="vet_name">Clinic Name</Label>
                <Input id="vet_name" name="vet_name" required />
              </div>
              <div>
                <Label htmlFor="vet_address">Address</Label>
                <Input id="vet_address" name="vet_address" required />
              </div>
              <div>
                <Label htmlFor="vet_phone_number">Phone Number</Label>
                <Input id="vet_phone_number" name="vet_phone_number" required />
              </div>
              <div>
                <Label htmlFor="vet_description">Description</Label>
                <Textarea
                  id="vet_description"
                  name="vet_description"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vet_open_hour">Open Hour</Label>
                  <Input
                    id="vet_open_hour"
                    name="vet_open_hour"
                    type="time"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vet_close_hour">Close Hour</Label>
                  <Input
                    id="vet_close_hour"
                    name="vet_close_hour"
                    type="time"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="vet_image">Clinic Image</Label>
                <Input
                  id="vet_image"
                  name="vet_image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vet_latitude">Latitude</Label>
                  <Input id="vet_latitude" name="vet_latitude" required />
                </div>
                <div>
                  <Label htmlFor="vet_longitude">Longitude</Label>
                  <Input id="vet_longitude" name="vet_longitude" required />
                </div>
              </div>
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Clinic</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateClinic} className="space-y-4">
              <div>
                <Label htmlFor="edit_vet_name">Clinic Name</Label>
                <Input
                  id="edit_vet_name"
                  name="vet_name"
                  defaultValue={selectedVet?.vet_name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_vet_address">Address</Label>
                <Input
                  id="edit_vet_address"
                  name="vet_address"
                  defaultValue={selectedVet?.vet_address}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_vet_phone_number">Phone Number</Label>
                <Input
                  id="edit_vet_phone_number"
                  name="vet_phone_number"
                  defaultValue={selectedVet?.vet_detail.vet_phone_number}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_vet_description">Description</Label>
                <Textarea
                  id="edit_vet_description"
                  name="vet_description"
                  defaultValue={selectedVet?.vet_description}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_vet_open_hour">Open Hour</Label>
                  <Input
                    id="edit_vet_open_hour"
                    name="vet_open_hour"
                    type="time"
                    defaultValue={selectedVet?.vet_open_hour.slice(0, 5)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_vet_close_hour">Close Hour</Label>
                  <Input
                    id="edit_vet_close_hour"
                    name="vet_close_hour"
                    type="time"
                    defaultValue={selectedVet?.vet_close_hour.slice(0, 5)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_vet_image">Clinic Image</Label>
                <Input
                  id="edit_vet_image"
                  name="vet_image"
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_vet_latitude">Latitude</Label>
                  <Input
                    id="edit_vet_latitude"
                    name="vet_latitude"
                    defaultValue={selectedVet?.vet_detail.vet_latitude}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_vet_longitude">Longitude</Label>
                  <Input
                    id="edit_vet_longitude"
                    name="vet_longitude"
                    defaultValue={selectedVet?.vet_detail.vet_longitude}
                    required
                  />
                </div>
              </div>
              <Button type="submit">Update</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {!isLoading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinic Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Open Hours</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vets.map((vet) => (
              <TableRow key={vet.vet_id}>
                <TableCell>{vet.vet_name}</TableCell>
                <TableCell>{vet.vet_address}</TableCell>
                <TableCell>
                  {vet.vet_open_hour} - {vet.vet_close_hour}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(vet.vet_id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleEdit(vet)}
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Link
                    href={`/dashboard/admin/clinics/${vet.vet_id}`}
                    passHref
                  >
                    <Button variant="ghost" className="flex items-center gap-1">
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
