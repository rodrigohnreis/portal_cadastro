# Plano de Correção da Funcionalidade de Relatórios

## Problemas Identificados

1. **Erro no JavaScript de relatórios**: O arquivo `relatorios.js` está tentando renderizar dados incorretos
2. **Incompatibilidade entre backend e frontend**: O backend retorna dados agrupados, mas o frontend espera dados individuais
3. **Rota de relatórios não está funcionando corretamente**

## Soluções a Implementar

### 1. Corrigir o JavaScript de relatórios
- Ajustar a função `renderRelatorio()` para trabalhar com os dados corretos
- Corrigir a estrutura da tabela de relatórios

### 2. Ajustar o backend de relatórios
- Verificar se a rota está registrada corretamente
- Garantir que os dados retornados estejam no formato esperado

### 3. Testar a funcionalidade completa
- Criar registros de teste
- Gerar relatórios
- Testar downloads em CSV e PDF

## Implementação

Vou começar corrigindo o JavaScript e depois verificar o backend.

