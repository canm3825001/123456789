import { useState, useCallback, useEffect } from "react";

// ==================== TYPES ====================
interface Step {
  title: string;
  content: string;
  formula?: string;
  note?: string;
  highlight?: boolean;
}

interface Solution {
  hasRealRoots: boolean;
  hasComplexRoots: boolean;
  x1?: number;
  x2?: number;
  x1Complex?: { real: number; imag: number };
  x2Complex?: { real: number; imag: number };
  delta: number;
  isLinear?: boolean;
  linearX?: number;
  isIdentity?: boolean;
  isInconsistent?: boolean;
  steps: Step[];
  summary: string;
}

// ==================== HELPERS ====================
function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const rounded = Math.round(n * 10000) / 10000;
  if (Number.isInteger(rounded)) return rounded.toString();
  return rounded.toString();
}

function formatCoeff(val: number, varName: string, isFirst: boolean): string {
  if (val === 0) return "";
  let sign = val > 0 ? (isFirst ? "" : " + ") : (isFirst ? "-" : " - ");
  let abs = Math.abs(val);
  let coeff = abs === 1 && varName !== "" ? "" : abs.toString();
  return `${sign}${coeff}${varName}`;
}

function buildEquation(a: number, b: number, c: number): string {
  let parts: string[] = [];
  if (a !== 0) parts.push(formatCoeff(a, "x²", parts.length === 0));
  if (b !== 0) parts.push(formatCoeff(b, "x", parts.length === 0));
  if (c !== 0) parts.push(formatCoeff(c, "", parts.length === 0));
  if (parts.length === 0) return "0 = 0";
  return parts.join("") + " = 0";
}

function sqrtApprox(n: number): number {
  return Math.sqrt(n);
}

// ==================== SOLVER ====================
function solveQuadratic(a: number, b: number, c: number): Solution {
  const steps: Step[] = [];
  const eq = buildEquation(a, b, c);

  // Bước 1: Viết phương trình
  steps.push({
    title: "Bước 1: Viết phương trình ban đầu",
    content: `Phương trình cần giải: ${eq}`,
    formula: `${eq}`,
  });

  // Bước 2: Xác định hệ số
  steps.push({
    title: "Bước 2: Xác định các hệ số",
    content: `So sánh với dạng tổng quát ax² + bx + c = 0:`,
    formula: `a = ${a},  b = ${b},  c = ${c}`,
  });

  // Trường hợp a = 0 → phương trình bậc nhất
  if (a === 0) {
    steps.push({
      title: "Bước 3: Nhận dạng phương trình",
      content: `Vì a = 0 nên đây không phải phương trình bậc hai. Đây là phương trình bậc nhất (hoặc phương trình thường).`,
      highlight: true,
    });

    if (b !== 0) {
      const x = -c / b;
      steps.push({
        title: "Bước 4: Giải phương trình bậc nhất",
        content: `Phương trình trở thành ${b}x + ${c} = 0`,
        formula: `${b}x = ${-c}`,
        note: `x = ${-c} / ${b} = ${formatNumber(x)}`,
      });
      return {
        hasRealRoots: true,
        hasComplexRoots: false,
        isLinear: true,
        linearX: x,
        delta: NaN,
        steps,
        summary: `Phương trình bậc nhất có nghiệm duy nhất: x = ${formatNumber(x)}`,
      };
    } else {
      if (c === 0) {
        steps.push({
          title: "Bước 4: Kết luận",
          content: `Phương trình 0 = 0 luôn đúng với mọi x.`,
          highlight: true,
        });
        return {
          hasRealRoots: true,
          hasComplexRoots: false,
          isIdentity: true,
          delta: NaN,
          steps,
          summary: "Phương trình vô số nghiệm (đúng với mọi x ∈ ℝ)",
        };
      } else {
        steps.push({
          title: "Bước 4: Kết luận",
          content: `Phương trình ${c} = 0 vô lý (không đúng).`,
          highlight: true,
        });
        return {
          hasRealRoots: false,
          hasComplexRoots: false,
          isInconsistent: true,
          delta: NaN,
          steps,
          summary: "Phương trình vô nghiệm",
        };
      }
    }
  }

  // Bước 3: Kiểm tra a ≠ 0
  steps.push({
    title: "Bước 3: Kiểm tra điều kiện a ≠ 0",
    content: `Ta có a = ${a} ≠ 0 → Thỏa mãn điều kiện phương trình bậc hai.`,
    highlight: true,
  });

  // Bước 4: Tính Delta
  const delta = b * b - 4 * a * c;
  steps.push({
    title: "Bước 4: Tính biệt số Delta (Δ)",
    content: "Áp dụng công thức Δ = b² - 4ac:",
    formula: `Δ = (${b})² - 4·(${a})·(${c}) = ${b * b} - ${4 * a * c} = ${delta}`,
  });

  // Bước 5: Đánh giá Delta
  if (delta > 0) {
    steps.push({
      title: "Bước 5: Đánh giá Delta",
      content: `Ta có Δ = ${delta} > 0 → Phương trình có hai nghiệm phân biệt.`,
      highlight: true,
    });

    const sqrtDelta = sqrtApprox(delta);
    const x1 = (-b + sqrtDelta) / (2 * a);
    const x2 = (-b - sqrtDelta) / (2 * a);

    const isDeltaPerfectSquare = Number.isInteger(sqrtApprox(delta)) && sqrtDelta * sqrtDelta === delta;

    steps.push({
      title: "Bước 6: Tính hai nghiệm",
      content: `Áp dụng công thức nghiệm:`,
      formula: `x₁ = (-b + √Δ) / (2a) = (${-b} + √${delta}) / ${2 * a}`,
      note: `x₁ = (${-b} + ${isDeltaPerfectSquare ? formatNumber(sqrtDelta) : `√${delta}`}) / ${2 * a} = ${formatNumber(x1)}`,
    });

    steps.push({
      title: "",
      content: ``,
      formula: `x₂ = (-b - √Δ) / (2a) = (${-b} - √${delta}) / ${2 * a}`,
      note: `x₂ = (${-b} - ${isDeltaPerfectSquare ? formatNumber(sqrtDelta) : `√${delta}`}) / ${2 * a} = ${formatNumber(x2)}`,
    });

    return {
      hasRealRoots: true,
      hasComplexRoots: false,
      x1,
      x2,
      delta,
      steps,
      summary: `Phương trình có hai nghiệm phân biệt: x₁ = ${formatNumber(x1)} và x₂ = ${formatNumber(x2)}`,
    };
  } else if (delta === 0) {
    steps.push({
      title: "Bước 5: Đánh giá Delta",
      content: `Ta có Δ = 0 → Phương trình có nghiệm kép.`,
      highlight: true,
    });

    const x = -b / (2 * a);
    steps.push({
      title: "Bước 6: Tính nghiệm kép",
      content: `Áp dụng công thức nghiệm kép:`,
      formula: `x₁ = x₂ = -b / (2a) = ${-b} / ${2 * a} = ${formatNumber(x)}`,
    });

    return {
      hasRealRoots: true,
      hasComplexRoots: false,
      x1: x,
      x2: x,
      delta,
      steps,
      summary: `Phương trình có nghiệm kép: x₁ = x₂ = ${formatNumber(x)}`,
    };
  } else {
    // delta < 0
    steps.push({
      title: "Bước 5: Đánh giá Delta",
      content: `Ta có Δ = ${delta} < 0 → Phương trình vô nghiệm thực.`,
      highlight: true,
    });

    steps.push({
      title: "Bước 6: Kết luận",
      content: `Vì Δ < 0 nên phương trình không có nghiệm thực nào.`,
      note: "Trong tập số phức ℂ, phương trình vẫn có hai nghiệm phức.",
    });

    const realPart = -b / (2 * a);
    const imagPart = sqrtApprox(-delta) / (2 * a);

    steps.push({
      title: "Bước 7 (Mở rộng): Nghiệm phức",
      content: `Nghiệm trong tập số phức ℂ:`,
      formula: `x₁ = ${formatNumber(realPart)} + ${formatNumber(Math.abs(imagPart))}i`,
      note: `x₂ = ${formatNumber(realPart)} - ${formatNumber(Math.abs(imagPart))}i`,
    });

    return {
      hasRealRoots: false,
      hasComplexRoots: true,
      x1Complex: { real: realPart, imag: Math.abs(imagPart) },
      x2Complex: { real: realPart, imag: -Math.abs(imagPart) },
      delta,
      steps,
      summary: "Phương trình vô nghiệm thực (Δ < 0). Có 2 nghiệm phức.",
    };
  }
}

// ==================== EXAMPLES ====================
const EXAMPLES = [
  { a: 1, b: -3, c: 2, label: "x² - 3x + 2 = 0", desc: "Δ > 0 — Hai nghiệm phân biệt" },
  { a: 1, b: 2, c: 1, label: "x² + 2x + 1 = 0", desc: "Δ = 0 — Nghiệm kép" },
  { a: 1, b: 1, c: 1, label: "x² + x + 1 = 0", desc: "Δ < 0 — Vô nghiệm thực" },
  { a: 2, b: -7, c: 3, label: "2x² - 7x + 3 = 0", desc: "Δ > 0 — Hai nghiệm PB" },
  { a: 0, b: 3, c: -6, label: "3x - 6 = 0", desc: "a=0 — Phương trình bậc nhất" },
  { a: -1, b: 4, c: -4, label: "-x² + 4x - 4 = 0", desc: "Δ = 0 — Nghiệm kép" },
];

// ==================== MAIN APP ====================
export default function App() {
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [c, setC] = useState<string>("");
  const [solution, setSolution] = useState<Solution | null>(null);
  const [error, setError] = useState<string>("");
  const [animKey, setAnimKey] = useState(0);

  const handleSolve = useCallback(() => {
    setError("");
    setSolution(null);

    const numA = parseFloat(a);
    const numB = parseFloat(b);
    const numC = parseFloat(c);

    if (a === "" || b === "" || c === "") {
      setError("Vui lòng nhập đầy đủ cả 3 hệ số a, b và c!");
      return;
    }

    if (isNaN(numA) || isNaN(numB) || isNaN(numC)) {
      setError("Vui lòng nhập số hợp lệ cho tất cả các hệ số!");
      return;
    }

    if (numA === 0 && numB === 0 && numC === 0) {
      setError("Phương trình 0 = 0 luôn đúng — hãy nhập hệ số khác 0!");
      return;
    }

    const result = solveQuadratic(numA, numB, numC);
    setSolution(result);
    setAnimKey((k) => k + 1);
  }, [a, b, c]);

  const handleReset = () => {
    setA("");
    setB("");
    setC("");
    setSolution(null);
    setError("");
  };

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setA(ex.a.toString());
    setB(ex.b.toString());
    setC(ex.c.toString());
    setError("");
    setSolution(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSolve();
  };

  // Preview equation
  const liveEq = (() => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    const nc = parseFloat(c);
    if (isNaN(na) && isNaN(nb) && isNaN(nc)) return "ax² + bx + c = 0";
    return buildEquation(
      isNaN(na) ? 0 : na,
      isNaN(nb) ? 0 : nb,
      isNaN(nc) ? 0 : nc
    );
  })();

  // Scroll to result
  useEffect(() => {
    if (solution) {
      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [solution, animKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1040] to-[#24243e] text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* ====== HEADER ====== */}
        <header className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm mb-6">
            <span className="text-lg">📐</span>
            <span>Công cụ giải toán trực tuyến</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent leading-tight">
            Giải Phương Trình
            <br />
            Bậc Hai
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Nhập các hệ số <span className="text-red-400 font-semibold">a</span>,{" "}
            <span className="text-blue-400 font-semibold">b</span>,{" "}
            <span className="text-emerald-400 font-semibold">c</span> — Hệ thống sẽ hướng dẫn
            giải chi tiết từng bước
          </p>
        </header>

        {/* ====== INPUT CARD ====== */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          {/* Equation preview */}
          <div className="text-center mb-8">
            <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/20">
              <p className="text-sm text-gray-400 mb-1">Phương trình của bạn</p>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide">
                {liveEq}
              </p>
            </div>
          </div>

          {/* Input fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {/* a */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md bg-red-500/20 border border-red-400/30 flex items-center justify-center text-xs font-bold">a</span>
                Hệ số a <span className="text-gray-500 font-normal">(x²)</span>
              </label>
              <input
                type="number"
                value={a}
                onChange={(e) => setA(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập a"
                className="w-full px-5 py-3.5 rounded-xl bg-white/5 border-2 border-red-400/20 focus:border-red-400 focus:bg-white/10 outline-none transition-all text-white text-lg font-mono placeholder-gray-600 group-focus-within:shadow-lg group-focus-within:shadow-red-500/10"
              />
            </div>
            {/* b */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-xs font-bold">b</span>
                Hệ số b <span className="text-gray-500 font-normal">(x)</span>
              </label>
              <input
                type="number"
                value={b}
                onChange={(e) => setB(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập b"
                className="w-full px-5 py-3.5 rounded-xl bg-white/5 border-2 border-blue-400/20 focus:border-blue-400 focus:bg-white/10 outline-none transition-all text-white text-lg font-mono placeholder-gray-600 group-focus-within:shadow-lg group-focus-within:shadow-blue-500/10"
              />
            </div>
            {/* c */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xs font-bold">c</span>
                Hệ số c <span className="text-gray-500 font-normal">(hằng số)</span>
              </label>
              <input
                type="number"
                value={c}
                onChange={(e) => setC(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập c"
                className="w-full px-5 py-3.5 rounded-xl bg-white/5 border-2 border-emerald-400/20 focus:border-emerald-400 focus:bg-white/10 outline-none transition-all text-white text-lg font-mono placeholder-gray-600 group-focus-within:shadow-lg group-focus-within:shadow-emerald-500/10"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSolve}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Giải Phương Trình
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold transition-all active:scale-[0.98]"
            >
              Xóa hết
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-center animate-slide-down">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}
        </div>

        {/* ====== EXAMPLES ====== */}
        {!solution && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-center text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              📌 Thử nhanh các ví dụ
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(ex)}
                  className="glass-card-light rounded-xl p-4 text-left hover:bg-white/10 transition-all group active:scale-[0.97]"
                >
                  <p className="font-mono font-bold text-white group-hover:text-indigo-300 transition-colors text-sm sm:text-base">
                    {ex.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{ex.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ====== RESULT SECTION ====== */}
        {solution && (
          <div id="result-section" key={animKey} className="animate-fade-in-up">
            {/* Summary Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 mb-6 ${
                solution.hasRealRoots
                  ? "bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border border-emerald-400/20"
                  : solution.hasComplexRoots
                  ? "bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-400/20"
                  : "bg-gradient-to-br from-red-900/30 to-pink-900/30 border border-red-400/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    solution.hasRealRoots
                      ? "bg-emerald-500/20"
                      : solution.hasComplexRoots
                      ? "bg-amber-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {solution.hasRealRoots ? "✅" : solution.hasComplexRoots ? "⚠️" : "❌"}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Kết quả</h2>
                  <p className="text-sm text-gray-400">
                    {solution.isLinear
                      ? "Phương trình bậc nhất"
                      : solution.isIdentity
                      ? "Phương trình luôn đúng"
                      : solution.isInconsistent
                      ? "Phương trình vô lý"
                      : "Phương trình bậc hai"}
                  </p>
                </div>
              </div>

              {/* Summary text */}
              <div className="formula-highlight text-center mb-5">
                <p className="text-lg sm:text-xl font-semibold text-white">{solution.summary}</p>
              </div>

              {/* Root values */}
              {solution.hasRealRoots && !solution.isIdentity && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {solution.isLinear ? (
                    <div className="result-box p-5 text-center col-span-full">
                      <p className="text-sm text-gray-400 mb-1">Nghiệm duy nhất</p>
                      <p className="text-3xl font-bold font-mono text-emerald-400">
                        x = {formatNumber(solution.linearX!)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="result-box p-5 text-center">
                        <p className="text-sm text-gray-400 mb-1">
                          Nghiệm {solution.x1 === solution.x2 ? "thứ nhất" : "x₁"}
                        </p>
                        <p className="text-3xl font-bold font-mono text-emerald-400">
                          x₁ = {formatNumber(solution.x1!)}
                        </p>
                      </div>
                      <div className="result-box p-5 text-center">
                        <p className="text-sm text-gray-400 mb-1">
                          Nghiệm {solution.x1 === solution.x2 ? "thứ hai" : "x₂"}
                        </p>
                        <p className="text-3xl font-bold font-mono text-blue-400">
                          x₂ = {formatNumber(solution.x2!)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Complex roots */}
              {solution.hasComplexRoots && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="result-box p-5 text-center">
                    <p className="text-sm text-gray-400 mb-1">Nghiệm phức x₁</p>
                    <p className="text-xl font-bold font-mono text-amber-400">
                      {formatNumber(solution.x1Complex!.real)} + {formatNumber(solution.x1Complex!.imag)}i
                    </p>
                  </div>
                  <div className="result-box p-5 text-center">
                    <p className="text-sm text-gray-400 mb-1">Nghiệm phức x₂</p>
                    <p className="text-xl font-bold font-mono text-orange-400">
                      {formatNumber(solution.x2Complex!.real)} - {formatNumber(solution.x2Complex!.imag)}i
                    </p>
                  </div>
                </div>
              )}

              {/* Delta badge */}
              {!isNaN(solution.delta) && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 font-mono text-sm">
                    Δ = {formatNumber(solution.delta)}
                    {solution.delta > 0 && <span className="text-emerald-400">(&gt; 0)</span>}
                    {solution.delta === 0 && <span className="text-blue-400">(= 0)</span>}
                    {solution.delta < 0 && <span className="text-red-400">(&lt; 0)</span>}
                  </span>
                </div>
              )}
            </div>

            {/* ====== DETAILED STEPS ====== */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Hướng dẫn giải chi tiết
              </h3>

              <div className="space-y-0">
                {solution.steps.map((step, i) => (
                  <div
                    key={i}
                    className="step-line animate-step-reveal"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    <div className="step-dot" style={{ top: "2px" }}></div>
                    {step.title && (
                      <h4 className={`font-bold text-base mb-2 ${step.highlight ? "text-yellow-300" : "text-indigo-300"}`}>
                        {step.title}
                      </h4>
                    )}
                    {step.content && (
                      <p className="text-gray-300 text-sm mb-2">{step.content}</p>
                    )}
                    {step.formula && (
                      <div className="my-2 px-4 py-3 rounded-lg bg-black/30 border border-white/5 font-mono text-base sm:text-lg text-cyan-300 overflow-x-auto">
                        {step.formula}
                      </div>
                    )}
                    {step.note && (
                      <p className="text-sm text-emerald-400 mt-1 font-medium">
                        → {step.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ====== FORMULA REFERENCE ====== */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6">
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Ôn tập công thức
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-gray-400 mb-2">Dạng tổng quát</p>
                  <p className="font-mono text-lg text-white">ax² + bx + c = 0 &nbsp;(a ≠ 0)</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-gray-400 mb-2">Công thức Delta</p>
                  <p className="font-mono text-lg text-cyan-300">Δ = b² − 4ac</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-gray-400 mb-2">Δ &gt; 0 → Hai nghiệm phân biệt</p>
                  <p className="font-mono text-base text-emerald-300">
                    x₁ = (−b + √Δ) / 2a &nbsp;&nbsp;|&nbsp;&nbsp; x₂ = (−b − √Δ) / 2a
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-gray-400 mb-2">Δ = 0 → Nghiệm kép</p>
                  <p className="font-mono text-lg text-blue-300">x₁ = x₂ = −b / 2a</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-gray-400 mb-2">Δ &lt; 0 → Vô nghiệm thực</p>
                  <p className="font-mono text-base text-red-300">
                    Vô nghiệm trong ℝ — Có nghiệm phức trong ℂ
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-400/10">
                  <p className="text-sm text-yellow-400 mb-1">💡 Định lý Viète</p>
                  <p className="font-mono text-sm text-gray-300">
                    x₁ + x₂ = −b/a &nbsp;&nbsp;|&nbsp;&nbsp; x₁ · x₂ = c/a
                  </p>
                </div>
              </div>
            </div>

            {/* Back to top */}
            <div className="text-center">
              <button
                onClick={() => {
                  handleReset();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Giải phương trình mới
              </button>
            </div>
          </div>
        )}

        {/* ====== FOOTER ====== */}
        <footer className="text-center mt-12 py-6 border-t border-white/5">
          <p className="text-gray-500 text-sm">
            📐 Công cụ giải phương trình bậc hai — Hướng dẫn giải chi tiết từng bước
          </p>
          <p className="text-gray-600 text-xs mt-1">
            ax² + bx + c = 0 &nbsp;|&nbsp; Δ = b² − 4ac &nbsp;|&nbsp; x = (−b ± √Δ) / 2a
          </p>
        </footer>
      </div>
    </div>
  );
}
