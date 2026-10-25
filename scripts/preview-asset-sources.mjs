import { parse } from "@babel/parser";

/** Minifier names may change; the audited URL and row.original.flag access may not. */
export function findOriginalFlagTemplate(code) {
  const matches = [];
  const member = (node, name) => node?.type === "MemberExpression" && !node.computed && node.property.type === "Identifier" && node.property.name === name;
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.type === "TemplateLiteral" && node.quasis.length === 2 && node.expressions.length === 1 && node.quasis[0].value.cooked === "https://flagcdn.com/" && node.quasis[1].value.cooked === ".svg") {
      const call = node.expressions[0];
      if (call.type === "CallExpression" && call.arguments.length === 0 && member(call.callee, "toLowerCase") && member(call.callee.object, "flag") && member(call.callee.object.object, "original") && call.callee.object.object.object.type === "Identifier") {
        matches.push({ source: code.slice(node.start, node.end), binding: call.callee.object.object.object.name });
      }
    }
    Object.values(node).forEach(visit);
  }
  visit(parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] }).program);
  if (matches.length !== 1) throw new Error("Expected exactly one original Data Grid flag URL expression");
  return matches[0];
}

/** Audit the official Blur Fade sample's nine deterministic photo dimensions. */
export function findOriginalPicsumTemplate(code) {
  const matches = [];
  const identifier = (node, name) => node?.type === "Identifier" && node.name === name;
  const number = (node, value) => node?.type === "NumericLiteral" && node.value === value;
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && identifier(node.callee.object, "Array") && identifier(node.callee.property, "from")) {
      const [options, callback] = node.arguments;
      const length = options?.type === "ObjectExpression" && options.properties.length === 1 && options.properties[0];
      const index = callback?.params?.[1]?.name;
      const [declaration, returned] = callback?.body?.body ?? [];
      const [even, width, height] = declaration?.declarations ?? [];
      const condition = even?.init;
      const size = (value, first, second) => value?.type === "ConditionalExpression" && identifier(value.test, even?.id?.name) && number(value.consequent, first) && number(value.alternate, second);
      const template = returned?.argument;
      const [sequence, x, y] = template?.expressions ?? [];
      const originalRange = length && identifier(length.key, "length") && number(length.value, 9)
        && callback?.type === "ArrowFunctionExpression" && callback.body.body?.length === 2 && declaration.declarations?.length === 3;
      const alternating = condition?.type === "BinaryExpression" && condition.operator === "===" && number(condition.right, 0)
        && condition.left.type === "BinaryExpression" && condition.left.operator === "%" && identifier(condition.left.left, index) && number(condition.left.right, 2);
      const dimensions = size(width?.init, 800, 600) && size(height?.init, 600, 800);
      const originalTemplate = returned?.type === "ReturnStatement" && template?.type === "TemplateLiteral"
        && template.quasis.map(part => part.value.cooked).join("|") === "https://picsum.photos/seed/|/|/|"
        && sequence?.type === "BinaryExpression" && sequence.operator === "+" && identifier(sequence.left, index) && number(sequence.right, 1)
        && identifier(x, width?.id?.name) && identifier(y, height?.id?.name);
      if (originalRange && alternating && dimensions && originalTemplate) {
        matches.push({ source: code.slice(template.start, template.end), bindings: { index, width: x.name, height: y.name } });
      }
    }
    Object.values(node).forEach(visit);
  }
  visit(parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] }).program);
  if (matches.length !== 1) throw new Error("Expected exactly one original Blur Fade photo sample expression");
  return matches[0];
}

/** Preserve Cult's name hash calculation and relocate only its exact avatar URL. */
export function findOriginalPravatarTemplate(code) {
  const matches = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.type === "TemplateLiteral" && node.quasis.length === 2 && node.expressions.length === 1 && node.quasis[0].value.cooked === "https://i.pravatar.cc/48?img=" && node.quasis[1].value.cooked === "") {
      const sum = node.expressions[0], modulo = sum.left, call = modulo?.left;
      if (sum.type === "BinaryExpression" && sum.operator === "+" && sum.right.type === "NumericLiteral" && sum.right.value === 1
        && modulo?.type === "BinaryExpression" && modulo.operator === "%" && modulo.right.type === "NumericLiteral" && modulo.right.value === 70
        && call?.type === "CallExpression" && call.arguments.length === 1 && call.arguments[0].type === "Identifier"
        && call.callee.type === "MemberExpression" && !call.callee.computed && call.callee.object.type === "Identifier" && call.callee.object.name === "Math" && call.callee.property.type === "Identifier" && call.callee.property.name === "abs") {
        matches.push({ source: code.slice(node.start, node.end), binding: call.arguments[0].name });
      }
    }
    Object.values(node).forEach(visit);
  }
  visit(parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] }).program);
  if (matches.length !== 1) throw new Error("Expected exactly one original Cult avatar expression");
  return matches[0];
}

/** Locate an audited URL template without depending on minifier binding names.
 * Only simple identifier interpolation is accepted; the original expression is
 * retained by the runtime mapping, including unknown-value fallback. */
export function findOriginalUrlTemplate(code, parts) {
  const matches = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.type === "TemplateLiteral" && JSON.stringify(node.quasis.map(part => part.value.cooked)) === JSON.stringify(parts)
      && node.expressions.every(expression => expression.type === "Identifier")
      && new Set(node.expressions.map(expression => expression.name)).size === 1) {
      matches.push({ source: code.slice(node.start, node.end), binding: node.expressions[0].name });
    }
    Object.values(node).forEach(visit);
  }
  visit(parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] }).program);
  if (matches.length !== 1) throw new Error("Expected exactly one original URL template");
  return matches[0];
}
