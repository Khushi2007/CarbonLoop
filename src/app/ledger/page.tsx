"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatDate, formatTonnes } from "@/components/ui/format";
import { Register, RegisterBody, RegisterCell, RegisterHead, RegisterHeadCell, RegisterRow } from "@/components/ui/register";
import { formatCo2e, formatInr } from "@/components/ui/stat";
import { useCarbonRecords } from "@/hooks/use-carbon-records";

export default function LedgerPage() {
  const state = useCarbonRecords();

  return (
    <div className="shell py-10 sm:py-14">
      <div className="border-b border-border pb-6">
        <h1 className="font-mono text-xs text-foreground-muted">Carbon Ledger</h1>
        <p className="mt-2 max-w-xl text-sm text-foreground-secondary">Completed operational records.</p>
      </div>

      <div className="pt-8">
        {state.status === "loading" && <p className="text-sm text-foreground-secondary">Loading ledger…</p>}
        {state.status === "error" && (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-error">{state.message}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}
        {state.status === "success" && state.records.length === 0 && (
          <p className="text-sm text-foreground-secondary">No completed carbon records exist yet.</p>
        )}

        {state.status === "success" && state.records.length > 0 && (
          <>
            <div className="hidden sm:block">
              <Register>
                <RegisterHead>
                  <RegisterHeadCell>Record</RegisterHeadCell>
                  <RegisterHeadCell>Waste</RegisterHeadCell>
                  <RegisterHeadCell>Facility</RegisterHeadCell>
                  <RegisterHeadCell align="right">Net CO2e</RegisterHeadCell>
                  <RegisterHeadCell align="right">Economic value</RegisterHeadCell>
                  <RegisterHeadCell>Date</RegisterHeadCell>
                  <RegisterHeadCell align="right">
                    <span className="sr-only">Action</span>
                  </RegisterHeadCell>
                </RegisterHead>
                <RegisterBody>
                  {state.records.map((record) => (
                    <RegisterRow key={record.id}>
                      <RegisterCell mono>
                        <span title={record.id}>{record.id.slice(0, 8)}…</span>
                      </RegisterCell>
                      <RegisterCell>
                        {record.waste.type} · {formatTonnes(record.waste.quantityTonnes)}
                      </RegisterCell>
                      <RegisterCell>{record.conversion.facility.name}</RegisterCell>
                      <RegisterCell align="right" mono>
                        {formatCo2e(record.carbon.netCo2eBenefitKgCo2e)}
                      </RegisterCell>
                      <RegisterCell align="right" mono>
                        {formatInr(record.economics.estimatedEconomicValueInr)}
                      </RegisterCell>
                      <RegisterCell mono>{formatDate(record.createdAt)}</RegisterCell>
                      <RegisterCell align="right">
                        <Link href={`/ledger/${record.id}`} className="font-mono text-xs text-accent hover:underline">
                          Open →
                        </Link>
                      </RegisterCell>
                    </RegisterRow>
                  ))}
                </RegisterBody>
              </Register>
            </div>

            <div className="sm:hidden">
              {state.records.map((record) => (
                <Link
                  key={record.id}
                  href={`/ledger/${record.id}`}
                  className="block border-b border-border py-4 first:pt-0 last:border-b-0 hover:bg-surface"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-mono text-xs text-foreground-muted">{record.id.slice(0, 8)}…</p>
                    <p className="font-mono text-xs text-foreground-muted">{formatDate(record.createdAt)}</p>
                  </div>
                  <p className="mt-1 text-base text-foreground">
                    {record.waste.type} · {formatTonnes(record.waste.quantityTonnes)}
                  </p>
                  <p className="mt-1 text-sm text-foreground-secondary">{record.conversion.facility.name}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <dt className="text-foreground-muted">Net CO2e</dt>
                      <dd className="font-mono text-foreground-secondary">
                        {formatCo2e(record.carbon.netCo2eBenefitKgCo2e)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted">Economic value</dt>
                      <dd className="font-mono text-foreground-secondary">
                        {formatInr(record.economics.estimatedEconomicValueInr)}
                      </dd>
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
