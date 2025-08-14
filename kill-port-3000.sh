#!/bin/bash

# 3000번 포트 사용 중인 프로세스 강제 종료
PORT=3000

echo "포트 $PORT 를 사용하는 프로세스 확인 중..."

# Windows에서 실행할 경우
if command -v taskkill &> /dev/null; then
    PIDS=$(netstat -ano | grep ":$PORT " | awk '{print $5}' | sort -u)
    if [ -n "$PIDS" ]; then
        for PID in $PIDS; do
            echo "PID $PID 를 종료합니다..."
            taskkill //PID $PID //F
        done
    else
        echo "포트 $PORT 를 사용하는 프로세스가 없습니다."
    fi
# Linux/Mac에서 실행할 경우
elif command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:$PORT)
    if [ -n "$PIDS" ]; then
        echo "포트 $PORT 를 사용하는 프로세스 $PIDS 를 종료합니다..."
        kill -9 $PIDS
    else
        echo "포트 $PORT 를 사용하는 프로세스가 없습니다."
    fi
else
    echo "지원되지 않는 운영체제입니다."
fi

echo "완료!"
