"use client";

import { Board, Column, JobApplication } from "@/lib/models/models.types";
import {
  Award,
  Calendar,
  CheckCircle2,
  Mic,
  MoreVertical,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import { Button } from "./ui/button";
import { useBoard } from "@/lib/hooks/use-boards";
import { DragDropProvider, DragOverlay, useDroppable } from "@dnd-kit/react";
import {
  DragEndEvent,
  DragStartEvent,
  PointerActivationConstraints,
  PointerSensor,
} from "@dnd-kit/dom";
import { useSortable } from "@dnd-kit/react/sortable";
import { useState } from "react";
import jobApplications from "@/lib/models/job-applications";

interface KanbanBoardProps {
  board: Board;
  userId: string;
}

interface ColConfig {
  color: string;
  icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
  {
    color: "bg-cyan-500",
    icon: <Calendar />,
  },
  {
    color: "bg-purple-500",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  {
    color: "bg-green-500",
    icon: <Mic className="h-4 w-4" />,
  },
  {
    color: "bg-yellow-500",
    icon: <Award className="h-4 w-4" />,
  },
  {
    color: "bg-red-500",
    icon: <XCircle className="h-4 w-4" />,
  },
];

function DroppableColumn({
  column,
  config,
  boardId,
  sortedColumns,
}: {
  column: Column;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[];
}) {
  const { ref, isDropTarget } = useDroppable({
    id: column._id,
    data: {
      type: "column",
      columnId: column._id,
    },
  });

  const sortedJobs =
    column.jobApplications?.sort((a, b) => a.order - b.order) || [];

  return (
    <Card className="min-w-75 shrink-0 p-0 shadow-md">
      <CardHeader
        className={`${config.color} rounded-t-lg pt-3 pb-3 text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-base font-semibold text-white">
              {column.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-white/20"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-max">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Pencil className="mr-2 h-4 w-4" /> Rename Column
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Column
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent
        ref={ref}
        className={`min-h-100 space-y-2 rounded-b-lg bg-gray-50/50 pt-4 ${isDropTarget && "ring-2 ring-blue-500"}`}
      >
        {sortedJobs.map((job, index) => (
          <SortableJobCard
            key={job._id}
            index={index}
            job={{ ...job, columnId: job.columnId || column._id }}
            columns={sortedColumns}
          />
        ))}
        <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
      </CardContent>
    </Card>
  );
}

function SortableJobCard({
  job,
  columns,
  index,
}: {
  job: JobApplication;
  columns: Column[];
  index: number;
}) {
  const { isDragging, ref, handleRef } = useSortable({
    id: job._id,
    index: index,
    group: "jobApplications",
    data: {
      type: "job",
      job,
    },
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={ref} style={style} key={`${job._id}-${index}`}>
      <JobApplicationCard
        job={job}
        columns={columns}
        dragHandleRef={handleRef}
      />
    </div>
  );
}

export default function KanbanBoard({ board, userId }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<String | null>(null);
  const { columns, moveJob } = useBoard(board);

  const sortedColumns = columns?.sort((a, b) => a.order - b.order) || [];

  const sensors = [
    PointerSensor.configure({
      activationConstraints: [
        new PointerActivationConstraints.Distance({
          value: 8,
        }),
      ],
    }),
  ];

  async function handleDragStart(event: DragStartEvent) {
    if (!event.operation.source) return;
    setActiveId(event.operation.source.id as String);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { source, target } = event.operation;

    if (!target || !board._id) return;

    const activeId = source?.id as string;
    const overId = target.id as string;

    let draggedJob: JobApplication | null = null;
    let sourceColumn: Column | null = null;
    let sourceIndex = -1;

    for (const column of sortedColumns) {
      const jobs =
        column.jobApplications.sort((a, b) => a.order - b.order) || [];
      const jobIndex = jobs.findIndex((j) => j._id === activeId);
      if (jobIndex !== -1) {
        draggedJob = jobs[jobIndex];
        sourceColumn = column;
        sourceIndex = jobIndex;
        break;
      }
    }

    if (!draggedJob || !sourceColumn) return;

    //   // check if dropped in a column or another job
    const targetColumn = sortedColumns.find((col) => col._id === overId);
    const targetJob = sortedColumns
      .flatMap((col) => col.jobApplications || [])
      .find((job) => job._id === overId);

    let targetColumnId: string;
    let newOrder: number;

    if (targetColumn) {
      targetColumnId = targetColumn._id;
      const jobsInTarget =
        targetColumn.jobApplications
          .filter((j) => j._id !== activeId)
          .sort((a, b) => a.order - b.order) || [];
      newOrder = jobsInTarget.length;
    } else if (targetJob) {
      const targetJobColumn = sortedColumns.find((col) =>
        col.jobApplications.some((j) => j._id === targetJob._id),
      );
      targetColumnId = targetJob.columnId || targetJobColumn?._id || "";
      if (!targetColumnId) return;

      const targetColumnObj = sortedColumns.find(
        (col) => col._id === targetColumnId,
      );

      if (!targetColumnObj) return;

      const allJobsInTargetOriginal =
        targetColumnObj.jobApplications.sort((a, b) => a.order - b.order) || [];
      const allJobsInTargetFiltered =
        allJobsInTargetOriginal.filter((j) => j._id !== activeId) || [];

      const targetIndexInOriginal = allJobsInTargetOriginal.findIndex(
        (j) => j._id === overId,
      );
      const targetIndexInFiltered = allJobsInTargetFiltered.findIndex(
        (j) => j._id === overId,
      );

      if (targetIndexInFiltered !== -1) {
        if (sourceColumn._id === targetColumnId) {
          if (sourceIndex < targetIndexInOriginal) {
            newOrder = targetIndexInFiltered + 1;
          } else {
            newOrder = targetIndexInFiltered;
          }
        } else {
          newOrder = targetIndexInFiltered;
        }
      } else {
        newOrder = allJobsInTargetFiltered.length;
      }
    } else {
      return;
    }

    if (!targetColumnId) return;

    await moveJob(activeId, targetColumnId, newOrder);
  }

  const activeJob = sortedColumns
    .flatMap((col) => col.jobApplications || [])
    .find((job) => job._id === activeId);

  return (
    <DragDropProvider sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col, key) => {
            const config = COLUMN_CONFIG[key] || {
              color: "bg-gray-500",
              icon: <Calendar className="h-4 w-4" />,
            };
            return (
              <DroppableColumn
                key={key}
                column={col}
                config={config}
                boardId={board._id}
                sortedColumns={sortedColumns}
              />
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeJob ? (
          <div className="opacity-50">
            <JobApplicationCard job={activeJob} columns={sortedColumns} />
          </div>
        ) : null}
      </DragOverlay>
    </DragDropProvider>
  );
}
