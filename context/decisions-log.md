# Log de Decisões

Registre cada decisão relevante para não repetir discussões nem perder o raciocínio.

## [AAAA-MM-DD] Título da decisão
**Contexto:** Por que essa decisão surgiu.
**Decisão:** O que foi decidido.
**Alternativas consideradas:** O que foi descartado e por quê.
**Consequências:** O que isso implica pra frente.

---

## [2026-09-23] Arquitetura e stack inicial do MVP
**Contexto:** A spec exige um app web leve para processar boletos em PDF, sem armazenar os arquivos originais, em um computador com Windows 10, 6 GB de RAM e Intel Core i5.
**Decisão:** Adotar um monólito modular em camadas, implementado em Node.js com TypeScript, Fastify, interface web simples, SQLite e Vitest. O processamento de PDF ocorrerá no backend, com arquivos em área temporária e descarte após o processamento. A autenticação usará sessões no backend e os dados serão sempre filtrados pelo usuário autenticado.
**Alternativas consideradas:** Frontend e backend separados, microsserviços, serviço externo de leitura de PDF, JWT e banco servidor. Foram descartados para o MVP por adicionarem processos, dependências, custo ou complexidade desnecessários.
**Consequências:** O MVP terá configuração local simples e baixo consumo de recursos. O processamento de lotes deverá usar limites de tamanho e quantidade, com baixa concorrência. A troca futura de SQLite ou da forma de autenticação poderá exigir uma decisão arquitetural posterior.

## [2026-09-23] Status vencido derivado
**Contexto:** A spec exige os status pendente, pago e vencido, mas também precisa manter uma conta paga como paga depois do vencimento.
**Decisão:** Persistir `pendente` e `pago`. Exibir `vencido` quando a conta estiver pendente e a data de vencimento já tiver passado. O status vencido não será persistido nem dependerá de rotina agendada.
**Alternativas consideradas:** Persistir os três status, executar rotina diária ou atualizar somente quando o usuário acessar. Foram descartadas para evitar inconsistência e processos adicionais.
**Consequências:** O status será calculado nas consultas e a data/hora de referência deverá ser tratada de forma consistente.

## [2026-09-23] Processamento parcial de lotes
**Contexto:** Um lote pode conter PDFs válidos e inválidos, e a falha de um arquivo não deve impedir o aproveitamento dos demais.
**Decisão:** Processar cada arquivo de forma independente e retornar o resultado individual de cada item do lote.
**Alternativas consideradas:** Uma transação única para todo o lote ou uma fila assíncrona. A primeira perderia resultados válidos em caso de falha; a segunda é complexa para o MVP.
**Consequências:** O usuário poderá revisar os arquivos válidos e corrigir ou reenviar somente os arquivos que falharam.

## [2026-09-23] Regras de conta, duplicidade e upload
**Contexto:** A implementação precisava de regras mínimas para autenticação, detecção de boletos repetidos e controle do consumo de memória durante o envio de lotes.
**Decisão:** Criar contas com e-mail e senha de no mínimo 8 caracteres, armazenada somente como hash seguro. Deixar recuperação de senha e confirmação de e-mail fora do MVP. Aceitar até 10 PDFs por lote, com limite de 5 MB por arquivo e 25 MB por lote, processados sequencialmente. Alertar duplicidades quando usuário, beneficiário, valor e vencimento coincidirem, permitindo que o usuário confirme ou cancele.
**Alternativas consideradas:** Exigir confirmação de e-mail no MVP, bloquear duplicidades automaticamente, permitir lotes sem limite e processar arquivos em paralelo. Foram descartadas por aumentarem o escopo, causarem falsos positivos ou elevarem o consumo de memória.
**Consequências:** O sistema terá limites explícitos de upload e poderá manter duplicatas legítimas quando o usuário confirmar. Recuperação de conta e confirmação de e-mail ficam planejadas para uma versão futura.
