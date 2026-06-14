<!-- ===================== ♔ ШАХМАТЫ · README ===================== -->

<div align="center">

<img width="900" alt="Шахматы — 3D игра на Three.js" src="https://github.com/user-attachments/assets/b656f618-f946-4413-ad1b-1c1cb48b1cc1" />

<br/>
<br/>

# ♔ ШАХМАТЫ

### Роскошные 3D-шахматы в браузере · чёрное и золото

*Премиальная игра на Three.js с ИИ-соперником, живым чатом и полной реализацией правил.*

<br/>

[![Играть онлайн](https://img.shields.io/badge/♛_ИГРАТЬ_ОНЛАЙН-badvino--ctrl.github.io%2Fchess-D4AF37?style=for-the-badge&logoColor=black)](https://badvino-ctrl.github.io/chess/)

<br/>

![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=three.js&logoColor=white)
![AI](https://img.shields.io/badge/AI-Mistral-D4AF37?style=flat-square)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live-222222?style=flat-square&logo=github&logoColor=white)
![Mobile](https://img.shields.io/badge/Mobile-✓-22C55E?style=flat-square)
![Lang](https://img.shields.io/badge/Язык-Русский-D4AF37?style=flat-square)

</div>

---

## ✨ О проекте

Полноценная браузерная **3D-игра «Шахматы»** в роскошной эстетике матового чёрного и золота. Игра против ИИ-соперника, который комментирует ходы в живом чате, строгая реализация всех правил и подробное обучение для новичков.

> 🌐 **Демо:** https://badvino-ctrl.github.io/chess/

---

## 🎮 Возможности

<table>
<tr>
<td width="50%" valign="top">

### ♟ Игра и логика
- Полные правила шахмат
- Рокировка, взятие на проходе, превращение пешки
- Шах, мат и пат
- Запрет ходов под шах
- Кнопка **«Отменить ход»** (Undo)

</td>
<td width="50%" valign="top">

### 🤖 ИИ и чат
- Соперник на **Mistral API**
- 3 уровня: Лёгкий · Стандарт · Сложный
- Живые комментарии к ходам
- Авто-переключение на запасной ключ
- Очистка ответов от Markdown

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎨 Дизайн
- Матовый чёрный и золото
- Золотые фигуры с тёплым свечением
- Glassmorphism-интерфейс (blur)
- Тёплое кино-освещение

</td>
<td width="50%" valign="top">

### 📱 Управление и сохранения
- Drag & Drop и клик-клик
- Зум колесом / щипком
- 100% адаптивность + touch
- Сохранение игры в `localStorage`

</td>
</tr>
</table>

---

## 📂 Структура файлов

| Файл | Назначение |
|:---|:---|
| `index.html` | Основной файл сайта (игра) |
| `rules.html` | Страница с правилами и обучением |
| `helper-worker.js` | Фоновый расчёт ходов ИИ (Web Worker) |
| `helper.html` | Резервная страница помощника |
| `chess.html` | Совместимый редирект на `index.html` |
| `.nojekyll` | Отключает Jekyll-обработку на GitHub Pages |

---

## 🚀 Как запустить

1. Открой демо: https://badvino-ctrl.github.io/chess/
2. При первом входе появится вопрос *«Умеете играть в шахматы?»*
3. «Да» — начинается игра · «Нет» — откроется обучение (`rules.html`)

Локально: скачай репозиторий и открой `index.html` в браузере (нужен интернет для CDN и Mistral API).

---

## 🛠️ Стек

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)
![Mistral AI](https://img.shields.io/badge/Mistral_AI-FF7000?style=flat-square)

Библиотеки подключаются через **CDN**. Графика — Three.js (WebGL).

---

<details>
<summary>🧠 Промпт, по которому собран проект (развернуть)</summary>

<br/>

**Роль:** Senior Full-Stack разработчик и эксперт по WebGL (Three.js).

**Задача:** полноценная 3D-игра «Шахматы» с ИИ-соперником и чатом + страница обучения. Весь интерфейс — на русском.

**1. Архитектура и файлы**
- `chess.html`: весь HTML, CSS (`<style>`) и JavaScript (`<script>`) для игры.
- `rules.html`: интерактивное руководство.
- Библиотеки (Three.js и вспомогательные) — только через CDN.

**2. Визуальный стиль**
- Матовый чёрный и золото; без синего/фиолетового/розового.
- Светлые фигуры — полированное золото; тёмные — матовый чёрный с серебристым сиянием.
- UI и чат: glassmorphism (`backdrop-filter: blur()`), золотой текст, активная кнопка — золотая пластина с чёрным текстом.

**3. Механика, 3D и управление**
- Движок Three.js; фигуры и доска — процедурные/стилизованные примитивы.
- Drag & Drop или клик-клик; зум колесом/щипком; кнопка Undo.
- 100% адаптивность, touch-события; на телефонах чат сворачивается/накладывается с блюром.
- Брендинг: в левом нижнем углу золотая кнопка «viora studio» → https://t.me/VioraStudio.

**4. Правила**
- Уникальные ходы всех фигур, взятие, спецходы (рокировка, en passant, превращение).
- Определение шаха, мата и пата; запрет ходов под шах.

**5. ИИ (Mistral API) и чат**
- Модель `mistral-tiny`; основной + запасной ключ с авто-переключением.
- 3 уровня сложности (глубина просчёта + системный промпт).
- Плавная анимация хода + комментарий в чате.
- RegExp-функция чистит ответ от Markdown (`**`, `#`).

**6. Сохранения и обучение**
- `localStorage`: положение на доске, история чата, сложность — игра продолжается после обновления.
- Первый вход: золотой pop-up «Умеете играть? [Да/Нет]».
- `rules.html`: подробный лендинг в том же стиле (цель игры, ценность фигур, ходы, особые правила, шах/мат) и кнопка «Я готов играть!».

</details>

---

<div align="center">

Сделано в <a href="https://t.me/VioraStudio">viora studio</a> · ♔ чёрное и золото

<sub>Чёрный мат и золотой блеск — играй красиво.</sub>

</div>
