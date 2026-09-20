# Política de segurança

Este é um projeto de uso pessoal por estudantes, sem fins lucrativos e sem uso comercial.
A política abaixo é proporcional a isso: cobre o que o projeto realmente faz, não um teatro
de conformidade.

## Relatar uma vulnerabilidade

Use o canal privado do GitHub: **Security → Report a vulnerability**, no repositório.

Não abra issue pública para falhas de segurança. Issues são visíveis a qualquer pessoa, e
uma falha descrita ali fica explorável até ser corrigida.

> Se o relato privado ainda não estiver habilitado, ative em
> _Settings → Code security → Private vulnerability reporting_.

## Dados pessoais

### Hoje

**Nenhum dado é armazenado.** A aplicação roda inteiramente no navegador: o nome e o texto
digitados existem apenas na memória da aba e desaparecem ao recarregar a página. Não há
banco de dados, cookies, `localStorage`, analytics nem qualquer requisição a serviços
externos.

### A partir da Fase 4 (envio por email)

O relatório de correção passa pelo servidor para ser enviado. O texto do aluno e o endereço
de email trafegam, mas não são persistidos nessa fase.

### A partir da Fase 5 (cadastro e histórico)

| Campo       | Por que existe                            |
| ----------- | ----------------------------------------- |
| `id`        | Identificador da tentativa e do aluno     |
| `nome`      | Identificar o aluno no relatório          |
| `email`     | Login por magic link e envio do resultado |
| `pontuação` | Acompanhar a evolução                     |
| `erros`     | Acompanhar a evolução                     |
| `criado_em` | Ordenar o histórico                       |

**Não são coletados:** senha (o login é por magic link, sem senha), endereço IP em banco,
dados de navegação, analytics, cookies de rastreamento ou qualquer dado além da tabela
acima.

### Retenção e remoção

O histórico existe para o aluno acompanhar a própria evolução, e só enquanto ele quiser.
Um pedido de remoção deve apagar as tentativas e o cadastro — não anonimizar, apagar.

Como o projeto lida com dados de estudantes, possivelmente menores de idade, a regra é
coletar o mínimo que faz a funcionalidade existir. Qualquer campo novo precisa justificar
por que a aplicação não funciona sem ele.

## Decisões de segurança já tomadas

**A correção não constrói HTML.** A versão original montava o resultado por concatenação de
strings e o escrevia via `innerHTML`, com uma função de escape que não tratava aspas duplas
e cujo resultado ia parar dentro de um atributo HTML. Essa função foi removida, não portada:
o React renderiza os tokens como elementos e escapa sozinho. O vetor deixou de existir por
construção, não por sanitização.

**O CI não recebe permissão de escrita.** O workflow declara `permissions: contents: read`.
Nenhum passo usa o `GITHUB_TOKEN`.

**As actions são fixadas por SHA de commit,** não por tag — uma tag pode ser reapontada por
quem controla a action. O Dependabot mantém os pins atualizados.

**As dependências são auditadas a cada push e PR,** em job próprio, falhando em severidade
alta ou crítica.

## Regras para as próximas fases

Estas não são sugestões; são condições para as fases entrarem.

### Fase 4 — envio por email

- [ ] **O servidor recalcula a nota** a partir do texto recebido, usando `lib/diff.ts`. A
      pontuação nunca vem do cliente — caso contrário qualquer um forja um resultado
      perfeito com uma requisição manual.
- [ ] Corpo da requisição validado com Zod, incluindo o formato do email.
- [ ] Rate limit por IP. O formulário aceita qualquer endereço digitado e fica exposto na
      internet: sem limite, ele vira ferramenta de spam em nome do domínio remetente, o que
      queima a reputação de envio.
- [ ] Segredos apenas em variáveis de ambiente na Vercel. Nada de `RESEND_API_KEY` no
      repositório — `.env*` está no `.gitignore` e deve continuar.

### Fase 5 — cadastro e histórico

- [ ] **Row Level Security ativo no Supabase antes da primeira linha real entrar na tabela.**
      RLS esquecido é a falha mais comum dessa stack: sem ele, a chave anônima do cliente lê
      a tabela inteira, e o histórico de todos os alunos fica exposto a qualquer um que abra
      o DevTools.
- [ ] Política de RLS testada com dois alunos distintos, confirmando que nenhum enxerga as
      tentativas do outro.
- [ ] Apenas a chave anônima no cliente. A `service_role` ignora RLS e nunca deve sair do
      servidor.
- [ ] Caminho de remoção de conta implementado junto com o cadastro, não depois.
