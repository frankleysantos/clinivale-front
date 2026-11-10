# Especificação de Memória e Contexto do Projeto (clinivale-front)

Este documento registra o contexto arquitetural, regras de negócio e o estado atual das telas e componentes para que qualquer assistente de IA ou desenvolvedor consiga continuar o trabalho exatamente de onde parou.

---

## 1. Visão Geral da Arquitetura
- **Stack**: Vue 3 (Composition API, `<script setup>`), Quasar Framework, Pinia, TypeScript, Axios/Boot API.
- **Autenticação**: `authStore` armazena o token JWT e os dados do usuário, incluindo a clínica ativa em `authStore.user.client`.
- **Permissões**: Controle de renderização baseado em `authStore.hasPermission('ControllerName', 'methodName')`.

---

## 2. Regras Fundamentais de Negócio no Frontend

### Contexto de Clínica Ativa (`client_id`)
1. **Requisições à API**: O token JWT já trafega o `client_id` ativo. Não enviar manualmente a menos que seja uma operação explícita de seleção ou criação por superadmin.
2. **Diferenciação da Clínica Master (Clinivale / ID: 1)**:
   - Identificada via `authStore.user?.client?.id === 1 || authStore.user?.client?.name?.toLowerCase() === 'clinivale'`.
   - Usuários logados na clínica master possuem recursos extras, como selecionar qual clínica receberá novos usuários ou novos perfis.

---

## 3. Estado Atual das Telas e Componentes

### Tela de Usuários (`src/pages/UsersPage.vue`)
- **Tabela**: Exibe listagem de usuários com badges de perfis e a clínica (`Estabelecimento`).
- **Modal de Criação / Edição**:
  - Exibe campo de seleção de clínica (`<q-select>` de Clínica / Estabelecimento) com `v-if="isMasterClinic"`.
  - Ao alterar a clínica no select (`@update:model-value="onClientChange"`):
    1. Reseta o array `role_ids = []` para não manter perfis de outro cliente.
    2. Invoca `rolesStore.fetchAll(clientId)` passando o ID da clínica selecionada para listar apenas os perfis específicos dessa clínica e globais.
  - Ao abrir o modal (`openDialog`), busca os dados da clínica e as roles respectivas da clínica do usuário ou da clínica ativa.
- **Store de Usuários (`src/stores/users.ts`)**:
  - `CreateUserDto` atualizado para conter o campo opcional `client_id?: number`.

---

## 4. Integração MCP Memory
- Configurado servidor `@modelcontextprotocol/server-memory` em `.agents/mcp_config.json` apontando para `.agents/memory.json`.

