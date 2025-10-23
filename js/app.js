// Variáveis
let currentInput = document.querySelector(".currentInput");
let answerScreen = document.querySelector(".answerScreen");
let buttons = document.querySelectorAll("button");
let erasebtn = document.querySelector("#erase");
let clearbtn = document.querySelector("#clear");
let evaluate = document.querySelector("#evaluate");

function tokenize(expr) {
  const tokens = [];
  const re = /\s*([0-9]*\.?[0-9]+|[()+\-*/^%])\s*/g;
  let m;
  let idx = 0;
  while ((m = re.exec(expr)) !== null) {
    if (m.index !== idx) throw new Error("Tokenização inválida");
    tokens.push(m[1]);
    idx = re.lastIndex;
  }
  if (idx !== expr.length) throw new Error("Caracter inválido na expressão");
  return tokens;
}

function toRPN(tokens) {
  const out = [];
  const ops = [];
  const prec = { "+": 2, "-": 2, "*": 3, "/": 3, "%": 3, "^": 4 };
  const rightAssoc = { "^": true };

  tokens.forEach((t) => {
    if (!isNaN(t)) {
      out.push(t);
      return;
    }
    if (t === "(") {
      ops.push(t);
      return;
    }
    if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop());
      if (!ops.length || ops.pop() !== "(")
        throw new Error("Parênteses desequilibrados");
      return;
    }

    while (ops.length) {
      const top = ops[ops.length - 1];
      if (top === "(") break;
      const p1 = prec[t] || 0;
      const p2 = prec[top] || 0;
      if ((rightAssoc[t] && p1 < p2) || (!rightAssoc[t] && p1 <= p2)) {
        out.push(ops.pop());
        continue;
      }
      break;
    }
    ops.push(t);
  });

  while (ops.length) {
    const o = ops.pop();
    if (o === "(" || o === ")") throw new Error("Parênteses desequilibrados");
    out.push(o);
  }
  return out;
}

function evalRPN(rpn) {
  const stack = [];
  rpn.forEach((token) => {
    if (!isNaN(token)) {
      stack.push(parseFloat(token));
      return;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined)
      throw new Error("Expressão inválida");
    switch (token) {
      case "+":
        stack.push(a + b);
        break;
      case "-":
        stack.push(a - b);
        break;
      case "*":
        stack.push(a * b);
        break;
      case "/":
        stack.push(a / b);
        break;
      case "%":
        stack.push(a % b);
        break;
      case "^":
        stack.push(Math.pow(a, b));
        break;
      default:
        throw new Error("Operador desconhecido: " + token);
    }
  });
  if (stack.length !== 1) throw new Error("Expressão inválida");
  return stack[0];
}

function evaluateExpression(expr) {
  if (!expr || expr.trim() === "") return 0;
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  return evalRPN(rpn);
}

let realTimeScreenValue = [];

clearbtn.addEventListener("click", () => {
  realTimeScreenValue = [];
  currentInput.innerHTML = "";
  answerScreen.innerHTML = 0;
  currentInput.className = "currentInput";
  answerScreen.className = "answerScreen";
  answerScreen.style.color = " rgba(150, 150, 150, 0.87)";
});

erasebtn.addEventListener("click", () => {
  if (!realTimeScreenValue.length) return;
  realTimeScreenValue.pop();
  const exprRaw = realTimeScreenValue.join("");
  currentInput.innerHTML = exprRaw;

  let expr = exprRaw;
  expr = expr.trim();
  while (expr.length && !/[0-9\)]$/.test(expr)) {
    expr = expr.slice(0, -1);
  }

  if (!expr) {
    answerScreen.innerHTML = 0;
    return;
  }

  try {
    const result = evaluateExpression(expr);
    answerScreen.innerHTML =
      result === Infinity || result === -Infinity || Number.isNaN(result)
        ? "Erro"
        : result;
  } catch (e) {
    answerScreen.innerHTML = "Erro";
  }
});

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!btn.id.match("erase")) {
      realTimeScreenValue.push(btn.value);
      currentInput.innerHTML = realTimeScreenValue.join("");
      if (btn.classList.contains("num_btn")) {
        const expr = realTimeScreenValue.join("");
        try {
          const result = evaluateExpression(expr);
          answerScreen.innerHTML =
            result === Infinity || result === -Infinity || Number.isNaN(result)
              ? "Erro"
              : result;
        } catch (e) {
          answerScreen.innerHTML = "Erro";
        }
      }
    }
  });
});


evaluate.addEventListener("click", () => {
  const exprRaw = realTimeScreenValue.join("");
  if (!exprRaw) return;

  let expr = exprRaw.trim();
  while (expr.length && !/[0-9")]$/.test(expr)) {
    expr = expr.slice(0, -1);
  }

  if (!expr) {
    answerScreen.innerHTML = 0;
    return;
  }

  try {
    const result = evaluateExpression(expr);
    if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
      answerScreen.innerHTML = "Erro";
      return;
    }

    answerScreen.innerHTML = result;
    currentInput.innerHTML = String(result);
    realTimeScreenValue = [String(result)];
  } catch (e) {
    answerScreen.innerHTML = "Erro";
  }
});
