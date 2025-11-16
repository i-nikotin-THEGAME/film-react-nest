FROM nginx:alpine

# Копируем конфигурацию nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Точка монтирования для фронтенда
VOLUME ["/usr/share/nginx/html"]

# Port для nginx
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
