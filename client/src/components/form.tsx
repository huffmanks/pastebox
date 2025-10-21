import { EyeIcon, EyeOffIcon, RefreshCcwIcon, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Editor } from "@/components/blocks/editor-00/editor";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { FileUpload, FileUploadDropzone, FileUploadItem, FileUploadItemDelete, FileUploadItemMetadata, FileUploadItemPreview, FileUploadList, FileUploadTrigger } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Form() {
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  return (
    <div className="w-full grid gap-8 grid-cols-1 md:grid-cols-[3fr_1.25fr]">
      <FieldSet>
        <FieldGroup>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="content">Note</FieldLabel>
            <Editor />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldGroup className="gap-5">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input id="slug" type="text" value={slug} placeholder="my-files" onChange={(e) => setSlug(e.target.value)} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupButton className="cursor-pointer" onClick={() => setShowPassword((prev) => !prev)} size="icon-xs">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
              </InputGroupAddon>
              <InputGroupInput id="password" type={showPassword ? "text" : "password"} value={password} placeholder="Enter a password" onChange={(e) => setPassword(e.target.value)} />
              <InputGroupAddon align="inline-end">
                <InputGroupButton className="cursor-pointer" onClick={() => setPassword("")} size="icon-xs">
                  <RefreshCcwIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FileUpload value={files} onValueChange={setFiles} onFileReject={onFileReject} multiple>
              <FileUploadDropzone className="cursor-pointer">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center rounded-full border p-2.5">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">Drag & drop files here</p>
                  <p className="text-muted-foreground text-xs">Or click to browse</p>
                </div>
                <FileUploadTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2 w-fit cursor-pointer">
                    Browse files
                  </Button>
                </FileUploadTrigger>
              </FileUploadDropzone>

              {files && files.length > 0 && (
                <ScrollArea className="h-80 w-full p-4 rounded-md border">
                  <FileUploadList>
                    {files.map((file, index) => (
                      <FileUploadItem key={index} value={file} className="w-full">
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata className="w-0" />
                        <FileUploadItemDelete asChild>
                          <Button variant="ghost" size="icon" className="size-7 cursor-pointer">
                            <X />
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </ScrollArea>
              )}
            </FileUpload>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
