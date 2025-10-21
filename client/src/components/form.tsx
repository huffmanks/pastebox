import { EyeIcon, EyeOffIcon, PackagePlusIcon, RefreshCcwIcon, Upload, X } from "lucide-react";
import generatePassword from "omgopass";
import { generateSlug } from "random-word-slugs";
import { useCallback, useState } from "react";
import slugify from "slugify";
import { toast } from "sonner";

import { Editor } from "@/components/blocks/editor-00/editor";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import { FileUpload, FileUploadDropzone, FileUploadItem, FileUploadItemDelete, FileUploadItemMetadata, FileUploadItemPreview, FileUploadList, FileUploadTrigger } from "@/components/ui/file-upload";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

export default function Form() {
  const [noteValue, setNoteValue] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugOptions = {
    lower: true,
    strict: true,
    trim: true,
  };

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      if (noteValue) {
        formData.append("note", noteValue);
      }

      if (!slug) {
        formData.append("slug", generateSlug());
      } else {
        formData.set("slug", slugify(slug, slugOptions));
      }

      const values = Object.fromEntries(formData.entries());
      console.log(values);
    } catch (err) {
      console.error("Upload failed:", err);

      toast.error("Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // const copyToClipboard = (text: string) => {
  //   navigator.clipboard.writeText(text);
  //   setCopied(true);
  //   setTimeout(() => setCopied(false), 2000);
  // };

  const randomSlug = generateSlug();

  return (
    <div className="w-full">
      <form className="grid gap-8 grid-cols-1 md:grid-cols-[3fr_1.25fr]" onSubmit={handleSubmit}>
        <div>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="content">Note</FieldLabel>
            <Editor setNoteValue={setNoteValue} />
          </Field>
        </div>
        <div className="flex flex-col gap-6">
          <FieldGroup className="gap-1.5">
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <InputGroup>
              <Field>
                <InputGroupInput
                  id="slug"
                  name="slug"
                  type="text"
                  value={slug}
                  placeholder={randomSlug}
                  onChange={(e) => setSlug(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (val) setSlug(slugify(val, slugOptions));
                  }}
                />
              </Field>
              <InputGroupAddon align="inline-end">
                <Field>
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    className="cursor-pointer"
                    onClick={() => {
                      const tmpSlug = generateSlug();
                      setSlug(tmpSlug);
                    }}>
                    <RefreshCcwIcon />
                  </InputGroupButton>
                </Field>
              </InputGroupAddon>
            </InputGroup>
          </FieldGroup>

          <FieldGroup className="gap-2.5">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="isProtected">Password protect</FieldLabel>
              </FieldContent>
              <Switch id="isProtected" name="isProtected" checked={isProtected} onCheckedChange={(checked) => setIsProtected(checked)} />
            </Field>

            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Field>
                  <InputGroupButton disabled={!isProtected} type="button" size="icon-xs" className="cursor-pointer" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </Field>
              </InputGroupAddon>
              <Field className="gap-1.5">
                <InputGroupInput
                  disabled={!isProtected}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Enter a password"
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
              </Field>
              <InputGroupAddon align="inline-end">
                <Field>
                  <InputGroupButton
                    disabled={!isProtected}
                    type="button"
                    size="icon-xs"
                    className="cursor-pointer"
                    onClick={() => {
                      const tmpPass = generatePassword();
                      setPassword(tmpPass);
                    }}>
                    <RefreshCcwIcon />
                  </InputGroupButton>
                </Field>
              </InputGroupAddon>
            </InputGroup>
          </FieldGroup>

          <Field>
            <FileUpload disabled={isSubmitting} value={files} onValueChange={setFiles} onFileReject={onFileReject} multiple>
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
          <Button disabled={isSubmitting} type="submit" className="cursor-pointer">
            <PackagePlusIcon />
            <span>Create</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
