import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(rootDir, 'src', 'themes', 'index.ts');
const outputDir = path.join(rootDir, 'themes');
const sourceText = await fs.readFile(sourcePath, 'utf8');
const sourceFile = ts.createSourceFile(
  sourcePath,
  sourceText,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
);

const themesDeclaration = sourceFile.statements
  .filter(ts.isVariableStatement)
  .flatMap((statement) => statement.declarationList.declarations)
  .find((declaration) =>
    ts.isIdentifier(declaration.name) && declaration.name.text === 'themes'
  );

if (!themesDeclaration?.initializer || !ts.isArrayLiteralExpression(themesDeclaration.initializer)) {
  throw new Error(`Could not find the themes array in ${path.relative(rootDir, sourcePath)}`);
}

function getProperty(object, propertyName) {
  if (!ts.isObjectLiteralExpression(object)) return undefined;

  return object.properties.find((property) => {
    if (!ts.isPropertyAssignment(property)) return false;
    const name = property.name;
    return (ts.isIdentifier(name) || ts.isStringLiteral(name)) && name.text === propertyName;
  });
}

const staticCssVariables = new Map(
  sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => statement.declarationList.declarations)
    .filter((declaration) =>
      ts.isIdentifier(declaration.name) &&
      declaration.initializer &&
      ts.isNoSubstitutionTemplateLiteral(declaration.initializer)
    )
    .map((declaration) => [declaration.name.text, declaration.initializer.text])
);

const themes = themesDeclaration.initializer.elements.map((element, index) => {
  const idProperty = getProperty(element, 'id');
  const cssProperty = getProperty(element, 'css');
  const id = idProperty?.initializer;
  const cssExpression = cssProperty?.initializer;

  if (!id || !ts.isStringLiteral(id) || !/^[a-z0-9][a-z0-9-]*$/.test(id.text)) {
    throw new Error(`Theme at position ${index + 1} has a missing or invalid id`);
  }

  const css = cssExpression && ts.isNoSubstitutionTemplateLiteral(cssExpression)
    ? cssExpression.text
    : cssExpression && ts.isIdentifier(cssExpression)
      ? staticCssVariables.get(cssExpression.text)
      : undefined;

  if (css === undefined) {
    throw new Error(`Theme "${id.text}" must use a static CSS template literal`);
  }

  return { id: id.text, css };
});

if (themes.length === 0) {
  throw new Error('No built-in themes were found');
}

await fs.mkdir(outputDir, { recursive: true });

for (const theme of themes) {
  await fs.writeFile(path.join(outputDir, `${theme.id}.css`), theme.css, 'utf8');
}

console.log(`Exported ${themes.length} built-in themes to ${path.relative(rootDir, outputDir)} in source order.`);
