import React, { useMemo, useState } from "react";
import { CITY_OPTIONS, CityOption } from "./cityData";
import { compareTime, formatCandidateLine, isValidHHmm } from "./utils";

type Candidate = { id: string; date: string; start: string; end: string };
type Participant = { id: string; label: string; iana: string; source: "city" | "iana" };

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function App() {
  const [baseCityLabel, setBaseCityLabel] = useState("New York");
  const baseCity = useMemo<CityOption | null>(() => {
    const found = CITY_OPTIONS.find(c => c.label.toLowerCase() === baseCityLabel.trim().toLowerCase());
    return found ?? null;
  }, [baseCityLabel]);

  const [use24h, setUse24h] = useState(false);

  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: uid(), date: "2026-01-19", start: "20:00", end: "21:00" }
  ]);

  const [participants, setParticipants] = useState<Participant[]>([
    { id: uid(), label: "Tokyo", iana: "Asia/Tokyo", source: "city" }
  ]);

  const [newParticipantMode, setNewParticipantMode] = useState<"city" | "iana">("city");
  const [newParticipantInput, setNewParticipantInput] = useState("");

  const validationErrors = useMemo(() => {
    const errs: string[] = [];

    if (!baseCity) {
      errs.push("開催都市が主要都市リストに見つかりません。候補から選ぶか、実装拡張が必要です。");
    }

    candidates.forEach((c, idx) => {
      if (!c.date) errs.push(`候補${idx + 1}: 日付が未入力です。`);
      if (!isValidHHmm(c.start)) errs.push(`候補${idx + 1}: 開始時刻はHH:mm形式で入力してください。`);
      if (!isValidHHmm(c.end)) errs.push(`候補${idx + 1}: 終了時刻はHH:mm形式で入力してください。`);
      if (isValidHHmm(c.start) && isValidHHmm(c.end) && compareTime(c.end, c.start) <= 0) {
        errs.push(`候補${idx + 1}: 終了時刻は開始時刻より後にしてください。`);
      }
    });

    participants.forEach((p, idx) => {
      if (!p.iana) errs.push(`参加者都市${idx + 1}: タイムゾーン(IANA)が空です。`);
    });

    return errs;
  }, [baseCity, candidates, participants]);

  const outputText = useMemo(() => {
    if (!baseCity) return "";
    if (validationErrors.length > 0) return "";

    return candidates
      .map(c =>
        formatCandidateLine({
          baseIana: baseCity.iana,
          baseLabel: baseCity.label,
          candidateDate: c.date,
          start: c.start,
          end: c.end,
          participants: participants.map(p => ({ label: p.label, iana: p.iana })),
          use24h
        })
      )
      .join("\n");
  }, [baseCity, candidates, participants, use24h, validationErrors.length]);

  function addCandidate() {
    setCandidates(prev => [...prev, { id: uid(), date: todayISO(), start: "09:00", end: "10:00" }]);
  }

  function updateCandidate(id: string, patch: Partial<Candidate>) {
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCandidate(id: string) {
    setCandidates(prev => prev.filter(c => c.id !== id));
  }

  function addParticipant() {
    const value = newParticipantInput.trim();
    if (!value) return;

    if (newParticipantMode === "city") {
      const found = CITY_OPTIONS.find(c => c.label.toLowerCase() === value.toLowerCase());
      if (!found) {
        // city mode なのに見つからない場合は、案内しつつ追加しない（誤変換防止）
        alert("主要都市候補に見つかりません。IANAモードで例: Asia/Singapore のように入力してください。");
        return;
      }
      setParticipants(prev => [
        ...prev,
        { id: uid(), label: found.label, iana: found.iana, source: "city" }
      ]);
      setNewParticipantInput("");
      return;
    }

    // IANA直接入力
    setParticipants(prev => [...prev, { id: uid(), label: value, iana: value, source: "iana" }]);
    setNewParticipantInput("");
  }

  function removeParticipant(id: string) {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }

  async function copyToClipboard() {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      alert("コピーしました。メールに貼り付けできます。");
    } catch {
      // フォールバック
      const ta = document.getElementById("outputArea") as HTMLTextAreaElement | null;
      if (ta) {
        ta.focus();
        ta.select();
        document.execCommand("copy");
        alert("コピーしました（フォールバック）。");
      } else {
        alert("コピーに失敗しました。");
      }
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Global Meeting Time Planner</h1>
        <p className="sub">
          候補日時を開催都市基準で入力し、参加都市のローカル時刻へ自動変換してメール用テキストを生成します。
        </p>
      </header>

      <section className="card">
        <div className="row">
          <div className="field">
            <label>開催都市（基準）</label>
            <input
              list="cityOptions"
              value={baseCityLabel}
              onChange={e => setBaseCityLabel(e.target.value)}
              placeholder="New York"
            />
            <datalist id="cityOptions">
              {CITY_OPTIONS.map(c => (
                <option key={c.iana} value={c.label} />
              ))}
            </datalist>
            <div className="hint">
              {baseCity ? (
                <>
                  TZ: <code>{baseCity.iana}</code>
                </>
              ) : (
                <span className="warn">主要都市リストにありません（要拡張）</span>
              )}
            </div>
          </div>

          <div className="field small">
            <label>表記</label>
            <div className="toggle">
              <button
                className={!use24h ? "active" : ""}
                onClick={() => setUse24h(false)}
                type="button"
              >
                12h
              </button>
              <button
                className={use24h ? "active" : ""}
                onClick={() => setUse24h(true)}
                type="button"
              >
                24h
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <div className="cardTitle">
            <h2>候補日時</h2>
            <button type="button" onClick={addCandidate}>
              + Add candidate
            </button>
          </div>

          <div className="list">
            {candidates.map((c, idx) => (
              <div className="listRow" key={c.id}>
                <div className="badge">{idx + 1}</div>
                <div className="field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={c.date}
                    onChange={e => updateCandidate(c.id, { date: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Start</label>
                  <input
                    type="time"
                    value={c.start}
                    onChange={e => updateCandidate(c.id, { start: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>End</label>
                  <input
                    type="time"
                    value={c.end}
                    onChange={e => updateCandidate(c.id, { end: e.target.value })}
                  />
                </div>
                <button className="danger" type="button" onClick={() => removeCandidate(c.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="cardTitle">
            <h2>参加都市</h2>
          </div>

          <div className="row">
            <div className="field small">
              <label>追加モード</label>
              <select value={newParticipantMode} onChange={e => setNewParticipantMode(e.target.value as any)}>
                <option value="city">都市（候補から）</option>
                <option value="iana">IANA（手入力）</option>
              </select>
            </div>

            <div className="field">
              <label>{newParticipantMode === "city" ? "都市名" : "IANAタイムゾーン"}</label>
              <input
                list={newParticipantMode === "city" ? "cityOptions" : undefined}
                value={newParticipantInput}
                onChange={e => setNewParticipantInput(e.target.value)}
                placeholder={newParticipantMode === "city" ? "Tokyo" : "Asia/Singapore"}
              />
              <div className="hint">
                {newParticipantMode === "iana" ? (
                  <>
                    例: <code>Asia/Singapore</code>, <code>Europe/London</code>
                  </>
                ) : (
                  <>主要都市はオートコンプリートから選べます</>
                )}
              </div>
            </div>

            <div className="field small">
              <label>&nbsp;</label>
              <button type="button" onClick={addParticipant}>
                + Add
              </button>
            </div>
          </div>

          <div className="list">
            {participants.map((p, idx) => (
              <div className="listRow" key={p.id}>
                <div className="badge">{idx + 1}</div>
                <div className="mono">
                  <div>
                    <strong>{p.label}</strong>{" "}
                    <span className="muted">({p.source === "city" ? "city" : "iana"})</span>
                  </div>
                  <div className="muted">
                    TZ: <code>{p.iana}</code>
                  </div>
                </div>
                <button className="danger" type="button" onClick={() => removeParticipant(p.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="cardTitle">
          <h2>Output</h2>
          <div className="actions">
            <button type="button" onClick={copyToClipboard} disabled={!outputText}>
              Copy
            </button>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="errors">
            <strong>入力エラー</strong>
            <ul>
              {validationErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          id="outputArea"
          value={outputText}
          readOnly
          rows={Math.max(6, candidates.length + 3)}
          placeholder="入力が揃うとここに出力されます"
        />
        <div className="hint">
          候補日ごとに改行区切りでコピーされます。日付ズレは <code>(+1d)</code>/<code>(-1d)</code> で表示します。
        </div>
      </section>

      <footer className="footer">
        <span className="muted">Frontend-only / Luxon(IANA TZ + DST)</span>
      </footer>
    </div>
  );
}
