"use client";

import Link from "next/link";

import { Button, LinkButton } from "@/components/ui/button";
import { formatCoordinates, formatDate, formatTonnes } from "@/components/ui/format";
import { Register, RegisterBody, RegisterCell, RegisterHead, RegisterHeadCell, RegisterRow } from "@/components/ui/register";
import { StatusLabel } from "@/components/ui/status-label";
import { useMyWasteLots } from "@/hooks/use-my-waste-lots";

/** Authenticated, user-scoped view — distinct from the public /waste-lots register, which lists every lot in the ecosystem. */
export default function MyWasteLotsPage() {
  const state = useMyWasteLots();

  return (
    <div className="shell py-10 sm:py-14">
      <p className="font-mono text-xs text-foreground-muted">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>{" "}
        / My Waste Lots
      </p>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl text-foreground sm:text-3xl">My Waste Lots</h1>
          <p className="mt-2 max-w-xl text-sm text-foreground-secondary">
            Waste lots you have logged.{" "}
            <Link href="/waste-lots" className="text-accent hover:underline">
              View all waste lots
            </Link>{" "}
            for the full ecosystem-wide register.
          </p>
        </div>
        <LinkButton href="/waste-lots/new" variant="primary" className="shrink-0">
          Create Waste Lot
        </LinkButton>
      </div>

      <div className="pt-8">
        {state.status === "loading" && <p className="text-sm text-foreground-secondary">Loading your waste lots…</p>}
        {state.status === "error" && (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-error">{state.message}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}
        {state.status === "success" && state.wasteLots.length === 0 && (
          <p className="text-sm text-foreground-secondary">
            You haven&rsquo;t logged any waste lots yet.{" "}
            <Link href="/waste-lots/new" className="text-accent hover:underline">
              Create your first one
            </Link>
            .
          </p>
        )}

        {state.status === "success" && state.wasteLots.length > 0 && (
          <>
            <div className="hidden sm:block">
              <Register>
                <RegisterHead>
                  <RegisterHeadCell>ID</RegisterHeadCell>
                  <RegisterHeadCell>Waste type</RegisterHeadCell>
                  <RegisterHeadCell align="right">Quantity</RegisterHeadCell>
                  <RegisterHeadCell>Location</RegisterHeadCell>
                  <RegisterHeadCell>Available from</RegisterHeadCell>
                  <RegisterHeadCell>Status</RegisterHeadCell>
                  <RegisterHeadCell align="right">
                    <span className="sr-only">Action</span>
                  </RegisterHeadCell>
                </RegisterHead>
                <RegisterBody>
                  {state.wasteLots.map((lot) => (
                    <RegisterRow key={lot.id}>
                      <RegisterCell mono>
                        <span title={lot.id}>{lot.id.slice(0, 8)}…</span>
                      </RegisterCell>
                      <RegisterCell>{lot.wasteType}</RegisterCell>
                      <RegisterCell align="right" mono>
                        {formatTonnes(lot.quantityTonnes)}
                      </RegisterCell>
                      <RegisterCell mono>{formatCoordinates(lot.location.latitude, lot.location.longitude)}</RegisterCell>
                      <RegisterCell mono>{formatDate(lot.availableFrom)}</RegisterCell>
                      <RegisterCell>
                        <StatusLabel status={lot.status} />
                      </RegisterCell>
                      <RegisterCell align="right">
                        <Link href={`/waste-lots/${lot.id}`} className="font-mono text-xs text-accent hover:underline">
                          Open →
                        </Link>
                      </RegisterCell>
                    </RegisterRow>
                  ))}
                </RegisterBody>
              </Register>
            </div>

            <div className="sm:hidden">
              {state.wasteLots.map((lot) => (
                <Link
                  key={lot.id}
                  href={`/waste-lots/${lot.id}`}
                  className="block border-b border-border py-4 first:pt-0 last:border-b-0 hover:bg-surface"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-mono text-xs text-foreground-muted">{lot.id.slice(0, 8)}…</p>
                    <StatusLabel status={lot.status} />
                  </div>
                  <p className="mt-1 text-base text-foreground">{lot.wasteType}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <dt className="text-foreground-muted">Quantity</dt>
                      <dd className="font-mono text-foreground-secondary">{formatTonnes(lot.quantityTonnes)}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted">Available from</dt>
                      <dd className="font-mono text-foreground-secondary">{formatDate(lot.availableFrom)}</dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
