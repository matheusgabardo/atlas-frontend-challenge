# Brief de Identidade Visual — "QuemFaz Eventos"

Prompt usado para gerar a identidade visual (logo, paleta, tipografia) no Claude Design. O resultado será mapeado para os design tokens em `app/assets/css/main.css` (`@theme`).

> Marca: **QuemFaz Eventos** · domínio `quemfazeventos.com.br`. Contexto de produto em [`business-rules.md`](./business-rules.md) e telas em [`screens.md`](./screens.md).

---

## Prompt

Você é diretor(a) de identidade visual. Crie a identidade da marca **"QuemFaz Eventos"**.

**Sobre a marca**
- **O que é:** plataforma/catálogo **B2B** que conecta organizadores de eventos (produtoras, casas de show, igrejas, agências, eventos corporativos) aos **fornecedores de estrutura técnica** que fazem o evento acontecer.
- **Segmento (6 categorias):** sonorização · iluminação/VJ · painel de LED/telão · projeção & mapping · palco/treliça · gerador/energia.
- **Nome / significado:** "QuemFaz Eventos" = quem está nos **bastidores** e coloca o evento de pé. Tom direto, brasileiro.
- **Usuário:** empresas buscando, comparando e contratando fornecedores **por cidade** (cobertura nacional), atentas a specs técnicas (line array, pixel pitch, kVA, lúmens).
- **Diferenciais:** busca por specs técnicas, selo **"verificado"** (confiança), foco em performance/UX.

**Personalidade**
- Profissional, **confiável** e técnica, mas acessível e direta.
- "Bastidores de evento" + "energia de palco": robustez de estrutura (treliça, cabos, força) com a energia de luz/LED.
- **Evitar** clichês de festa (balão, confete, glitter, arco-íris) — é ferramenta de trabalho B2B.
- Adjetivos: técnica · confiável · enérgica · objetiva.

**Entregáveis**
1. **Logotipo:** wordmark + ideia de símbolo (explore treliça/grid, ondas sonoras, matriz de pixels/LED, holofote, plugue de energia). Deve funcionar em favicon (16px) e em fundo claro e escuro.
2. **Paleta (HEX):** **primária** (sugiro algo que remeta a holofote/luz de palco — mas proponha o melhor), **neutros** (texto/fundos/bordas) e **feedback** (sucesso/aviso/erro) + cor do selo **"verificado"**. Entregue a primária como **escala 50–950** (para mapear em tokens Tailwind).
3. **Tipografia:** família **display** (títulos) + **texto/UI**, pegada técnica/limpa (sans geométrica ou neo-grotesca), com escala. Preferir fontes open-source (Google Fonts).
4. **Ícones** (traço/cantos) e **vibe de componentes** (cards, botões, badges): raio de canto, sombra, densidade, contraste.
5. **Tom de voz** (pt-BR) + 1 headline de home (ex.: "Procurar fornecedores…").

**Restrições**
- **Web app responsiva, mobile-first** (Nuxt + Tailwind). Tema claro como base; se possível, proponha **modo escuro** coerente com "palco/luz".
- **Acessibilidade:** contrastes WCAG **AA** (texto ≥ 4.5:1).
- Cores em **HEX** e fontes nomeadas, prontas para implementação.
