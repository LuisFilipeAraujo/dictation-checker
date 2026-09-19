# British Dictation Checker

Corretor de ditados em inglês britânico. O aluno digita o que ouviu, escolhe o número do
ditado, e a aplicação compara o texto com a referência palavra a palavra — marcando o que
saiu errado, o que faltou e o que sobrou.

A identidade visual segue a Union Flag (Pantone 280 C e 186 C) sobre fundo pergaminho, com
tipografia inglesa: Libre Baskerville nos títulos e Cabin — desenhada a partir da Gill Sans —
na interface.

## Stack

| Camada    | Escolha                                                        |
| --------- | -------------------------------------------------------------- |
| Framework | Next.js 16 (App Router) + React 19                             |
| Linguagem | TypeScript, modo `strict`                                      |
| Estilo    | Tailwind CSS v4 (tokens em `@theme`, sem `tailwind.config.js`) |
| Fontes    | `next/font/google`, self-hosted                                |
| Testes    | Vitest                                                         |
| Qualidade | ESLint + Prettier                                              |
| CI        | GitHub Actions                                                 |
| Deploy    | Vercel _(ainda não conectado — ver o roteiro)_                 |

Requer **Node 24** ou superior, a mesma versão usada no CI.

## Começando

```bash
npm install
npm run dev
```

A aplicação sobe em [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando                | O que faz                                           |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                         |
| `npm run build`        | Build de produção                                   |
| `npm run start`        | Serve o build de produção                           |
| `npm run lint`         | ESLint                                              |
| `npm run typecheck`    | Gera os tipos de rota do Next e roda `tsc --noEmit` |
| `npm test`             | Suíte de testes, uma passada                        |
| `npm run test:watch`   | Testes em modo watch                                |
| `npm run format`       | Aplica o Prettier                                   |
| `npm run format:check` | Verifica a formatação sem alterar arquivos          |

> `typecheck` encadeia `next typegen` porque o Next 16 gera tipos como `LayoutProps` durante
> o build. Sem esse passo, o `tsc` sozinho falha em `app/layout.tsx`.

## Estrutura

```
app/           Rotas, layout e CSS global (App Router)
components/    Interface — apenas DictationChecker.tsx é client component
lib/           Lógica pura de correção, com os testes ao lado
.github/       Pipeline de CI
docs/          Roteiro do projeto e regras de correção
```

A lógica de correção em `lib/` não toca no DOM e não monta HTML: ela devolve operações de
diff e a pontuação, e quem renderiza é o React. Isso é o que permite reaproveitá-la no
servidor quando o envio por email entrar (Fase 4), recalculando a nota em vez de confiar no
que o cliente mandar.

## Como a correção funciona

Em resumo: o texto é normalizado e quebrado em tokens, alinhado contra a referência por
subsequência comum mais longa, e cada desvio conta um erro — palavra errada, faltando ou
extra. A nota é a fração da referência reproduzida corretamente.

As regras completas, incluindo três bugs de correção que já foram consertados e não devem
voltar, estão em **[docs/MARKING.md](docs/MARKING.md)**.

## Integração contínua

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda em todo push no `main` e em todo
pull request, nesta ordem:

```
format:check → lint → typecheck → test → build
```

Para reproduzir o pipeline inteiro localmente antes de abrir um PR:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
```

## Roteiro

O projeto nasceu como três arquivos estáticos e está sendo migrado por fases. O que já foi
feito, o que vem a seguir e as decisões tomadas no caminho estão em
**[docs/ROADMAP.md](docs/ROADMAP.md)**.
