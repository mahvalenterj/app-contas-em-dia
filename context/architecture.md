# Arquitetura do Projeto

> Preencha isto antes de começar a codar. É a "memória" que qualquer IA deve ler primeiro.

## Visão geral
O sistema é um app web para pessoas físicas enviarem boletos em PDF com texto selecionável. O backend processa os arquivos temporariamente, extrai os dados principais e apresenta os resultados para conferência antes de salvar. Apenas os dados confirmados ficam associados ao usuário; os PDFs originais são descartados. As contas confirmadas são organizadas por mês, vencimento e status.

## Camadas / módulos
| Camada | Responsabilidade | Pasta |
|---|---|---|
| Controller/Route | Recebe requisições web, autentica a sessão e valida entradas básicas | `src/routes/` |
| Service | Processa PDFs, extrai dados, aplica regras de contas e calcula status vencido | `src/services/` |
| Repository/Data | Persiste usuários e dados confirmados dos boletos no SQLite | `src/repositories/` |

## Padrões arquiteturais adotados
- Monólito modular em camadas.
- Separação entre rotas, serviços e repositórios.
- Processamento de lote com resultado independente por arquivo.
- PDFs mantidos somente em área temporária durante o processamento.

## Diagrama (descrição textual)
Fluxo principal: Navegador → Route → Service de autenticação/processamento/contas → Repository → SQLite

Fluxo de PDF: Upload temporário → validação → extração de texto → dados para conferência → confirmação → persistência dos dados → descarte do PDF

## Integrações externas
- API/serviço: Nenhuma na primeira versão.
- Autenticação: Sessão no backend, senha armazenada somente como hash forte e autorização por usuário em toda consulta e alteração.
