# Grill — Contas em Dia

## Ideia inicial
Criar um app web para pessoas físicas enviarem boletos em PDF. O app deve ler os dados principais de cada boleto e organizar as contas por mês e por data de vencimento.

## Por que isso é fraco / o que falta
- Ainda não está definido quais tipos de PDF serão aceitos: PDF com texto, PDF escaneado ou ambos.
- A leitura pode falhar quando o boleto estiver desfocado, protegido ou em um formato incomum.
- Ainda não está definido se o usuário poderá corrigir dados extraídos incorretamente.
- Organizar por mês e vencimento resolve a visualização, mas ainda falta decidir quais informações ajudam o usuário a controlar as contas.

## O que mudaria o jogo
- Extração automática dos dados do boleto com revisão e correção manual pelo usuário.
- Visão mensal clara, ordenada por vencimento, mostrando contas próximas do vencimento e contas atrasadas.
- Busca e filtros por período, status e descrição.
- Avisos visuais para vencimentos próximos, sem transformar a primeira versão em um sistema bancário.

## Público inicial
Pessoas físicas que recebem ou acumulam boletos em PDF e precisam saber o que vence em cada mês.

## Fluxo principal imaginado
1. Usuário acessa o app web.
2. Usuário envia um ou mais PDFs.
3. App tenta identificar descrição, valor, data de vencimento e linha digitável ou código de barras.
4. App mostra os dados extraídos para conferência.
5. Usuário corrige ou confirma os dados.
6. Boleto aparece organizado por mês e em ordem de vencimento.

## Dados que o app deve tentar extrair
- Descrição ou nome do beneficiário
- Valor
- Data de vencimento
- Linha digitável ou código de barras
- Data de emissão, quando disponível
- Banco ou instituição, quando disponível

## Decisões técnicas em aberto
- [x] O app aceitará apenas PDFs com texto ou também PDFs escaneados? → **Decisão:** Apenas PDFs com texto na primeira versão.
- [x] Será necessário OCR para imagens? → **Decisão:** Não na primeira versão.
- [x] Os boletos ficarão salvos permanentemente ou poderão ser excluídos pelo usuário? → **Decisão:** Os arquivos PDF não serão salvos. Apenas os dados extraídos e confirmados poderão ser armazenados.
- [x] Haverá login de usuário? → **Decisão:** Sim, o usuário deverá criar uma conta e fazer login.
- [x] Os dados serão armazenados localmente ou em um servidor? → **Decisão:** Os dados confirmados ficarão associados à conta do usuário no servidor; os PDFs originais não serão persistidos.
- [x] O usuário poderá importar vários PDFs de uma vez? → **Decisão:** Sim.
- [x] Quais status existirão: pendente, pago, vencido e cancelado? → **Decisão:** Três status: pendente, pago e vencido.
- [x] O app terá notificações ou apenas organização visual na primeira versão? → **Decisão:** Apenas organização visual na primeira versão.
- [ ] A leitura será feita no navegador, no backend ou em um serviço externo? → **Decisão:**

## Restrições do ambiente de desenvolvimento
O desenvolvimento deve considerar Windows 10, 6 GB de RAM e Intel Core i5. A solução deve priorizar poucas dependências, baixo consumo de memória e execução local simples. OCR e serviços pesados devem ser avaliados com cuidado.

## Fora de escopo inicial
- Pagamento de boletos dentro do app
- Integração direta com bancos
- Emissão de boletos
- Controle financeiro completo
- Contas compartilhadas entre vários usuários
- Aplicativo mobile nativo
- Notificações por SMS ou WhatsApp

## Riscos principais
- PDFs escaneados exigem OCR e podem gerar erros de leitura.
- Boletos de diferentes bancos têm layouts variados.
- Dados financeiros exigem cuidado com privacidade, armazenamento e exclusão.
- Linha digitável extraída com um dígito errado pode causar problemas; o valor deve ser sempre conferido pelo usuário.

## Pronto para virar spec?
- [x] Sim — mover conteúdo relevante para `/specs/contas-em-dia.md`
- [ ] Ainda não — decidir suporte a OCR, login, armazenamento e revisão dos dados
