"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([
    { id: 1, patientName: "Fluffy", date: "2023-05-15", diagnosis: "Annual Checkup" },
  ])

  const [isOpen, setIsOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const newRecord = {
      id: currentRecord ? currentRecord.id : Date.now(),
      patientName: formData.get("patientName"),
      date: formData.get("date"),
      diagnosis: formData.get("diagnosis"),
    }

    if (currentRecord) {
      setRecords(records.map(record => record.id === currentRecord.id ? newRecord : record))
    } else {
      setRecords([...records, newRecord])
    }

    setIsOpen(false)
    setCurrentRecord(null)
  }

  const handleEdit = (record) => {
    setCurrentRecord(record)
    setIsOpen(true)
  }

  const handleDelete = (id) => {
    setRecords(records.filter(record => record.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Medical Records</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentRecord(null)}>Add New Record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentRecord ? "Edit Record" : "Add New Record"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input 
                  id="patientName" 
                  name="patientName" 
                  defaultValue={currentRecord?.patientName || ""}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  defaultValue={currentRecord?.date || ""}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea 
                  id="diagnosis" 
                  name="diagnosis" 
                  defaultValue={currentRecord?.diagnosis || ""}
                  required 
                />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.patientName}</TableCell>
              <TableCell>{record.date}</TableCell>
              <TableCell>{record.diagnosis}</TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => handleEdit(record)}>Edit</Button>
                <Button variant="ghost" onClick={() => handleDelete(record.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

