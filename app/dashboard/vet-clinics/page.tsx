"use client";

import { useState, useEffect } from "react";
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
import { Star, ChevronRight } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  openHour: string;
  closeHour: string;
  image: string;
  facilities: string;
  schedule: string;
  latitude: string;
  longitude: string;
}

interface Doctor {
  doctor_id: string;
  doctor_name: string;
  doctor_rating: number;
  specialization: {
    specialization_id: string;
    specialization_name: string;
  };
}

export default function CombinedVetClinic() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClinics = async () => {
    setIsLoading(true);
    setError(null);

    const adminToken = localStorage.getItem("access_token");
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

      if (!response.ok) throw new Error("Failed to fetch clinics");

      const data = await response.json();
      if (data.meta.success) {
        const formattedClinics = data.data.map((clinic: any) => ({
          id: clinic.vet_id,
          name: clinic.vet_name,
          address: clinic.vet_address,
          phone: clinic.phone || "",
          description: clinic.vet_description,
          openHour: clinic.vet_open_hour,
          closeHour: clinic.vet_close_hour,
          image: clinic.vet_image,
          facilities: clinic.facilities || "",
          schedule: clinic.schedule || "Monday to Saturday",
          latitude: clinic.latitude || "",
          longitude: clinic.longitude || "",
        }));
        setClinics(formattedClinics);
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctors = async (clinicId: string) => {
    setIsLoading(true);
    setError(null);

    const adminToken = localStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/vet/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ vet_id: clinicId }),
      });

      if (!response.ok) throw new Error("Failed to fetch doctors");

      const data = await response.json();
      if (data.meta.success) {
        setDoctors(data.data);
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
    fetchClinics();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clinicData = {
      id: currentClinic ? currentClinic.id : Date.now().toString(),
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      description: formData.get("description") as string,
      openHour: formData.get("openHour") as string,
      closeHour: formData.get("closeHour") as string,
      image: formData.get("image") as string,
      facilities: formData.get("facilities") as string,
      schedule: formData.get("schedule") as string,
      latitude: formData.get("latitude") as string,
      longitude: formData.get("longitude") as string,
    };

    if (currentClinic) {
      setClinics(
        clinics.map((clinic) =>
          clinic.id === currentClinic.id ? clinicData : clinic
        )
      );
    } else {
      setClinics([...clinics, clinicData]);
    }

    setIsOpen(false);
    setCurrentClinic(null);
  };

  const handleEdit = (clinic: Clinic) => {
    setCurrentClinic(clinic);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    setClinics(clinics.filter((clinic) => clinic.id !== id));
  };

  const handleClinicSelect = (clinic: Clinic) => {
    if (selectedClinic?.id === clinic.id) {
      setSelectedClinic(null);
      setDoctors([]);
    } else {
      setSelectedClinic(clinic);
      fetchDoctors(clinic.id);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vet Clinics</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentClinic(null)}>
              Add New Clinic
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-screen overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <Button type="submit">Save</Button>
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
                <TableCell className="space-x-2">
                  <Button variant="ghost" onClick={() => handleEdit(clinic)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(clinic.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleClinicSelect(clinic)}
                    className="flex items-center gap-1"
                  >
                    View Doctors
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedClinic && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Doctors at {selectedClinic.name}
          </h2>
          {isLoading ? (
            <div>Loading doctors...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.doctor_id}>
                    <TableCell>{doctor.doctor_name}</TableCell>
                    <TableCell>
                      {doctor.specialization.specialization_name}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      {doctor.doctor_rating}
                      <Star className="h-4 w-4 text-yellow-400" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
