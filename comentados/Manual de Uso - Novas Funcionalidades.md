# Manual de Uso - Novas Funcionalidades

## Funcionalidade de Registro de Múltiplos Materiais

### Como Usar

1. **Acesse a página de Registros**
   - Clique no menu "Registros" no topo da página

2. **Inicie um novo registro**
   - Clique no botão "Novo Registro"

3. **Preencha os dados básicos**
   - Selecione a **Equipe** responsável
   - Defina a **Data** do registro

4. **Adicione materiais**
   - Selecione o primeiro **Material** no dropdown
   - Informe a **Quantidade** utilizada
   - Para adicionar mais materiais, clique em **"Adicionar Material"**
   - Repita o processo para cada material adicional

5. **Finalize o registro**
   - Adicione uma **Observação** se necessário
   - Clique em **"Salvar"** para registrar todos os materiais de uma vez

### Vantagens da Nova Funcionalidade

- **Eficiência**: Registre vários materiais em uma única operação
- **Organização**: Todos os materiais usados pela equipe em uma data ficam agrupados
- **Praticidade**: Não precisa fazer múltiplos cadastros separados

## Funcionalidade de Relatórios Corrigida

### Como Gerar Relatórios

1. **Acesse a página de Relatórios**
   - Clique no menu "Relatórios" no topo da página

2. **Configure o período**
   - Defina a **Data Início** e **Data Fim**
   - Opcionalmente, selecione uma **Equipe** específica

3. **Gere o relatório**
   - Clique em **"Gerar Relatório"** para visualizar os dados na tela

4. **Faça o download**
   - Clique em **"Baixar CSV"** para arquivo de planilha
   - Clique em **"Baixar PDF"** para arquivo em PDF

### Informações do Relatório

O relatório mostra:
- Data de uso dos materiais
- Nome da equipe
- Material utilizado
- Unidade de medida
- Quantidade total consumida

## Estrutura do Sistema Atualizada

### Backend (API)
- **Nova rota**: `/api/registros/lote` - Para registro de múltiplos materiais
- **Rota corrigida**: `/api/relatorios/material-por-dia` - Para geração de relatórios

### Frontend
- **Formulário dinâmico**: Permite adicionar/remover campos de material
- **JavaScript modularizado**: Cada página tem seu próprio arquivo JS
- **Interface responsiva**: Funciona em desktop e mobile

## Benefícios das Melhorias

1. **Produtividade**: Menos cliques e tempo para registrar materiais
2. **Precisão**: Todos os materiais de uma equipe ficam vinculados à mesma data
3. **Relatórios funcionais**: Downloads em CSV e PDF funcionando corretamente
4. **Manutenibilidade**: Código organizado e modular

## Próximos Passos Recomendados

1. Teste a funcionalidade com dados reais
2. Treine os usuários nas novas funcionalidades
3. Configure backups regulares do banco de dados
4. Monitore o desempenho com maior volume de dados

