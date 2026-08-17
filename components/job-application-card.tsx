import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";

interface JobApplicationCardProps {
  job: JobApplication;
  columns: Column[];
}

export default function JobApplicationCard({
  job,
  columns,
}: JobApplicationCardProps) {
  return (
    <>
      <Card>
        <CardContent>
          <div>
            <div>
              <h3>{job.position}</h3>
              <p>{job.company}</p>
              {job.description && <p>{job.description}</p>}
              {(job.tags && job.tags.length > 0) && <div>{job.tags.map((tag, key) => (
                <span>{tag}</span>
              ))}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
