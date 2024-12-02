"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: new Date(),
      startHour: "09:00",
      endHour: "09:30",
      petName: "Max",
      ownerName: "John Doe",
      doctor: "Dr. Smith",
      status: "Confirmed",
      notes: "Routine check-up.",
    },
    {
      id: 2,
      date: new Date(),
      startHour: "10:00",
      endHour: "10:30",
      petName: "Bella",
      ownerName: "Jane Smith",
      doctor: "Dr. Johnson",
      status: "Pending",
      notes: "",
    },
    {
      id: 3,
      date: new Date(),
      startHour: "11:00",
      endHour: "11:45",
      petName: "Charlie",
      ownerName: "Bob Brown",
      doctor: "Dr. Smith",
      status: "Pending",
      notes: "",
    },
    {
      id: 4,
      date: new Date(),
      startHour: "14:00",
      endHour: "14:30",
      petName: "Luna",
      ownerName: "Alice Green",
      doctor: "Dr. Johnson",
      status: "Confirmed",
      notes: "Follow-up on surgery.",
    },
  ]);

  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleConfirmAppointment = (id: number) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: "Confirmed" } : apt
      )
    );
  };

  const handleEditNotes = (appointment: any) => {
    setCurrentAppointment(appointment);
    setIsNotesDialogOpen(true);
  };

  const handleSaveNotes = (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedNotes = formData.get("notes");

    setAppointments(
      appointments.map((apt) =>
        apt.id === currentAppointment.id ? { ...apt, notes: updatedNotes } : apt
      )
    );

    setIsNotesDialogOpen(false);
    setCurrentAppointment(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Appointments Schedule</h1>
      <div className="flex space-x-4">
        <div className="w-1/3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </div>
        <div className="w-2/3">
          <h2 className="text-xl font-semibold mb-4">
            Appointments for {selectedDate?.toDateString()}
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start - End</TableHead>
                <TableHead>Pet Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {appointment.startHour} - {appointment.endHour}
                  </TableCell>
                  <TableCell>{appointment.petName}</TableCell>
                  <TableCell>{appointment.ownerName}</TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNotes(appointment)}
                    >
                      Notes
                    </Button>
                  </TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {appointment.status === "Pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleConfirmAppointment(appointment.id)
                          }
                        >
                          Confirm
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {currentAppointment && (
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Notes</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveNotes}>
              <div className="space-y-4">
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={currentAppointment.notes}
                  placeholder="Add notes about the appointment"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNotesDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
