export type CityOption = { label: string; iana: string; aliases?: string[] };

export const CITY_OPTIONS: CityOption[] = [
  { label: "Tokyo", iana: "Asia/Tokyo", aliases: ["東京"] },

  // Europe
  { label: "Milano", iana: "Europe/Rome", aliases: ["Milan", "ミラノ"] },
  { label: "Madrid", iana: "Europe/Madrid", aliases: ["マドリード"] },
  { label: "Barcelona", iana: "Europe/Madrid", aliases: ["バルセロナ"] },
  { label: "Denmark (Copenhagen)", iana: "Europe/Copenhagen", aliases: ["デンマーク", "Copenhagen", "コペンハーゲン"] },
  { label: "Romania (Bucharest)", iana: "Europe/Bucharest", aliases: ["ルーマニア", "Bucharest", "ブカレスト"] },
  { label: "London", iana: "Europe/London", aliases: ["ロンドン"] },
  { label: "Berlin", iana: "Europe/Berlin", aliases: ["ベルリン"] },

  // US
  { label: "Dallas", iana: "America/Chicago", aliases: ["ダラス"] },
  { label: "New York", iana: "America/New_York", aliases: ["ニューヨーク", "NYC"] },
  { label: "San Francisco", iana: "America/Los_Angeles", aliases: ["サンフランシスコ", "SF"] },
  { label: "Los Angeles", iana: "America/Los_Angeles", aliases: ["ロサンゼルス", "LA"] },
  { label: "Chicago", iana: "America/Chicago", aliases: ["シカゴ"] },

  // LatAm
  { label: "Chile (Santiago)", iana: "America/Santiago", aliases: ["チリ", "Santiago", "サンティアゴ"] },
  { label: "Brazil (São Paulo)", iana: "America/Sao_Paulo", aliases: ["ブラジル", "サンパウロ", "Sao Paulo", "São Paulo"] },

  // APAC
  { label: "Bangalore", iana: "Asia/Kolkata", aliases: ["バンガロール", "Bengaluru"] },
  { label: "Delhi", iana: "Asia/Kolkata", aliases: ["デリ", "New Delhi", "ニューデリー"] },
  { label: "Singapore", iana: "Asia/Singapore", aliases: ["シンガポール"] },
  { label: "Macau", iana: "Asia/Macau", aliases: ["マカオ"] },
  { label: "China (Shanghai)", iana: "Asia/Shanghai", aliases: ["中国", "Shanghai", "上海", "Beijing", "北京"] }
];

// 入力文字列から候補を探す（label/aliases両方を見る）
export function findCityOption(input: string): CityOption | undefined {
  const normalized = input.trim().toLowerCase();
  return CITY_OPTIONS.find(c => {
    if (c.label.toLowerCase() === normalized) return true;
    return (c.aliases ?? []).some(a => a.toLowerCase() === normalized);
  });
}
