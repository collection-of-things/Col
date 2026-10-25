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
