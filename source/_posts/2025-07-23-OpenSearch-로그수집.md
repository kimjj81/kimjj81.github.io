---
layout: publish
title: OpenSearch 로그수집
date: 2025-07-23 10:16:03
tags: OpenSearch, Data Prepper, Log Collection
---

## 참고자료 

- https://github.com/opensearch-project/data-prepper/blob/main/docs/getting_started.md
- https://docs.fluentbit.io/manual/administration/configuring-fluent-bit/classic-mode/configuration-file

## Prerequisites

OpenSearch 3.10.0 은 java 21로 컴파일된 것으로 보이므로 java 21이 필요하다.

post-installation 에서 /var/log/opensearch/install_demo_security.log 를 살피라고 하지만 아무것도 기록되지 않은 경우 jre 21을 설치해서 해결했다.

```bash

```

```.bashrc
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-arm64
export OPENSEARCH_JAVA_HOME=$JAVA_HOME
```

## 1. Data Prepper 개요

OpenSearch Data Prepper는 서버 사이드 데이터 수집기로, 필터링, 강화, 변환, 정규화, 집계 기능을 제공하여 다운스트림 분석과 시각화를 지원합니다. OpenSearch의 선호되는 데이터 수집 도구입니다.

## 2. 설치 및 기본 설정

### Docker를 이용한 설치
```bash
# Data Prepper 3.1.0 이상 설치
docker pull opensearchproject/data-prepper:latest

# 실행
docker run --name data-prepper -p 4900:4900 -p 2021:2021 \
  -v ${PWD}/pipelines.yaml:/usr/share/data-prepper/pipelines/pipelines.yaml \
  -v ${PWD}/data-prepper-config.yaml:/usr/share/data-prepper/config/data-prepper-config.yaml \
  opensearchproject/data-prepper:latest
```

## 3. 서버 상태 모니터링 설정

### 시스템 메트릭 수집 구성

**data-prepper-config.yaml**:
```yaml
# 메트릭 수집 활성화
extensions:
  geoip_service:
    maxmind:
      database_refresh_interval: PT1H
      cache_count: 16_384

# SSL 비활성화 (개발환경)
ssl: false

# 인증 설정 (필요시)
authentication:
  http_basic:
    username: "admin"
    password: "admin"
```

### 서버 모니터링 파이프라인

**pipelines.yaml**:
```yaml
# 시스템 메트릭 수집 파이프라인
system-metrics-pipeline:
  source:
    http:
      path: "/system/metrics"
      ssl: false
  processor:
    - date:
        from_time_received: true
        destination: "@timestamp"
    - add_entries:
        entries:
          - key: "data_type"
            value: "system_metrics"
  sink:
    - opensearch:
        hosts: ["https://localhost:9200"]
        username: "admin"
        password: "admin"
        insecure: true
        index: "system-metrics-%{yyyy.MM.dd}"

# JVM 및 시스템 메트릭 모니터링
jvm-metrics-pipeline:
  source:
    http:
      path: "/jvm/metrics"
      ssl: false
  processor:
    - date:
        from_time_received: true
        destination: "@timestamp"
  sink:
    - opensearch:
        hosts: ["https://localhost:9200"]
        username: "admin"
        password: "admin"
        insecure: true
        index: "jvm-metrics-%{yyyy.MM.dd}"
```

## 4. Nginx 로그 수집 설정

### Fluent Bit 설정

**fluent-bit.conf**:
```conf
[INPUT]
    name                  tail
    refresh_interval      5
    path                  /var/log/nginx/access.log
    read_from_head        true
    tag                   nginx.access

[INPUT]
    name                  tail
    refresh_interval      5
    path                  /var/log/nginx/error.log
    read_from_head        true
    tag                   nginx.error

[OUTPUT]
    Name                  http
    Match                 nginx.*
    Host                  localhost
    Port                  2021
    URI                   /log/ingest
    Format                json
    # SSL 설정 (필요시)
    # tls                 On
    # tls.verify          Off
```

### Nginx 로그 파이프라인

**pipelines.yaml** (nginx 로그 부분):
```yaml
# Nginx 액세스 로그 파이프라인
nginx-access-log-pipeline:
  source:
    http:
      path: "/log/ingest"
      ssl: false
  processor:
    - grok:
        match:
          log: [ "%{COMMONAPACHELOG_DATATYPED}" ]
    - date:
        from_time_received: true
        destination: "@timestamp"
    - add_entries:
        entries:
          - key: "log_type"
            value: "nginx_access"
          - key: "service"
            value: "nginx"
  route:
    - success_logs: '/response >= 200 and /response < 400'
    - error_logs: '/response >= 400'
  sink:
    - opensearch:
        hosts: ["https://localhost:9200"]
        username: "admin"
        password: "admin"
        insecure: true
        index: "nginx-access-logs-%{yyyy.MM.dd}"
        routes: [success_logs]
    - opensearch:
        hosts: ["https://localhost:9200"]
        username: "admin"
        password: "admin"
        insecure: true
        index: "nginx-error-logs-%{yyyy.MM.dd}"
        routes: [error_logs]

# Nginx 에러 로그 파이프라인
nginx-error-log-pipeline:
  source:
    http:
      path: "/error/ingest"
      ssl: false
  processor:
    - grok:
        match:
          log: [ "%{NGINX_ERROR}" ]
    - date:
        from_time_received: true
        destination: "@timestamp"
  sink:
    - opensearch:
        hosts: ["https://localhost:9200"]
        username: "admin"
        password: "admin"
        insecure: true
        index: "nginx-errors-%{yyyy.MM.dd}"
```

## 5. 고급 설정

### 로그 메트릭 생성 파이프라인

```yaml
# 로그에서 메트릭 생성
log-to-metrics-pipeline:
  source:
    pipeline:
      name: "nginx-access-log-pipeline"
  processor:
    - aggregate:
        identification_keys: ["clientip", "request"]
        action:
          histogram:
            key: "bytes"
            record_minmax: true
            units: "bytes"
            buckets: [0, 1000, 5000, 10000, 50000, 100000]
        group_duration: "30s"
  sink:
    - opensearch:
        hosts: ["https://localhost:9200"]
        username: "admin"
        password: "admin"
        insecure: true
        index: "nginx-metrics-%{yyyy.MM.dd}"
```

### 이상 탐지 파이프라인

```yaml
# 이상 탐지
anomaly-detection-pipeline:
  source:
    pipeline:
      name: "log-to-metrics-pipeline"
  processor:
    - anomaly_detector:
        keys: ["bytes"]
        mode:
          random_cut_forest:
            shingle_size: 4
            sample_size: 256
  sink:
    - opensearch:
        hosts: ["https://localhost:9200"]
        username: "admin"
        password: "admin"
        insecure: true
        index: "nginx-anomalies-%{yyyy.MM.dd}"
```

## 6. 모니터링 및 메트릭 수집

### Data Prepper 자체 모니터링

Data Prepper는 기본적으로 /metrics/sys 엔드포인트에서 메트릭을 제공합니다. JVM 및 시스템 메트릭은 런타임 메트릭으로 클래스로더, 메모리, 가비지 컬렉션, 스레드 등에 대한 메트릭을 포함합니다.

```bash
# Data Prepper 메트릭 확인
curl http://localhost:4900/metrics/sys

# 파이프라인 목록 확인
curl http://localhost:4900/list
```

### Prometheus 연동

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'data-prepper'
    static_configs:
      - targets: ['localhost:4900']
    metrics_path: '/metrics/sys'
    scrape_interval: 30s
```

## 7. 성능 최적화

### 파이프라인 튜닝

```yaml
nginx-optimized-pipeline:
  workers: 4  # CPU 코어 수에 맞게 조정
  delay: 100  # 밀리초 단위
  buffer:
    bounded_blocking:
      buffer_size: 2048  # 메모리에 따라 조정
      batch_size: 512    # 처리량에 따라 조정
  source:
    http:
      path: "/log/ingest"
      ssl: false
      request_timeout: 10000  # 10초
      thread_count: 8
  processor:
    - grok:
        match:
          log: [ "%{COMMONAPACHELOG_DATATYPED}" ]
        break_on_match: true
        named_captures_only: true
  sink:
    - opensearch:
        hosts: ["https://localhost:9200"]
        username: "admin"
        password: "admin"
        insecure: true
        index: "nginx-logs-%{yyyy.MM.dd}"
        bulk_size: 100
        flush_timeout: 5000
```

## 8. 보안 설정

### SSL/TLS 활성화

```yaml
# data-prepper-config.yaml
ssl: true
keyStoreFilePath: "/usr/share/data-prepper/keystore.p12"
keyStorePassword: "password"
privateKeyPassword: "password"

# pipelines.yaml
nginx-secure-pipeline:
  source:
    http:
      ssl_certificate_file: "/path/to/cert.crt"
      ssl_key_file: "/path/to/key.key"
      authentication:
        http_basic:
          username: "user"
          password: "password"
```

## 9. 실행 및 확인

### 서비스 시작

```bash
# Docker Compose를 이용한 전체 스택 실행
version: '3.8'
services:
  data-prepper:
    image: opensearchproject/data-prepper:latest
    ports:
      - "4900:4900"
      - "2021:2021"
    volumes:
      - ./pipelines.yaml:/usr/share/data-prepper/pipelines/pipelines.yaml
      - ./data-prepper-config.yaml:/usr/share/data-prepper/config/data-prepper-config.yaml
    networks:
      - opensearch-net

  fluent-bit:
    image: fluent/fluent-bit:latest
    volumes:
      - ./fluent-bit.conf:/fluent-bit/etc/fluent-bit.conf
      - /var/log/nginx:/var/log/nginx:ro
    networks:
      - opensearch-net

networks:
  opensearch-net:
```

### 로그 생성 및 테스트

```bash
# Nginx 로그 생성
echo '192.168.1.1 - - [04/Nov/2024:15:07:25 -0500] "GET /index.html HTTP/1.1" 200 1024' >> /var/log/nginx/access.log

# Data Prepper 상태 확인
curl http://localhost:4900/list

# OpenSearch에서 데이터 확인
curl -X GET "localhost:9200/nginx-access-logs-*/_search?pretty"
```

이 설정을 통해 OpenSearch 3.1.0 이상에서 Data Prepper를 이용한 종합적인 서버 모니터링과 nginx 로그 수집 시스템을 구축할 수 있습니다. 각 파이프라인은 독립적으로 동작하며, 필요에 따라 추가적인 처리나 라우팅을 구성할 수 있습니다.

## 10. ARM64 아키텍처 지원

Data Prepper는 ARM64 아키텍처를 지원하지 않습니다. 그러나, 컨테이너 이미지를 빌드하여 ARM64 환경에서 실행할 수 있습니다. Dockerfile을 사용하여 이미지를 빌드하고, 필요한 의존성을 설치한 후, Data Prepper를 실행하는 스크립트를 추가해야 합니다.

### 소스 받기

```Bash
git clone https://github.com/opensearch-project/data-prepper.git
cd data-prepper
```

### Dockerfile 생성

Dockerfile 을 아래처럼 생성합니다.

```Dockerfile
# 1. 빌드 스테이지 (ARM64용 OpenJDK 이미지 사용). 자신의 서버에 설치된 jre 버전을 이용해야 합니다.
FROM --platform=linux/arm64 eclipse-temurin:11-jdk AS builder 
WORKDIR /app
# 소스 복사
COPY . .
# Gradle Wrapper로 빌드 (네트워크 환경에 따라 --no-daemon 옵션 추가 가능)
RUN ./gradlew build -x test
# RUN ./gradlew build -x test -x javadoc -Dfile.encoding=UTF-8 

# 2. 런타임 스테이지 (ARM64용 OpenJDK 이미지 사용)
FROM --platform=linux/arm64 eclipse-temurin:11-jre
WORKDIR /app
# 빌드 결과물 복사 (경로는 실제 빌드 결과물 위치에 따라 다를 수 있음)
COPY --from=builder /app/data-prepper-dist/build/distributions/*.tar.gz ./
# 압축 해제
RUN tar -xzf *.tar.gz && rm *.tar.gz
# 환경변수 및 실행 명령 (실제 실행 파일명에 맞게 수정)
ENV JAVA_OPTS=""
CMD ["sh", "-c", "./data-prepper-*/bin/data-prepper"]
```

소스 코드를 빌드하는데 ASCII 문자열 문제로 빌드가 안될 때가 있다. 그럴 때 아래 줄로 대체

  RUN ./gradlew build -x test -x javadoc -Dfile.encoding=UTF-8


### 이미지 빌드

도커 이미지 생성에 시간이 꽤 걸립니다.

```Bash
# x86 버전
docker build -t data-prepper-arm64 .
# arm64 버전
# docker build --platform linux/arm64 -t data-prepper:arm64 .
# 실행
# docker run --rm -it data-prepper:arm64
```

### 이미지 실행 및 Docker Compose에 추가

1. docker 로 실행
```Bash
docker run -p 4900:4900 -p 2021:2021 -v /path/to/pipelines.yaml:/usr/share/data-prepper/pipelines/pipelines.yaml -v /path/to/data-prepper-config.yaml:/usr/share/data-prepper/config/data-prepper-config.yaml data-prepper-arm64
```

2. docker-compose.yml 에 추가하는 법

```yaml
  data-prepper:
    image: data-prepper-arm64
    ports:
      - "4900:4900"
      - "2021:2021"
    volumes:
      - ./pipelines.yaml:/usr/share/data-prepper/pipelines/pipelines.yaml
      - ./data-prepper-config.yaml:/usr/share/data-prepper/config/data-prepper-config.yaml
    networks:
      - opensearch-net
```

### 직접 Docker 이미지 빌드한 경우

1. docker-compose.yml

```yaml
services:
  data-prepper:
    image: data-prepper:arm64
    container_name: data-prepper
    # 필요한 포트, 볼륨, 환경변수 등 추가
    ports:
      - "4900:4900"
    environment:
      - JAVA_OPTS=
```

2. 빌드와 compose 한번에 하기

```yaml
# docker-compose.yaml

services:
  data-prepper:
    build:
      context: .
      dockerfile: Dockerfile
      platform: linux/arm64
    image: data-prepper:arm64
    container_name: data-prepper
    ports:
      - "4900:4900"
```

```bash
docker compose up --build
``` 