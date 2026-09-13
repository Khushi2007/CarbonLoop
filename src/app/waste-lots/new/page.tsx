"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function NewWasteLotPage() {
  const router = useRouter();

  const [wasteType, setWasteType] = useState("");
  const [quantityTonnes, setQuantityTonnes] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [qualityScore, setQualityScore] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/waste-lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wasteType,
        quantityTonnes: Number(quantityTonnes),
        latitude: Number(latitude),
        longitude: Number(longitude),
        availableFrom,
        moisturePercent: moisturePercent ? Number(moisturePercent) : undefined,
        qualityScore: qualityScore ? Number(qualityScore) : undefined,
      }),
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(typeof body?.error === "string" ? body.error : "Unable to create waste lot.");
      return;
    }

    setStatus("success");
    router.push(`/waste-lots/${body.wasteLot.id}`);
  }

  return (
    <div className="shell max-w-md py-10 sm:py-14">
      <p className="font-mono text-xs text-foreground-muted">
        <Link href="/waste-lots" className="hover:underline">
          Waste Lots
        </Link>{" "}
        / New
      </p>
      <h1 className="mt-2 text-2xl text-foreground">Create Waste Lot</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-mono text-xs text-foreground-muted">Waste type</span>
          <input
            required
            value={wasteType}
            onChange={(event) => setWasteType(event.target.value)}
            placeholder="e.g. Rice Husk"
            className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-mono text-xs text-foreground-muted">Quantity (tonnes)</span>
          <input
            type="number"
            required
            min={0.001}
            step="any"
            value={quantityTonnes}
            onChange={(event) => setQuantityTonnes(event.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-mono text-xs text-foreground-muted">Latitude</span>
            <input
              type="number"
              required
              step="any"
              min={-90}
              max={90}
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-mono text-xs text-foreground-muted">Longitude</span>
            <input
              type="number"
              required
              step="any"
              min={-180}
              max={180}
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-mono text-xs text-foreground-muted">Available from</span>
          <input
            type="date"
            required
            value={availableFrom}
            onChange={(event) => setAvailableFrom(event.target.value)}
            className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-mono text-xs text-foreground-muted">Moisture % (optional)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="any"
              value={moisturePercent}
              onChange={(event) => setMoisturePercent(event.target.value)}
              className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-mono text-xs text-foreground-muted">Quality score (optional)</span>
            <input
              type="number"
              min={0}
              max={100}
              step="any"
              value={qualityScore}
              onChange={(event) => setQualityScore(event.target.value)}
              className="border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-foreground-secondary"
            />
          </label>
        </div>

        {status === "error" && <p className="text-sm text-error">{message}</p>}

        <Button type="submit" variant="primary" disabled={status === "loading"} className="mt-2">
          {status === "loading" ? "Creating…" : "Create Waste Lot"}
        </Button>
      </form>
    </div>
  );
}
