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
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import MedicalRecordForm from "./MedicalRecordForm";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const formatDateToLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAppointments = async (date: Date) => {
    setIsLoading(true);
    setError(null);

    const doctorToken = localStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Admin access token is missing. Please log in.");
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    try {
      const formattedDate = formatDateToLocal(date);
      console.log("Selected Date Object:", date);
      console.log("Formatted Date being sent:", formattedDate);

      const response = await fetch("http://localhost:8000/appointment/doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          appointment_date: formattedDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();
      console.log("Response Data:", data);

      if (data.meta.success) {
        console.log("Appointments received:", data.data);
        if (data.data && data.data.length > 0) {
          console.log("First appointment date:", data.data[0].appointment_date);
        }
        setAppointments(data.data || []);
      } else {
        throw new Error(data.meta.message || "Unknown error occurred");
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

      if (newStatus === "Accepted") {
        const appointment = appointments.find(
          (a) => a.appointment_id === appointmentId
        );
        setSelectedAppointment(appointment || null);
      } else {
        setSelectedAppointment(null);
      }

      await fetchAppointments(selectedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    console.log("Selected date changed to:", selectedDate);
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Doctor Appointments</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                console.log("DayPicker selected date:", date);
                setSelectedDate(date);
              }
            }}
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
                  <TableHead>Actions</TableHead>
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
                  const isCompleted =
                    appointment.appointment_status === "Accepted";
                  return (
                    <TableRow key={appointment.appointment_id}>
                      <TableCell>{appointment.client_name}</TableCell>
                      <TableCell>{appointment.pet_name}</TableCell>
                      <TableCell>{appointment.appointment_status}</TableCell>
                      <TableCell>{appointment.appointment_notes}</TableCell>
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
                          {isCompleted
                            ? "Mark as Waiting"
                            : "Mark as Completed"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {selectedAppointment && (
            <MedicalRecordForm
              appointment={selectedAppointment}
              onSubmit={() => {
                setSelectedAppointment(null);
                fetchAppointments(selectedDate);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
