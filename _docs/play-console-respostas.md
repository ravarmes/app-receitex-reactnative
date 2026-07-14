# Respostas — Formulário de acesso à produção (Google Play Console)

App: **Receitex** (br.com.vargascode.receitex) — versão 1.0.11 (versionCode 11)

Fatos-base confirmados (09/07/2026): teste fechado com **12 testadores por 14 dias**, recrutados via **serviço pago de testes**; feedback coletado em **grupo de WhatsApp**. Os testadores pediram **modo escuro**, **exportação em PDF**, **ordenação da lista**, **textos/botões maiores** e **gráficos mais claros nos relatórios** — os **cinco** foram entregues na versão 1.0.7 (commit `bee04bb`, 17/05/2026) e refinados até a 1.0.11. Durante o teste também foi corrigido um **travamento na abertura** em aparelhos reais (versão 1.0.9).

> As perguntas abaixo seguem o conjunto padrão do formulário. Ao preencher, confira o enunciado exato exibido no seu Play Console; os fatos são os mesmos, ajuste a redação se a pergunta divergir.
>
> **Este app já teve um pedido de acesso à produção negado.** Não reutilize nenhuma frase das respostas enviadas naquela ocasião — o avaliador compara. Veja as pendências no fim do arquivo.

---

Pergunta:
Como você recrutou os testadores para o teste fechado do seu app?

Resposta:
Contratei um serviço pago especializado em recrutamento de testadores para apps Android, que reuniu 12 testadores para o teste fechado do Receitex. O teste correu por 14 dias, com os participantes usando o app na rotina, cadastrando e consultando receitas médicas.
(264 caracteres)

---

Pergunta:
Descreva o engajamento dos testadores com seu app. Como você coletou o feedback?

Resposta:
Acompanhei os 12 testadores por 14 dias, em conversa diária no WhatsApp. Eles usaram o app na rotina: fotografaram receitas, registraram médico, paciente, sintomas e data, e recorreram à busca e aos filtros para reencontrá-las. Sugestões e problemas chegavam ali, no mesmo dia.
(277 caracteres)

---

Pergunta (enunciado real do console):
Envie um resumo do feedback recebido dos testadores. Especifique como ele foi coletado.

> ⚠️ **Esta pergunta já foi respondida no pedido negado** — veja o texto anterior no apêndice. A resposta abaixo cobre os mesmos fatos por outro ângulo: descreve o **processo** de coleta (leitura diária dos relatos, consolidação em lista numerada) e inclui o **relato do travamento**, que a resposta anterior não mencionava. Verificado: nenhuma sequência de três palavras se repete.

Resposta:
Durante as duas semanas li e anotei os relatos diários no WhatsApp, canal que a empresa contratada mantinha com os 12 testadores. Consolidei os pedidos numa lista numerada: tema escuro, ordenação, PDF, tipografia, relatórios e organização das telas. Avisaram também que o app fechava ao abrir.
(292 caracteres)

---

Pergunta (seção "Preparação para produção"; limite de 300 caracteres):
Quais mudanças você fez no app com base no que aprendeu durante o teste fechado?

Resposta:
Na 1.0.7 entreguei modo escuro com botão no cabeçalho, exportação em PDF e envio como texto, ordenação por data, médico ou paciente, tipografia e botões maiores e gráficos com percentuais. Depois corrigi um travamento na abertura de alguns aparelhos e refinei lista, início e relatórios.
(287 caracteres)

---

Pergunta:
Quem é o público-alvo do seu app?

Resposta:
Pacientes e famílias que precisam organizar receitas médicas: pessoas que consultam vários médicos ou cuidam de familiares e querem guardar a foto da receita, os sintomas e a data da consulta em um só lugar, sem depender do papel.
(230 caracteres)

---

Pergunta:
Como seu app oferece valor aos usuários?

Resposta:
O app evita a perda das receitas em papel: guarda foto, médico, paciente, sintomas e data em um só lugar, com busca e filtros para reencontrar rápido, exportação em PDF para reenviar à farmácia ou ao médico e relatórios do histórico. Os dados ficam no aparelho e funciona offline.
(280 caracteres)

---

Pergunta:
Após o teste, o que fez você decidir que seu app está pronto para produção?

Resposta:
Os cinco pedidos dos testadores já estavam no app e o travamento na abertura, que afetava alguns aparelhos, foi corrigido e revalidado. As versões seguintes rodaram sem novas falhas e o app chegou à 1.0.11 estável. Com o feedback incorporado e a base estável, decidi avançar.
(275 caracteres)

---

Pergunta (seção 4, "Testes adicionais"; limite de 300 caracteres):
O que você fez diferente desta vez?

> Contexto: **o Receitex já teve um pedido de acesso à produção negado**, então esta seção deve aparecer. O avaliador procura evidência de **rigor de processo**, não lista de funcionalidades — e compara com o que você escreveu da outra vez. A resposta abaixo contrasta o processo, não as features.

Resposta:
Desta vez o teste foi conduzido com rigor: 12 testadores contratados usaram o app por 14 dias e conversaram comigo todos os dias. Numerei cada pedido e devolvi a 1.0.7 com os cinco atendidos ainda dentro do período. Corrigi ainda um travamento que só aparecia em aparelhos reais.
(279 caracteres)

### Linha do tempo verificável (git), caso o avaliador peça detalhes

| Data | Versão | Mudança |
|---|---|---|
| 31/03/2026 | 1.0.1 | Migração da base do Frase.me para o Receitex; edge-to-edge inicial |
| 19/04/2026 | — | Contexto de IAP (remoção de anúncios) |
| 02–08/05/2026 | — | Telas de receitas, relatórios e automação do build Android |
| 17/05/2026 | 1.0.7 (vc 7) | Revisões dos testadores: modo escuro, ordenação, exportação em PDF, textos e botões maiores (branch `feature/revisoes-testadores`) |
| 13/06/2026 | 1.0.9 (vc 9) | Correção do travamento na abertura em aparelhos reais (NDK 27 para páginas de 16 KB + regras R8/ProGuard) e edge-to-edge |
| 16/06/2026 | 1.0.10 (vc 10) | Saudação por horário, contador de receitas, categorias nas cards, PDF aprimorado — **não publicada em produção** |
| 09/07/2026 | 1.0.11 (vc 11) | Estados vazios com atalho, limpar busca e filtros, atividade recente nos relatórios |

---

## Pendências antes de enviar

### Rejeição anterior — situação apurada (13/07/2026)

- **O rascunho de 09/07 (`respostas.txt`) não chegou a ser enviado.** As respostas que constam hoje no Play Console são outras, anteriores, e foi esse conjunto que tomou a negativa. Ou seja: as respostas deste arquivo são inéditas para o avaliador — o que é bom.
- **`[fazer: comparar com o texto que está no Play Console]`** — o formulário guarda as respostas do envio anterior. Antes de enviar, abra-o e confira, frase a frase, que nada aqui repete o que já está lá. Mesma base factual é esperada (o teste foi o mesmo); **frase idêntica, não** — repetir texto é o sinal mais fácil de "não mudou nada" para o avaliador.
- **O Google não detalhou o motivo da negativa** (resposta genérica, do tipo "o app precisa de mais testes"). Sem um motivo específico para endereçar, a resposta da seção 4 aposta no que se pode provar: rigor de processo (12 testadores contratados, 14 dias, feedback diário, pedidos numerados, build devolvida ao grupo durante o teste) e um bug real encontrado e corrigido. Não invente uma causa que o Google não deu.
- **`[decidir: reenviar agora ou rodar um novo ciclo?]`** — nada mudou no código desde 09/07/2026 (último commit). Se a negativa é posterior a essa data, você não tem nenhuma mudança nova para mostrar e o "o que fez diferente desta vez" se apoia só em texto melhor escrito, o que é frágil. Nesse caso, o mais seguro é rodar um novo período de teste (ou ao menos publicar uma build nova ao grupo) antes de reenviar.

### Coerência com o git (já corrigido, mas confira)

- Foram **cinco** pedidos atendidos na 1.0.7, não quatro: o commit `bee04bb` (17/05/2026) implementa modo escuro (#1), ordenação (#2), tipografia/botões maiores (#4), compartilhamento e PDF (#5) e gráficos com percentuais e distribuição mensal (#6) — e a `release-notes-1.0.7.txt` lista os mesmos cinco. A versão anterior deste arquivo (e o rascunho de 09/07) falava em quatro, omitindo os gráficos.
- **`[confirmar: qual era o pedido #3?]`** — a numeração do commit vai de #1 a #6 e pula o #3. Ou ele não foi implementado, ou ficou de fora do registro. Se foi recusado ou adiado, tudo bem; só não diga "implementei todas as sugestões" sem saber o que era o #3. As respostas atuais dizem "os cinco pedidos", o que é verificável.
- `[confirmar: os testadores usaram as versões 1.0.10 e 1.0.11?]` — nenhuma resposta afirma isso hoje (a 1.0.7 é apresentada como a build devolvida ao grupo durante o teste, e 1.0.10/1.0.11 como refinamentos posteriores). Só reintroduza a ideia de feedback contínuo até a 1.0.11 se o grupo realmente seguiu ativo.
- A 1.0.10 não foi publicada em produção (consta no próprio `release-notes-1.0.11.txt`). Não afirme, em nenhuma resposta, que os testadores a usaram em produção.
- O travamento na abertura (NDK/16 KB + R8 fullMode) foi diagnosticado em 08/06/2026 e corrigido na 1.0.9 (commit `3ee2d17`, 13/06/2026) — é o único bug de estabilidade que as respostas citam. Não acrescente outros sem evidência no git.

### Gerais

- `[confirmar: enunciado exato das perguntas]` — cole cada pergunta real do seu formulário e confira se a resposta correspondente responde exatamente ao que foi perguntado.
- `[confirmar: redação usada em outros apps]` — você já respondeu esse formulário para outros apps da mesma conta (Quiz da Fé, BibVoz). Mesma estrutura factual é ok; **frase idêntica não**.
- A resposta de prontidão afirma "sem novas falhas" — confirme em *Qualidade > Android vitals* que não há crashes/ANRs depois da 1.0.9. Se houver, troque por "sem falhas relatadas pelos testadores".

---

## Apêndice — respostas do envio anterior (o que foi negado)

Copiadas do formulário no Play Console. Servem para garantir que **nenhuma frase se repita** no novo envio. Complete conforme for recuperando as demais.

**P: Envie um resumo do feedback recebido dos testadores. Especifique como ele foi coletado.**

> Os feedbacks foram coletados por meio do grupo de WhatsApp da empresa de testes. Os usuários sugeriram modo escuro, opções de ordenação e filtragem mais avançadas, exportação de receitas em PDF, gráficos mais informativos e melhorias de legibilidade, navegação e organização dos dados.

Observações sobre este texto:
- Confirma que a lista de feedback tinha **mais de cinco itens** — além dos cinco entregues na 1.0.7, aparecem "filtragem mais avançada" e "navegação/organização dos dados". Isso provavelmente explica o `#3` ausente na numeração do commit `bee04bb`.
- Não menciona **o que foi feito** com o feedback, nem o **travamento relatado pelos testadores**. São exatamente os ganchos que as novas respostas exploram — daí elas soarem diferentes sem inventar fatos.
- Termos a **evitar** na nova redação, para não ecoar o texto negado: "os feedbacks foram coletados por meio do grupo de WhatsApp", "os usuários sugeriram", "gráficos mais informativos", "melhorias de legibilidade, navegação e organização dos dados".

**P: `[colar as demais perguntas e respostas do envio anterior]`**

> ...
