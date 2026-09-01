# Песочница для live-coding: многошаговая форма

React 18 + TypeScript + Vite. Стек намеренно совпадает с боевым: `react-hook-form@7` + `yup`.

- [TASK.md](./TASK.md) — задание кандидату.
- `INTERVIEWER.md` — шпаргалка интервьюеру: лежит рядом локально и намеренно исключена
  из репозитория через `.gitignore`.

## Запуск

```bash
npm install && npm run dev
```

Вкладка «Задача» — рабочее место кандидата (`src/task/ScanJobWizard.tsx`).
Вкладка «Компоненты» — витрина готовых контролов с их пропсами.

## Структура

```
src/
  components/     готовые UI-компоненты (форму не знают, полностью управляемые)
  api/            мок-бэкенд: задержки, AbortSignal, 422 и 500 (хук загрузки пишет кандидат)
  task/           точка входа кандидата: formModel.ts + ScanJobWizard.tsx
  Showcase.tsx    витрина компонентов
.devcontainer/    автозапуск в GitHub Codespaces (+ Live Share)
.stackblitzrc     автозапуск в StackBlitz
.codesandbox/     автозапуск в CodeSandbox
```

## Мок-API

По умолчанию используется встроенный `src/api/mockApi.ts` — сети нет, всё детерминировано:

| Метод | Задержка | Зачем в задаче |
| --- | --- | --- |
| `getScanTypes()` | 200 мс | простой select, есть `disabled`-опция |
| `getProfiles(scanType)` | 700 мс | зависимый select, видно состояние загрузки |
| `getTags()` / `getUsers()` | 300–400 мс | мультиселекты |
| `getAssetGroups()` / `getPeriodicity()` | 150–200 мс | фильтр и select |
| `getAssets({ search, groupId }, signal)` | 800 мс | таблица, поиск с debounce, отмена гонки запросов |
| `checkJobName(name)` | 600 мс | асинхронная валидация уникальности |
| `createScanJob(payload)` | 1200 мс | сабмит; кидает `ApiValidationError` (422) с `fieldErrors` |

`src/api/config.ts` — рычаги для демонстрации: `latencyMs` и `failureRate` (доля запросов,
падающих с 500). Поставьте `failureRate: 0.3`, если хотите увидеть, как кандидат обрабатывает
сбои.

### Публичные API, если хочется живой сети

Встроенный мок закрывает всю задачу; публичные API нужны, только если вы хотите настоящий
`fetch` и реальные сетевые ошибки. Все перечисленные отдают CORS-заголовки и работают из
браузера без ключей (лимиты и условия стоит перепроверить перед интервью).

| API | База | Чем полезен |
| --- | --- | --- |
| DummyJSON | `https://dummyjson.com` | `/products`, `/users`, `/users/search?q=`, пагинация `?limit=&skip=` — таблица и поиск |
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` | `/users`, `/todos` — опции селектов; `POST` возвращает фейковый id |
| Platzi Fake Store | `https://api.escuelajs.co/api/v1` | настоящий CRUD; `POST /products` с битым телом отдаёт 400 со списком ошибок — почти готовый сценарий серверной валидации |
| REST Countries | `https://restcountries.com/v3.1/all?fields=name,cca2` | ~250 значений — мультиселект с поиском под нагрузкой |
| GitHub Search | `https://api.github.com/search/users?q=` | жёсткий rate limit без токена — отлично показывает необходимость debounce и отмены запросов |
| httpbin / Postman Echo | `https://httpbin.org`, `https://postman-echo.com` | `/status/422`, `/delay/3`, эхо `POST` — эмуляция ошибок и таймаутов |
| Reqres | `https://reqres.in/api` | пагинация + `POST /register` с 400; сейчас требует заголовок `x-api-key: reqres-free-v1` |

Свой бэкенд под задачу: **mockapi.io** или **beeceptor** (создаются за пару минут в UI),
либо **MSW** прямо внутри песочницы (`msw` + `setupWorker`) — если нужны полностью
управляемые ответы, включая 422 по конкретным полям.

Точка подмены одна: `src/api/mockApi.ts` — замените тела методов на `fetch`, сигнатуры
трогать не придётся.

## Как расшарить кандидату из GitHub

Идея: код живёт в отдельном GitHub-репозитории, вы правите его локально, а кандидат открывает
готовую ссылку. Ничего писать «в облаке» не нужно — облако только запускает то, что в репозитории.

### Подготовка репозитория (один раз)

Локальный репозиторий уже инициализирован, первый коммит сделан. Осталось создать пустой
приватный репозиторий на github.com (без README и .gitignore) и запушить:

```bash
git remote add origin https://github.com/<логин>/scan-job-wizard-task.git && git push -u origin main
```

Полезно сразу включить в настройках репозитория **Template repository**: тогда кандидат жмёт
«Use this template», получает свою приватную копию и не видит копии других кандидатов.

`INTERVIEWER.md` и `.idea` в репозиторий не попадают — они в `.gitignore`.

### Варианты запуска

| Вариант | Ссылка кандидату | Кто что видит | Ограничения |
| --- | --- | --- | --- |
| **StackBlitz** | `https://stackblitz.com/github/<owner>/<repo>?file=src/task/ScanJobWizard.tsx` | кандидат шарит экран, в конце присылает ссылку на свой форк | нужен Chrome/Edge; приватный репозиторий требует авторизации в GitHub; совместное редактирование — платный тариф |
| **GitHub Codespaces** | кандидат жмёт **Code → Codespaces → Create** в вашем репозитории | привычный VS Code; через расширение **Live Share** вы подключаетесь и видите правки в реальном времени | нужен доступ к репозиторию (collaborator или копия из template); бесплатные core-hours ограничены |
| **CodeSandbox** | `https://codesandbox.io/p/github/<owner>/<repo>` | кандидат шарит экран или приглашает вас в сессию | free-тариф ограничен кредитами; real-time collaboration на платных планах |
| **Replit** | Import from GitHub → ссылка Join | multiplayer с приглашением гостя из коробки | конфигурацию Vite иногда приходится поправить руками |

Тарифы у всех четырёх регулярно меняются — прогоните выбранный сценарий на своём аккаунте
до интервью.

### Что уже настроено в репозитории

- `.devcontainer/devcontainer.json` — Codespaces поднимается сам: `npm install`, проброс порта
  5173, предустановленный **Live Share**.
- `.stackblitzrc` — StackBlitz ставит зависимости и стартует `npm run dev` без ручных команд.
- `.codesandbox/tasks.json` — то же для CodeSandbox.
- В `npm run dev` уже есть `--host`, иначе превью в контейнере не открывается.

### Что рекомендую

Если важно **видеть, как кандидат печатает** — Codespaces + Live Share: ссылка на репозиторий,
кандидат создаёт Codespace, запускает Live Share и присылает вам join-ссылку. Всё бесплатно
в пределах лимитов личного аккаунта и ближе всего к реальной среде.

Если важнее **скорость старта** — StackBlitz: открывается за секунды, кандидат шарит экран,
в конце присылает ссылку на форк со всем кодом.
