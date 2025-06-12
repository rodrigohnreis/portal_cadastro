# Modificações Realizadas no Portal de Cadastro

## Resumo das Alterações

### 1. Página Inicial - Gráficos e Tabelas com Filtros de Data

#### Novos Endpoints de API (routes/relatorios.py)
- `/api/relatorios/material-por-cidade` - Dados para gráfico de material por cidade
- `/api/relatorios/material-por-equipe` - Dados para gráfico de material por equipe  
- `/api/relatorios/tabela-material-cidade` - Dados para tabela materiais x cidades
- `/api/relatorios/tabela-material-equipe` - Dados para tabela materiais x equipes

Todos os endpoints suportam filtros de data através dos parâmetros:
- `data_inicio` (formato: YYYY-MM-DD)
- `data_fim` (formato: YYYY-MM-DD)

#### Modificações na Interface (static/index.html)
- Adicionado filtro de data com campos "Data Início" e "Data Fim"
- Botões "Aplicar Filtros" e "Limpar Filtros"
- Dois gráficos de barras:
  - Material por Cidade
  - Material por Equipe
- Duas tabelas dinâmicas:
  - Materiais nas linhas, Cidades nas colunas
  - Materiais nas linhas, Equipes nas colunas
- Ambas as tabelas mostram totais por material

#### Funcionalidades JavaScript (static/js/script.js)
- Integração com Chart.js para renderização dos gráficos
- Carregamento dinâmico dos dados via AJAX
- Aplicação de filtros de data em tempo real
- Atualização automática de gráficos e tabelas
- Responsividade para dispositivos móveis

#### Estilos CSS (static/css/style.css)
- Estilos para filtros de data
- Layout responsivo para gráficos (grid 2 colunas)
- Estilos para tabelas com destaque nos totais
- Adaptação para dispositivos móveis

### 2. Página Equipe - Alteração de "Contato" para "Supervisor"

#### Modificações na Interface (static/equipes.html)
- Label do formulário alterado de "Contato" para "Supervisor"
- Cabeçalho da tabela alterado de "Contato" para "Supervisor"

**Nota:** O campo no banco de dados continua sendo "contato" para manter compatibilidade com dados existentes. Apenas a interface foi alterada.

## Arquivos Modificados

1. `/routes/relatorios.py` - Novos endpoints para gráficos e tabelas
2. `/static/index.html` - Interface da página inicial com gráficos e filtros
3. `/static/js/script.js` - Funcionalidades JavaScript para gráficos e tabelas
4. `/static/css/style.css` - Estilos para novos elementos
5. `/static/equipes.html` - Alteração do campo "Contato" para "Supervisor"

## Como Usar

### Filtros de Data na Página Inicial
1. Acesse a página inicial do portal
2. Use os campos "Data Início" e "Data Fim" para definir o período
3. Clique em "Aplicar Filtros" para atualizar gráficos e tabelas
4. Use "Limpar Filtros" para remover as restrições de data

### Gráficos
- **Material por Cidade**: Mostra a quantidade de cada material usado por cidade
- **Material por Equipe**: Mostra a quantidade de cada material usado por equipe

### Tabelas
- **Materiais por Cidade**: Tabela cruzada com materiais nas linhas e cidades nas colunas
- **Materiais por Equipe**: Tabela cruzada com materiais nas linhas e equipes nas colunas
- Ambas incluem coluna "Total" com a soma por material

### Campo Supervisor
- Na página de equipes, o campo anteriormente chamado "Contato" agora é "Supervisor"
- A funcionalidade permanece a mesma, apenas o rótulo foi alterado

## Dependências Adicionais

- Chart.js (carregado via CDN) para renderização dos gráficos
- Todas as outras dependências já estavam presentes no projeto original

## Compatibilidade

- As modificações são totalmente compatíveis com dados existentes
- Não há necessidade de migração de banco de dados
- A API mantém retrocompatibilidade

