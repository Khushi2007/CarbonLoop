"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatCoordinates, formatDate, formatKm, formatTonnes } from "@/components/ui/format";
import { Register, RegisterBody, RegisterCell, RegisterHead, RegisterHeadCell, RegisterRow } from "@/components/ui/register";
import { formatInr } from "@/components/ui/stat";
import { StatusLabel } from "@/components/ui/status-label";
import { useMatches } from "@/hooks/use-matches";
import { useWasteLots } from "@/hooks/use-waste-lots";

export function WasteLotDetail({ id }: { id: string }) {
  const wasteLots = useWasteLots();
  const { state: matchState, requestMatches } = useMatches(id);

  const lot = wasteLots.status === "success" ? wasteLots.wasteLots.find((item) => item.id === id) : undefined;

  return (
    <div className="shell py-10 sm:py-14">
      <p className="font-mono text-xs text-foreground-muted">
        <Link href="/waste-lots" className="hover:underline">
          Waste Lots
        </Link>{" "}
        / Record
      </p>

      {wasteLots.status === "loading" && <p className="mt-4 text-sm text-foreground-secondary">Loading record…</p>}
      {wasteLots.status === "error" && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-sm text-error">{wasteLots.message}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}
      {wasteLots.status === "success" && !lot && (
        <p className="mt-4 text-sm text-foreground-secondary">
          No waste lot found with this ID.{" "}
          <Link href="/waste-lots" className="text-accent hover:underline">
            Return to the register
          </Link>
          .
        </p>
      )}

      {lot && (
        <>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl text-foreground sm:text-3xl">{lot.wasteType}</h1>
              <p className="mt-1 font-mono text-xs text-foreground-muted">{lot.id}</p>
            </div>
            <StatusLabel status={lot.status} className="text-sm" />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 border-b border-border pb-8 sm:grid-cols-4">
            <div>
              <dt className="font-mono text-xs text-foreground-muted">Quantity</dt>
              <dd className="mt-1 font-mono text-lg text-foreground">{formatTonnes(lot.quantityTonnes)}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-foreground-muted">Location</dt>
              <dd className="mt-1 font-mono text-lg text-foreground">{formatCoordinates(lot.latitude, lot.longitude)}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-foreground-muted">Available from</dt>
              <dd className="mt-1 font-mono text-lg text-foreground">{formatDate(lot.availableFrom)}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-foreground-muted">Logged</dt>
              <dd className="mt-1 font-mono text-lg text-foreground">{formatDate(lot.createdAt)}</dd>
            </div>
          </dl>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-mono text-xs text-foreground-muted">Facility matches</h2>
              <Button variant="primary" onClick={requestMatches} disabled={matchState.status === "loading"}>
                {matchState.status === "loading"
                  ? "Matching…"
                  : matchState.status === "success"
                    ? "Refresh Matches"
                    : "Request Matches"}
              </Button>
            </div>

            {matchState.status === "error" && <p className="mt-4 text-sm text-error">{matchState.message}</p>}

            {matchState.status === "success" && matchState.matches.length === 0 && (
              <p className="mt-4 text-sm text-foreground-secondary">
                No compatible facilities were found within range for this lot.
              </p>
            )}

            {matchState.status === "success" && matchState.matches.length > 0 && (
              <div className="mt-4">
                <Register>
                  <RegisterHead>
                    <RegisterHeadCell>#</RegisterHeadCell>
                    <RegisterHeadCell>Facility</RegisterHeadCell>
                    <RegisterHeadCell align="right">Distance</RegisterHeadCell>
                    <RegisterHeadCell align="right">Est. transport cost</RegisterHeadCell>
                    <RegisterHeadCell align="right">Overall score</RegisterHeadCell>
                  </RegisterHead>
                  <RegisterBody>
                    {matchState.matches.map((match, index) => (
                      <RegisterRow key={match.facility.id}>
                        <RegisterCell mono>{String(index + 1).padStart(2, "0")}</RegisterCell>
                        <RegisterCell>
                          <p className="text-foreground">{match.facility.name}</p>
                          <p className="mt-1 text-xs text-foreground-muted">{match.matchReason}</p>
                        </RegisterCell>
                        <RegisterCell align="right" mono>
                          {formatKm(match.distanceKm)}
                        </RegisterCell>
                        <RegisterCell align="right" mono>
                          {formatInr(match.estimatedTransportCostInr)}
                        </RegisterCell>
                        <RegisterCell align="right" mono>
                          {match.overallScore.toFixed(1)}
                        </RegisterCell>
                      </RegisterRow>
                    ))}
                  </RegisterBody>
                </Register>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
