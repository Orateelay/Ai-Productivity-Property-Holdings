import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function FirstVisitModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!localStorage.getItem("apa.ack")) setOpen(true); }, []);
  const ack = () => { localStorage.setItem("apa.ack", "1"); setOpen(false); };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && ack()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Before you start</DialogTitle>
          <DialogDescription className="space-y-2 pt-2 leading-relaxed">
            This assistant uses AI to draft estimates, emails, plans and research. Outputs may contain errors and
            cost estimates are indicative only — not a formal quotation. Always have a qualified professional
            review important decisions. Your history is stored only in this browser.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter><Button onClick={ack}>I understand</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
