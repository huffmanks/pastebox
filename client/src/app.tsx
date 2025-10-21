import { PackageOpenIcon, PlusIcon } from "lucide-react";

import Form from "@/components/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function App() {
  return (
    <>
      <header className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1>pastebox</h1>
            <PackageOpenIcon />
          </div>
          <div>
            <a href="/">
              <Button aria-label="Create a new note" className="hidden sm:inline-flex cursor-pointer" variant="outline" size="sm">
                <PlusIcon /> <span>New</span>
              </Button>

              <Button variant="outline" size="icon" className="sm:hidden rounded-full cursor-pointer">
                <PlusIcon />
              </Button>
            </a>
          </div>
        </div>
      </header>
      <Separator />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Form />
      </main>
    </>
  );
}

export default App;
