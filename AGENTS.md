# Diretrizes e Instruções Obrigatórias do Projeto (clinivale-front)

Antes de realizar qualquer alteração de código ou responder a requisições, certifique-se de seguir rigorosamente as regras abaixo:

## 1. Sem Execução de Comandos de Terminal / Build
- **NUNCA** execute comandos no terminal (como `npx vue-tsc`, `npm run dev`, `quasar dev`, etc.) a menos que o usuário peça explicitamente.
- O foco do agente deve ser **exclusivamente a alteração direta de código** nos arquivos para economizar tokens.

## 2. Contexto de Clínica Ativa (`client_id`)
- Garantir que todas as chamadas da API utilizem o token JWT contendo a clínica ativa logada (`authStore.user.client.id`).
- Não enviar `client_id` manualmente se o backend já resolve a clínica ativa pelo token JWT.

## 3. Reutilização de Componentes e UI Quasar
- Reaproveitar os componentes do Quasar Framework (`<q-card>`, `<q-dialog>`, `<q-select>`, `<q-btn>`, `<q-input>`, etc.).
- Utilizar as stores do Pinia (`useAuthStore`, `usePatientsStore`, etc.) para gerenciamento de estado e chamadas de API.
