"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { EyeIcon, EyeOffIcon, PackagePlusIcon, RefreshCcwIcon, Upload, XIcon } from "lucide-react";
import generatePassword from "omgopass";
import { generateSlug } from "random-word-slugs";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";

import { createBox } from "@/actions/box";
import { SLUG_OPTIONS } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

const Editor = dynamic(
  () => import("@/components/editor/blocks/editor").then((mod) => mod.Editor),
  { ssr: false }
);

const _formSchema = z.object({
  content: z.string().optional(),
  slug: z.string().optional(),
  password: z.string().optional(),
  isProtected: z.boolean(),
  showPassword: z.boolean(),
  files: z.array(z.instanceof(File)),
});

type FormSchema = z.infer<typeof _formSchema>;

export default function Form() {
  const [formState, setFormState] = useState<FormSchema>({
    content: "",
    slug: "",
    password: "",
    isProtected: false,
    showPassword: false,
    files: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ content?: boolean; files?: boolean }>({});

  const router = useRouter();

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  function updateForm(updates: Partial<typeof formState>) {
    setFormState((prev) => ({ ...prev, ...updates }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!formState.content && formState.files.length === 0) {
      toast.error("Provide a note or at least one file.");
      setErrors({ content: true, files: true });
      setIsSubmitting(false);
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const finalSlug = formState.slug ? slugify(formState.slug, SLUG_OPTIONS) : generateSlug();
    formData.set("slug", finalSlug);

    if (formState.content) formData.append("content", formState.content);
    if (!formState.isProtected) formData.delete("password");

    if (formState.files?.length) {
      formState.files.forEach((file) => formData.append("files", file));
    }

    try {
      const createdBox = await createBox(formData);

      if (typeof createdBox !== "object" || !createdBox) throw new Error("Failed to create box.");

      router.push(`/results/${createdBox.slug}`);
    } catch (error) {
      const message = typeof error === "string" ? error : "Failed to create box.";
      console.error(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <form
        id="create-box-form"
        name="create-box-form"
        className="grid grid-cols-1 gap-8 md:grid-cols-[3fr_1.25fr]"
        autoComplete="off"
        onFocus={() => setErrors({})}
        onSubmit={handleSubmit}>
        <div>
          <Field
            className="gap-1.5"
            data-invalid={errors.content}>
            <FieldLabel asChild>
              <p>Note</p>
            </FieldLabel>
            <Editor
              setContent={(content) => updateForm({ content })}
              aria-invalid={errors.content}
            />
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
                  autoComplete="off"
                  type="text"
                  value={formState.slug}
                  placeholder="huge-scrawny-sugar"
                  onChange={(e) => updateForm({ slug: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (val) updateForm({ slug: slugify(val, SLUG_OPTIONS) });
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
                      updateForm({ slug: tmpSlug });
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
              <Switch
                id="isProtected"
                name="isProtected"
                checked={formState.isProtected}
                onCheckedChange={(checked) => updateForm({ isProtected: checked })}
              />
            </Field>

            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Field>
                  <InputGroupButton
                    disabled={!formState.isProtected}
                    type="button"
                    size="icon-xs"
                    className="cursor-pointer"
                    onClick={() => updateForm({ showPassword: !formState.showPassword })}>
                    {formState.showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </Field>
              </InputGroupAddon>
              <Field className="gap-1.5">
                <InputGroupInput
                  disabled={!formState.isProtected}
                  name="password"
                  autoComplete="off"
                  type={formState.showPassword ? "text" : "password"}
                  value={formState.password}
                  placeholder="Enter a password"
                  onChange={(e) => updateForm({ password: e.target.value })}
                  onFocus={(e) => e.target.select()}
                />
              </Field>
              <InputGroupAddon align="inline-end">
                <Field>
                  <InputGroupButton
                    disabled={!formState.isProtected}
                    type="button"
                    size="icon-xs"
                    className="cursor-pointer"
                    onClick={() => {
                      const tmpPass = generatePassword();
                      updateForm({ password: tmpPass });
                    }}>
                    <RefreshCcwIcon />
                  </InputGroupButton>
                </Field>
              </InputGroupAddon>
            </InputGroup>
          </FieldGroup>

          <FieldGroup>
            <Field data-invalid={errors.files}>
              <FileUpload
                aria-invalid={errors.files}
                disabled={isSubmitting}
                value={formState.files}
                onValueChange={(files) => updateForm({ files })}
                onFileReject={onFileReject}
                multiple>
                <FileUploadDropzone className="cursor-pointer">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                      <Upload className="text-muted-foreground size-6" />
                    </div>
                    <p className="text-sm font-medium">Drag & drop files here</p>
                    <p className="text-muted-foreground text-xs">Or click to browse</p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-fit cursor-pointer">
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>

                {formState.files && formState.files.length > 0 && (
                  <ScrollArea className="max-h-80 w-full rounded-md border p-4">
                    <FileUploadList>
                      {formState.files.map((file, index) => (
                        <FileUploadItem
                          key={index}
                          value={file}
                          className="w-full">
                          <FileUploadItemPreview />
                          <FileUploadItemMetadata className="w-0" />
                          <FileUploadItemDelete asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 cursor-pointer">
                              <XIcon />
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
          <Button
            disabled={isSubmitting}
            type="submit"
            className="cursor-pointer">
            <PackagePlusIcon />
            <span>Create</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
