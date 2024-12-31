import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type MedicalRecordFormProps = {
  appointment: {
    appointment_id: string;
    pet_name: string;
  };
  onSubmit: () => void;
};

export default function MedicalRecordForm({
  appointment,
  onSubmit,
}: MedicalRecordFormProps) {
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [vaccineId, setVaccineId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const doctorToken = localStorage.getItem("access_token");
    if (!doctorToken) {
      console.error("Doctor token is missing");
      return;
    }

    try {
      // Submit medical record
      const medicalRecordResponse = await fetch(
        "http://localhost:8000/medical-record",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${doctorToken}`,
          },
          body: JSON.stringify({
            pet_id: appointment.appointment_id, // Assuming appointment_id can be used as pet_id
            vet_id: "7f49b4f8-4cfe-4b2e-b041-1d2034d54abc", // This should be dynamically set based on the logged-in vet
            diagnosis,
            treatment,
          }),
        }
      );

      if (!medicalRecordResponse.ok) {
        throw new Error("Failed to submit medical record");
      }

      // Submit vaccine attachment if a vaccine ID is provided
      if (vaccineId) {
        const vaccineResponse = await fetch(
          "http://localhost:8000/vaccine-attachment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${doctorToken}`,
            },
            body: JSON.stringify({
              pet_id: appointment.appointment_id, // Assuming appointment_id can be used as pet_id
              vaccine_id: vaccineId,
            }),
          }
        );

        if (!vaccineResponse.ok) {
          throw new Error("Failed to submit vaccine attachment");
        }
      }

      onSubmit();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <h2 className="text-xl font-semibold">
        Medical Record for {appointment.pet_name}
      </h2>
      <Textarea
        placeholder="Diagnosis"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        required
      />
      <Textarea
        placeholder="Treatment"
        value={treatment}
        onChange={(e) => setTreatment(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Vaccine ID (optional)"
        value={vaccineId}
        onChange={(e) => setVaccineId(e.target.value)}
      />
      <Button type="submit">Submit Medical Record</Button>
    </form>
  );
}
