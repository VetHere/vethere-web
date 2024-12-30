"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Appointment = {
  appointment_id: string;
  client_name: string;
  pet_name: string;
  appointment_status: string;
  appointment_notes: string;
  appointment_date: string;
  appointment_time: string;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);

    const doctorToken = localStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Admin access token is missing. Please log in.");
      setAppointments([]); // Reset appointments
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/appointment/doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          appointment_date: "2024-12-13", // Ensure valid format for the backend
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();
      if (data.meta.success) {
        setAppointments(data.data || []); // Set to an empty array if null
      } else {
        throw new Error(data.meta.message || "Unknown error occurred");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setAppointments([]); // Reset appointments
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string
  ) => {
    const doctorToken = localStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/appointment/doctor", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          appointment_status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update appointment status");

      const data = await response.json();
      if (!data.meta.success) {
        throw new Error(data.meta.message);
      }

      await fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Doctor Appointments</h1>

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
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => {
              const date = new Date(
                appointment.appointment_date
              ).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const time = new Date(
                appointment.appointment_time
              ).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });
              const isCompleted = appointment.appointment_status === "Accepted";
              return (
                <TableRow key={appointment.appointment_id}>
                  <TableCell>{appointment.client_name}</TableCell>
                  <TableCell>{appointment.pet_name}</TableCell>
                  <TableCell>{appointment.appointment_status}</TableCell>
                  <TableCell>{appointment.appointment_notes}</TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleStatusChange(
                          appointment.appointment_id,
                          isCompleted ? "Waiting" : "Accepted"
                        )
                      }
                    >
                      {isCompleted ? "Mark as Waiting" : "Mark as Completed"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
