# Uso de Inteligência Artificial

> Requisito do challenge: informar quais ferramentas de IA foram utilizadas e como. Este documento descreve **as ferramentas, a forma de uso e os princípios** que guiaram o trabalho com IA — refletindo também os diferenciais da vaga (engenharia de prompts, automação assistida, revisão crítica e orientação sobre uso responsável de IA).

## Ferramentas utilizadas
- **Claude Code (Claude Opus)** — apoio em planejamento, scaffold, geração de código, documentação e revisão; orquestração de workflows multi-agente (revisão do plano e vet das telas).
- **Claude Design** — geração dos layouts de alta fidelidade a partir de [`screens.md`](./screens.md).
- **ChatGPT** - criação da identidade da marca.

## Princípio condutor
> **A IA é ferramenta; as decisões e a autoria são do desenvolvedor.**

Toda sugestão da IA passou por **revisão crítica e validação** antes de ser adotada — aderência a padrões, performance, acessibilidade e arquitetura. As decisões de produto e de arquitetura foram tomadas e justificadas pelo desenvolvedor (ver [`dev-journal.md`](./dev-journal.md) e os ADRs em `adr/`).

## Como a IA foi usada (por área)
- **Planejamento:** explorar opções de segmento, formato de perfil, estratégia de dados; estruturar trade-offs em ADRs.
- **Scaffold/setup:** gerar a base Nuxt com a ferramenta oficial e configurar a stack.
- **Desenvolvimento:** geração e refino de componentes, composables e da camada de API.
- **Documentação:** ADRs, README, este documento e a jornada de decisões.
- **Revisão:** leitura crítica de código e checagem de boas práticas.

## Engenharia de prompts & fluxo de produtividade
- Prompts com **contexto explícito** (requisitos do challenge + da vaga), **decisões já tomadas** e **restrições** (priorizar o challenge, mobile-first, performance).
- **Decisões antes de código:** alinhamento de regras de negócio e telas antes de implementar, reduzindo retrabalho.
- **Rastreabilidade:** decisões registradas em ADRs e na jornada, permitindo auditar o porquê de cada escolha.

## Uso responsável (orientação)
- Validar criticamente todo código gerado (segurança, performance, padrões).
- Não delegar decisões de arquitetura à IA sem entendimento — capacidade de defender cada escolha.
- Não submeter soluções "prontas" de ferramentas no-code: o domínio da base de código é do desenvolvedor.

_(Documento vivo — atualizado ao longo do desenvolvimento.)_
