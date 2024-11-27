import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DoctorInfoPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Doctor Information</h1>
        <Button>Update Information</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Years of Experience</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Dr. Jane Smith</TableCell>
            <TableCell>Feline Medicine</TableCell>
            <TableCell>10</TableCell>
            <TableCell>
              <Button variant="ghost">Edit</Button>
              <Button variant="ghost">View Details</Button>
            </TableCell>
          </TableRow>
          {/* Add more rows as needed */}
        </TableBody>
      </Table>
    </div>
  )
}

