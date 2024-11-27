"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function VetClinicsPage() {
  const [clinics, setClinics] = useState([
    { id: 1, name: "Happy Paws Veterinary", address: "123 Main St, Anytown, USA", phone: "(555) 123-4567" },
  ])

  const [isOpen, setIsOpen] = useState(false)
  const [currentClinic, setCurrentClinic] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const newClinic = {
      id: currentClinic ? currentClinic.id : Date.now(),
      name: formData.get("name"),
      address: formData.get("address"),
      phone: formData.get("phone"),
    }

    if (currentClinic) {
      setClinics(clinics.map(clinic => clinic.id === currentClinic.id ? newClinic : clinic))
    } else {
      setClinics([...clinics, newClinic])
    }

    setIsOpen(false)
    setCurrentClinic(null)
  }

  const handleEdit = (clinic) => {
    setCurrentClinic(clinic)
    setIsOpen(true)
  }

  const handleDelete = (id) => {
    setClinics(clinics.filter(clinic => clinic.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vet Clinics</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentClinic(null)}>Add New Clinic</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentClinic ? "Edit Clinic" : "Add New Clinic"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Clinic Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={currentClinic?.name || ""}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  name="address" 
                  defaultValue={currentClinic?.address || ""}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  defaultValue={currentClinic?.phone || ""}
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
            <TableHead>Clinic Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clinics.map((clinic) => (
            <TableRow key={clinic.id}>
              <TableCell>{clinic.name}</TableCell>
              <TableCell>{clinic.address}</TableCell>
              <TableCell>{clinic.phone}</TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => handleEdit(clinic)}>Edit</Button>
                <Button variant="ghost" onClick={() => handleDelete(clinic.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

