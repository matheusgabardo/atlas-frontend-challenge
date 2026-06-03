# Contribuindo

Padrões do projeto **QuemFaz Eventos**.

## Idioma
- **Código em inglês:** identificadores (funções, variáveis, tipos, componentes) **e comentários de código**.
- **Documentação em português:** `docs/`, ADRs, README.
- **UI / copy em pt-BR:** o produto é brasileiro.
- **Commits em inglês.**

## Commits — Conventional Commits v1.0.0
Seguimos a [especificação Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), **enforçada por commitlint + husky** (hook `commit-msg`).

Formato: `type(scope?): subject`

Types: `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `revert`.

Exemplos:
```
feat(catalog): add price range filter
fix(profile): handle missing rating as "Novo"
docs(adr): add ADR-007 on URL-as-source-of-truth
chore: configure husky + commitlint
```

## Branches
`feat/…`, `fix/…`, `chore/…`, `docs/…` — integradas via Pull Request.

## Comandos
| Ação | Comando |
|---|---|
| Instalar | `npm install` |
| Desenvolvimento | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Formatar | `npm run format` |
| Type-check | `npm run typecheck` |
| Testes | `npm run test` |
| Gerar dados (seed) | `npm run seed` _(em breve)_ |
