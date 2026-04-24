# Шахматы — GitHub Pages

Сайт готов к публикации на GitHub Pages.

## Файлы

- `index.html` — основной файл сайта
- `rules.html` — страница с правилами
- `helper-worker.js` — фоновый расчёт ходов ИИ
- `helper.html` — резервная страница помощника
- `chess.html` — совместимый редирект на `index.html`
- `.nojekyll` — отключает Jekyll-обработку на GitHub Pages

## Как развернуть

1. Загрузите содержимое этой папки в корень репозитория GitHub.
2. Откройте `Settings -> Pages`.
3. В `Build and deployment` выберите:
   - `Source: Deploy from a branch`
   - `Branch: main` или `master`
   - `Folder: / (root)`
4. Сохраните настройки.
5. Подождите публикацию сайта.

## Что важно

- Точка входа для GitHub Pages: `index.html`
- Старый адрес `chess.html` сохранён как редирект, чтобы старые ссылки не ломались
- Все внутренние ссылки уже обновлены на `index.html`

## После теста

- Удалите временные API-ключи перед публичной публикацией
