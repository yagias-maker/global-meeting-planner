import { DateTime } from "luxon";

const TZ_ABBR_MAP: Record<string, { std: string; dst?: string }> = {
  // Asia
  "Asia/Tokyo": { std: "JST" },
  "Asia/Kolkata": { std: "IST" },
  "Asia/Shanghai": { std: "CST" }, // China
  "Asia/Macau": { std: "CST" },
  "Asia/Singapore": { std: "SGT" },

  // Europe
  "Europe/London": { std: "GMT", dst: "BST" },
  "Europe/Berlin": { std: "CET", dst: "CEST" },
  "Europe/Rome": { std: "CET", dst: "CEST" },
  "Europe/Madrid": { std: "CET", dst: "CEST" },
  "Europe/Bucharest": { std: "EET", dst: "EEST" },
  "Europe/Copenhagen": { std: "CET", dst: "CEST" },

  // North America
  "America/New_York": { std: "EST", dst: "EDT" },
  "America/Chicago": { std: "CST", dst: "CDT" },
  "America/Los_Angeles": { std: "PST", dst: "PDT" },

  // South America
  "America/Sao_Paulo": { std: "BRT" },
  "America/Santiago": { std: "CLT", dst: "CLST" }
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
  candidateDate: string;
  start: string;
  end: string;
  participants: Array<{ label: string; iana: string }>;
  use24h: boolean;
}): string {
  const { baseIana, candidateDate, start, end, participants, use24h } = params;

  const startBase = DateTime.fromISO(`${candidateDate}T${start}`, { zone: baseIana });
  const endBase = DateTime.fromISO(`${candidateDate}T${end}`, { zone: baseIana });

  const fmtDate = startBase.toFormat("MMM d, yyyy (ccc)");
  const fmtTime = (dt: DateTime) =>
    use24h ? dt.toFormat("HH:mm") : dt.toFormat("h:mm a");

  // 開催都市（基準）
  const segments: string[] = [
    `${fmtTime(startBase)} – ${fmtTime(endBase)} (${getTzAbbr(startBase)})`
  ];

  // 参加都市
  participants.forEach(p => {
    const s = startBase.setZone(p.iana);
    const e = endBase.setZone(p.iana);

    segments.push(
      `${fmtTime(s)} – ${fmtTime(e)} (${getTzAbbr(s)})`
    );
  });

  return `${fmtDate}: ${segments.join(" / ")}`;
}

