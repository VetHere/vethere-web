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
import { Textarea } from "@/components/ui/textarea";
import { RadioButton } from "@/components/ui/radio-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/pages/api/api";

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

type Vaccine = {
  vaccine_id: string;
  vaccine_name: string;
};

export default function AdminAppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [selectedVaccine, setSelectedVaccine] = useState<string>("");
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] =
    useState(false);
  const [isMedicalRecordDialogOpen, setIsMedicalRecordDialogOpen] =
    useState(false);
  const [isVaccineDialogOpen, setIsVaccineDialogOpen] = useState(false);
  const [appointmentToChange, setAppointmentToChange] = useState<{
    id: string;
    newStatus: string;
  } | null>(null);

  const formatDateToLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAppointments = async (date: Date) => {
    setIsLoading(true);
    setError(null);

    const doctorToken = sessionStorage.getItem("access_token");
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

      const response = await fetch(`${API_BASE_URL}/appointment/doctor`, {
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

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    setAppointmentToChange({ id: appointmentId, newStatus });
    setIsStatusChangeDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!appointmentToChange) return;

    const { id, newStatus } = appointmentToChange;
    const doctorToken = sessionStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/appointment/doctor`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          appointment_id: id,
          appointment_status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update appointment status");

      const data = await response.json();
      if (!data.meta.success) {
        throw new Error(data.meta.message);
      }

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.appointment_id === id
            ? { ...appointment, appointment_status: newStatus }
            : appointment
        )
      );

      setIsStatusChangeDialogOpen(false);
      setAppointmentToChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const closeForm = () => {
    setSelectedAppointment(null);
    setDiagnosis("");
    setTreatment("");
    setSelectedVaccine("");
  };

  const handleMedicalRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMedicalRecordDialogOpen(true);
  };

  const confirmMedicalRecordSubmit = async () => {
    if (!selectedAppointment) return;

    const doctorToken = sessionStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/medical-record/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          pet_id: selectedAppointment.pet_id,
          diagnosis: diagnosis,
          treatment: treatment,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit medical record");

      const data = await response.json();
      if (!data.meta.success) {
        throw new Error(data.meta.message);
      }

      setDiagnosis("");
      setTreatment("");
      await fetchAppointments(selectedDate);
      setIsMedicalRecordDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchVaccines = async () => {
    const doctorToken = sessionStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vaccine`, {
        headers: {
          Authorization: `Bearer ${doctorToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch vaccines");

      const data = await response.json();
      if (data.meta.success) {
        setVaccines(data.data || []);
      } else {
        throw new Error(data.meta.message || "Unknown error occurred");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleVaccineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVaccineDialogOpen(true);
  };

  const confirmVaccineSubmit = async () => {
    if (!selectedAppointment || !selectedVaccine) return;

    const doctorToken = sessionStorage.getItem("access_token");
    if (!doctorToken) {
      setError("Admin access token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vaccine-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          pet_id: selectedAppointment.pet_id,
          vaccine_id: selectedVaccine,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit vaccine");

      const data = await response.json();
      if (!data.meta.success) {
        throw new Error(data.meta.message || "Failed to submit vaccine");
      }

      setSelectedVaccine("");
      await fetchAppointments(selectedDate);
      setIsVaccineDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    console.log("Selected date changed to:", selectedDate);
    fetchAppointments(selectedDate);
    fetchVaccines();
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
                          onClick={() => setSelectedAppointment(appointment)}
                          className="mb-2"
                        >
                          Insert Details
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setAppointmentToChange({
                              id: appointment.appointment_id,
                              newStatus: appointment.appointment_status,
                            });
                          }}
                        >
                          Change Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {selectedAppointment && (
            <div className="mt-8 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Details for {selectedAppointment.pet_name}
                </h2>
                <Button onClick={closeForm}>Close</Button>
              </div>
              <form onSubmit={handleMedicalRecordSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="diagnosis"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Diagnosis
                  </label>
                  <Textarea
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
                <div>
                  <label
                    htmlFor="treatment"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Treatment
                  </label>
                  <Textarea
                    id="treatment"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    required
                    className="mt-1 block w-full"
                  />
                </div>
                <Button type="submit">Submit Medical Record</Button>
              </form>

              <form onSubmit={handleVaccineSubmit} className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold">Vaccines</h3>
                <div className="space-y-2">
                  {vaccines.map((vaccine) => (
                    <RadioButton
                      key={vaccine.vaccine_id}
                      label={vaccine.vaccine_name}
                      name="vaccine"
                      value={vaccine.vaccine_id}
                      checked={selectedVaccine === vaccine.vaccine_id}
                      onChange={() => setSelectedVaccine(vaccine.vaccine_id)}
                    />
                  ))}
                </div>
                <Button type="submit" disabled={!selectedVaccine}>
                  Submit Vaccine
                </Button>
              </form>
            </div>
          )}
          {appointmentToChange && (
            <div className="mt-8 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Change Status for {selectedAppointment?.pet_name}
                </h2>
                <Button onClick={() => setAppointmentToChange(null)}>
                  Close
                </Button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStatusChange(
                    appointmentToChange.id,
                    appointmentToChange.newStatus
                  );
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <RadioButton
                    label="Accepted"
                    name="status"
                    value="Accepted"
                    checked={appointmentToChange.newStatus === "Accepted"}
                    onChange={(e) =>
                      setAppointmentToChange({
                        ...appointmentToChange,
                        newStatus: e.target.value,
                      })
                    }
                  />
                  <RadioButton
                    label="Rejected"
                    name="status"
                    value="Rejected"
                    checked={appointmentToChange.newStatus === "Rejected"}
                    onChange={(e) =>
                      setAppointmentToChange({
                        ...appointmentToChange,
                        newStatus: e.target.value,
                      })
                    }
                  />
                  <RadioButton
                    label="Finished"
                    name="status"
                    value="Finished"
                    checked={appointmentToChange.newStatus === "Finished"}
                    onChange={(e) =>
                      setAppointmentToChange({
                        ...appointmentToChange,
                        newStatus: e.target.value,
                      })
                    }
                  />
                </div>
                <Button type="submit">Change Status</Button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={isStatusChangeDialogOpen}
        onOpenChange={setIsStatusChangeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <p className="text-sm text-gray-500">
              Are you sure you want to change the appointment status?
            </p>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setIsStatusChangeDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={confirmStatusChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isMedicalRecordDialogOpen}
        onOpenChange={setIsMedicalRecordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Medical Record Submission</DialogTitle>
            <p className="text-sm text-gray-500">
              Are you sure you want to submit this medical record?
            </p>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setIsMedicalRecordDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={confirmMedicalRecordSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isVaccineDialogOpen} onOpenChange={setIsVaccineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Vaccine Submission</DialogTitle>
            <p className="text-sm text-gray-500">
              Are you sure you want to submit this vaccine record?
            </p>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setIsVaccineDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={confirmVaccineSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
