import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Check, FileText, AlertCircle, Upload as UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  description: string;
  requiredColumns?: string[];
  onChange: (file: File | null) => void;
};

export function Dropzone({ label, description, requiredColumns = [], onChange }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(false);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0];
      if (!f) return;
      if (!f.name.toLowerCase().endsWith(".csv")) {
        setError("Only .csv files are allowed");
        setValid(false);
        setFile(null);
        onChange(null);
        return;
      }
      Papa.parse(f, {
        header: true,
        preview: 1,
        complete: (res) => {
          const headers = res.meta.fields ?? [];
          const missing = requiredColumns.filter(
            (c) => !headers.some((h) => h.toLowerCase() === c.toLowerCase()),
          );
          if (missing.length) {
            setError(`Missing columns: ${missing.join(", ")}`);
            setValid(false);
            setFile(null);
            onChange(null);
          } else {
            setError(null);
            setValid(true);
            setFile(f);
            onChange(f);
          }
        },
        error: () => {
          setError("Could not parse CSV");
          setValid(false);
          setFile(null);
          onChange(null);
        },
      });
    },
    [onChange, requiredColumns],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold">{label}</h3>
        {requiredColumns.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            requires: {requiredColumns.join(", ")}
          </span>
        )}
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          valid && "border-primary/60 bg-primary/5",
          error && "border-destructive/60 bg-destructive/5",
        )}
      >
        <input {...getInputProps()} />
        {file && valid ? (
          <div className="flex items-center justify-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <FileText className="h-4 w-4" />
            <span className="font-medium">{file.name}</span>
            <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-1 text-sm">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">{error}</span>
            <span className="text-xs text-muted-foreground">Click or drop another file</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
            <UploadIcon className="h-5 w-5" />
            <span>{isDragActive ? "Drop it here" : description}</span>
          </div>
        )}
      </div>
    </div>
  );
}