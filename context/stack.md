# Stack Técnica

## Linguagens
- TypeScript em ambiente Node.js.
- HTML, CSS e JavaScript no navegador.

## Frameworks / Bibliotecas
- Backend: Fastify, com renderização/entrega da interface pelo próprio monólito.
- PDFs: biblioteca de extração de texto para PDFs, executada no backend.
- Autenticação: sessões no backend e biblioteca de hash de senha compatível com o ambiente.
- Testes: Vitest.
- Banco de dados: SQLite.

## Ferramentas de versionamento e CI
- Git flow adotado: branches curtas por mudança, sem criar complexidade além do necessário para o MVP.
- CI/CD: validação local com testes e lint; pipeline será definido quando houver ambiente remoto.

## Convenções de código
- Nomenclatura: nomes descritivos, TypeScript estrito e funções pequenas por responsabilidade.
- Estrutura de pastas: `src/routes/`, `src/services/`, `src/repositories/`, `src/domain/`, `src/lib/` e `tests/`.
- Estilo de commits: Conventional Commits.
- Restrição de execução: evitar serviços locais adicionais, containers e dependências pesadas para preservar recursos no Windows 10 com 6 GB de RAM.
