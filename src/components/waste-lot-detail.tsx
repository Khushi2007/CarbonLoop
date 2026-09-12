"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { CarbonEvidence } from "@/components/carbon-evidence";
import { RouteMap } from "@/components/route-map";
import { Button } from "@/components/ui/button";
import { formatCoordinates, formatDate, formatDuration, formatKm, formatTonnes } from "@/components/ui/format";
import { Register, RegisterBody, RegisterCell, RegisterHead, RegisterHeadCell, RegisterRow } from "@/components/ui/register";
import { formatInr } from "@/components/ui/stat";
import { StatusLabel } from "@/components/ui/status-label";
import { useCarbon, type CarbonState } from "@/hooks/use-carbon";
import { useMatches } from "@/hooks/use-matches";
import { useRoute } from "@/hooks/use-route";
import { useWasteLots } from "@/hooks/use-waste-lots";

export function WasteLotDetail({ id }: { id: string }) {
  const wasteLots = useWasteLots();
  const { state: matchState, requestMatches } = useMatches(id);
  const { state: routeState, planRoute } = useRoute(id);
  const { state: carbonState, calculateCarbon } = useCarbon(id);
  const reduceMotion = useReducedMotion();

  const hasRoute = routeState.status === "success";
  // If the routed facility has changed since the last carbon calculation, that
  // result no longer applies to the current selection — present it as idle
  // rather than a stale success/error for a facility that's no longer routed.
  const carbonFacilityMismatch =
    hasRoute && carbonState.status !== "idle" && carbonState.facilityId !== routeState.result.facility.id;
  const effectiveCarbonState: CarbonState = carbonFacilityMismatch ? { status: "idle" } : carbonState;

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
                    <RegisterHeadCell align="right">
                      <span className="sr-only">Action</span>
                    </RegisterHeadCell>
                  </RegisterHead>
                  <RegisterBody>
                    {matchState.matches.map((match, index) => {
                      const isSelected = routeState.status !== "idle" && routeState.facilityId === match.facility.id;
                      const isPlanning = routeState.status === "loading" && isSelected;
                      return (
                        <RegisterRow
                          key={match.facility.id}
                          className={isSelected ? "border-l-2 border-l-accent" : undefined}
                        >
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
                          <RegisterCell align="right">
                            <button
                              type="button"
                              onClick={() => planRoute(match.facility.id)}
                              disabled={isPlanning}
                              className="font-mono text-xs text-accent hover:underline disabled:opacity-50"
                            >
                              {isPlanning ? "Planning…" : "Plan Route →"}
                            </button>
                          </RegisterCell>
                        </RegisterRow>
                      );
                    })}
                  </RegisterBody>
                </Register>
              </div>
            )}
          </section>

          <section className="mt-8 border-t border-border pt-8">
            <h2 className="font-mono text-xs text-foreground-muted">Route</h2>

            {routeState.status === "idle" && (
              <p className="mt-4 text-sm text-foreground-secondary">
                Select a ranked match above and choose &ldquo;Plan Route&rdquo; to calculate the route to that
                facility.
              </p>
            )}

            {routeState.status === "loading" && (
              <p className="mt-4 text-sm text-foreground-secondary">Calculating route…</p>
            )}

            {routeState.status === "error" && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <p className="text-sm text-error">{routeState.message}</p>
                <Button variant="secondary" onClick={() => planRoute(routeState.facilityId)}>
                  Retry
                </Button>
              </div>
            )}

            {routeState.status === "success" && (
              <motion.div
                className="mt-4"
                initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <p className="font-mono text-xs text-foreground-muted">Route to</p>
                <p className="text-lg text-foreground">{routeState.result.facility.name}</p>

                <dl className="mt-4 grid max-w-md grid-cols-3 gap-x-8 gap-y-4">
                  <div>
                    <dt className="font-mono text-xs text-foreground-muted">Distance</dt>
                    <dd className="mt-1 font-mono text-lg text-foreground">
                      {formatKm(routeState.result.route.distanceKm)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-foreground-muted">Duration</dt>
                    <dd className="mt-1 font-mono text-lg text-foreground">
                      {formatDuration(routeState.result.route.durationMinutes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-xs text-foreground-muted">Est. cost</dt>
                    <dd className="mt-1 font-mono text-lg text-foreground">
                      {formatInr(routeState.result.route.estimatedTransportCostInr)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <RouteMap
                    origin={[routeState.result.wasteLot.latitude, routeState.result.wasteLot.longitude]}
                    destination={[routeState.result.facility.latitude, routeState.result.facility.longitude]}
                    coordinates={routeState.result.route.geometry.coordinates}
                  />
                </div>
              </motion.div>
            )}
          </section>

          <CarbonEvidence
            hasRoute={hasRoute}
            routeFacilityName={hasRoute ? routeState.result.facility.name : undefined}
            state={effectiveCarbonState}
            onCalculate={() => {
              if (routeState.status === "success") calculateCarbon(routeState.result.facility.id);
            }}
          />
        </>
      )}
    </div>
  );
}
