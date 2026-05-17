"use client";

import { useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ExportLeadsButtonProps {
  searchId?: string;
  label?: string;
}

function getFilenameFromDisposition(value: string | null) {
  if (!value) return "raspalead-leads.xlsx";

  const match = value.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? "raspalead-leads.xlsx";
}

export function ExportLeadsButton({
  searchId,
  label = "Exportar",
}: ExportLeadsButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      try {
        const url = searchId
          ? `/api/exports/leads?search_id=${searchId}`
          : "/api/exports/leads";

        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
          throw new Error("export_failed");
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const filename = getFilenameFromDisposition(
          response.headers.get("content-disposition"),
        );

        const anchor = document.createElement("a");
        anchor.href = downloadUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(downloadUrl);

        toast.success("Exportacao iniciada");
      } catch {
        toast.error("Nao foi possivel exportar os leads");
      }
    });
  }

  return (
    <Button type="button" variant="outline" onClick={handleExport} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
