# Planejador Pro JS

[![CI](https://github.com/Kenjihidehira/planner-pro-js/actions/workflows/ci.yml/badge.svg)](https://github.com/Kenjihidehira/planner-pro-js/actions/workflows/ci.yml)

Aplicação front-end avançada para gerenciamento de projetos, feita com HTML, CSS e JavaScript puro.

## Persistência local segura

O módulo `storage.js` centraliza leitura e escrita no `localStorage`, valida o formato salvo, recupera JSON corrompido sem derrubar a interface e trata falhas de quota. Os cenários negativos são executados por `npm test` e pela CI.

## Funcionalidades

- Quadro Kanban com arrastar e soltar
- Cadastro de tarefas
- Filtros por projeto, prioridade e busca
- Métricas de tarefas, horas estimadas e risco
- Linha do tempo de próximos prazos
- Relatório de capacidade por responsável
- Exclusão de tarefas
- Exportação JSON
- Persistência com `localStorage`
- Layout responsivo

## Como rodar

Abra o arquivo `index.html` no navegador.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- API de arrastar e soltar
- localStorage
- Blob API
