import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import postcss, { type AtRule, type Declaration, type Root, type Rule } from 'postcss'
import ts from 'typescript'

const projectRoot = process.env.WEIMO_UI_PROJECT_ROOT ?? process.cwd()

export function projectPath(relativePath: string) {
  return path.join(projectRoot, relativePath)
}

export function projectFileExists(relativePath: string) {
  return existsSync(projectPath(relativePath))
}

export function readProjectFile(relativePath: string) {
  return readFileSync(projectPath(relativePath), 'utf8')
}

export function readProjectJson<T>(relativePath: string): T {
  return JSON.parse(readProjectFile(relativePath)) as T
}

export function parseProjectCss(relativePath: string) {
  return postcss.parse(readProjectFile(relativePath), { from: projectPath(relativePath) })
}

function matchingRules(root: Root, selector: string) {
  const rules: Rule[] = []

  root.walkRules((rule) => {
    if (rule.selectors.includes(selector)) rules.push(rule)
  })

  return rules
}

export function cssRule(root: Root, selector: string) {
  const rules = matchingRules(root, selector)

  if (rules.length !== 1) {
    throw new Error(`Expected one CSS rule for ${selector}, found ${rules.length}.`)
  }

  return rules[0]
}

export function cssRuleWithDeclaration(
  root: Root,
  selector: string,
  property: string,
) {
  const rules = matchingRules(root, selector).filter((rule) =>
    rule.nodes?.some(
      (node) => node.type === 'decl' && node.prop === property,
    ),
  )

  if (rules.length !== 1) {
    throw new Error(
      `Expected one CSS rule for ${selector} with ${property}, found ${rules.length}.`,
    )
  }

  return rules[0]
}

export function optionalCssRule(root: Root, selector: string) {
  const rules = matchingRules(root, selector)

  if (rules.length > 1) {
    throw new Error(`Expected at most one CSS rule for ${selector}, found ${rules.length}.`)
  }

  return rules[0]
}

export function cssDeclaration(rule: Rule, property: string) {
  const declarations: Declaration[] = []

  rule.walkDecls(property, (declaration) => {
    declarations.push(declaration)
  })
  if (declarations.length !== 1) {
    throw new Error(
      `Expected one ${property} declaration in ${rule.selector}, found ${declarations.length}.`,
    )
  }

  return declarations[0].value
}

export function optionalCssDeclaration(rule: Rule, property: string) {
  const declarations: Declaration[] = []

  rule.walkDecls(property, (declaration) => {
    declarations.push(declaration)
  })
  if (declarations.length > 1) {
    throw new Error(
      `Expected at most one ${property} declaration in ${rule.selector}, found ${declarations.length}.`,
    )
  }

  return declarations[0]?.value
}

export function cssAtRule(root: Root, name: string, params: string) {
  const matches: AtRule[] = []

  root.walkAtRules(name, (atRule) => {
    if (atRule.params === params) matches.push(atRule)
  })
  if (matches.length !== 1) {
    throw new Error(`Expected one @${name} ${params} rule, found ${matches.length}.`)
  }

  return matches[0]
}

export function parseProjectTypeScript(relativePath: string) {
  const filePath = projectPath(relativePath)
  const scriptKind = relativePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS

  return ts.createSourceFile(
    filePath,
    readProjectFile(relativePath),
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  )
}

function hasExportModifier(node: ts.Node) {
  return ts.canHaveModifiers(node) &&
    ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
}

export function exportedNames(relativePath: string) {
  const sourceFile = parseProjectTypeScript(relativePath)
  const names = new Set<string>()

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) names.add(element.name.text)
      }
      continue
    }
    if (!hasExportModifier(statement)) continue

    if (
      ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement)
    ) {
      if (statement.name) names.add(statement.name.text)
      continue
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text)
      }
    }
  }

  return names
}
