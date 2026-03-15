"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const statuses = [
  "PENDING",
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const update = async () => {
    setIsSaving(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaved(true);
    setIsSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onChange={(e) => { setStatus(e.target.value); setSaved(false); }}
        className="w-40"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </Select>
      <Button
        onClick={update}
        disabled={isSaving || status === currentStatus}
        size="sm"
        style={{ backgroundColor: saved ? "oklch(0.6 0.15 145)" : "var(--brand)", color: "var(--brand-foreground)" }}
        className="gap-1.5"
      >
        {saved ? <><Check className="size-3.5" /> Saved</> : isSaving ? "Saving..." : "Update"}
      </Button>
    </div>
  );
}
