# Regras de correção

Como o texto do aluno vira uma nota. Toda a lógica descrita aqui vive em
[`lib/diff.ts`](../lib/diff.ts) e [`lib/grade.ts`](../lib/grade.ts), é pura (sem DOM, sem
rede) e está coberta por testes em `lib/diff.test.ts` e `lib/grade.test.ts`.

## 1. Tokenização

`tokenise()` prepara os dois textos antes de qualquer comparação:

1. tudo em minúsculas — maiúscula errada não é penalizada;
2. aspas e apóstrofos tipográficos viram retos (`’` → `'`, `“” ` → `"`);
3. espaços em branco de qualquer tipo colapsam em um só;
4. o resultado é quebrado em tokens: palavras (`[a-z0-9']+`) e cada sinal de pontuação
   isolado.

Contrações permanecem inteiras: `don't` é **um** token, não três.

## 2. Alinhamento

`lcsAlign()` monta a tabela de subsequência comum mais longa entre os tokens da referência e
os do aluno, e percorre a tabela de volta produzindo uma lista de operações:

| Operação  | Significado        | Como aparece na tela            |
| --------- | ------------------ | ------------------------------- |
| `ok`      | igual à referência | texto normal                    |
| `replace` | palavra trocada    | vermelho, sublinhado ondulado   |
| `delete`  | palavra faltando   | verde, itálico, entre colchetes |
| `insert`  | palavra a mais     | dourado, sublinhado pontilhado  |

## 3. Pareamento de trocas

Uma tabela LCS só sabe apagar e inserir. Trocar uma palavra por outra apareceria, então,
como _palavra faltando_ seguida de _palavra extra_ — dois erros por um único deslize.

`mergeReplacements()` corre a lista e pareia sequências adjacentes de `delete` e `insert` em
`replace`, na ordem. O que sobrar continua como faltando ou extra:

```
referência: one two three four
aluno:      nine four
→ replace(one→nine), delete(two), delete(three), ok(four)
```

## 4. Contagem de erros

**Toda operação que não seja `ok` conta um erro** — errada, faltando ou extra.

Palavra extra passou a contar em [`c350282`](https://github.com/LuisFilipeAraujo/dictation-checker/commit/c350282);
antes disso um aluno podia inventar dez palavras e continuar com 100%.

## 5. Nota

```
nota % = máx(0, (tokens_da_referência − erros) / tokens_da_referência × 100)
```

O denominador é o tamanho da **referência**, não o do texto do aluno. Como extras contam
como erro mas não aumentam o denominador, um texto muito inflado pode produzir mais erros do
que tokens na referência — daí o piso em zero, sem o qual a nota ficaria negativa.

Faixas, em `lib/grade.ts`:

| Nota  | Faixa            | Rótulo         |
| ----- | ---------------- | -------------- |
| ≥ 85% | `excellent`      | Excellent      |
| ≥ 65% | `good`           | Good effort    |
| < 65% | `needs-practice` | Needs practice |

---

## Bugs já consertados — não reintroduzir

Os três apareceram na migração para Next.js e cada um tem teste de regressão. Se algum teste
abaixo começar a falhar, é sinal de que a correção foi desfeita.

### Apóstrofo tipográfico quebrava toda contração

Nove dos treze ditados de referência (118 a 126) usam `’`, 45 ocorrências no total. O
tokenizador antigo casava apenas o apóstrofo reto, e `’` não estava nem na classe de
palavras nem na de pontuação:

```
referência  don’t  →  ["don", "t"]     (2 tokens)
aluno       don't  →  ["don't"]        (1 token)
```

Como o teclado do aluno produz o apóstrofo reto, **toda contração desses nove ditados era
acusada como erro**, mesmo escrita corretamente. Resolvido pela normalização no passo 1 da
tokenização.

_Regressão:_ um teste parametrizado reescreve cada um dos nove ditados com apóstrofo reto e
exige 100%.

### O ramo `replace` era inalcançável

No algoritmo original, chegar ao ramo de substituição exigia `dp[i][j] === dp[i][j-1]`, mas
só se chegava lá quando `dp[i][j-1] < dp[i-1][j]` — condições que se contradizem. Na
prática a categoria _palavra errada_ nunca acontecia, e a tarja vermelha da legenda era
decoração. Resolvido pelo pareamento do passo 3.

### Palavras coladas no ditado 126

O texto de referência continha `Charlesdisguised`, `queen’spresence`, `correcttechnique`,
`racket.Then`, `pulledthe`, `measures toensure` e `antique,feeble`. Cada uma gerava um erro
que o aluno não cometeu. O texto foi revisado em [`lib/dictations.ts`](../lib/dictations.ts).

> Ao adicionar novos ditados, cole o texto e confira se não há palavras coladas. Um teste
> não pega isso: a referência é a fonte da verdade, então um erro nela vira um erro
> "legítimo" na correção.
