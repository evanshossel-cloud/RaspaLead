"use client";

import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Identidade visual clara ativa"
      className="h-10 w-10 rounded-xl"
      title="Identidade visual clara ativa"
      type="button"
    >
      <Sun className="h-4 w-4" />
    </Button>
  );
}
