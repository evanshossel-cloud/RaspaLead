"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyToClipboardButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  toastMessage?: string;
  errorMessage?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export function CopyToClipboardButton({
  text,
  label = "Copiar",
  copiedLabel = "Copiado",
  toastMessage = "Mensagem copiada",
  errorMessage = "Nao foi possivel copiar",
  variant = "outline",
  size = "sm",
  className,
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(toastMessage);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      toast.error(errorMessage);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleCopy}
      variant={copied ? "secondary" : variant}
      size={size}
      disabled={!text}
      className={cn("shrink-0", className)}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
