import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const templates = [
  { id: "tpl-rosary", label: "Daily Rosary" },
  { id: "tpl-caro", label: "Caro Family Rosary" },
  { id: "tpl-novena-54", label: "54-Day Rosary Novena" },
  { id: "tpl-michael", label: "Chaplet of St. Michael" },
  { id: "tpl-mercy", label: "Divine Mercy Chaplet" },
];

const cadences = [
  { id: "once", label: "Just today" },
  { id: "daily", label: "Every day" },
  { id: "n_days", label: "For a number of days" },
  { id: "weekly", label: "Certain weekdays" },
];

/** Clean, two-choice way to add a session: pick a template, pick how often. */
export function AddSessionDialog() {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<string | undefined>();
  const [cadence, setCadence] = useState<string>("once");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" aria-hidden />
          Add session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal">Add a session</DialogTitle>
          <DialogDescription>
            Choose what to pray. The session is built from its template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a prayer or devotion" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>How often</Label>
            <Select value={cadence} onValueChange={setCadence}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cadences.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!template} onClick={() => setOpen(false)}>
            Add to today
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
