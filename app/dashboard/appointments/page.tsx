"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState([
    { id: 1, date: new Date(), time: "09:00", petName: "Max", ownerName: "John Doe", doctor: "Dr. Smith", status: "Confirmed" },
    { id: 2, date: new Date(), time: "10:00", petName: "Bella", ownerName: "Jane Smith", doctor: "Dr. Johnson", status: "Pending" },
    { id: 3, date: new Date(), time: "11:00", petName: "Charlie", ownerName: "Bob Brown", doctor: "Dr. Smith", status: "Pending" },
    { id: 4, date: new Date(), time: "14:00", petName: "Luna", ownerName: "Alice Green", doctor: "Dr. Johnson", status: "Confirmed" },
  ])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    // In a real application, you would fetch appointments for the selected date here
  }

  const handleConfirmAppointment = (id: number) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: "Confirmed" } : apt
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "Pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

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
          <h2 className="text-xl font-semibold mb-4">Appointments for {selectedDate?.toDateString()}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Pet Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.petName}</TableCell>
                  <TableCell>{appointment.ownerName}</TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    {appointment.status === "Pending" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfirmAppointment(appointment.id)}
                      >
                        Confirm
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

