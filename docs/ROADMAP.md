# Roteiro do projeto

O projeto começou como três arquivos estáticos — `index.html`, `style.css` e `app.js`, com
toda a lógica numa função que lia o DOM, montava HTML por concatenação de strings e escrevia
o resultado de volta. Sem build, sem tipos, sem testes, sem CI e sem servidor, o que
inviabilizava tanto o envio por email quanto qualquer forma de cadastro.

A migração está sendo feita em fases. Este documento registra o que já foi entregue, o que
vem a seguir e as decisões tomadas no caminho.

## Decisões

| Decisão         | Escolha                    | Por quê                                                                                                            |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Hospedagem      | Vercel                     | API routes nativas: email e login não exigem reescrever a arquitetura. O Actions cuida do CI; a Vercel, do deploy. |
| Envio por email | Professor + cópia ao aluno | Relatório vai para um endereço fixo de professor; o aluno recebe cópia se informar o email.                        |
| Cadastro        | Aluno com histórico        | Cada aluno acompanha os próprios ditados e sua evolução — exige Postgres e um modelo de tentativas.                |

## Fases

### ✅ Fase 0 — Scaffold e ferramental

Next.js + TypeScript `strict` + Tailwind v4 + ESLint + Prettier + Vitest, e o pipeline do
GitHub Actions já nesta fase, para que toda fase seguinte nascesse protegida.

### ✅ Fase 1 — Lógica pura e testes

Extração da lógica para `lib/`, sem dependência de DOM: `tokenise`, `lcsAlign`,
`compareDictation` e `gradeFor`. A função `escHtml` do código antigo foi deletada em vez de
portada — o React escapa sozinho.

**Três bugs de correção foram consertados aqui**, documentados em [MARKING.md](MARKING.md).
O mais grave acusava erro em toda contração de nove dos treze ditados.

### ✅ Fase 2 — Interface em React + Tailwind

Porte da interface preservando a identidade britânica: mesma paleta, mesma tipografia, mesmo
layout. Os tokens de cor viraram `@theme` em `app/globals.css`; as fontes passaram a
`next/font`, self-hosted, eliminando a requisição ao Google Fonts. Os três `alert()` de
validação viraram mensagens inline com `role="alert"` e `aria-invalid`.

Restaram apenas dois blocos de CSS próprio, por não se expressarem bem como utilitários: o
fundo pergaminho pautado e a barra de içamento da Union Flag.

A paridade visual foi conferida com screenshots das duas versões, e o estado de resultados
foi validado dirigindo a aplicação com Playwright: ditado 118 com uma palavra trocada, uma
omitida e uma a mais produziu exatamente 3 erros e 98%.

### ⬜ Fase 3 — Deploy

- [ ] Conectar `LuisFilipeAraujo/dictation-checker` à Vercel — **passo manual, no dashboard**
- [ ] Produção no `main`, preview automático por pull request
- [ ] Branch protection no `main` exigindo o check do CI
- [ ] Manter o `build` no `ci.yml` — ver a nota abaixo

**Sobre a duplicação de build.** O `ci.yml` roda `next build` e a Vercel constrói de novo a
cada push. A integração via Git sempre constrói: não há como deixar a Vercel "só com o
deploy" sem trocar para `vercel build` + `vercel deploy --prebuilt` disparados pelo Actions.

A duplicação é aceitável e o build fica no CI, por dois motivos:

1. **As cotas são separadas.** Tirar o build do Actions pouparia minutos do GitHub, não da
   Vercel. E como este repositório é público, minutos de Actions são gratuitos e ilimitados
   — não há nada a economizar.
2. **A branch protection depende desse check.** Um PR que passa no typecheck mas quebra no
   build não deveria ser mergeável.

No plano Hobby a Vercel constrói um projeto por vez, então pushes em sequência entram em
fila. Se isso passar a incomodar, a saída é mover o build para o Actions e publicar com
`vercel deploy --prebuilt`, e aí a Vercel de fato só recebe o artefato pronto.

### ⬜ Fase 4 — Envio por email

- [ ] `app/api/send-result/route.ts` (POST), corpo validado com Zod
- [ ] **O servidor recalcula o diff** com `lib/diff.ts` a partir do texto enviado — a nota
      nunca vem do cliente, senão qualquer um forja um resultado perfeito
- [ ] Resend + React Email para o template do relatório
- [ ] Professor sempre; aluno em cópia apenas se informar o email
- [ ] Rate limit por IP com Upstash Redis — o formulário aceita qualquer endereço digitado e
      fica exposto na internet
- [ ] Botão de envio no card de resultados, com estados de carregando/enviado/erro

Variáveis de ambiente: `RESEND_API_KEY`, `TEACHER_EMAIL`, `UPSTASH_*`.

### ⬜ Fase 5 — Cadastro e histórico

- [ ] Supabase (Postgres + Auth no mesmo serviço, menos cola que Auth.js + banco separado)
- [ ] Tabelas `students` e `attempts` (ditado, texto enviado, erros, percentual, diff, data)
- [ ] Login por magic link — o aluno já informa o email na Fase 4
- [ ] Página `/historico` com as tentativas e a evolução do percentual
- [ ] Row Level Security **ativo antes da primeira linha real entrar na tabela**, e testado
      com dois alunos distintos
- [ ] Caminho de remoção de conta junto com o cadastro, não depois

As condições de segurança que as Fases 4 e 5 precisam cumprir antes de entrar estão em
[SECURITY.md](../SECURITY.md), com a justificativa de cada uma.

## Pendências externas

Dependem de contas e não podem ser feitas a partir do repositório:

1. Conectar o repositório à Vercel — Fase 3
2. Conta na Resend e domínio remetente verificado — Fase 4
3. Projeto no Upstash — Fase 4
4. Projeto no Supabase — Fase 5
5. Cadastrar as variáveis de ambiente na Vercel

O `gh` CLI não está instalado na máquina de desenvolvimento, então a criação de PRs e a
branch protection são feitas pela interface do GitHub.

## Desvios em relação ao plano original

Registrados porque mudam o que está no repositório:

- **`create-next-app` recusa diretório não vazio.** O scaffold foi gerado à parte e copiado;
  os arquivos antigos passaram por uma pasta `legacy/`, usada como referência visual durante
  a Fase 2 e removida ao final dela. O original continua recuperável em
  [`9079bb9`](https://github.com/LuisFilipeAraujo/dictation-checker/commit/9079bb9).
- **`@types/node` subiu de `^20` para `^24`.** O Vitest 5 exige `>=22`; a versão foi alinhada
  ao Node realmente em uso, em vez de forçar `--legacy-peer-deps`.
- **`typecheck` encadeia `next typegen`.** Sem isso o `tsc` falha em tipos que o Next 16 só
  gera durante o build.
- **Menos CSS próprio que o previsto.** Os sublinhados ondulado e pontilhado do diff saíram
  como utilitários do Tailwind (`decoration-wavy`, `decoration-dotted`).
- **Palavra extra passou a contar como erro**, decidido durante a Fase 1 e não previsto no
  plano inicial. Ver [MARKING.md](MARKING.md).
