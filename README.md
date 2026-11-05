# VELOCITY X1 — e-commerce cinematográfico

Site conceitual de uma marca fictícia de tênis de corrida. A navegação é guiada pelo scroll: um único tênis 3D atravessa as sete seções do site (hero, design, tecnologia com vista explodida, performance, galeria, compra e encerramento).

**Tecnologias:** Next.js 15, TypeScript, GSAP ScrollTrigger, Lenis, React Three Fiber (Three.js), Framer Motion, Zustand.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `/` (raiz) | Site já compilado: `index.html`, `_next/`, `images/`, `models/`. Abre direto no XAMPP e no GitHub Pages. |
| `codigo-fonte/` | Projeto Next.js com o código-fonte, os scripts de geração de imagens e o README técnico. |

## Ver o site

- **XAMPP:** com o Apache ligado, acesse `http://localhost/Sitetenispro/`.
- **GitHub Pages:** em *Settings → Pages*, escolha *Deploy from a branch*, a branch `main` e a pasta `/ (root)`.

Não abra o `index.html` direto pelo explorador de arquivos (`file://`), porque o navegador bloqueia o carregamento do modelo 3D. Use sempre um servidor.

## Desenvolver

```bash
cd codigo-fonte
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em codigo-fonte/out
```

Depois de um novo `build`, copie o conteúdo de `codigo-fonte/out/` para a raiz para atualizar a versão publicada.

## Créditos

Modelo 3D base: "Materials Variants Shoe" © 2021 Shopify, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), recolorido e reiluminado. VELOCITY é uma marca fictícia e o checkout é apenas demonstrativo.
