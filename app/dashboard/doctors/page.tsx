"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioButton } from "@/components/ui/radio-button";

interface Doctor {
  doctor_id: string;
  doctor_name: string;
  specialization: {
    specialization_id: string;
    specialization_name: string;
  };
}

interface Specialization {
  specialization_id: string;
  specialization_name: string;
}

export default function EditDoctorPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDoctor();
    fetchSpecializations();
  }, [id]);

  const fetchDoctor = async () => {
    setIsLoading(true);
    setError(null);

    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/doctor/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch doctor details");

      const result = await response.json();
      if (result.meta.success) {
        setDoctor(result.data);
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

  const handleUpdateDoctor = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
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

      formData.append("doctor_id", id);
      formData.append("specialization_id", form.specialization.value);
      formData.append("doctor_name", form.doctor_name.value);

      if (form.password.value) {
        formData.append("password", form.password.value);
      }

      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) {
        formData.append("doctor_image", imageFile);
      }

      const response = await fetch(`http://localhost:8000/doctor/update`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update doctor");
      }

      if (responseData.meta.success) {
        router.push("/doctors"); // Redirect to doctors list page
      } else {
        throw new Error(responseData.meta.message);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating doctor"
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!doctor) return <div>No doctor details found</div>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Edit Doctor: {doctor.doctor_name}</h1>
      <form onSubmit={handleUpdateDoctor} className="space-y-4">
        <div>
          <Label htmlFor="doctor_name">Doctor Name</Label>
          <Input
            id="doctor_name"
            name="doctor_name"
            defaultValue={doctor.doctor_name}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">
            New Password (leave blank to keep current)
          </Label>
          <Input id="password" name="password" type="password" />
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
                defaultChecked={
                  spec.specialization_id ===
                  doctor.specialization.specialization_id
                }
              />
            ))}
          </div>
        </div>
        <Button type="submit">Update Doctor</Button>
      </form>
    </div>
  );
}
