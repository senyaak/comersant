# Архитектура Comersant Game Platform

Данный документ содержит C4 диаграммы архитектуры платформы для игры Comersant (аналог Монополии).

## Обзор C4 Model

C4 Model - это подход к визуализации архитектуры программного обеспечения, который использует 4 уровня детализации:

- **Level 1 - Context**: Показывает систему в контексте пользователей и внешних систем
- **Level 2 - Container**: Показывает основные технологические блоки системы
- **Level 3 - Component**: Детализирует внутреннюю структуру каждого контейнера
- **Level 4 - Code**: Показывает реализацию на уровне классов (не включен в данный проект)

## Диаграммы

### Level 1 - System Context
![Context Diagram](01-context.puml)

**Описание**: Показывает Comersant Game Platform в контексте игроков и администраторов. Система предоставляет веб-интерфейс для многопользовательской игры в реальном времени.

**Ключевые элементы**:
- Игроки взаимодействуют через веб-браузер
- Система управляет комнатами и игровым процессом
- Документация доступна для администраторов

### Level 2 - Container Architecture
![Container Diagram](02-container.puml)

**Описание**: Показывает основные технологические компоненты системы и их взаимодействие.

**Основные контейнеры**:
- **Single Page Application (Angular)**: Пользовательский интерфейс
- **API Application (NestJS)**: REST API для управления комнатами
- **WebSocket Server (Socket.IO)**: Реальное время коммуникации
- **Game Engine**: Логика игры
- **Static File Server**: Документация и статические файлы

**Технологии**:
- Frontend: Angular, TypeScript
- Backend: NestJS, Socket.IO
- Communication: HTTPS, WebSocket

### Level 3 - Component Architecture

#### Backend Components
![Backend Components](03-component-backend.puml)

**Описание**: Детализирует внутреннюю структуру NestJS backend.

**Основные модули**:
- **App Module**: Главный модуль приложения
- **Lobby Module**: Управление комнатами и подключениями игроков
- **Game Module**: Управление активными играми и игровой логикой

**Ключевые компоненты**:
- **Controllers**: REST endpoints для управления
- **Gateways**: WebSocket обработчики событий
- **Services**: Бизнес-логика
- **Game Engine**: Основная логика игры

#### Frontend Components  
![Frontend Components](03-component-frontend.puml)

**Описание**: Показывает структуру Angular приложения.

**Angular модули**:
- **App Module**: Корневой модуль с маршрутизацией
- **Lobby Module**: Ленивая загрузка для управления комнатами
- **Game Module**: Ленивая загрузка для игрового процесса

**Ключевые сервисы**:
- **Lobby Service**: WebSocket подключение к `/lobby` namespace
- **Game Service**: WebSocket подключение к `/game` namespace
- **Game State Service**: Локальное управление состоянием игры

## Ключевые архитектурные решения

### 1. Разделение ответственности
- **Frontend**: Только UI и локальное состояние
- **Backend**: Вся игровая логика и валидация
- **WebSocket**: Реальное время синхронизации

### 2. Модульная архитектура
- Четкое разделение Lobby и Game функционала
- Независимые Angular модули с ленивой загрузкой
- NestJS модули для организации backend кода

### 3. Real-time коммуникация
- Два отдельных WebSocket namespace: `/lobby` и `/game`
- Event-driven архитектура для синхронизации состояния
- Декораторы для валидации WebSocket событий

### 4. Type Safety
- Общие TypeScript типы между frontend и backend
- Строгая типизация WebSocket событий
- Валидация на уровне decorators

## Как читать диаграммы

### Элементы C4
- **Прямоугольники**: Системы, контейнеры, компоненты
- **Овалы**: Люди (пользователи)
- **Стрелки**: Отношения и потоки данных
- **Цвета**: Различные типы элементов (синий - внутренние, серый - внешние)

### Уровни детализации
1. **Context**: "Что делает система?"
2. **Container**: "Из чего состоит система?"
3. **Component**: "Как организованы компоненты внутри контейнеров?"

## Просмотр диаграмм

Для просмотра диаграмм используйте:

1. **PlantUML расширение в VS Code**
2. **Онлайн PlantUML Viewer**: http://www.plantuml.com/plantuml/
3. **PlantUML CLI**: `plantuml diagram.puml`

## Связанная документация

- [Backend API Documentation](/docs/backend)
- [Frontend Documentation](/docs/frontend)
- [Compodoc Documentation](./documentation/)

---

**Автор**: Создано с помощью GitHub Copilot  
**Дата**: Октябрь 2025  
**Версия**: 1.0