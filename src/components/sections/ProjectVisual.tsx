"use client";

/**
 * Art-directed concept visuals for each project.
 * These are stylized interface illustrations — every card carries a
 * "CONCEPT VISUAL" caption so nothing is presented as a real screenshot.
 */

function ChromeBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-edge bg-obsidian/70 px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-flux/70" />
        <span className="h-2 w-2 rounded-full bg-aurum/70" />
        <span className="h-2 w-2 rounded-full bg-neon/70" />
      </div>
      <span className="label-mono text-[9px]">{title}</span>
      <span className="h-1 w-6 bg-edge" />
    </div>
  );
}

function Caption() {
  return (
    <div className="flex items-center justify-between border-t border-edge bg-obsidian/80 px-3 py-1.5">
      <span className="label-mono text-[8px] text-dim/70">
        CONCEPT VISUAL — NOT A PRODUCT SCREENSHOT
      </span>
      <span className="label-mono text-[8px] text-neon/70">RENDER OK</span>
    </div>
  );
}

/* --------------- PackSure: label inspection console --------------- */

function PackSureVisual() {
  return (
    <div className="flex h-full flex-col bg-[#080b12]">
      <ChromeBar title="PACKSURE // LABEL INSPECTION" />
      <div className="scanline motion-reduce:hidden" />
      <div className="grid flex-1 grid-cols-5 gap-3 p-4">
        {/* label crop with bounding box */}
        <div className="relative col-span-3 border border-edge/70 bg-[#0c1018] p-4">
          <div className="absolute left-2 top-2 h-3 w-3 border-l border-t border-neon" />
          <div className="absolute right-2 top-2 h-3 w-3 border-r border-t border-neon" />
          <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-neon" />
          <div className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-neon" />
          <p className="label-mono mb-3 text-[8px] text-neon">
            OCR CROP — CONF 0.94
          </p>
          <div className="space-y-2.5 border border-dashed border-neon/40 p-3">
            <div className="h-2.5 w-3/4 bg-[#1c2534]" />
            <div className="h-2 w-1/2 bg-[#161d2a]" />
            <div className="mt-3 space-y-1.5 font-technical text-[9px] text-dim">
              <p className="flex justify-between">
                <span>NET QTY</span>
                <span className="text-bone">500 g</span>
              </p>
              <p className="flex justify-between">
                <span>MRP</span>
                <span className="text-bone">₹ 120.00</span>
              </p>
              <p className="flex justify-between">
                <span>MFG DATE</span>
                <span className="text-bone">detected</span>
              </p>
            </div>
          </div>
        </div>
        {/* rule engine results */}
        <div className="col-span-2 flex flex-col gap-2">
          <p className="label-mono text-[8px]">RULE ENGINE / LEGAL METROLOGY</p>
          {[
            ["DECLARATION", true],
            ["NET QTY", true],
            ["MRP FORMAT", true],
            ["FONT SIZE", true],
          ].map(([label, ok]) => (
            <div
              key={label as string}
              className="flex items-center justify-between border border-edge/60 bg-[#0b0f16] px-2.5 py-1.5"
            >
              <span className="font-technical text-[9px] text-dim">
                {label as string}
              </span>
              <span
                className={`font-technical text-[9px] ${
                  ok ? "text-neon" : "text-flux"
                }`}
              >
                {ok ? "PASS" : "CHECK"}
              </span>
            </div>
          ))}
          <div className="mt-auto border border-neon/50 bg-neon/5 px-2.5 py-2 text-center">
            <span className="label-mono-neon text-[9px]">VERDICT — COMPLIANT</span>
          </div>
        </div>
      </div>
      <Caption />
    </div>
  );
}

/* --------------- Oiltrace: detection sweep --------------- */

function OiltraceVisual() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#04070d]">
      <ChromeBar title="OILTRACE // SEGMENTATION PASS" />
      <div className="relative flex-1">
        {/* ocean depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 80% at 30% 40%, #071522 0%, #050b14 55%, #030710 100%)",
          }}
        />
        {/* grid */}
        <div className="grid-fade absolute inset-0 opacity-40" />
        {/* radar sweep */}
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 rounded-full border border-neon/20" />
          <div className="absolute inset-6 rounded-full border border-neon/15" />
          <div className="absolute inset-12 rounded-full border border-neon/10" />
          <div
            className="radar-sweep motion-reduce:hidden absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(0,229,255,0.35), rgba(0,229,255,0.02) 70deg, transparent 90deg)",
            }}
          />
          {/* detection blob */}
          <div
            className="absolute left-[58%] top-[38%] h-10 w-14 rounded-[60%_40%_55%_45%]"
            style={{
              background:
                "radial-gradient(ellipse, rgba(255,45,149,0.55), rgba(255,45,149,0.12) 60%, transparent 75%)",
              boxShadow: "0 0 24px rgba(255,45,149,0.35)",
            }}
          />
          <div className="absolute left-[70%] top-[52%] h-2 w-2 rounded-full bg-flux shadow-[0_0_10px_#ff2d95]" />
        </div>
        {/* readouts */}
        <ul className="absolute right-3 top-3 space-y-1.5 text-right">
          {[
            ["MODEL", "U-NET"],
            ["AIS FEED", "LINKED"],
            ["SPECTRAL", "ACTIVE"],
          ].map(([k, v]) => (
            <li key={k} className="font-technical text-[8px] tracking-[0.2em] text-dim">
              {k} <span className="text-neon">{v}</span>
            </li>
          ))}
        </ul>
        <p className="label-mono absolute bottom-3 left-3 text-[8px]">
          SECTOR 22-B // SPILL CANDIDATE FLAGGED
        </p>
      </div>
      <Caption />
    </div>
  );
}

/* --------------- SyncFit: booking interface --------------- */

function SyncFitVisual() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const sessions: Record<string, { row: number; color: string; label: string }[]> = {
    MON: [{ row: 0, color: "neon", label: "HIIT 06:00" }],
    TUE: [{ row: 1, color: "flux", label: "SPIN 18:30" }],
    WED: [{ row: 0, color: "neon", label: "HIIT 06:00" }, { row: 2, color: "aurum", label: "YOGA 19:00" }],
    THU: [{ row: 1, color: "flux", label: "SPIN 18:30" }],
    FRI: [{ row: 0, color: "neon", label: "CROSS 07:00" }],
    SAT: [{ row: 2, color: "aurum", label: "OPEN MAT 10:00" }],
  };
  const colorCls: Record<string, string> = {
    neon: "border-neon/60 bg-neon/10 text-neon",
    flux: "border-flux/60 bg-flux/10 text-flux",
    aurum: "border-aurum/60 bg-aurum/10 text-aurum",
  };
  return (
    <div className="flex h-full flex-col bg-[#080b12]">
      <ChromeBar title="SYNCFIT // WEEK SCHEDULE" />
      <div className="grid flex-1 grid-cols-5 gap-3 p-4">
        {/* schedule grid */}
        <div className="col-span-3">
          <div className="grid grid-cols-6 gap-1.5">
            {days.map((d) => (
              <p key={d} className="label-mono text-center text-[7px]">
                {d}
              </p>
            ))}
            {days.map((d) =>
              [0, 1, 2].map((row) => {
                const s = sessions[d]?.find((x) => x.row === row);
                return (
                  <div
                    key={`${d}-${row}`}
                    className={`flex h-9 items-center justify-center border px-1 ${
                      s ? colorCls[s.color] : "border-edge/40 bg-[#0b0f16]"
                    }`}
                  >
                    {s && (
                      <span className="font-technical text-[7.5px] leading-tight">
                        {s.label}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* booking side panel */}
        <div className="col-span-2 flex flex-col gap-2 border-l border-edge/60 pl-3">
          <p className="label-mono text-[8px]">MEMBER — BOOKING</p>
          {["STRENGTH", "CARDIO", "RECOVERY"].map((r, i) => (
            <div
              key={r}
              className="flex items-center justify-between border border-edge/60 bg-[#0b0f16] px-2 py-1.5"
            >
              <span className="font-technical text-[9px] text-dim">{r}</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i === 0 ? "bg-neon" : i === 1 ? "bg-aurum" : "bg-edge"
                }`}
              />
            </div>
          ))}
          <div className="mt-auto bg-neon px-2 py-2 text-center">
            <span className="label-mono text-[9px] font-bold text-obsidian">
              BOOK SESSION
            </span>
          </div>
        </div>
      </div>
      <Caption />
    </div>
  );
}

/* --------------- dispatcher --------------- */

export default function ProjectVisual({ kind }: { kind: "packsure" | "oiltrace" | "syncfit" }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-edge transition-colors duration-500 group-hover:border-neon/40">
      {kind === "packsure" && <PackSureVisual />}
      {kind === "oiltrace" && <OiltraceVisual />}
      {kind === "syncfit" && <SyncFitVisual />}
      {/* corner tick */}
      <span className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-neon/70" />
      <span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-neon/70" />
    </div>
  );
}
