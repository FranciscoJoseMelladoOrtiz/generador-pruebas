"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TestRecord, deleteTest } from "@/lib/storage";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TestCard({ test }: { test: TestRecord }) {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const handleDelete = async (e: React.MouseEvent) => {
    // Prevent navigation to detail view
    e.preventDefault();
    e.stopPropagation();

    await deleteTest(projectId, test.id);
    router.refresh();
  };

  return (
    <div className="relative group">
      <Link href={`/projects/${projectId}/test/${test.id}`} className="block">
        <Card className="bg-card hover:border-primary/50 transition-all cursor-pointer">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-lg pr-10">
              <span className="truncate">{test.name || "Untitled Test"}</span>
              <span className="text-xs font-normal px-2 py-1 rounded bg-secondary text-secondary-foreground">
                {test.environment}
              </span>
            </CardTitle>
            <CardDescription>
              {new Date(test.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-2">
            {/* Minimal content if needed */}
          </CardContent>
        </Card>
      </Link>

      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Test?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                test record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
