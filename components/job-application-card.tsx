import { Column, JobApplication } from "@/lib/models/models.types";
import { Card, CardContent } from "./ui/card";
import { ArrowLeftRight, Delete, Edit2, ExternalLink, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

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
      <Card className="hover: group cursor-pointer bg-white shadow-sm transition-shadow hover:shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-sm font-semibold">{job.position}</h3>
              <p className="text-muted-foreground mb-2 text-xs">
                {job.company}
              </p>
              {job.description && (
                <p className="text-muted-foreground mb-2 line-clamp-2 text-xs">
                  {job.description}
                </p>
              )}
              {job.tags && job.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {job.tags.map((tag, key) => (
                    <span
                      key={key}
                      className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {job.jobUrl && (
                <a
                  target="_blank"
                  href={job.jobUrl}
                  className="text-primary mt-1 inline-flex items-center gap-1 text-xs hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="flex items-start gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-full">
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {columns.length > 1 && (
                    <>
                      {columns
                        .filter((c) => c._id !== job.columnId)
                        .map((column, key) => (
                          <DropdownMenuItem key={key}>
                            <ArrowLeftRight />
                            Move to {column.name}
                          </DropdownMenuItem>
                        ))}
                    </>
                  )}
                  <DropdownMenuItem className="text-destructive">
                    <Delete className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
