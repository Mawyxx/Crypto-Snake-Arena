#!/bin/bash
# Просмотр логов бэкенда. Запуск: ./deploy/logs.sh
# Опции: -f (follow), -n 100 (последние 100 строк)
journalctl -u crypto-snake-arena "$@" -o short-iso
