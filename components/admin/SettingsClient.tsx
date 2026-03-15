"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  carrier: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  type: string;
  extraCharge: number;
  isActive: boolean;
  sortOrder: number;
  instructions: string | null;
}

interface SettingsClientProps {
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  settings: Record<string, string>;
}

function ShippingForm({
  method,
  onSave,
  onCancel,
}: {
  method?: ShippingMethod;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState({
    name: method?.name ?? "",
    description: method?.description ?? "",
    price: method?.price ?? 0,
    carrier: method?.carrier ?? "",
    isActive: method?.isActive ?? true,
    sortOrder: method?.sortOrder ?? 0,
  });

  const save = async () => {
    const url = method ? `/api/shipping-methods/${method.id}` : "/api/shipping-methods";
    await fetch(url, {
      method: method ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    onSave();
  };

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-secondary/20">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Name *</Label>
          <Input value={values.name} onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))} placeholder="Standard Delivery" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Price (CZK)</Label>
          <Input type="number" step="0.01" value={values.price} onChange={(e) => setValues((p) => ({ ...p, price: Number(e.target.value) }))} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Carrier</Label>
          <Select value={values.carrier} onChange={(e) => setValues((p) => ({ ...p, carrier: e.target.value }))} className="h-8 text-sm">
            <option value="">Other</option>
            <option value="packeta">Packeta / Zásilkovna</option>
            <option value="dpd">DPD</option>
            <option value="ppl">PPL</option>
            <option value="gls">GLS</option>
            <option value="czech_post">Czech Post</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Sort Order</Label>
          <Input type="number" value={values.sortOrder} onChange={(e) => setValues((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="h-8 text-sm" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Input value={values.description} onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))} placeholder="Delivered within 2-3 business days" className="h-8 text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={values.isActive} onChange={(e) => setValues((p) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-brand" id="ship-active" />
        <Label htmlFor="ship-active" className="text-xs">Active</Label>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={save} style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}>
          <Check className="size-3.5" /> Save
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          <X className="size-3.5" /> Cancel
        </Button>
      </div>
    </div>
  );
}

function PaymentForm({
  method,
  onSave,
  onCancel,
}: {
  method?: PaymentMethod;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState({
    name: method?.name ?? "",
    description: method?.description ?? "",
    type: method?.type ?? "OTHER",
    extraCharge: method?.extraCharge ?? 0,
    isActive: method?.isActive ?? true,
    sortOrder: method?.sortOrder ?? 0,
    instructions: method?.instructions ?? "",
  });

  const save = async () => {
    const url = method ? `/api/payment-methods/${method.id}` : "/api/payment-methods";
    await fetch(url, {
      method: method ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    onSave();
  };

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-secondary/20">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Name *</Label>
          <Input value={values.name} onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))} placeholder="Bank Transfer" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select value={values.type} onChange={(e) => setValues((p) => ({ ...p, type: e.target.value }))} className="h-8 text-sm">
            <option value="STRIPE">Stripe (Card)</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Extra Charge (CZK)</Label>
          <Input type="number" step="0.01" value={values.extraCharge} onChange={(e) => setValues((p) => ({ ...p, extraCharge: Number(e.target.value) }))} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Sort Order</Label>
          <Input type="number" value={values.sortOrder} onChange={(e) => setValues((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="h-8 text-sm" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Input value={values.description} onChange={(e) => setValues((p) => ({ ...p, description: e.target.value }))} placeholder="Pay securely by card" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Payment Instructions (shown to customer)</Label>
        <Textarea value={values.instructions} onChange={(e) => setValues((p) => ({ ...p, instructions: e.target.value }))} rows={2} placeholder="Bank: Example Bank, IBAN: CZ00 0000..." className="text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={values.isActive} onChange={(e) => setValues((p) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-brand" id="pay-active" />
        <Label htmlFor="pay-active" className="text-xs">Active</Label>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={save} style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}>
          <Check className="size-3.5" /> Save
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          <X className="size-3.5" /> Cancel
        </Button>
      </div>
    </div>
  );
}

export function SettingsClient({ shippingMethods: initialShipping, paymentMethods: initialPayment }: SettingsClientProps) {
  const [shippingMethods, setShippingMethods] = useState(initialShipping);
  const [paymentMethods, setPaymentMethods] = useState(initialPayment);
  const [editingShipping, setEditingShipping] = useState<string | null>(null);
  const [addingShipping, setAddingShipping] = useState(false);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [addingPayment, setAddingPayment] = useState(false);

  const refreshShipping = async () => {
    const res = await fetch("/api/shipping-methods");
    const data = await res.json();
    setShippingMethods(data.map((s: ShippingMethod & { price: number }) => ({ ...s, price: Number(s.price) })));
    setEditingShipping(null);
    setAddingShipping(false);
  };

  const refreshPayment = async () => {
    const res = await fetch("/api/payment-methods");
    const data = await res.json();
    setPaymentMethods(data.map((p: PaymentMethod & { extraCharge: number }) => ({ ...p, extraCharge: Number(p.extraCharge) })));
    setEditingPayment(null);
    setAddingPayment(false);
  };

  const deleteShipping = async (id: string) => {
    if (!confirm("Delete this shipping method?")) return;
    await fetch(`/api/shipping-methods/${id}`, { method: "DELETE" });
    refreshShipping();
  };

  const deletePayment = async (id: string) => {
    if (!confirm("Delete this payment method?")) return;
    await fetch(`/api/payment-methods/${id}`, { method: "DELETE" });
    refreshPayment();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Shipping Methods */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Shipping Methods</h2>
          <Button size="sm" onClick={() => setAddingShipping(true)} style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <div className="p-4 space-y-3">
          {addingShipping && (
            <ShippingForm onSave={refreshShipping} onCancel={() => setAddingShipping(false)} />
          )}
          {shippingMethods.map((method) => (
            editingShipping === method.id ? (
              <ShippingForm key={method.id} method={method} onSave={refreshShipping} onCancel={() => setEditingShipping(null)} />
            ) : (
              <div key={method.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{method.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {method.price === 0 ? "Free" : `${method.price} CZK`}
                    {method.carrier && ` · ${method.carrier}`}
                    {!method.isActive && " · Inactive"}
                  </p>
                </div>
                <button onClick={() => setEditingShipping(method.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => deleteShipping(method.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          ))}
          {shippingMethods.length === 0 && !addingShipping && (
            <p className="text-sm text-muted-foreground text-center py-4">No shipping methods yet</p>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Payment Methods</h2>
          <Button size="sm" onClick={() => setAddingPayment(true)} style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <div className="p-4 space-y-3">
          {addingPayment && (
            <PaymentForm onSave={refreshPayment} onCancel={() => setAddingPayment(false)} />
          )}
          {paymentMethods.map((method) => (
            editingPayment === method.id ? (
              <PaymentForm key={method.id} method={method} onSave={refreshPayment} onCancel={() => setEditingPayment(null)} />
            ) : (
              <div key={method.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{method.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {method.type}
                    {method.extraCharge > 0 && ` · +${method.extraCharge} CZK`}
                    {!method.isActive && " · Inactive"}
                  </p>
                </div>
                <button onClick={() => setEditingPayment(method.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => deletePayment(method.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )
          ))}
          {paymentMethods.length === 0 && !addingPayment && (
            <p className="text-sm text-muted-foreground text-center py-4">No payment methods yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
