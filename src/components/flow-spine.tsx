"use client";

import { motion, useReducedMotion } from "motion/react";

const STAGES = [
  { name: "Waste Lot", description: "Generator lists quantity, type, and location." },
  { name: "Match", description: "Facilities ranked by compatibility and distance." },
  { name: "Route", description: "Road distance, duration, and cost calculated." },
  { name: "Facility", description: "The ranked facility receives the shipment." },
  { name: "Carbon", description: "Net CO2e benefit computed against the landfill baseline." },
  { name: "Value", description: "Economic value recorded to the ledger." },
];

/** The six-stage Material Flow, used once on the Overview to explain the process — not repeated elsewhere. */
export function FlowSpine() {
  const reduceMotion = useReducedMotion();

  return (
    <ol className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
      {STAGES.map((stage, index) => (
        <motion.li
          key={stage.name}
          className="border-t-2 border-border-strong pt-3"
          initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
        >
          <p className="font-mono text-xs text-foreground-muted">{String(index + 1).padStart(2, "0")}</p>
          <p className="mt-1 font-mono text-sm text-foreground">{stage.name}</p>
          <p className="mt-1 text-sm text-foreground-secondary">{stage.description}</p>
        </motion.li>
      ))}
    </ol>
  );
}
