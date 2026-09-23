# Spec: Contas em Dia — Organização de Boletos

## 1. Problema
Pessoas físicas acumulam boletos em PDF e têm dificuldade para identificar quanto devem pagar e em qual data. O app deve permitir o envio de vários boletos, extrair seus dados principais e organizar as contas por mês e por vencimento.

A primeira versão será um app web com conta de usuário. Os arquivos PDF serão processados durante o envio e não serão armazenados. Somente os dados extraídos e confirmados pelo usuário poderão permanecer associados à sua conta.

## 2. Resultado esperado (Definition of Done)
- [ ] Usuário consegue criar uma conta e fazer login.
- [ ] Usuário consegue enviar vários PDFs em uma única operação.
- [ ] O sistema aceita PDFs com texto e rejeita ou informa claramente quando o arquivo não puder ser lido.
- [ ] O sistema extrai, quando disponíveis, descrição ou beneficiário, valor, vencimento, linha digitável ou código de barras, data de emissão e banco.
- [ ] O sistema apresenta os dados extraídos para conferência antes de salvá-los.
- [ ] Usuário consegue corrigir os dados extraídos antes da confirmação.
- [ ] Usuário consegue confirmar cada boleto e associá-lo à própria conta.
- [ ] O PDF original não é persistido após o processamento.
- [ ] As contas confirmadas aparecem agrupadas por mês de vencimento.
- [ ] Dentro de cada mês, as contas aparecem ordenadas pela data de vencimento.
- [ ] Cada conta possui um dos três status: pendente, pago ou vencido.
- [ ] Usuário consegue alterar o status de uma conta entre pendente e pago.
- [ ] O sistema identifica visualmente contas vencidas com base na data atual e no status.
- [ ] Usuário consegue visualizar os dados das próprias contas depois de sair e entrar novamente.
- [ ] Um usuário não consegue visualizar ou alterar contas pertencentes a outra conta de usuário.
- [ ] A aplicação funciona em ambiente de desenvolvimento compatível com Windows 10, 6 GB de RAM e Intel Core i5.

## 3. Fora de escopo
- Leitura de PDFs escaneados ou imagens.
- OCR.
- Pagamento de boletos dentro do app.
- Integração direta com bancos.
- Emissão de boletos.
- Controle financeiro completo.
- Contas compartilhadas entre usuários.
- Aplicativo mobile nativo.
- Notificações por e-mail, SMS, WhatsApp ou push.
- Armazenamento dos arquivos PDF originais.

Funcionalidades planejadas para versões futuras:
- Recuperação de senha.
- Confirmação de e-mail.

## 4. Restrições técnicas
- Stack: Node.js com TypeScript, Fastify, interface web simples, SQLite e Vitest.
- O sistema deve ser um app web.
- A solução deve usar poucas dependências e consumir pouca memória e CPU.
- A leitura deve funcionar somente para PDFs que contenham texto selecionável.
- Os dados persistidos devem ser vinculados ao usuário autenticado.
- O processamento deve evitar manter o PDF em armazenamento permanente.
- A linha digitável ou o código de barras extraído deve ser tratado como dado sujeito a conferência manual; o sistema não deve considerar a extração automaticamente correta.
- A arquitetura deve separar autenticação, processamento dos boletos, regras de negócio e persistência quando a stack for definida.
- A leitura do texto do PDF será executada no backend, com arquivo temporário descartável.
- A conta será criada com e-mail e senha de no mínimo 8 caracteres; a senha será armazenada somente como hash seguro.
- Recuperação de senha e confirmação de e-mail ficam fora do MVP.
- Cada envio aceitará no máximo 10 PDFs, com até 5 MB por arquivo e 25 MB por lote.
- Os arquivos do lote serão processados sequencialmente para reduzir picos de memória.

## 5. Casos de borda
- PDF sem texto selecionável.
- Arquivo que não é PDF, está corrompido ou está protegido por senha.
- PDF que contém mais de um boleto.
- Envio de vários arquivos com alguns válidos e outros inválidos.
- PDF em que o sistema não encontra a data de vencimento.
- Valor, beneficiário ou linha digitável ausente ou ambíguo.
- Data extraída em formato inválido ou impossível.
- Boleto duplicado enviado mais de uma vez.
- Boleto com vencimento no mês anterior ou posterior ao mês atual.
- Conta marcada como paga antes do vencimento.
- Conta pendente cuja data de vencimento já passou.
- Falha durante o processamento de apenas um arquivo do lote.
- Usuário tentando acessar dados de outro usuário.
- Sessão expirada durante o envio ou a confirmação dos dados.
- Usuário fechando a página antes de confirmar os dados extraídos.

## 6. Exemplos de entrada/saída
```text
Entrada:
  boleto_energia.pdf

Dados extraídos para conferência:
  beneficiário: Companhia de Energia Exemplo
  valor: R$ 184,70
  vencimento: 2026-10-15
  linha digitável: identificada para conferência
  status inicial: pendente

Após confirmação:
  Outubro de 2026
    15/10/2026 — Companhia de Energia Exemplo — R$ 184,70 — pendente
```

```text
Entrada:
  lote com 3 PDFs, sendo 2 legíveis e 1 PDF escaneado

Saída:
  2 boletos disponíveis para conferência
  1 arquivo marcado como não processado, com orientação de que PDFs escaneados
  não são aceitos na primeira versão
```

## 7. Perguntas abertas
Não há perguntas abertas bloqueadoras para o MVP.
