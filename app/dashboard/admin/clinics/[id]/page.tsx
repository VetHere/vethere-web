"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioButton } from "@/components/ui/radio-button";

interface VetDetail {
  vet_id: string;
  vet_name: string;
  vet_description: string;
  vet_rating: number;
  vet_open_hour: string;
  vet_close_hour: string;
  vet_address: string;
  vet_image: string;
  vet_detail: {
    vet_detail_id: string;
    vet_phone_number: string;
    vet_latitude: number;
    vet_longitude: number;
  };
  vet_doctors: Array<{
    doctor_id: string;
    doctor_name: string;
    doctor_rating: number;
    doctor_image?: string;
    specialization: {
      specialization_id: string;
      specialization_name: string;
    };
  }> | null;
  vet_facilities: Array<{
    facility_id: string;
    facility_name: string;
  }> | null;
}

interface Specialization {
  specialization_id: string;
  specialization_name: string;
}

interface Facility {
  facility_id: string;
  facility_name: string;
}

export default function VetDetailPage() {
  const { id } = useParams() as { id: string };
  const [vetDetail, setVetDetail] = useState<VetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVetDetail = async () => {
    setIsLoading(true);
    setError(null);

    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/vet/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ vet_id: id }),
      });

      if (!response.ok) throw new Error("Failed to fetch vet details");

      const result = await response.json();
      if (result.meta.success) {
        setVetDetail(result.data);
      } else {
        throw new Error(result.meta.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/specialization", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch specializations");

      const result = await response.json();
      if (result.meta.success) {
        setSpecializations(result.data);
      } else {
        throw new Error(result.meta.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchFacilities = async () => {
    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/facility", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch facilities");

      const result = await response.json();
      if (result.meta.success) {
        setFacilities(result.data);
      } else {
        throw new Error(result.meta.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    if (id) {
      fetchVetDetail();
      fetchSpecializations();
      fetchFacilities();
    }
  }, [id]);

  const handleAddDoctor = async (event: React.FormEvent<HTMLFormElement>) => {
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

      formData.append("vet_id", id);
      formData.append("specialization_id", form.specialization.value);
      formData.append("username", form.username.value);
      formData.append("password", form.password.value);
      formData.append("doctor_name", form.doctor_name.value);
      formData.append("doctor_rating", form.doctor_rating.value);

      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) {
        formData.append("doctor_image", imageFile);
      }

      const response = await fetch("http://localhost:8000/doctor/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log("API Response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add doctor");
      }

      if (responseData.meta.success) {
        await fetchVetDetail();
        setIsAddDoctorOpen(false);
        form.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(responseData.meta.message);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while adding new doctor"
      );
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/doctor`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ doctor_id: doctorId }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to delete doctor");
      }

      if (responseData.meta.success) {
        await fetchVetDetail(); // Refresh the vet details after deletion
      } else {
        throw new Error(responseData.meta.message);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while deleting the doctor"
      );
    }
  };

  const handleAddFacility = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const form = event.currentTarget;
      const selectedFacilities = Array.from(form.facilities)
        .filter((checkbox: HTMLInputElement) => checkbox.checked)
        .map((checkbox: HTMLInputElement) => checkbox.value);

      const response = await fetch("http://localhost:8000/vet/facility", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          vet_id: id,
          facility_ids: selectedFacilities,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add facilities");
      }

      const data = await response.json();
      if (data.meta.success) {
        await fetchVetDetail();
        setIsAddFacilityOpen(false);
        form.reset();
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while adding facilities"
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!vetDetail) return <div>No vet details found</div>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">{vetDetail.vet_name}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={vetDetail.vet_image}
            alt={vetDetail.vet_name}
            className="w-full h-64 object-cover rounded-lg"
          />
          <p className="mt-4">{vetDetail.vet_description}</p>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Address:</strong> {vetDetail.vet_address}
            </p>
            <p>
              <strong>Phone:</strong> {vetDetail.vet_detail.vet_phone_number}
            </p>
            <p>
              <strong>Hours:</strong> {vetDetail.vet_open_hour} -{" "}
              {vetDetail.vet_close_hour}
            </p>
            <p>
              <strong>Rating:</strong> {vetDetail.vet_rating}{" "}
              <Star className="inline h-4 w-4 text-yellow-400" />
            </p>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Doctors</h2>
            <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Doctor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddDoctor} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctor_name">Doctor Name</Label>
                    <Input id="doctor_name" name="doctor_name" required />
                  </div>
                  <div>
                    <Label htmlFor="doctor_rating">Doctor Rating</Label>
                    <Input
                      id="doctor_rating"
                      name="doctor_rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctor_image">Doctor Image</Label>
                    <Input
                      id="doctor_image"
                      name="doctor_image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                    />
                  </div>
                  <div>
                    <Label>Specialization</Label>
                    <div className="space-y-2">
                      {specializations.map((spec) => (
                        <RadioButton
                          key={spec.specialization_id}
                          id={`spec-${spec.specialization_id}`}
                          name="specialization"
                          value={spec.specialization_id}
                          label={spec.specialization_name}
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit">Add Doctor</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {vetDetail.vet_doctors && vetDetail.vet_doctors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vetDetail.vet_doctors.map((doctor) => (
                  <TableRow key={doctor.doctor_id}>
                    <TableCell>{doctor.doctor_name}</TableCell>
                    <TableCell>
                      {doctor.specialization.specialization_name}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      {doctor.doctor_rating}
                      <Star className="h-4 w-4 text-yellow-400" />
                    </TableCell>
                    <TableCell>
                      <Button
                        className="bg-red-500 text-white hover:bg-red-600"
                        onClick={() => handleDeleteDoctor(doctor.doctor_id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No doctors information available</p>
          )}

          <div className="flex justify-between items-center mt-8 mb-4">
            <h2 className="text-2xl font-bold">Facilities</h2>
            <Dialog
              open={isAddFacilityOpen}
              onOpenChange={setIsAddFacilityOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Facility
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Facility</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFacility} className="space-y-4">
                  <div>
                    <Label>Facilities</Label>
                    <div className="space-y-2">
                      {facilities.map((facility) => (
                        <div
                          key={facility.facility_id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`facility-${facility.facility_id}`}
                            name="facilities"
                            value={facility.facility_id}
                          />
                          <Label htmlFor={`facility-${facility.facility_id}`}>
                            {facility.facility_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button type="submit">Add Facilities</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {vetDetail.vet_facilities && vetDetail.vet_facilities.length > 0 ? (
            <ul className="list-disc list-inside">
              {vetDetail.vet_facilities.map((facility) => (
                <li key={facility.facility_id}>{facility.facility_name}</li>
              ))}
            </ul>
          ) : (
            <p>No facilities information available</p>
          )}
        </div>
      </div>
    </div>
  );
}
