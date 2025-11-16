# CI/CD Pipeline Setup Guide

## Обзор системы

Этот документ описывает настройку автоматической сборки Docker образов и развертывания на сервер с использованием GitHub Actions.

### Архитектура

```
Code Push to GitHub
        ↓
   Build & Push Workflow
        ↓
   Docker Images → ghcr.io
        ↓
   Deploy Workflow
        ↓
   SSH to Server
        ↓
   Deploy Script
        ↓
   Docker Compose Up
        ↓
   Live Application
```

---

## Part 1: GitHub Actions Workflows

### 1.1 Build and Push Workflow (`.github/workflows/build-and-push.yml`)

Этот workflow автоматически:
- Запускается при push в ветки `main` и `review-2`
- Собирает Docker образы для Backend, Frontend и Nginx
- Публикует образы в GitHub Container Registry (ghcr.io)

**Особенности:**
- Использует Docker Buildx для кроссплатформенной сборки
- Кеширует слои образов для ускорения повторных сборок
- Автоматически использует GITHUB_TOKEN для аутентификации

**Теги образов:**
- `latest` - для main ветки
- `<branch-name>` - для других веток
- `<commit-sha>` - хеш коммита
- Семвер теги (если используются)

**Результат:**
```
ghcr.io/i-nikotin-THEGAME/film-react-nest/backend:latest
ghcr.io/i-nikotin-THEGAME/film-react-nest/frontend:latest
ghcr.io/i-nikotin-THEGAME/film-react-nest/nginx:latest
```

### 1.2 Deploy Workflow (`.github/workflows/deploy.yml`)

Этот workflow:
- Запускается после успешного завершения Build & Push workflow
- Подключается к серверу по SSH
- Запускает скрипт развертывания на сервере

---

## Part 2: Настройка Repository Secrets

Для работы CI/CD нужно добавить следующие секреты в репозиторий.

### Как добавить секреты:

1. Перейдите на страницу репозитория на GitHub
2. Settings → Secrets and variables → Actions
3. Нажмите "New repository secret"
4. Добавьте каждый секрет

### Требуемые секреты:

#### `SSH_PRIVATE_KEY`
SSH приватный ключ для подключения к серверу

**Как создать:**
```bash
# На локальной машине
ssh-keygen -t ed25519 -C "github-actions@film-app" -f github_actions_key -N ""

# Содержимое файла github_actions_key (приватный ключ)
# Скопируйте весь контент и добавьте как секрет SSH_PRIVATE_KEY
```

**На сервере добавить публичный ключ:**
```bash
# На сервере
mkdir -p ~/.ssh
cat >> ~/.ssh/authorized_keys << 'EOF'
<содержимое github_actions_key.pub>
EOF

chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

#### `SERVER_HOST`
IP адрес или хост сервера
```
158.160.133.7
```

#### `SERVER_USER`
Пользователь для SSH подключения
```
inikotin
```

#### `SERVER_PORT`
SSH порт (обычно 22, но может быть изменен)
```
22
```

### Проверка секретов:

```bash
# Проверить, что секреты доступны в workflow (локально невозможно)
# Они будут использованы автоматически GitHub Actions
```

---

## Part 3: Подготовка сервера

### 3.1 Установка Docker

```bash
# На сервере (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin

# Добавить текущего пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker

# Проверить установку
docker --version
docker compose version
```

### 3.2 Клонирование репозитория

```bash
# На сервере в домашнюю директорию
cd ~
git clone https://github.com/i-nikotin-THEGAME/film-react-nest.git
cd film-react-nest
```

### 3.3 Запуск скрипта подготовки сервера

```bash
# Сделать скрипты исполняемыми
chmod +x scripts/setup-server.sh
chmod +x scripts/deploy.sh

# Запустить подготовку
bash scripts/setup-server.sh

# (Опционально) Установить systemd сервис для автозапуска
bash scripts/setup-server.sh --systemd
```

### 3.4 Конфигурация окружения

```bash
# Создать и отредактировать .env файл
cd ~/film-react-nest
cp .env.example .env  # или создать новый

# Отредактировать значения
nano .env
```

**Пример .env:**
```env
# Backend
PORT=3000
LOGGER_TYPE=json
FRONTEND_URL=https://inikotinthegame.nomorepartiessbs.ru

# Database (если требуется)
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Other
NODE_ENV=production
```

### 3.5 Настройка Docker credentials

Для доступа к приватным образам в GitHub Registry:

```bash
# Создать Personal Access Token на GitHub
# Settings → Developer settings → Personal access tokens → Tokens (classic)
# Выбрать scope: read:packages, write:packages

# На сервере войти в GitHub Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Сохранить credentials для автоматизма
# Они будут сохранены в ~/.docker/config.json
```

---

## Part 4: Скрипты развертывания

### 4.1 `scripts/deploy.sh`

Основной скрипт развертывания, который:
1. Проверяет наличие Docker
2. Проверяет наличие docker-compose.yml
3. Загружает последние образы из GHCR
4. Останавливает старые контейнеры
5. Запускает новые контейнеры
6. Проверяет здоровье сервисов
7. Выводит логи и статус

**Использование:**
```bash
bash ~/film-react-nest/scripts/deploy.sh
```

**Логи:**
Все операции логируются в `~/deployment.log`

### 4.2 `scripts/setup-server.sh`

Скрипт начальной подготовки сервера:
- Создает необходимые директории
- Устанавливает правильные права доступа
- Создает .env шаблон
- (Опционально) настраивает systemd сервис

---

## Part 5: Полный CI/CD Flow

### Шаг 1: Разработка и Push

```bash
# На локальной машине
git add .
git commit -m "New feature"
git push origin main
```

### Шаг 2: GitHub Actions - Build

```
GitHub Action Trigger: build-and-push.yml
├─ Checkout code
├─ Setup Docker Buildx
├─ Login to GHCR
├─ Build Backend image
├─ Push Backend image
├─ Build Frontend image
├─ Push Frontend image
├─ Build Nginx image
└─ Push Nginx image
```

Результат: Образы в `ghcr.io` с тегом `latest`

### Шаг 3: GitHub Actions - Deploy

```
GitHub Action Trigger: deploy.yml (after build-and-push)
├─ SSH подключение к серверу
├─ Pull latest code
├─ Login to GHCR
├─ Execute deploy.sh
│  ├─ Pull latest images
│  ├─ Stop old containers
│  ├─ Start new containers
│  └─ Health check
└─ Notification
```

Результат: Приложение обновлено на сервере

---

## Part 6: Мониторинг и Логирование

### Просмотр workflow runs

```bash
# На GitHub:
Repository → Actions → Select workflow → View runs
```

### Просмотр логов на сервере

```bash
# SSH на сервер
ssh appuser@158.160.133.7

# Просмотр deployment лога
cat ~/deployment.log
tail -f ~/deployment.log

# Просмотр логов контейнеров
cd ~/film-react-nest
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Проверка статуса контейнеров
docker-compose ps
```

### Проверка здоровья приложения

```bash
# SSH на сервер
ssh appuser@158.160.133.7

# Проверить, что приложение работает
curl -f http://localhost:3000/api/afisha/films
curl -f http://localhost:80/

# Проверить использование ресурсов
docker stats
```

---

## Part 7: Troubleshooting

### Проблема: Deploy workflow не запускается

**Решение:**
1. Проверьте, что build-and-push.yml успешно завершился
2. Проверьте permissions в .github/workflows/build-and-push.yml
3. Убедитесь, что workflow на branch `main`

### Проблема: SSH connection refused

**Решение:**
```bash
# Проверьте секреты
# Settings → Secrets → Проверьте SERVER_HOST, SERVER_USER, SERVER_PORT

# На сервере проверьте SSH доступ
ssh-keyscan -H 158.160.133.7 >> ~/.ssh/known_hosts

# Проверьте права на ~/.ssh
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Проблема: Failed to pull image

**Решение:**
```bash
# На сервере проверьте GHCR credentials
docker login ghcr.io -u USERNAME

# Убедитесь, что образ существует
docker pull ghcr.io/i-nikotin-THEGAME/film-react-nest/backend:latest

# Проверьте, что токен имеет права на read:packages
```

### Проблема: Containers are running but application is down

**Решение:**
```bash
# На сервере проверьте логи
docker-compose logs backend
docker-compose logs frontend

# Проверьте переменные окружения
docker-compose config

# Проверьте порты
netstat -tlnp | grep -E ":3000|:80"
```

---

## Part 8: Безопасность

### Best Practices

1. **SSH ключи:**
   - Используйте отдельный ключ для CI/CD
   - Регулярно ротируйте ключи
   - Никогда не коммитьте приватные ключи

2. **Секреты:**
   - Храните все чувствительные данные в Secrets
   - Не выводите секреты в логах
   - Регулярно проверяйте доступ

3. **Образы:**
   - Используйте теги вместо latest для production
   - Регулярно обновляйте зависимости
   - Сканируйте образы на уязвимости

4. **Брандмауэр:**
   - Ограничьте SSH доступ по IP
   - Используйте нестандартный порт SSH
   - Включите fail2ban для защиты

---

## Part 9: Информация о вашем окружении

**Домен:** inikotinthegame.nomorepartiessbs.ru  
**IP сервера:** 158.160.133.7  
**Пользователь:** inikotin  
**Тип ключа:** ssh-ed25519  
**Настройка:** cloud-config (Yandex Cloud)  

---

## Part 10: Быстрый старт

1. **Добавьте секреты в GitHub:**
   ```
   SSH_PRIVATE_KEY=<содержимое вашего приватного ключа>
   SERVER_HOST=158.160.133.7
   SERVER_USER=inikotin
   SERVER_PORT=22
   ```

2. **Подготовьте сервер:**
   ```bash
   ssh inikotin@158.160.133.7
   cd ~
   git clone https://github.com/i-nikotin-THEGAME/film-react-nest.git
   cd film-react-nest
   bash scripts/setup-server.sh
   ```

3. **Протестируйте:**
   ```bash
   bash scripts/deploy.sh
   ```

4. **Сделайте push:**
   ```bash
   git push origin main
   # Workflow автоматически сработает
   ```

---

## Дополнительные команды

```bash
# Ручная сборка и запуск локально
docker-compose build
docker-compose up -d

# Остановка контейнеров
docker-compose down

# Удаление всех образов и volumes
docker-compose down -v

# Просмотр активных контейнеров
docker ps

# Логирование в реальном времени
docker-compose logs -f

# Пересборка конкретного сервиса
docker-compose build backend
docker-compose up -d backend
```

---

**Версия документации:** 1.0  
**Последнее обновление:** 16 ноября 2025 г.
