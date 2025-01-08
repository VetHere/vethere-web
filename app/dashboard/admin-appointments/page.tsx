"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Appointment = {
  appointment_id: string;
  client_name: string;
  pet_name: string;
  pet_id: string;
  appointment_status: string;
  appointment_notes: string;
  appointment_date: string;
  appointment_time: string;
};

type Vet = {
  vet_id: string;
  vet_name: string;
  vet_doctors: Array<{
    doctor_id: string;
    doctor_name: string;
  }>;
};

export default function AdminAppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [vets, setVets] = useState<Vet[]>([]);
  const [selectedVet, setSelectedVet] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [doctors, setDoctors] = useState<
    Array<{ doctor_id: string; doctor_name: string }>
  >([]);

  const formatDateToLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchVets = async () => {
    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/vet/admin", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch vets");

      const data = await response.json();
      if (data.meta.success) {
        setVets(data.data);
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchDoctors = async (vetId: string) => {
    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/vet/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ vet_id: vetId }),
      });

      if (!response.ok) throw new Error("Failed to fetch doctors");

      const data = await response.json();
      if (data.meta.success && data.data.vet_doctors) {
        setDoctors(data.data.vet_doctors);
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchAppointments = async () => {
    if (!selectedDoctor) return;

    setIsLoading(true);
    setError(null);

    const adminToken = sessionStorage.getItem("access_token");
    if (!adminToken) {
      setError("Admin access token is missing. Please log in.");
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    try {
      const formattedDate = formatDateToLocal(selectedDate);
      const response = await fetch(
        "http://localhost:8000/appointment/admin/doctor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            doctor_id: selectedDoctor,
            appointment_date: formattedDate,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();
      if (data.meta.success) {
        setAppointments(data.data || []);
      } else {
        throw new Error(data.meta.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVets();
  }, []);

  useEffect(() => {
    if (selectedVet) {
      fetchDoctors(selectedVet);
      setSelectedDoctor("");
    }
  }, [selectedVet]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchAppointments();
    }
  }, [selectedDoctor, selectedDate]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Admin Appointment View</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 space-y-4">
          <div>
            <Label htmlFor="vet-select">Select Vet Clinic</Label>
            <Select value={selectedVet} onValueChange={setSelectedVet}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vet clinic" />
              </SelectTrigger>
              <SelectContent>
                {vets.map((vet) => (
                  <SelectItem key={vet.vet_id} value={vet.vet_id}>
                    {vet.vet_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="doctor-select">Select Doctor</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.doctor_id} value={doctor.doctor_id}>
                    {doctor.doctor_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="border rounded-lg p-4"
          />
        </div>

        <div className="md:w-2/3">
          {isLoading && <div>Loading...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}

          {!isLoading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Pet Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => {
                  const time = new Date(
                    appointment.appointment_time
                  ).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <TableRow key={appointment.appointment_id}>
                      <TableCell>{appointment.client_name}</TableCell>
                      <TableCell>{appointment.pet_name}</TableCell>
                      <TableCell>{appointment.appointment_status}</TableCell>
                      <TableCell>{appointment.appointment_notes}</TableCell>
                      <TableCell>{time}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
