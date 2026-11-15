import { readFile } from "node:fs/promises";
import ts from "typescript";

// Read literal answer fixtures without executing server-only modules or relying on formatting.
export async function readDataConstant(url, name) {
  const source = ts.createSourceFile(
    String(url),
    await readFile(url, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const declaration = statement.declarationList.declarations.find(
      (node) => ts.isIdentifier(node.name) && node.name.text === name,
    );
    if (declaration?.initializer) return literal(declaration.initializer);
  }
  throw new Error(`Missing data constant: ${name} in ${url}`);
}

function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties.map((property) => {
        if (
          !ts.isPropertyAssignment(property) ||
          !(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
        )
          throw new Error("Expected a literal data property");
        return [property.name.text, literal(property.initializer)];
      }),
    );
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  throw new Error(`Expected literal fixture, received ${ts.SyntaxKind[node.kind]}`);
}
