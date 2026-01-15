import { DateTime } from "luxon";

const TZ_ABBR_MAP: Record<string, { std: string; dst?: string }> = {
  "Asia/Tokyo": { std: "JST" },

  "Europe/London": { std: "GMT", dst: "BST" },
  "Europe/Paris": { std: "CET", dst: "CEST" },
  "Europe/Berlin": { std: "CET", dst: "CEST" },

  "America/New_York": { std: "EST", dst: "EDT" },
  "America/Chicago": { std: "CST", dst: "CDT" },
  "America/Los_Angeles": { std: "PST", dst: "PDT" },

  "Asia/Singapore": { std: "SGT" },
  "Asia/Seoul": { std: "KST" },
  "Asia/Shanghai": { std: "CST" },
  "Australia/Sydney": { std: "AEST", dst: "AEDT" }
};

function getTzAbbr(dt: DateTime): string {
  // zoneName が null の可能性をここで潰す
  const zone: string = dt.zoneName ?? "UTC";

  const entry = TZ_ABBR_MAP[zone];

  // マップに無い場合のフォールバック（必ず string）
  if (!entry) {
    return dt.offsetNameShort ?? zone;
  }

  // DSTが無いゾーン（JSTなど）
  if (!entry.dst) {
    return entry.std;
  }

  // 冬(1月)のoffsetと比較してDST判定
  const winter = dt.set({ month: 1 });
  const isDst = dt.offset !== winter.offset;

  return isDst ? entry.dst : entry.std;
}


export function isValidHHmm(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

export function compareTime(a: string, b: string): number {
  // "HH:mm" 同士の比較
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  if (ah !== bh) return ah - bh;
  return am - bm;
}

export function formatCandidateLine(params: {
  baseIana: string;
  baseLabel: string;
  candidateDate: string; // yyyy-mm-dd
  start: string; // HH:mm
  end: string;   // HH:mm
  participants: Array<{ label: string; iana: string }>;
  use24h: boolean;
}): string {
  const { baseIana, baseLabel, candidateDate, start, end, participants, use24h } = params;

  const startBase = DateTime.fromISO(`${candidateDate}T${start}`, { zone: baseIana });
  const endBase = DateTime.fromISO(`${candidateDate}T${end}`, { zone: baseIana });

  // 先頭日付は開催都市基準
  const headDate = startBase.toFormat("MMM d, yyyy (ccc)");

  const fmtTime = (dt: DateTime) => (use24h ? dt.toFormat("HH:mm") : dt.toFormat("h:mm a"));
  const tzShort = (dt: DateTime) => getTzAbbr(dt);

  const baseSegment = (() => {
    const s = fmtTime(startBase);
    const e = fmtTime(endBase);
    const tz = tzShort(startBase);
    return `${s} to ${e} ${tz}`;
  })();

  const baseDay = startBase.startOf("day");

  const otherSegments = participants.map(p => {
    const s = startBase.setZone(p.iana);
    const e = endBase.setZone(p.iana);

    const shiftDays = Math.round(s.startOf("day").diff(baseDay, "days").days);
    const suffix = shiftDays === 0 ? "" : ` (${shiftDays > 0 ? "+" : ""}${shiftDays}d)`;

    return `${fmtTime(s)} to ${fmtTime(e)} ${tzShort(s)}${suffix}`;
  });

  // 開催都市も「都市名」を出したい場合はここで付けられるが、例に合わせて時刻のみを並べる
  // 例: `${baseLabel} ${baseSegment} / ...` も可能
  return `${headDate}: ${baseSegment} / ${otherSegments.join(" / ")}`;
}

