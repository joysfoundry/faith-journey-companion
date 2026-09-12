import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { inferReference } from "@/lib/bible/apps";

/**
 * A save-time check (ACTS-196) shown when someone saves a **scripture** quote with
 * an **empty citation**. It never hard-blocks — "Save without citation" is always
 * offered — but it makes the choice explicit (replacing the easy-to-miss inline
 * hint) so a scripture passage doesn't quietly land uncited in the generic
 * "Scripture" group. When a citation can be read from the passage text it's offered
 * for one-tap accept-and-save; a cross-reference offers each candidate; otherwise an
 * amber warning explains the cost of saving without one.
 *
 * The passage text (`body`) is only read — never modified. Accepting sets the
 * citation via the caller's `onChooseCitation`, which is expected to save with it.
 */
export function ScriptureCitationSaveDialog({
  open,
  onOpenChange,
  body,
  onChooseCitation,
  onAddManually,
  onSaveWithout,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The passage text we read a citation out of. Never changed. */
  body: string | undefined;
  /** Accept a citation and save with it (one-tap). */
  onChooseCitation: (ref: string) => void;
  /** Dismiss so the reader can type a citation into the field themselves (no save). */
  onAddManually: () => void;
  /** Proceed and save with no citation. */
  onSaveWithout: () => void;
}) {
  const inferred = inferReference(body);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {inferred.kind === "none" ? "Save without a citation?" : "Add a citation?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {inferred.kind === "confident"
              ? "A citation lets this scripture file under its book and open in your Bible."
              : inferred.kind === "ambiguous"
                ? "This passage names more than one place — pick the one it's from so it files correctly."
                : "A citation lets a scripture file under its book and open in your Bible."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200">
          {inferred.kind === "confident" ? (
            <>
              This looks like <span className="font-semibold">{inferred.ref}</span>. Add it, or save
              the passage without a citation.
            </>
          ) : inferred.kind === "ambiguous" ? (
            <>Choose the passage this is, or save without a citation.</>
          ) : (
            <>
              Without a citation, this files under the general “Scripture” group instead of its book,
              and won’t open in your Bible. You can add one now or save as is.
            </>
          )}
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          {inferred.kind === "confident" ? (
            <Button onClick={() => onChooseCitation(inferred.ref)} className="w-full">
              Add {inferred.ref} &amp; save
            </Button>
          ) : inferred.kind === "ambiguous" ? (
            <div className="flex flex-wrap gap-2">
              {inferred.candidates.map((ref) => (
                <Button key={ref} onClick={() => onChooseCitation(ref)} className="flex-1">
                  Add {ref}
                </Button>
              ))}
            </div>
          ) : (
            <Button onClick={onAddManually} className="w-full">
              Add citation
            </Button>
          )}
          <Button variant="outline" onClick={onSaveWithout} className="w-full">
            Save without citation
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
