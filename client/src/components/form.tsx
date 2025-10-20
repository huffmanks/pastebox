import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { EyeIcon, RefreshCcwIcon } from "lucide-react";
import { useState } from "react";
import { Textarea } from "./ui/textarea";

// slug, content, password

export default function Form() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  console.log(password);

  return (
    <div className="w-full max-w-md">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input id="slug" type="text" placeholder="my-files" />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupButton onClick={() => setIsPasswordVisible(!isPasswordVisible)} size="icon-xs">
                  <EyeIcon />
                </InputGroupButton>
              </InputGroupAddon>
              <InputGroupInput id="password" type="password" placeholder="Enter a password" onChange={(e) => setPassword(e.target.value)} />
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={() => setPassword("")} size="icon-xs">
                  <RefreshCcwIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="content">Note</FieldLabel>
            <Textarea placeholder="Enter a note here..." />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
