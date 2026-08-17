"use client";

import { Board, Column } from "@/lib/models/models.types";
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
import { Card, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "@base-ui/react";

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
}: {
  column: Column;
  config: ColConfig;
  boardId: string;
}) {
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
                <Button className="h-6 w-6 text-white hover:bg-white/20">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-max">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Pencil /> Rename Column
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4"/> Delete Column
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function KanbanBoard({ board, userId }: KanbanBoardProps) {
  const columns = board.columns;

  return (
    <>
      <div>
        <div>
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
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
