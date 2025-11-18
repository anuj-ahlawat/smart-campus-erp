"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onUpload: (file: File) => Promise<void>;
  label?: string;
  accept?: string;
};

export const FileUploader = ({ onUpload, label = "Upload", accept }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    await onUpload(file);
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? "Uploading..." : label}
      </Button>
      {fileName && <p className="text-xs text-muted-foreground">Last selected: {fileName}</p>}
    </div>
  );
};

