"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioButton } from "@/components/ui/radio-button";

interface Doctor {
  doctor_id: string;
  doctor_name: string;
  doctor_rating: number;
  doctor_image?: string;
  specialization: {
    specialization_id: string;
    specialization_name: string;
  };
}

interface Specialization {
  specialization_id: string;
  specialization_name: string;
}

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDoctorInfo = async () => {
    setIsLoading(true);
    setError(null);

    const doctorToken = sessionStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Access token is missing. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/doctor", {
        headers: {
          Authorization: `Bearer ${doctorToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch doctor information");

      const result = await response.json();
      if (result.meta.success) {
        setDoctor(result.data);
      } else {
        throw new Error(result.meta.message || "Unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching doctor info:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    const doctorToken = sessionStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/specialization", {
        headers: {
          Authorization: `Bearer ${doctorToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch specializations");

      const result = await response.json();
      if (result.meta.success) {
        setSpecializations(result.data);
      } else {
        throw new Error(result.meta.message || "Unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching specializations:", err);
    }
  };

  useEffect(() => {
    fetchDoctorInfo();
    fetchSpecializations();
  }, []);

  const handleUpdateDoctor = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);

    const doctorToken = sessionStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Access token is missing. Please log in.");
      return;
    }

    try {
      const form = event.currentTarget;
      const formData = new FormData();

      const doctorName = form.doctor_name.value;
      const password = form.password.value;
      const specializationId = (form.specialization as HTMLInputElement)?.value;
      const imageFile = fileInputRef.current?.files?.[0];

      if (doctorName.trim()) {
        formData.append("doctor_name", doctorName);
      }
      if (password.trim()) {
        formData.append("password", password);
      }
      if (specializationId) {
        formData.append("specialization_id", specializationId);
      }
      if (imageFile) {
        formData.append("doctor_image", imageFile);
      }

      if ([...formData.entries()].length === 0) {
        setIsUpdateDialogOpen(false);
        return;
      }

      const response = await fetch("http://localhost:8000/doctor", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${doctorToken}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.meta.message || "Failed to update doctor information"
        );
      }

      if (responseData.meta.success) {
        await fetchDoctorInfo();
        setIsUpdateDialogOpen(false);
        form.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(responseData.meta.message || "Unknown error occurred");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating information"
      );
      console.error("Error updating doctor:", err);
    }
  };

  if (isLoading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error)
    return (
      <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
    );
  if (!doctor)
    return (
      <div className="container mx-auto p-4">No doctor information found</div>
    );

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {doctor.doctor_image && (
                <img
                  src={doctor.doctor_image}
                  alt={doctor.doctor_name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Name</h3>
                  <p>{doctor.doctor_name}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Specialization</h3>
                  <p>{doctor.specialization.specialization_name}</p>
                </div>
                {/* <div>
                  <h3 className="text-lg font-semibold">Rating</h3>
                  <p className="flex items-center gap-2">
                    {doctor.doctor_rating}
                    <Star className="h-4 w-4 text-yellow-400" />
                  </p>
                </div> */}
              </div>
            </div>
            <div>
              <Dialog
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">Update Profile</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateDoctor} className="space-y-4">
                    <div>
                      <Label htmlFor="doctor_name">Name (Optional)</Label>
                      <Input
                        id="doctor_name"
                        name="doctor_name"
                        defaultValue={doctor.doctor_name}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">New Password (Optional)</Label>
                      <Input id="password" name="password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="doctor_image">
                        Profile Image (Optional)
                      </Label>
                      <Input
                        id="doctor_image"
                        name="doctor_image"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                      />
                    </div>
                    <div>
                      <Label>Specialization (Optional)</Label>
                      <div className="space-y-2">
                        {specializations.map((spec) => (
                          <RadioButton
                            key={spec.specialization_id}
                            id={`spec-${spec.specialization_id}`}
                            name="specialization"
                            value={spec.specialization_id}
                            defaultChecked={
                              spec.specialization_id ===
                              doctor.specialization.specialization_id
                            }
                            label={spec.specialization_name}
                          />
                        ))}
                      </div>
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
