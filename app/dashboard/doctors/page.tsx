"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. John Doe",
      email: "john.doe@example.com",
      specialization: "General",
      password: "securepassword",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newDoctor = {
      id: currentDoctor ? currentDoctor.id : Date.now(),
      name: formData.get("name"),
      email: formData.get("email"),
      specialization: formData.get("specialization"),
      password: formData.get("password"),
    };

    if (currentDoctor) {
      setDoctors(
        doctors.map((doctor) =>
          doctor.id === currentDoctor.id ? newDoctor : doctor
        )
      );
    } else {
      setDoctors([...doctors, newDoctor]);
    }

    setIsOpen(false);
    setCurrentDoctor(null);
  };

  const handleEdit = (doctor) => {
    setCurrentDoctor(doctor);
    setIsOpen(true);
  };

  const handleDelete = (id) => {
    setDoctors(doctors.filter((doctor) => doctor.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentDoctor(null)}>
              Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentDoctor ? "Edit Doctor" : "Add New Doctor"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentDoctor?.name || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={currentDoctor?.email || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  defaultValue={currentDoctor?.specialization || ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  defaultValue={currentDoctor?.password || ""}
                  required
                />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Doctor Information</TabsTrigger>
          <TabsTrigger value="accounts">Doctor Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="accounts">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.password}</TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => handleEdit(doctor)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(doctor.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
