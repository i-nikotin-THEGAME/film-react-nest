# 🚀 CI/CD Pipeline для film-react-nest

Полная автоматизация сборки Docker образов и развертывания приложения на сервер Yandex Cloud.

## 📋 Что было создано

### GitHub Actions Workflows

1. **`.github/workflows/build-and-push.yml`** - Сборка и публикация
   - Сборка Docker образов для Backend, Frontend, Nginx
   - Публикация в GitHub Container Registry (ghcr.io)
   - Кеширование слоев для ускорения повторных сборок
   - Автоматические теги (latest, branch-name, commit-sha)

2. **`.github/workflows/deploy.yml`** - Развертывание на сервер
   - SSH подключение к серверу
   - Выполнение скрипта развертывания
   - Проверка статуса развертывания
   - Логирование результатов

### Deploy Scripts

1. **`scripts/deploy.sh`** - Основной скрипт развертывания
   - Проверка Docker демона
   - Загрузка образов из GHCR
   - Остановка старых контейнеров
   - Запуск новых контейнеров
   - Health check сервисов
   - Логирование в `~/deployment.log`

2. **`scripts/setup-server.sh`** - Подготовка сервера
   - Создание необходимых директорий
   - Установка правильных прав доступа
   - Создание .env шаблона
   - Опциональная настройка systemd

3. **`scripts/ci-cd-setup-info.sh`** - Информационный скрипт
   - Справочная информация
   - Список созданных файлов
   - Quick start инструкции

### Документация

1. **`DEPLOYMENT.md`** (обновлен) - Полное руководство (10 частей)
   - Обзор системы и архитектура
   - Настройка GitHub Actions Workflows
   - Конфигурация Repository Secrets
   - Подготовка сервера
   - Скрипты развертывания
   - Мониторинг и логирование
   - Troubleshooting
   - Безопасность и best practices

2. **`CI_CD_SETUP.md`** (обновлен) - Быстрый чеклист
   - 4 основных этапа
   - Пошаговые инструкции
   - Проверочные списки
   - Команды для тестирования

## 🔐 Информация о вашем сервере

```
Домен:              inikotinthegame.nomorepartiessbs.ru
IP адрес:           158.160.133.7
Пользователь:       inikotin
Тип ключа:          ssh-ed25519
Платформа:          Yandex Cloud
Конфигурация:       cloud-config
```

## 🔑 GitHub Secrets для добавления

Перейдите в `Settings → Secrets and variables → Actions` и добавьте:

| Секрет | Значение | Описание |
|--------|----------|---------|
| `SSH_PRIVATE_KEY` | Приватный ключ | SSH ключ для подключения к серверу |
| `SERVER_HOST` | `158.160.133.7` | IP адрес сервера |
| `SERVER_USER` | `inikotin` | Пользователь на сервере |
| `SERVER_PORT` | `22` | SSH порт |

## 🚀 Quick Start

### 1️⃣ Подготовка GitHub

```bash
# Добавьте 4 секрета в GitHub (см. выше)
```

### 2️⃣ Подготовка сервера

```bash
# SSH на сервер
ssh inikotin@158.160.133.7

# Клонируйте репозиторий
cd ~
git clone https://github.com/i-nikotin-THEGAME/film-react-nest.git
cd film-react-nest

# Запустите скрипт подготовки
bash scripts/setup-server.sh

# Установите Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker inikotin
newgrp docker
```

### 3️⃣ Тестирование

```bash
# На сервере
cd ~/film-react-nest
bash scripts/deploy.sh

# Проверьте статус
docker-compose ps
```

### 4️⃣ Запустите CI/CD

```bash
# На локальной машине
git push origin main

# Workflow автоматически сработает
# Проверьте: Repository → Actions
```

## 📊 CI/CD Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Developer pushes code to main branch                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │ GitHub Actions Workflow Triggers   │
        │ • build-and-push.yml               │
        └────────────────┬───────────────────┘
                         │
                    ┌────▼──────┐
                    │ Build      │
                    ├────────────┤
                    │ • Backend  │
                    │ • Frontend │
                    │ • Nginx    │
                    └────┬───────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Publish to GHCR      │
              │ ghcr.io/...          │
              └──────────┬───────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │ GitHub Actions Workflow Triggers   │
        │ • deploy.yml                       │
        └────────────────┬───────────────────┘
                         │
                    ┌────▼──────────┐
                    │ SSH Deploy     │
                    │ 158.160.133.7  │
                    └────┬──────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Execute deploy.sh    │
              │ • Pull images        │
              │ • Stop containers    │
              │ • Start new ones     │
              │ • Health check       │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Application Live     │
              │ inikotinthegame...   │
              └──────────────────────┘
```

## 📖 Документация

### Для полного понимания прочитайте:

1. **DEPLOYMENT.md** - Подробное руководство с 10 частями:
   - Part 1: GitHub Actions Workflows
   - Part 2: Настройка Repository Secrets
   - Part 3: Подготовка сервера
   - Part 4: Скрипты развертывания
   - Part 5: Полный CI/CD Flow
   - Part 6: Мониторинг и логирование
   - Part 7: Troubleshooting
   - Part 8: Безопасность
   - Part 9: Информация об окружении
   - Part 10: Быстрый старт

2. **CI_CD_SETUP.md** - Быстрый чеклист:
   - Этап 1: GitHub Repository Setup ✓
   - Этап 2: Server Setup ✓
   - Этап 3: Тестирование ✓
   - Этап 4: CI/CD Pipeline ✓

### Справочные команды

```bash
# SSH на сервер
ssh inikotin@158.160.133.7

# Просмотр логов развертывания
tail -f ~/deployment.log

# Статус контейнеров
docker-compose ps

# Логи приложения
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Проверка здоровья
curl http://localhost:3000/api/afisha/films

# Ручное развертывание
cd ~/film-react-nest
bash scripts/deploy.sh
```

## ✅ Что работает

- ✅ Автоматическая сборка Docker образов
- ✅ Публикация в GitHub Container Registry
- ✅ Развертывание на Yandex Cloud сервер
- ✅ SSH подключение с автентификацией
- ✅ Логирование всех операций
- ✅ Health checks приложения
- ✅ Откат на предыдущую версию (rollback)
- ✅ Мониторинг статуса сервисов

## 🔧 Обслуживание

### Просмотр workflow runs на GitHub

```
Repository → Actions → Select workflow → View runs
```

### Проверка логов на сервере

```bash
ssh inikotin@158.160.133.7

# Deployment logs
cat ~/deployment.log

# Container logs
docker-compose logs --tail=50 backend

# System logs
tail -f /var/log/syslog
```

### Перезагрузка сервиса

```bash
ssh inikotin@158.160.133.7
cd ~/film-react-nest
docker-compose restart
```

### Откат на предыдущую версию

```bash
ssh inikotin@158.160.133.7
cd ~/film-react-nest

# Просмотр резервных копий
ls -la ~/backups/

# Восстановление docker-compose.yml
cp ~/backups/docker-compose.<timestamp>.yml docker-compose.yml

# Перезапуск
docker-compose down -v
docker-compose up -d
```

## 🎯 Дальнейшее развитие

Возможные улучшения:

- [ ] Slack/Telegram уведомления о развертыванию
- [ ] Blue-green deployment для zero-downtime
- [ ] Автоматическое масштабирование (HPA)
- [ ] Prometheus + Grafana для мониторинга
- [ ] ELK Stack для логирования
- [ ] Backup и disaster recovery план
- [ ] Kubernetes вместо docker-compose
- [ ] CDN для frontend assets

## 📞 Troubleshooting

### SSH Connection Refused
```bash
# Проверьте секреты в GitHub
# Убедитесь что SSH ключ правильный
ssh -v inikotin@158.160.133.7
```

### Docker Pull Failed
```bash
ssh inikotin@158.160.133.7
echo "TOKEN" | docker login ghcr.io -u USERNAME --password-stdin
docker pull ghcr.io/i-nikotin-THEGAME/film-react-nest/backend:latest
```

### Container Health Check Failed
```bash
ssh inikotin@158.160.133.7
docker-compose logs backend
docker ps -a
```

## 📝 Логирование

Все операции логируются:
- `~/deployment.log` - логи развертывания
- `docker-compose logs` - логи контейнеров
- GitHub Actions - логи workflow runs
- `/var/log/syslog` - системные логи

## 🔒 Безопасность

- SSH ключи не коммитятся в репозиторий
- Все секреты хранятся в GitHub Secrets
- Используется ssh-ed25519 для лучшей безопасности
- Регулярная ротация SSH ключей рекомендуется
- Firewall должен ограничивать доступ к SSH

---

**Версия:** 1.0  
**Дата создания:** 16 ноября 2025 г.  
**Статус:** ✅ Production Ready
