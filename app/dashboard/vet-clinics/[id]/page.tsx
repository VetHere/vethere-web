"use client";

import { useState, useEffect } from "react";
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
import { Star } from "lucide-react";

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

export default function VetDetailPage() {
  const { id } = useParams() as { id: string };
  const [vetDetail, setVetDetail] = useState<VetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVetDetail = async () => {
      setIsLoading(true);
      setError(null);

      const adminToken = localStorage.getItem("access_token");
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

    if (id) {
      fetchVetDetail();
    }
  }, [id]);

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
          <h2 className="text-2xl font-bold mb-4">Doctors</h2>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No doctors information available</p>
          )}

          <h2 className="text-2xl font-bold mt-8 mb-4">Facilities</h2>
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
