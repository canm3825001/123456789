import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type SolveResult =
  | { type: "not_quadratic_linear"; x: number | null; steps: Step[] }
  | { type: "not_quadratic_degenerate"; steps: Step[] }
  | { type: "two_roots"; x1: number; x2: number; delta: number; steps: Step[] }
  | { type: "one_root"; x: number; delta: number; steps: Step[] }
  | { type: "no_real_root"; delta: number; steps: Step[] };

interface Step {
  title: string;
  content: React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number, decimals = 4): string {
  const r = parseFloat(n.toFixed(decimals));
  return r.toString();
}

function fmtCoeff(val: number): string {
  return fmt(val);
}

/** Render equation string like ax² + bx + c = 0 */
function equationStr(a: number, b: number, c: number): string {
  const parts: string[] = [];

  // a term
  if (a === 1) parts.push("x²");
  else if (a === -1) parts.push("-x²");
  else parts.push(`${fmtCoeff(a)}x²`);

  // b term
  if (b !== 0) {
    if (b === 1) parts.push("+ x");
    else if (b === -1) parts.push("- x");
    else if (b > 0) parts.push(`+ ${fmtCoeff(b)}x`);
    else parts.push(`- ${fmtCoeff(Math.abs(b))}x`);
  }

  // c term
  if (c !== 0) {
    if (c > 0) parts.push(`+ ${fmtCoeff(c)}`);
    else parts.push(`- ${fmtCoeff(Math.abs(c))}`);
  }

  return parts.join(" ") + " = 0";
}

// ─── Solver ───────────────────────────────────────────────────────────────────
function solve(a: number, b: number, c: number): SolveResult {
  // Case: a = 0 (not quadratic)
  if (a === 0) {
    const steps: Step[] = [
      {
        title: "Nhận xét hệ số a",
        content: (
          <p>
            Vì <span className="highlight-val">a = {fmt(a)}</span>, phương trình
            không phải phương trình bậc hai. Đây là phương trình{" "}
            <strong>bậc nhất</strong>: <span className="highlight-val">{fmt(b)}x + {fmt(c)} = 0</span>
          </p>
        ),
      },
    ];

    if (b === 0) {
      // 0x + c = 0
      steps.push({
        title: "Giải phương trình",
        content:
          c === 0 ? (
            <p>
              Ta có <span className="highlight-val">0 = 0</span> — phương trình{" "}
              <strong>vô số nghiệm</strong> (mọi x đều là nghiệm).
            </p>
          ) : (
            <p>
              Ta có <span className="highlight-val">{fmt(c)} = 0</span> — phương trình{" "}
              <strong>vô nghiệm</strong>.
            </p>
          ),
      });
      return { type: "not_quadratic_degenerate", steps };
    }

    // b ≠ 0
    const x = -c / b;
    steps.push({
      title: "Giải phương trình bậc nhất",
      content: (
        <div className="space-y-1">
          <p>
            {fmt(b)}x = -{fmt(c)}
          </p>
          <p>
            x = -{fmt(c)} / {fmt(b)} ={" "}
            <span className="highlight-val">{fmt(x)}</span>
          </p>
        </div>
      ),
    });
    return { type: "not_quadratic_linear", x, steps };
  }

  // Quadratic: a ≠ 0
  const steps: Step[] = [];

  // Step 1: Identify
  steps.push({
    title: "Xác định dạng phương trình",
    content: (
      <p>
        Phương trình bậc hai dạng <strong>ax² + bx + c = 0</strong> với:
        <br />
        <span className="highlight-val">a = {fmt(a)}</span>,{" "}
        <span className="highlight-val">b = {fmt(b)}</span>,{" "}
        <span className="highlight-val">c = {fmt(c)}</span>
      </p>
    ),
  });

  // Step 2: Special case b=0, c=0 → x²=0
  if (b === 0 && c === 0) {
    steps.push({
      title: "Trường hợp đặc biệt b = 0 và c = 0",
      content: (
        <p>
          Phương trình trở thành{" "}
          <span className="highlight-val">{fmt(a)}x² = 0</span> → x² = 0 →{" "}
          <strong>x = 0</strong> (nghiệm kép).
        </p>
      ),
    });
    return { type: "one_root", x: 0, delta: 0, steps };
  }

  // Step 3: Delta
  const delta = b * b - 4 * a * c;
  steps.push({
    title: "Tính biệt thức Δ (Delta)",
    content: (
      <div className="space-y-2">
        <p>
          Công thức: <strong>Δ = b² − 4ac</strong>
        </p>
        <div className="formula-box">
          Δ = ({fmt(b)})² − 4 × ({fmt(a)}) × ({fmt(c)})
          <br />
          Δ = {fmt(b * b)} − ({fmt(4 * a * c)})
          <br />
          Δ = <strong>{fmt(delta)}</strong>
        </div>
      </div>
    ),
  });

  // Step 4: Analyze delta
  if (delta > 0) {
    const sqrtDelta = Math.sqrt(delta);
    const x1 = (-b - sqrtDelta) / (2 * a);
    const x2 = (-b + sqrtDelta) / (2 * a);

    steps.push({
      title: "Phân tích biệt thức",
      content: (
        <p>
          Vì <span className="highlight-val">Δ = {fmt(delta)} &gt; 0</span>,
          phương trình có <strong>hai nghiệm thực phân biệt</strong>.
        </p>
      ),
    });

    steps.push({
      title: "Tính căn bậc hai của Δ",
      content: (
        <div className="formula-box">
          √Δ = √{fmt(delta)} ≈ <strong>{fmt(sqrtDelta)}</strong>
        </div>
      ),
    });

    steps.push({
      title: "Tính hai nghiệm x₁ và x₂",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Công thức nghiệm: x = (−b ± √Δ) / (2a)</p>
          <div className="formula-box">
            x₁ = (−b − √Δ) / (2a)
            <br />
            x₁ = (−({fmt(b)}) − {fmt(sqrtDelta)}) / (2 × {fmt(a)})
            <br />
            x₁ = ({fmt(-b)} − {fmt(sqrtDelta)}) / {fmt(2 * a)}
            <br />
            x₁ = {fmt(-b - sqrtDelta)} / {fmt(2 * a)}
            <br />
            <strong>x₁ ≈ {fmt(x1)}</strong>
          </div>
          <div className="formula-box">
            x₂ = (−b + √Δ) / (2a)
            <br />
            x₂ = (−({fmt(b)}) + {fmt(sqrtDelta)}) / (2 × {fmt(a)})
            <br />
            x₂ = ({fmt(-b)} + {fmt(sqrtDelta)}) / {fmt(2 * a)}
            <br />
            x₂ = {fmt(-b + sqrtDelta)} / {fmt(2 * a)}
            <br />
            <strong>x₂ ≈ {fmt(x2)}</strong>
          </div>
        </div>
      ),
    });

    // Verification
    steps.push({
      title: "Kiểm tra nghiệm (thế lại vào phương trình)",
      content: (
        <div className="space-y-2 text-sm">
          <div className="formula-box">
            Thế x₁ = {fmt(x1)}:
            <br />
            {fmt(a)} × ({fmt(x1)})² + {fmt(b)} × ({fmt(x1)}) + {fmt(c)}
            <br />≈ {fmt(a * x1 * x1 + b * x1 + c)} ✓
          </div>
          <div className="formula-box">
            Thế x₂ = {fmt(x2)}:
            <br />
            {fmt(a)} × ({fmt(x2)})² + {fmt(b)} × ({fmt(x2)}) + {fmt(c)}
            <br />≈ {fmt(a * x2 * x2 + b * x2 + c)} ✓
          </div>
        </div>
      ),
    });

    // Vi-ét
    steps.push({
      title: "Định lý Vi-ét (kiểm tra nhanh)",
      content: (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-slate-600">Theo định lý Vi-ét:</p>
          <div className="formula-box">
            x₁ + x₂ = −b/a = {fmt(-b / a)}
            <br />
            Kiểm tra: {fmt(x1)} + {fmt(x2)} = {fmt(x1 + x2)} ✓
            <br />
            <br />
            x₁ × x₂ = c/a = {fmt(c / a)}
            <br />
            Kiểm tra: {fmt(x1)} × {fmt(x2)} = {fmt(x1 * x2)} ✓
          </div>
        </div>
      ),
    });

    return { type: "two_roots", x1, x2, delta, steps };
  }

  if (delta === 0) {
    const x = -b / (2 * a);
    steps.push({
      title: "Phân tích biệt thức",
      content: (
        <p>
          Vì <span className="highlight-val">Δ = 0</span>, phương trình có{" "}
          <strong>nghiệm kép</strong>.
        </p>
      ),
    });
    steps.push({
      title: "Tính nghiệm kép x₁ = x₂",
      content: (
        <div className="formula-box">
          x₁ = x₂ = −b / (2a)
          <br />
          x₁ = x₂ = −({fmt(b)}) / (2 × {fmt(a)})
          <br />
          x₁ = x₂ = {fmt(-b)} / {fmt(2 * a)}
          <br />
          <strong>x₁ = x₂ = {fmt(x)}</strong>
        </div>
      ),
    });
    steps.push({
      title: "Kiểm tra nghiệm",
      content: (
        <div className="formula-box text-sm">
          Thế x = {fmt(x)}:
          <br />
          {fmt(a)} × ({fmt(x)})² + {fmt(b)} × ({fmt(x)}) + {fmt(c)}
          <br />≈ {fmt(a * x * x + b * x + c)} ✓
        </div>
      ),
    });
    return { type: "one_root", x, delta: 0, steps };
  }

  // delta < 0
  const realPart = -b / (2 * a);
  const imagPart = Math.sqrt(-delta) / (2 * Math.abs(a));
  steps.push({
    title: "Phân tích biệt thức",
    content: (
      <p>
        Vì <span className="highlight-val">Δ = {fmt(delta)} &lt; 0</span>,
        phương trình <strong>vô nghiệm thực</strong>. Phương trình có hai nghiệm{" "}
        phức liên hợp.
      </p>
    ),
  });
  steps.push({
    title: "Nghiệm phức (nâng cao)",
    content: (
      <div className="space-y-2">
        <p className="text-sm text-slate-500">
          Trong tập số phức ℂ, phương trình có hai nghiệm liên hợp:
        </p>
        <div className="formula-box">
          x₁ = (−b − i√|Δ|) / (2a)
          <br />
          x₁ = {fmt(realPart)} − {fmt(imagPart)}i
          <br />
          <br />
          x₂ = (−b + i√|Δ|) / (2a)
          <br />
          x₂ = {fmt(realPart)} + {fmt(imagPart)}i
        </div>
      </div>
    ),
  });
  return { type: "no_real_root", delta, steps };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StepCard({
  index,
  title,
  content,
}: {
  index: number;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div
      className="animate-fadeInUp flex gap-4"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Number badge */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md mt-0.5">
        {index}
      </div>
      {/* Content */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="font-semibold text-slate-700 mb-2">{title}</p>
        <div className="text-slate-600 text-sm leading-relaxed">{content}</div>
      </div>
    </div>
  );
}

function ResultBadge({ result }: { result: SolveResult }) {
  if (result.type === "two_roots") {
    return (
      <div className="result-delta-positive rounded-2xl p-5 animate-scaleIn">
        <p className="text-green-700 font-bold text-lg mb-3 flex items-center gap-2">
          <span>✅</span> Phương trình có hai nghiệm thực phân biệt
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-green-100">
            <p className="text-xs text-slate-400 mb-1">Nghiệm x₁</p>
            <p className="mono text-2xl font-bold text-indigo-600">{fmt(result.x1)}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-green-100">
            <p className="text-xs text-slate-400 mb-1">Nghiệm x₂</p>
            <p className="mono text-2xl font-bold text-purple-600">{fmt(result.x2)}</p>
          </div>
        </div>
      </div>
    );
  }
  if (result.type === "one_root") {
    return (
      <div className="result-delta-zero rounded-2xl p-5 animate-scaleIn">
        <p className="text-yellow-700 font-bold text-lg mb-3 flex items-center gap-2">
          <span>🔁</span> Phương trình có nghiệm kép
        </p>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-yellow-100">
          <p className="text-xs text-slate-400 mb-1">Nghiệm kép x₁ = x₂</p>
          <p className="mono text-2xl font-bold text-amber-600">{fmt(result.x)}</p>
        </div>
      </div>
    );
  }
  if (result.type === "no_real_root") {
    return (
      <div className="result-delta-negative rounded-2xl p-5 animate-scaleIn">
        <p className="text-red-700 font-bold text-lg flex items-center gap-2">
          <span>❌</span> Phương trình vô nghiệm thực (Δ &lt; 0)
        </p>
        <p className="text-red-500 text-sm mt-1">
          Phương trình không có nghiệm trong tập số thực ℝ.
        </p>
      </div>
    );
  }
  if (result.type === "not_quadratic_linear") {
    return (
      <div className="result-a-zero rounded-2xl p-5 animate-scaleIn">
        <p className="text-blue-700 font-bold text-lg mb-3 flex items-center gap-2">
          <span>📐</span> Phương trình bậc nhất (a = 0)
        </p>
        {result.x !== null ? (
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-blue-100">
            <p className="text-xs text-slate-400 mb-1">Nghiệm x</p>
            <p className="mono text-2xl font-bold text-blue-600">{fmt(result.x)}</p>
          </div>
        ) : (
          <p className="text-blue-500 text-sm">Phương trình vô nghiệm (b = 0, c ≠ 0).</p>
        )}
      </div>
    );
  }
  // degenerate
  return (
    <div className="result-a-zero rounded-2xl p-5 animate-scaleIn">
      <p className="text-blue-700 font-bold text-lg flex items-center gap-2">
        <span>♾️</span> Phương trình đặc biệt (a = 0, b = 0)
      </p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [inputs, setInputs] = useState({ a: "", b: "", c: "" });
  const [result, setResult] = useState<SolveResult | null>(null);
  const [error, setError] = useState<string>("");
  const [equation, setEquation] = useState<string>("");

  const handleChange = useCallback(
    (field: "a" | "b" | "c") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prev) => ({ ...prev, [field]: e.target.value }));
        setError("");
      },
    []
  );

  const handleSolve = useCallback(() => {
    const a = parseFloat(inputs.a);
    const b = parseFloat(inputs.b);
    const c = parseFloat(inputs.c);

    if (inputs.a.trim() === "" || isNaN(a)) {
      setError("Vui lòng nhập hệ số a hợp lệ.");
      return;
    }
    if (inputs.b.trim() === "" || isNaN(b)) {
      setError("Vui lòng nhập hệ số b hợp lệ.");
      return;
    }
    if (inputs.c.trim() === "" || isNaN(c)) {
      setError("Vui lòng nhập hệ số c hợp lệ.");
      return;
    }

    setError("");
    setEquation(equationStr(a, b, c));
    setResult(solve(a, b, c));
  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs({ a: "", b: "", c: "" });
    setResult(null);
    setError("");
    setEquation("");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSolve();
    },
    [handleSolve]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col">
      {/* Header */}
      <header className="text-center pt-10 pb-4 px-4 animate-fadeIn">
        <div className="inline-flex items-center gap-3 mb-3">
          <span className="text-4xl">🧮</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Giải Phương Trình Bậc Hai
          </h1>
        </div>
        <p className="text-indigo-300 text-base md:text-lg max-w-xl mx-auto">
          Nhập hệ số <strong>a</strong>, <strong>b</strong>, <strong>c</strong>{" "}
          — nhận ngay lời giải chi tiết từng bước!
        </p>
        <div className="mt-3 inline-block bg-white/10 text-white/80 text-sm font-mono rounded-full px-5 py-1.5 border border-white/20">
          ax² + bx + c = 0
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-16 pt-6 flex flex-col gap-6">
        {/* Input card */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 md:p-8 animate-fadeInUp">
          <h2 className="text-slate-700 font-bold text-lg mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-base">
              ✏️
            </span>
            Nhập hệ số phương trình
          </h2>

          {/* Coefficients */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(["a", "b", "c"] as const).map((field) => (
              <div key={field} className="flex flex-col gap-2">
                <label className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest">
                  Hệ số{" "}
                  <span className="text-indigo-500 text-base font-bold italic">
                    {field}
                  </span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={inputs[field]}
                  onChange={handleChange(field)}
                  onKeyDown={handleKeyDown}
                  placeholder={field === "a" ? "≠ 0" : "0"}
                  className="input-field"
                  aria-label={`Hệ số ${field}`}
                />
              </div>
            ))}
          </div>

          {/* Preview equation */}
          {(inputs.a || inputs.b || inputs.c) && (
            <div className="mb-5 bg-indigo-50 rounded-xl px-4 py-3 text-center border border-indigo-100 animate-fadeIn">
              <p className="text-xs text-indigo-400 mb-1 uppercase tracking-wider font-medium">
                Xem trước phương trình
              </p>
              <p className="mono font-bold text-indigo-700 text-base">
                {(() => {
                  const a = parseFloat(inputs.a) || 0;
                  const b = parseFloat(inputs.b) || 0;
                  const c = parseFloat(inputs.c) || 0;
                  try {
                    return equationStr(a, b, c);
                  } catch {
                    return "...";
                  }
                })()}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-medium animate-fadeIn flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={handleSolve} className="btn-solve flex-1">
              ⚡ Giải Ngay
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-semibold hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all duration-200"
              aria-label="Làm mới"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Result card */}
        {result && (
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 md:p-8 animate-fadeInUp">
            {/* Equation header */}
            <div className="mb-5 flex flex-col items-start gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Phương trình cần giải
              </span>
              <div className="mono font-bold text-indigo-700 text-lg bg-indigo-50 rounded-xl px-4 py-2 border border-indigo-100">
                {equation}
              </div>
            </div>

            {/* Result badge */}
            <div className="mb-6">
              <ResultBadge result={result} />
            </div>

            {/* Steps */}
            <div>
              <h3 className="font-bold text-slate-700 text-base mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
                  📖
                </span>
                Hướng dẫn giải chi tiết
              </h3>
              <div className="flex flex-col gap-4">
                {result.steps.map((step, i) => (
                  <StepCard
                    key={i}
                    index={i + 1}
                    title={step.title}
                    content={step.content}
                  />
                ))}
              </div>
            </div>

            {/* Theory note */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100 animate-fadeIn">
              <p className="font-semibold text-purple-700 text-sm mb-2 flex items-center gap-1">
                📌 Tóm tắt lý thuyết
              </p>
              <div className="text-slate-600 text-xs leading-relaxed space-y-1">
                <p>• Phương trình bậc hai: <strong>ax² + bx + c = 0</strong> (a ≠ 0)</p>
                <p>• Biệt thức: <strong>Δ = b² − 4ac</strong></p>
                <p>• Δ &gt; 0 → Hai nghiệm phân biệt: x = (−b ± √Δ) / 2a</p>
                <p>• Δ = 0 → Nghiệm kép: x = −b / 2a</p>
                <p>• Δ &lt; 0 → Vô nghiệm thực</p>
                <p>• Định lý Vi-ét: x₁ + x₂ = −b/a &nbsp;|&nbsp; x₁ × x₂ = c/a</p>
              </div>
            </div>
          </div>
        )}

        {/* Examples */}
        {!result && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 animate-fadeIn">
            <p className="text-white/70 text-sm font-semibold mb-3 flex items-center gap-2">
              💡 Thử với các ví dụ mẫu:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { label: "Δ > 0", a: "1", b: "-5", c: "6", desc: "x² − 5x + 6 = 0" },
                { label: "Δ = 0", a: "1", b: "-4", c: "4", desc: "x² − 4x + 4 = 0" },
                { label: "Δ < 0", a: "1", b: "2", c: "5", desc: "x² + 2x + 5 = 0" },
              ].map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => {
                    setInputs({ a: ex.a, b: ex.b, c: ex.c });
                    setError("");
                    setResult(null);
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-3 py-2.5 text-left transition-all duration-150 active:scale-95"
                >
                  <span className="text-xs text-indigo-300 font-bold">{ex.label}</span>
                  <br />
                  <span className="mono text-sm">{ex.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-white/30 text-xs">
        © 2025 Giải Phương Trình Bậc Hai · Được xây dựng bằng React + Tailwind CSS
      </footer>
    </div>
  );
}
