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

**O comando que importa antes de abrir um PR:**

```bash
npm run verify
```

Ele roda o portão inteiro — formatação, lint, tipos, testes e build — na mesma ordem do CI,
parando no primeiro que falhar.

### Desenvolvimento

| Comando              | O que faz                           |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento         |
| `npm run build`      | Build de produção                   |
| `npm run start`      | Serve o build de produção           |
| `npm run clean`      | Apaga `.next/` e `coverage/`        |
| `npm run test:watch` | Testes em modo watch, durante o TDD |

### Verificação

| Comando                 | O que faz                                              |
| ----------------------- | ------------------------------------------------------ |
| `npm run verify`        | Tudo abaixo, em sequência — o portão do CI             |
| `npm run format:check`  | Verifica a formatação sem alterar arquivos             |
| `npm run lint`          | ESLint                                                 |
| `npm run typecheck`     | Gera os tipos de rota do Next e roda `tsc --noEmit`    |
| `npm test`              | Suíte de testes, uma passada                           |
| `npm run test:coverage` | Testes com cobertura; detalhe por linha em `coverage/` |
| `npm run audit`         | `npm audit`, falhando em severidade alta ou crítica    |

### Correção automática

| Comando            | O que faz                                 |
| ------------------ | ----------------------------------------- |
| `npm run format`   | Aplica o Prettier                         |
| `npm run lint:fix` | Aplica as correções automáticas do ESLint |

Duas notas sobre escolhas que não são óbvias:

> `typecheck` encadeia `next typegen` porque o Next 16 gera tipos como `LayoutProps` durante
> o build. Sem esse passo, o `tsc` sozinho falha em `app/layout.tsx`.

> `audit` usa `--audit-level=high` de propósito. Um aviso moderado numa dependência
> transitiva de desenvolvimento não deve travar um merge; alto ou crítico, sim.

A cobertura é medida apenas sobre `lib/`, onde vivem as regras de correção. A interface é
verificada dirigindo a aplicação de verdade, não por contagem de linhas.

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
pull request, em dois jobs paralelos:

| Job      | O que roda                                          |
| -------- | --------------------------------------------------- |
| `verify` | `format:check → lint → typecheck → test → build`    |
| `audit`  | `npm audit`, falhando em severidade alta ou crítica |

O `verify` restaura `.next/cache` entre execuções com `actions/cache`. O Next compartilha um
cache de build nesse diretório; sem persistí-lo, todo build parte do zero e o Next reporta
"No Cache Detected".

O `audit` é um job separado de propósito: um aviso de segurança novo numa dependência não
tem relação com a qualidade do código do PR, e separá-lo deixa claro qual dos dois falhou.

Para reproduzir tudo localmente antes de abrir um PR: `npm run verify`.

O workflow declara `permissions: contents: read` e fixa as actions por SHA de commit, não
por tag — uma tag pode ser reapontada por quem controla a action. O
[Dependabot](.github/dependabot.yml) mantém os pins e as dependências npm atualizados.

## Segurança e dados

Hoje a aplicação não armazena nada: tudo roda no navegador e some ao recarregar a página.
A partir da Fase 5 o histórico do aluno guarda id, nome, email, pontuação, erros e data.

O que é coletado e por quê, como relatar uma falha e as regras que as próximas fases
precisam cumprir antes de entrar estão em **[SECURITY.md](SECURITY.md)**.

## Roteiro

O projeto nasceu como três arquivos estáticos e está sendo migrado por fases. O que já foi
feito, o que vem a seguir e as decisões tomadas no caminho estão em
**[docs/ROADMAP.md](docs/ROADMAP.md)**.
