"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Doctor {
  doctor_id: string;
  doctor_name: string;
  doctor_rating: number;
  specialization: {
    specialization_id: string;
    specialization_name: string;
  };
}

interface DoctorListResponse {
  meta: {
    success: boolean;
    message: string;
  };
  data: Doctor[];
}

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
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
          body: JSON.stringify({
            vet_id: "cd540881-9817-401e-b798-25b3eda2fa21",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }

        const data: DoctorListResponse = await response.json();

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

    fetchDoctors();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Doctor List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <Card key={doctor.doctor_id}>
            <CardHeader>
              <CardTitle>{doctor.doctor_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Specialization: {doctor.specialization.specialization_name}</p>
              <div className="flex items-center mt-2">
                <span className="mr-1">Rating:</span>
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < doctor.doctor_rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
