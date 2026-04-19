import { useState } from "react";

interface SolveResult {
  a: number;
  b: number;
  c: number;
  delta: number;
  type: "two_roots" | "one_root" | "no_root" | "linear" | "identity" | "no_solution";
  x1?: number;
  x2?: number;
  x?: number;
  steps: Step[];
}

interface Step {
  title: string;
  content: string;
  formula?: string;
  highlight?: boolean;
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(6)).toString();
}

function formatFrac(num: number, den: number): string {
  if (den === 0) return "∞";
  const result = num / den;
  if (Number.isInteger(result)) return result.toString();
  // simplify fraction
  const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const g = gcd(Math.abs(Math.round(num)), Math.abs(Math.round(den)));
  if (g > 0 && Number.isInteger(num) && Number.isInteger(den)) {
    const n2 = num / g;
    const d2 = den / g;
    if (d2 < 0) return `${-n2}/${-d2}`;
    return d2 === 1 ? `${n2}` : `${n2}/${d2}`;
  }
  return formatNum(result);
}

function solve(a: number, b: number, c: number): SolveResult {
  const steps: Step[] = [];

  // Step 1: Identify equation
  steps.push({
    title: "📌 Bước 1: Xác định phương trình",
    content: `Phương trình có dạng: ax² + bx + c = 0`,
    formula: `Với a = ${formatNum(a)}, b = ${formatNum(b)}, c = ${formatNum(c)}`,
  });

  const eqStr = (() => {
    const parts: string[] = [];
    if (a !== 0) {
      if (a === 1) parts.push("x²");
      else if (a === -1) parts.push("-x²");
      else parts.push(`${formatNum(a)}x²`);
    }
    if (b !== 0) {
      if (b === 1) parts.push(parts.length ? "+ x" : "x");
      else if (b === -1) parts.push(parts.length ? "- x" : "-x");
      else if (b > 0) parts.push(parts.length ? `+ ${formatNum(b)}x` : `${formatNum(b)}x`);
      else parts.push(parts.length ? `- ${formatNum(Math.abs(b))}x` : `${formatNum(b)}x`);
    }
    if (c !== 0) {
      if (c > 0) parts.push(parts.length ? `+ ${formatNum(c)}` : `${formatNum(c)}`);
      else parts.push(parts.length ? `- ${formatNum(Math.abs(c))}` : `${formatNum(c)}`);
    }
    return (parts.length ? parts.join(" ") : "0") + " = 0";
  })();

  steps[0].content = `Phương trình: ${eqStr}`;

  // Case a = 0
  if (a === 0) {
    steps.push({
      title: "⚠️ Lưu ý quan trọng",
      content: `Vì a = 0, đây KHÔNG phải phương trình bậc hai!`,
      highlight: true,
    });

    if (b === 0) {
      if (c === 0) {
        steps.push({
          title: "📐 Phân tích",
          content: `b = 0, c = 0 → Phương trình trở thành: 0 = 0`,
          formula: "Phương trình đúng với mọi x ∈ ℝ",
        });
        return { a, b, c, delta: 0, type: "identity", steps };
      } else {
        steps.push({
          title: "📐 Phân tích",
          content: `b = 0, c = ${formatNum(c)} → Phương trình trở thành: ${formatNum(c)} = 0`,
          formula: "Phương trình vô nghiệm",
        });
        return { a, b, c, delta: 0, type: "no_solution", steps };
      }
    } else {
      steps.push({
        title: "📐 Giải phương trình bậc nhất",
        content: `b = ${formatNum(b)}, c = ${formatNum(c)} → Phương trình trở thành: ${formatNum(b)}x + ${formatNum(c)} = 0`,
        formula: `x = ${formatFrac(-c, b)} = ${formatNum(-c / b)}`,
      });
      return { a, b, c, delta: 0, type: "linear", x: -c / b, steps };
    }
  }

  // Step 2: Check condition
  steps.push({
    title: "✅ Bước 2: Kiểm tra điều kiện",
    content: `Vì a = ${formatNum(a)} ≠ 0, đây là phương trình bậc hai thực sự.`,
    formula: "Áp dụng công thức nghiệm tổng quát",
  });

  // Step 3: Calculate delta
  const delta = b * b - 4 * a * c;
  steps.push({
    title: "🔢 Bước 3: Tính biệt thức Δ (Delta)",
    content: `Công thức: Δ = b² - 4ac`,
    formula: `Δ = (${formatNum(b)})² - 4 × (${formatNum(a)}) × (${formatNum(c)})
    = ${formatNum(b * b)} - ${formatNum(4 * a * c)}
    = ${formatNum(delta)}`,
    highlight: true,
  });

  // Step 4: Analyze delta
  if (delta > 0) {
    steps.push({
      title: "📊 Bước 4: Phân tích biệt thức",
      content: `Δ = ${formatNum(delta)} > 0`,
      formula: "→ Phương trình có HAI nghiệm phân biệt",
      highlight: true,
    });

    const sqrtDelta = Math.sqrt(delta);
    steps.push({
      title: "📐 Bước 5: Tính căn bậc hai của Δ",
      content: `√Δ = √${formatNum(delta)}`,
      formula: `√Δ ≈ ${formatNum(sqrtDelta)}`,
    });

    const x1 = (-b - sqrtDelta) / (2 * a);
    const x2 = (-b + sqrtDelta) / (2 * a);

    steps.push({
      title: "🎯 Bước 6: Tính hai nghiệm",
      content: `Áp dụng công thức nghiệm:`,
      formula: `x₁ = (-b - √Δ) / (2a)
    = (-(${formatNum(b)}) - ${formatNum(sqrtDelta)}) / (2 × ${formatNum(a)})
    = (${formatNum(-b)} - ${formatNum(sqrtDelta)}) / ${formatNum(2 * a)}
    = ${formatNum(-b - sqrtDelta)} / ${formatNum(2 * a)}
    = ${formatNum(x1)}

x₂ = (-b + √Δ) / (2a)
    = (-(${formatNum(b)}) + ${formatNum(sqrtDelta)}) / (2 × ${formatNum(a)})
    = (${formatNum(-b)} + ${formatNum(sqrtDelta)}) / ${formatNum(2 * a)}
    = ${formatNum(-b + sqrtDelta)} / ${formatNum(2 * a)}
    = ${formatNum(x2)}`,
      highlight: true,
    });

    steps.push({
      title: "🔍 Bước 7: Kiểm tra nghiệm",
      content: `Thay x₁ = ${formatNum(x1)} vào phương trình:`,
      formula: `f(${formatNum(x1)}) = ${formatNum(a)}×(${formatNum(x1)})² + ${formatNum(b)}×(${formatNum(x1)}) + ${formatNum(c)}
    ≈ ${formatNum(a * x1 * x1 + b * x1 + c)} ✓

Thay x₂ = ${formatNum(x2)} vào phương trình:
f(${formatNum(x2)}) = ${formatNum(a)}×(${formatNum(x2)})² + ${formatNum(b)}×(${formatNum(x2)}) + ${formatNum(c)}
    ≈ ${formatNum(a * x2 * x2 + b * x2 + c)} ✓`,
    });

    steps.push({
      title: "📋 Định lý Viète (kiểm tra thêm)",
      content: `Theo định lý Viète:`,
      formula: `x₁ + x₂ = -b/a = ${formatNum(-b)}/${formatNum(a)} = ${formatNum(-b / a)}
Kiểm tra: ${formatNum(x1)} + ${formatNum(x2)} = ${formatNum(x1 + x2)} ✓

x₁ × x₂ = c/a = ${formatNum(c)}/${formatNum(a)} = ${formatNum(c / a)}
Kiểm tra: ${formatNum(x1)} × ${formatNum(x2)} = ${formatNum(x1 * x2)} ✓`,
    });

    return { a, b, c, delta, type: "two_roots", x1, x2, steps };
  } else if (delta === 0) {
    steps.push({
      title: "📊 Bước 4: Phân tích biệt thức",
      content: `Δ = ${formatNum(delta)} = 0`,
      formula: "→ Phương trình có NGHIỆM KÉP (hai nghiệm bằng nhau)",
      highlight: true,
    });

    const x = -b / (2 * a);
    steps.push({
      title: "🎯 Bước 5: Tính nghiệm kép",
      content: `Áp dụng công thức nghiệm kép:`,
      formula: `x₁ = x₂ = -b / (2a)
    = -(${formatNum(b)}) / (2 × ${formatNum(a)})
    = ${formatNum(-b)} / ${formatNum(2 * a)}
    = ${formatNum(x)}`,
      highlight: true,
    });

    steps.push({
      title: "🔍 Bước 6: Kiểm tra nghiệm",
      content: `Thay x = ${formatNum(x)} vào phương trình:`,
      formula: `f(${formatNum(x)}) = ${formatNum(a)}×(${formatNum(x)})² + ${formatNum(b)}×(${formatNum(x)}) + ${formatNum(c)}
    ≈ ${formatNum(a * x * x + b * x + c)} ✓`,
    });

    return { a, b, c, delta, type: "one_root", x1: x, x2: x, steps };
  } else {
    steps.push({
      title: "📊 Bước 4: Phân tích biệt thức",
      content: `Δ = ${formatNum(delta)} < 0`,
      formula: "→ Phương trình VÔ NGHIỆM thực (có nghiệm phức)",
      highlight: true,
    });

    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-delta) / (2 * a);

    steps.push({
      title: "📐 Bước 5: Nghiệm phức (nâng cao)",
      content: `Trong tập số phức ℂ, phương trình có hai nghiệm phức liên hợp:`,
      formula: `x₁ = ${formatNum(realPart)} - ${formatNum(Math.abs(imagPart))}i
x₂ = ${formatNum(realPart)} + ${formatNum(Math.abs(imagPart))}i`,
    });

    steps.push({
      title: "❌ Kết luận",
      content: `Phương trình vô nghiệm trong tập số thực ℝ`,
      formula: `Vì Δ = ${formatNum(delta)} < 0, không tồn tại số thực nào thỏa mãn phương trình`,
      highlight: true,
    });

    return { a, b, c, delta, type: "no_root", steps };
  }
}

export default function App() {
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [inputC, setInputC] = useState("");
  const [result, setResult] = useState<SolveResult | null>(null);
  const [errors, setErrors] = useState<{ a?: string; b?: string; c?: string }>({});
  const [animating, setAnimating] = useState(false);

  const handleSolve = () => {
    const newErrors: { a?: string; b?: string; c?: string } = {};
    if (inputA === "" || isNaN(Number(inputA))) newErrors.a = "Vui lòng nhập số hợp lệ";
    if (inputB === "" || isNaN(Number(inputB))) newErrors.b = "Vui lòng nhập số hợp lệ";
    if (inputC === "" || isNaN(Number(inputC))) newErrors.c = "Vui lòng nhập số hợp lệ";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    const c = parseFloat(inputC);

    setAnimating(true);
    setResult(null);
    setTimeout(() => {
      setResult(solve(a, b, c));
      setAnimating(false);
    }, 400);
  };

  const handleReset = () => {
    setInputA("");
    setInputB("");
    setInputC("");
    setResult(null);
    setErrors({});
  };

  const handleExample = (a: string, b: string, c: string) => {
    setInputA(a);
    setInputB(b);
    setInputC(c);
    setResult(null);
    setErrors({});
  };

  const getEquationDisplay = () => {
    const a = parseFloat(inputA) || 0;
    const b = parseFloat(inputB) || 0;
    const c = parseFloat(inputC) || 0;
    const parts: string[] = [];

    if (inputA !== "") {
      if (a === 1) parts.push("x²");
      else if (a === -1) parts.push("-x²");
      else parts.push(`${formatNum(a)}x²`);
    } else {
      parts.push("ax²");
    }

    if (inputB !== "") {
      if (b === 1) parts.push("+ x");
      else if (b === -1) parts.push("- x");
      else if (b >= 0) parts.push(`+ ${formatNum(b)}x`);
      else parts.push(`- ${formatNum(Math.abs(b))}x`);
    } else {
      parts.push("+ bx");
    }

    if (inputC !== "") {
      if (c >= 0) parts.push(`+ ${formatNum(c)}`);
      else parts.push(`- ${formatNum(Math.abs(c))}`);
    } else {
      parts.push("+ c");
    }

    return parts.join(" ") + " = 0";
  };

  const resultColor = result
    ? result.type === "two_roots"
      ? "from-green-500 to-emerald-600"
      : result.type === "one_root"
      ? "from-blue-500 to-cyan-600"
      : result.type === "linear"
      ? "from-purple-500 to-violet-600"
      : result.type === "identity"
      ? "from-yellow-500 to-orange-500"
      : "from-red-500 to-rose-600"
    : "from-indigo-500 to-purple-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20" />
        <div className="relative max-w-4xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl shadow-orange-500/30 mb-6">
            <span className="text-4xl">🔢</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300">
              Giải Phương Trình Bậc Hai
            </span>
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            ax² + bx + c = 0 — Hướng dẫn giải chi tiết từng bước
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="px-3 py-1 rounded-full bg-purple-800/60 text-purple-200 text-sm border border-purple-700/50">
              📐 Phương pháp Delta
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-800/60 text-indigo-200 text-sm border border-indigo-700/50">
              🔍 Kiểm tra nghiệm
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-800/60 text-blue-200 text-sm border border-blue-700/50">
              📋 Định lý Viète
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-6">
        {/* Input Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm">✏️</span>
            Nhập hệ số phương trình
          </h2>

          {/* Live equation display */}
          <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-4 mb-6 text-center">
            <p className="text-xs text-purple-300 mb-1 font-medium">PHƯƠNG TRÌNH ĐANG NHẬP</p>
            <p className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              {getEquationDisplay()}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Input A */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <span className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-xs font-bold">a</span>
                Hệ số a
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inputA}
                  onChange={(e) => { setInputA(e.target.value); setErrors(prev => ({ ...prev, a: undefined })); }}
                  placeholder="Nhập a..."
                  className={`w-full bg-slate-800/80 border-2 rounded-xl px-4 py-3 text-white font-mono text-lg text-center outline-none transition-all focus:bg-slate-700/80 ${
                    errors.a ? "border-red-500 focus:border-red-400" : "border-slate-600 focus:border-purple-500"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && handleSolve()}
                />
                {errors.a && <p className="text-red-400 text-xs mt-1 text-center">{errors.a}</p>}
              </div>
            </div>

            {/* Input B */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold">b</span>
                Hệ số b
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inputB}
                  onChange={(e) => { setInputB(e.target.value); setErrors(prev => ({ ...prev, b: undefined })); }}
                  placeholder="Nhập b..."
                  className={`w-full bg-slate-800/80 border-2 rounded-xl px-4 py-3 text-white font-mono text-lg text-center outline-none transition-all focus:bg-slate-700/80 ${
                    errors.b ? "border-red-500 focus:border-red-400" : "border-slate-600 focus:border-indigo-500"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && handleSolve()}
                />
                {errors.b && <p className="text-red-400 text-xs mt-1 text-center">{errors.b}</p>}
              </div>
            </div>

            {/* Input C */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">c</span>
                Hệ số c
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inputC}
                  onChange={(e) => { setInputC(e.target.value); setErrors(prev => ({ ...prev, c: undefined })); }}
                  placeholder="Nhập c..."
                  className={`w-full bg-slate-800/80 border-2 rounded-xl px-4 py-3 text-white font-mono text-lg text-center outline-none transition-all focus:bg-slate-700/80 ${
                    errors.c ? "border-red-500 focus:border-red-400" : "border-slate-600 focus:border-blue-500"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && handleSolve()}
                />
                {errors.c && <p className="text-red-400 text-xs mt-1 text-center">{errors.c}</p>}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSolve}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-lg text-white shadow-lg shadow-purple-900/50 transition-all hover:scale-[1.02] hover:shadow-purple-700/50 active:scale-[0.98]"
            >
              🚀 GIẢI PHƯƠNG TRÌNH
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-4 rounded-2xl bg-slate-700/80 hover:bg-slate-600/80 font-bold text-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-600"
            >
              🔄 Xóa
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">💡 Ví dụ mẫu (click để thử)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { a: "1", b: "-5", c: "6", label: "x² - 5x + 6 = 0", desc: "Δ > 0" },
              { a: "1", b: "-2", c: "1", label: "x² - 2x + 1 = 0", desc: "Δ = 0" },
              { a: "1", b: "2", c: "5", label: "x² + 2x + 5 = 0", desc: "Δ < 0" },
              { a: "2", b: "-3", c: "-2", label: "2x² - 3x - 2 = 0", desc: "Δ > 0" },
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex.a, ex.b, ex.c)}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-purple-600 transition-all hover:scale-[1.02] text-left group"
              >
                <p className="font-mono text-xs text-slate-300 group-hover:text-white transition-colors">{ex.label}</p>
                <span className={`text-xs font-semibold mt-1 inline-block ${
                  ex.desc === "Δ > 0" ? "text-green-400" : ex.desc === "Δ = 0" ? "text-blue-400" : "text-red-400"
                }`}>{ex.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {animating && (
          <div className="text-center py-8">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full bg-purple-400"
                    style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate` }}
                  />
                ))}
              </div>
              <p className="text-slate-400">Đang tính toán...</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !animating && (
          <div className="space-y-4">
            {/* Result Summary */}
            <div className={`bg-gradient-to-r ${resultColor} rounded-3xl p-6 shadow-2xl`}>
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <span>🏆</span> KẾT QUẢ
              </h2>

              {result.type === "two_roots" && (
                <div className="space-y-3">
                  <p className="text-white/90 font-semibold">Phương trình có hai nghiệm phân biệt (Δ = {formatNum(result.delta)} &gt; 0):</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                      <p className="text-white/70 text-sm mb-1">Nghiệm x₁</p>
                      <p className="text-3xl font-black text-white font-mono">{formatNum(result.x1!)}</p>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                      <p className="text-white/70 text-sm mb-1">Nghiệm x₂</p>
                      <p className="text-3xl font-black text-white font-mono">{formatNum(result.x2!)}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.type === "one_root" && (
                <div className="space-y-3">
                  <p className="text-white/90 font-semibold">Phương trình có nghiệm kép (Δ = 0):</p>
                  <div className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <p className="text-white/70 text-sm mb-1">Nghiệm kép x₁ = x₂</p>
                    <p className="text-3xl font-black text-white font-mono">{formatNum(result.x1!)}</p>
                  </div>
                </div>
              )}

              {result.type === "no_root" && (
                <div className="space-y-2">
                  <p className="text-white/90 font-semibold">Phương trình vô nghiệm trong ℝ (Δ = {formatNum(result.delta)} &lt; 0)</p>
                  <div className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <p className="text-4xl font-black text-white">∅</p>
                    <p className="text-white/80 text-sm mt-1">Tập nghiệm rỗng</p>
                  </div>
                </div>
              )}

              {result.type === "linear" && (
                <div className="space-y-2">
                  <p className="text-white/90 font-semibold">Phương trình bậc nhất (a = 0):</p>
                  <div className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <p className="text-white/70 text-sm mb-1">Nghiệm duy nhất</p>
                    <p className="text-3xl font-black text-white font-mono">x = {formatNum(result.x!)}</p>
                  </div>
                </div>
              )}

              {result.type === "identity" && (
                <div className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <p className="text-2xl font-black text-white">x ∈ ℝ</p>
                  <p className="text-white/80 text-sm mt-1">Đúng với mọi số thực</p>
                </div>
              )}

              {result.type === "no_solution" && (
                <div className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <p className="text-4xl font-black text-white">∅</p>
                  <p className="text-white/80 text-sm mt-1">Phương trình vô nghiệm</p>
                </div>
              )}
            </div>

            {/* Step by step */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-sm">📖</span>
                Hướng dẫn giải chi tiết
              </h2>

              <div className="space-y-4">
                {result.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-5 border transition-all ${
                      step.highlight
                        ? "bg-purple-900/40 border-purple-500/50 shadow-lg shadow-purple-900/20"
                        : "bg-slate-800/50 border-slate-700/50"
                    }`}
                  >
                    <h3 className={`font-bold text-base mb-2 ${step.highlight ? "text-yellow-300" : "text-slate-200"}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mb-2 ${step.highlight ? "text-purple-200" : "text-slate-400"}`}>
                      {step.content}
                    </p>
                    {step.formula && (
                      <div className={`rounded-xl p-3 font-mono text-sm whitespace-pre-line ${
                        step.highlight
                          ? "bg-purple-950/60 text-yellow-200 border border-purple-600/40"
                          : "bg-slate-900/60 text-green-300 border border-slate-600/40"
                      }`}>
                        {step.formula}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Formula Reference */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📚</span> Công thức tham khảo
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <p className="text-yellow-300 font-bold text-sm mb-2">🔑 Công thức nghiệm</p>
              <div className="font-mono text-green-300 text-sm bg-slate-900/60 rounded-xl p-3 border border-slate-600/30">
                <p>Δ = b² - 4ac</p>
                <p className="mt-1">x₁,₂ = (-b ± √Δ) / 2a</p>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <p className="text-yellow-300 font-bold text-sm mb-2">📋 Định lý Viète</p>
              <div className="font-mono text-green-300 text-sm bg-slate-900/60 rounded-xl p-3 border border-slate-600/30">
                <p>x₁ + x₂ = -b/a</p>
                <p className="mt-1">x₁ × x₂ = c/a</p>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <p className="text-yellow-300 font-bold text-sm mb-2">📊 Phân tích biệt thức Δ</p>
              <div className="text-sm text-slate-300 space-y-1">
                <p><span className="text-green-400 font-bold">Δ &gt; 0</span> → 2 nghiệm phân biệt</p>
                <p><span className="text-blue-400 font-bold">Δ = 0</span> → nghiệm kép</p>
                <p><span className="text-red-400 font-bold">Δ &lt; 0</span> → vô nghiệm thực</p>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <p className="text-yellow-300 font-bold text-sm mb-2">💡 Dạng tích phân tích</p>
              <div className="font-mono text-green-300 text-sm bg-slate-900/60 rounded-xl p-3 border border-slate-600/30">
                <p>ax² + bx + c =</p>
                <p>a(x - x₁)(x - x₂)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm py-4">
          <p>🎓 Công cụ học tập Toán — Phương trình bậc hai</p>
          <p className="mt-1">Áp dụng phương pháp Delta chuẩn SGK Toán Việt Nam</p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.5; }
          to { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
