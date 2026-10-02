import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

export function useLocal<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(seed);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
      else localStorage.setItem(key, JSON.stringify(seed));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback(
    (fn: (prev: T) => T) =>
      setValue((prev) => {
        const next = fn(prev);
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      }),
    [key],
  );
  return [value, update] as const;
}

export type Activity = { id: string; text: string; module: string; at: string };
export function logActivity(text: string, module: string) {
  try {
    const list: Activity[] = JSON.parse(localStorage.getItem("apa.activity") ?? "null") ?? SEED_ACTIVITY;
    list.unshift({ id: crypto.randomUUID(), text, module, at: new Date().toISOString() });
    localStorage.setItem("apa.activity", JSON.stringify(list.slice(0, 20)));
  } catch {}
}

const h = (n: number) => new Date(Date.now() - n * 3600_000).toISOString();
export const SEED_ACTIVITY: Activity[] = [
  { id: "a1", text: "Estimate generated for 3-bed house in Pretoria East", module: "Cost Estimator", at: h(2) },
  { id: "a2", text: "Email drafted to Mokoena Architects re: site visit", module: "Email Generator", at: h(5) },
  { id: "a3", text: "Weekly plan created (9 tasks)", module: "Task Planner", at: h(20) },
  { id: "a4", text: "Research summary: SANS 10400-XA energy rules", module: "Research Assistant", at: h(30) },
];

export type Enquiry = {
  id: string; client: string; email: string; type: "House" | "School"; location: string;
  area: number; architect: string; low: number; high: number; status: "New" | "Quoted" | "Won" | "Lost"; at: string;
  notes?: string | undefined;
};
export const SEED_ENQUIRIES: Enquiry[] = [
  { id: "e1", client: "Thandi Nkosi", email: "thandi@example.co.za", type: "House", location: "Pretoria, Gauteng", area: 220, architect: "Lerato Mokoena", low: 2_650_000, high: 3_200_000, status: "Quoted", at: h(48) },
  { id: "e2", client: "Gqeberha Primary SGB", email: "sgb@gps.example.za", type: "School", location: "Gqeberha, Eastern Cape", area: 1800, architect: "Pieter van der Merwe", low: 21_000_000, high: 26_500_000, status: "New", at: h(70) },
  { id: "e3", client: "Ahmed Patel", email: "ahmed@example.co.za", type: "House", location: "Durban, KwaZulu-Natal", area: 310, architect: "Ayesha Khan", low: 4_400_000, high: 5_300_000, status: "Won", at: h(140) },
];

export const ArchitectSchema = z.string();
export const zar = (n: number) => "R " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
