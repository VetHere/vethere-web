"use client";

import { useState } from "react";
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

export default function VetClinicsPage() {
  const [clinics, setClinics] = useState([
    {
      id: 1,
      name: "Happy Paws Veterinary",
      address: "123 Main St, Anytown, USA",
      phone: "(555) 123-4567",
      description: "A cozy clinic specializing in pet wellness.",
      openHour: "08:00 AM",
      closeHour: "05:00 PM",
      image: "https://via.placeholder.com/150",
      facilities: "Grooming, Boarding, Surgery, Vaccinations",
      schedule: "Monday to Saturday",
      latitude: "40.7128",
      longitude: "-74.0060",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [currentClinic, setCurrentClinic] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newClinic = {
      id: currentClinic ? currentClinic.id : Date.now(),
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      description: formData.get("description"),
      openHour: formData.get("openHour"),
      closeHour: formData.get("closeHour"),
      image: formData.get("image"),
      facilities: formData.get("facilities"),
      schedule: formData.get("schedule"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
    };

    if (currentClinic) {
      setClinics(
        clinics.map((clinic) =>
          clinic.id === currentClinic.id ? newClinic : clinic
        )
      );
    } else {
      setClinics([...clinics, newClinic]);
    }

    setIsOpen(false);
    setCurrentClinic(null);
  };

  const handleEdit = (clinic) => {
    setCurrentClinic(clinic);
    setIsOpen(true);
  };

  const handleDelete = (id) => {
    setClinics(clinics.filter((clinic) => clinic.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vet Clinics</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentClinic(null)}>
              Add New Clinic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentClinic ? "Edit Clinic" : "Add New Clinic"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Clinic Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentClinic?.name || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={currentClinic?.address || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={currentClinic?.phone || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={currentClinic?.description || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="openHour">Open Hour</Label>
                <Input
                  id="openHour"
                  name="openHour"
                  type="time"
                  defaultValue={currentClinic?.openHour || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="closeHour">Close Hour</Label>
                <Input
                  id="closeHour"
                  name="closeHour"
                  type="time"
                  defaultValue={currentClinic?.closeHour || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  defaultValue={currentClinic?.image || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="facilities">Facilities</Label>
                <Textarea
                  id="facilities"
                  name="facilities"
                  defaultValue={currentClinic?.facilities || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  name="schedule"
                  defaultValue={currentClinic?.schedule || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  defaultValue={currentClinic?.latitude || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  defaultValue={currentClinic?.longitude || ""}
                  required
                />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clinic Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Open Hours</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clinics.map((clinic) => (
            <TableRow key={clinic.id}>
              <TableCell>{clinic.name}</TableCell>
              <TableCell>{clinic.address}</TableCell>
              <TableCell>{clinic.phone}</TableCell>
              <TableCell>
                {clinic.openHour} - {clinic.closeHour}
              </TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => handleEdit(clinic)}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => handleDelete(clinic.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
