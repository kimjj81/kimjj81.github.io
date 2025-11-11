---
layout: add
title: PostgreSQL에서 BM25와 벡터 검색을 함께 - pg_textsearch 확장 소개
date: 2025-10-31 14:34:42
tags:
  - PostgreSQL
  - BM25
  - 전문검색
  - pgvector
  - RAG
  - AI
categories:
  - Database
  - Search
---

## 참고자료

- [pg_textsearch 공식 문서](https://docs.tigerdata.com/use-timescale/latest/extensions/pg-textsearch/)
- [Tiger Cloud](https://www.tigerdata.com/cloud)
- [원문 블로그 포스트](https://www.tigerdata.com/blog/introducing-pg_textsearch-true-bm25-ranking-hybrid-retrieval-postgres)

## 개요

Tiger Data에서 PostgreSQL을 위한 새로운 확장인 `pg_textsearch`를 공개했습니다. 이 확장은 현대적인 BM25 랭킹 알고리즘을 PostgreSQL에 도입하여, AI 애플리케이션을 위한 하이브리드 검색 시스템을 단일 데이터베이스에서 구현할 수 있게 합니다.

## 검색 기술의 진화

검색 기술은 세 가지 시대를 거쳐 발전해왔습니다.

**첫 번째 시대**는 전자상거래나 문서 관리 시스템과 같은 정적인 카탈로그 검색에 초점을 맞췄습니다. PostgreSQL의 네이티브 전문 검색 기능인 `tsvector`와 `tsquery`가 이 용도로 오랫동안 사용되어 왔습니다.

**두 번째 시대**는 서버 로그, 메트릭, 이벤트 스트림과 같은 대용량 운영 데이터를 다루는 시기였습니다. Elasticsearch가 이 영역을 주도하며 수평 확장, 집계 기능, 대량 데이터의 실시간 인덱싱을 제공했습니다.

**세 번째 시대**는 현재의 AI 네이티브 애플리케이션 시대입니다. RAG(Retrieval-Augmented Generation) 시스템, 챗봇, 에이전트 워크플로우는 LLM이 컨텍스트를 검색할 수 있도록 검색 기능을 필요로 합니다. 이러한 시스템은 벡터 검색을 통한 의미론적 이해와 키워드 매칭의 정확성을 모두 요구합니다.

## 기존 PostgreSQL 전문검색과의 차이점

PostgreSQL은 오래전부터 `tsvector`와 `tsquery` 타입을 이용한 전문검색 기능을 제공해왔습니다. 그렇다면 `pg_textsearch`는 무엇이 다를까요?

### 기존 PostgreSQL 전문검색 방식

```sql
-- 기존 방식: tsvector와 tsquery 사용
CREATE INDEX articles_fts_idx ON articles 
USING gin(to_tsvector('english', content));

SELECT * FROM articles 
WHERE to_tsvector('english', content) @@ to_tsquery('database & performance');

-- 랭킹을 위한 ts_rank 사용
SELECT title, 
       ts_rank(to_tsvector('english', content), 
               to_tsquery('database & performance')) as score
FROM articles
ORDER BY score DESC;
```

이 방식은 수년간 카탈로그 검색, 문서 관리 시스템 등에서 잘 작동해왔습니다. 하지만 AI 애플리케이션에 필요한 고품질 검색 결과를 제공하는 데는 몇 가지 근본적인 한계가 있습니다.

## PostgreSQL 네이티브 전문 검색의 한계

### 1. 랭킹 품질 문제

PostgreSQL의 기본 `ts_rank` 함수는 현대적인 검색 엔진이 사용하는 핵심 랭킹 신호가 부족합니다.

#### IDF(Inverse Document Frequency) 부재

`ts_rank`는 "the", "a" 같은 흔한 단어나 "PostgreSQL" 같은 의미 있는 단어를 동일하게 취급합니다. 단어의 희소성을 고려하지 않아 일반적인 단어와 구별력 있는 단어에 동일한 가중치를 부여합니다.

```
"the"        → 거의 모든 문서에 존재 (낮은 정보가치)
"PostgreSQL" → 특정 문서에만 존재 (높은 정보가치)

ts_rank: 둘 다 동일하게 취급 ❌
BM25:    PostgreSQL에 더 높은 가중치 ✅
```

#### 용어 빈도 포화 미적용

키워드를 과도하게 반복하는 문서가 랭킹에서 부당하게 우위를 점할 수 있습니다.

```
문서 A: "database"를 50번 언급, "pooling" 2번 언급
문서 B: "database"를 5번 언급, "pooling" 20번 언급 (pooling 전문 가이드)

쿼리: "database connection pooling"

ts_rank 결과: 문서 A > 문서 B (잘못된 결과!)
이유: "database" 반복으로 인한 높은 점수
```

BM25는 용어 빈도 포화(TF Saturation)를 적용하여 이 문제를 해결합니다:

```
1번 출현:  큰 점수 증가
5번 출현:  적당한 점수 증가
50번 출현: 거의 증가 안함 (포화 효과)
```

#### 문서 길이 정규화 부족

긴 문서가 실제 관련성과 무관하게 높은 점수를 받습니다. 짧은 문서에서 5번 나타나는 키워드와 긴 문서에서 5번 나타나는 키워드가 동일하게 평가됩니다.

```
짧은 문서 (100단어): "PostgreSQL" 5번 → 높은 밀도
긴 문서 (1000단어): "PostgreSQL" 5번 → 낮은 밀도

ts_rank: 둘 다 비슷한 점수 ❌
BM25:    짧은 문서에 더 높은 점수 ✅
```

### 2. Boolean 매칭의 취약성

PostgreSQL의 GIN과 GiST 인덱스는 `@@` 연산자를 통한 Boolean 검색을 가속화합니다. 하지만 이는 **모든 쿼리 단어가 문서에 반드시 나타나야** 매칭됩니다.

```sql
-- 모든 단어가 필수
WHERE to_tsvector('english', content) @@ 
      to_tsquery('database & connection & pooling & management')
```

"database connection pooling management"를 검색할 때, "management"라는 단어가 없다는 이유만으로 연결 풀링에 대한 훌륭한 문서가 결과에서 **완전히 제외**됩니다. 부분 매칭이 불가능해 관련성 높은 문서를 놓칠 수 있습니다.

반면 BM25는 유연한 랭킹 방식을 제공합니다:

```sql
-- 단어가 많을수록 점수가 높지만, 일부만 있어도 검색됨
WHERE content <@> to_bm25query('database connection pooling management', 'idx')
```

### 3. 성능 문제

PostgreSQL은 결과를 랭킹하기 위해 매칭되는 **모든 문서의 점수를 계산**해야 합니다. 상위 k개의 관련 문서만 효율적으로 검색할 방법이 없습니다.

```sql
-- 100만개 문서에서 "database" 검색
-- → 50만개가 매칭됨
SELECT * FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('database')
ORDER BY ts_rank(to_tsvector('english', content), to_tsquery('database')) DESC
LIMIT 10;

-- 문제: 상위 10개만 필요하지만 50만개 전부의 점수를 계산해야 함
```

일반적인 단어로 수백만 행이 매칭될 때 이는 성능상 큰 부담이 됩니다. 실제로:
- 800,000행에서 `ts_rank`를 사용한 쿼리가 **1초 미만에서 25-30초**로 느려지는 사례 보고
- 랭킹을 위해 각 매칭 문서의 `tsvector`를 조회해야 하므로 I/O 바운드 발생
- 1-2백만 행 규모에서 심각한 성능 저하 발생

### 실제 비교 예시

다음 테스트 데이터로 두 방식을 비교해보겠습니다:

```sql
INSERT INTO articles (content) VALUES
('database database database connection'),           -- 문서 1
('connection pooling best practices guide'),         -- 문서 2  
('comprehensive pooling management tutorial');      -- 문서 3

-- 쿼리: "database connection pooling"
```

**기존 ts_rank 결과:**
```
1. 문서 1 (점수 높음: "database" 3번 반복)
2. 문서 2
3. 문서 3 (제외될 수 있음: "database" 없음)
```

**BM25 결과:**
```
1. 문서 2 (최고 관련성: connection + pooling)
2. 문서 3 (pooling 전문 가이드, "database" 없어도 포함)
3. 문서 1 (키워드 반복의 효과 제한됨)
```

### 비교 요약표

| 기능 | 기존 PostgreSQL FTS | pg_textsearch (BM25) |
|------|---------------------|----------------------|
| 검색 방식 | Boolean 매칭 | 랭킹 기반 검색 |
| IDF 가중치 | ❌ | ✅ |
| TF 포화 | ❌ | ✅ |
| 길이 정규화 | ❌ | ✅ |
| 부분 매칭 | 제한적 (AND 조건) | 유연함 (랭킹 점수) |
| 대규모 성능 | 느림 (전체 스캔) | 빠름 (최적화된 인덱스) |
| pgvector 통합 | 수동 구현 | 최적화된 통합 |
| 사용 적합성 | 단순 Boolean 검색 | AI/RAG 애플리케이션 |

## BM25: 현대적인 랭킹 알고리즘

BM25는 수십 년간 검증된 정보 검색 연구를 바탕으로 세 가지 핵심 개선사항을 통해 이러한 문제를 해결합니다.

1. **IDF 가중치**: 구별력 있는 용어를 식별합니다.
2. **용어 빈도 포화**: 키워드 스터핑으로 랭킹을 조작하는 것을 방지합니다.
3. **길이 정규화**: 짧은 문서와 긴 문서 간의 공정한 비교를 보장합니다.

이러한 기법은 Elasticsearch, Solr, Meilisearch를 포함한 현대 검색 엔진에서 널리 사용되는 검증된 접근 방식입니다.

## pg_textsearch: PostgreSQL을 위한 BM25

`pg_textsearch`는 이러한 검증된 접근 방식을 PostgreSQL로 가져오되, 완전한 검색 플랫폼을 재구현하는 대신 우수한 BM25 랭킹 구현에 집중합니다.

### 주요 특징

- **진정한 BM25 랭킹**: IDF, 용어 빈도 포화, 길이 정규화를 포함한 완전한 BM25 구현
- **트랜잭션 일관성**: PostgreSQL의 ACID 보장을 유지하며 별도의 동기화 작업 불필요
- **pgvector와의 통합**: 하이브리드 검색을 위한 원활한 통합
- **운영 단순성**: 별도의 검색 엔진이나 복잡한 동기화 파이프라인 불필요

## 단일 PostgreSQL 시스템의 장점

`pg_textsearch`와 `pgvector`를 함께 사용하면 단일 PostgreSQL 인스턴스에서 완전한 하이브리드 검색 시스템을 구축할 수 있습니다. 이는 다음과 같은 중요한 장점을 제공합니다.

### 1. 아키텍처 단순화

별도의 검색 엔진(Elasticsearch, Meilisearch 등)을 운영할 필요가 없습니다. 데이터베이스와 검색 인덱스 간의 동기화를 관리하는 복잡한 파이프라인도 필요하지 않습니다. 모든 것이 PostgreSQL 내에서 트랜잭션으로 관리됩니다.

### 2. 운영 복잡성 감소

- 관리할 시스템이 하나만 존재
- 데이터 일관성 문제 제거
- 배포와 모니터링 단순화
- 인프라 비용 절감

### 3. 개발 생산성 향상

표준 SQL로 전문 검색과 벡터 검색을 모두 수행할 수 있습니다. JOIN, 필터링, 집계와 같은 PostgreSQL의 강력한 기능을 검색 결과에 직접 적용할 수 있습니다.

### 4. 데이터 일관성 보장

UPDATE나 DELETE 작업 시 인덱스가 즉시 업데이트됩니다. 별도의 동기화 작업이나 최종 일관성 모델이 필요하지 않습니다. 이는 외부 검색 시스템과 데이터베이스를 동기화하는 복잡한 분산 시스템 문제를 근본적으로 제거합니다.

## 기본 사용법

### 확장 설치

```sql
CREATE EXTENSION pg_textsearch;
```

### 테이블 생성 및 인덱스 구축

```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    published_date DATE
);

-- BM25 인덱스 생성
CREATE INDEX articles_content_idx ON articles
USING bm25(content)
WITH (text_config='english');
```

`text_config` 매개변수는 토큰화와 형태소 분석을 위한 PostgreSQL 텍스트 검색 설정을 지정합니다. 영어, 프랑스어, 독일어를 포함해 29개 이상의 언어를 지원합니다.

### 검색 수행

```sql
SELECT id, title,
       content <@> to_bm25query('database performance', 'articles_content_idx') AS score
FROM articles
ORDER BY score
LIMIT 5;
```

핵심 포인트:
- `<@>` "eyeball" 연산자가 텍스트와 쿼리 간의 BM25 점수를 계산합니다
- `to_bm25query()`는 적절한 IDF 계산을 위해 인덱스 이름과 함께 쿼리 객체를 생성합니다
- BM25 점수는 음수이며, 0에 가까울수록 더 관련성이 높습니다

### 표준 SQL 통합

```sql
-- 날짜와 관련성 임계값으로 필터링
SELECT title, published_date
FROM articles
WHERE published_date > '2024-01-01'
  AND content <@> to_bm25query('query optimization', 'articles_content_idx') < -1.5
ORDER BY content <@> to_bm25query('query optimization', 'articles_content_idx');

-- 월별로 결과 그룹화
SELECT DATE_TRUNC('month', published_date) AS month,
       COUNT(*) AS matching_articles,
       AVG(content <@> to_bm25query('indexes', 'articles_content_idx')) AS avg_score
FROM articles
WHERE content <@> to_bm25query('indexes', 'articles_content_idx') < -0.5
GROUP BY month
ORDER BY month DESC;

-- 다른 테이블과 조인
SELECT a.title, u.name AS author,
       a.content <@> to_bm25query('postgres tips', 'articles_content_idx') AS score
FROM articles a
JOIN users u ON a.author_id = u.id
ORDER BY score
LIMIT 10;
```

## 하이브리드 검색: 벡터와 키워드 결합

현대적인 검색 시스템은 최적의 결과를 위해 의미론적 벡터 검색과 키워드 매칭을 결합합니다. 벡터 임베딩은 개념적 유사성을 포착하지만 정확한 용어를 놓칠 수 있습니다("PostgreSQL 17.2" 대 "PostgreSQL 17.1"). 키워드 검색은 정확한 매칭에 정밀도를 제공하지만 의미론적 이해가 부족합니다. **단일 PostgreSQL 시스템에서 두 가지를 함께 사용하는 것이 최상의 결과를 제공합니다.**

### 테이블 설정

```sql
-- 텍스트 콘텐츠와 벡터 임베딩을 모두 포함하는 테이블 생성
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    embedding vector(1536)  -- OpenAI ada-002 차원
);

-- 두 인덱스 모두 생성
CREATE INDEX documents_embedding_idx ON documents
USING hnsw (embedding vector_cosine_ops);

CREATE INDEX documents_content_idx ON documents
USING bm25(content)
WITH (text_config='english');
```

### Reciprocal Rank Fusion (RRF)

여러 소스의 결과를 결합하는 인기 있는 방법은 Cormack 등이 SIGIR 2009에서 소개한 Reciprocal Rank Fusion입니다. RRF는 파라미터 없이 간단하게 여러 랭킹을 병합하는 방법을 제공합니다.

```sql
-- 벡터와 키워드 결과를 결합하는 하이브리드 검색
WITH vector_search AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector) AS rank
    FROM documents
    ORDER BY embedding <=> $1::vector
    LIMIT 20
),
keyword_search AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY content <@> to_bm25query('query performance', 'documents_content_idx')) AS rank
    FROM documents
    ORDER BY content <@> to_bm25query('query performance', 'documents_content_idx')
    LIMIT 20
)
SELECT
    d.id,
    d.title,
    COALESCE(1.0 / (60 + v.rank), 0.0) + COALESCE(1.0 / (60 + k.rank), 0.0) AS combined_score
FROM documents d
LEFT JOIN vector_search v ON d.id = v.id
LEFT JOIN keyword_search k ON d.id = k.id
WHERE v.id IS NOT NULL OR k.id IS NOT NULL
ORDER BY combined_score DESC
LIMIT 10;
```

이 쿼리는:
1. 벡터 검색에서 상위 20개 결과를 가져옵니다
2. 키워드 검색에서 상위 20개 결과를 가져옵니다
3. RRF 공식 `1 / (k + rank)`를 사용해 두 결과를 결합합니다

### 가중치 조정

벡터 대 키워드 검색의 상대적 중요도를 조정할 수 있습니다.

```sql
SELECT
    d.id,
    d.title,
    0.7 * COALESCE(1.0 / (60 + v.rank), 0.0) +  -- 벡터에 70% 가중치
    0.3 * COALESCE(1.0 / (60 + k.rank), 0.0)    -- 키워드에 30% 가중치
    AS combined_score
FROM documents d
LEFT JOIN vector_search v ON d.id = v.id
LEFT JOIN keyword_search k ON d.id = k.id
WHERE v.id IS NOT NULL OR k.id IS NOT NULL
ORDER BY combined_score DESC
LIMIT 10;
```

## 아키텍처 세부사항

### 현재 프리뷰 릴리스

프리뷰 릴리스는 인메모리 구조를 사용해 빠른 쓰기와 쿼리를 제공합니다. 구현은 PostgreSQL의 Dynamic Shared Areas(DSA)를 활용해 공유 메모리에 역색인을 구축합니다.

핵심 구성요소:
1. **용어 사전**: 문자열 인터닝을 사용한 DSA 해시 테이블
2. **포스팅 리스트**: DSA 메모리에 동적으로 증가하는 벡터
3. **문서 메타데이터**: 각 문서의 길이와 상태 추적

### 향후 계획

1. **디스크 기반 세그먼트**: 메모리 제한 제거
2. **압축 최적화**: 델타 인코딩과 스킵 리스트로 성능 향상
3. **고급 쿼리 알고리즘**: Block-Max WAND를 통한 효율적인 top-k 검색

## RAG 시스템에 이상적인 이유

RAG(Retrieval-Augmented Generation) 시스템의 품질은 검색 품질에 직접적으로 의존합니다. 평범한 문서를 검색하면 LLM도 평범한 응답을 생성합니다.

`pg_textsearch`와 `pgvector`를 단일 PostgreSQL 시스템에서 함께 사용하면:

- **높은 검색 품질**: BM25의 정확한 키워드 매칭과 벡터 검색의 의미론적 이해를 결합
- **일관성 보장**: 트랜잭션 ACID 속성으로 데이터 불일치 문제 제거
- **간단한 통합**: 복잡한 다중 시스템 아키텍처 대신 표준 SQL 쿼리로 해결
- **비용 효율성**: 별도의 검색 인프라 불필요

## 언제 어떤 방식을 사용해야 할까?

### 기존 tsvector/tsquery 사용이 적합한 경우

- **단순한 Boolean 검색**: "이 단어들이 문서에 있는가?"만 확인하면 되는 경우
- **소규모 데이터**: 문서 수가 수천~수만 건 수준
- **랭킹 품질이 중요하지 않음**: 검색 결과의 순서보다 포함 여부가 중요한 경우
- **레거시 시스템**: 이미 구축되어 잘 작동하는 시스템

예시 사용 사례:
- 간단한 제품 카탈로그 검색
- 내부 문서 관리 시스템
- 단순 키워드 필터링

### pg_textsearch 사용이 적합한 경우

- **RAG(Retrieval-Augmented Generation) 시스템**: LLM에 제공할 최상의 컨텍스트를 찾아야 하는 경우
- **AI 애플리케이션**: 검색 품질이 전체 시스템의 출력 품질을 직접적으로 결정하는 경우
- **대규모 문서 컬렉션**: 수십만~수백만 건 이상의 문서
- **하이브리드 검색**: pgvector와 함께 의미 검색과 키워드 검색을 결합해야 하는 경우
- **높은 품질 요구**: Elasticsearch 수준의 랭킹 품질이 필요한 경우

예시 사용 사례:
- AI 챗봇의 지식 베이스 검색
- 기술 문서 Q&A 시스템
- 대규모 콘텐츠 추천 시스템
- 연구 논문 검색 플랫폼

## 시작하기

### Tiger Cloud에서 사용

```bash
curl -fsSL https://cli.tigerdata.com | sh
tiger auth login
tiger service create
tiger db connect
```

### 확장 활성화

```sql
CREATE EXTENSION pg_textsearch;
```

전체 문서는 [Tiger Data 공식 문서](https://docs.tigerdata.com/use-timescale/latest/extensions/pg-textsearch/)에서 확인할 수 있습니다.

## 결론

`pg_textsearch`는 PostgreSQL에 현대적인 BM25 랭킹을 도입하여 AI 네이티브 애플리케이션을 위한 고품질 검색을 가능하게 합니다. `pgvector`와 함께 사용하면 **단일 PostgreSQL 시스템에서 완전한 하이브리드 검색 솔루션**을 구축할 수 있습니다.

별도의 검색 엔진 없이, 복잡한 동기화 파이프라인 없이, 데이터 일관성 문제 없이 전문 검색과 벡터 검색을 모두 활용할 수 있습니다. 이는 RAG 시스템과 AI 애플리케이션 개발을 크게 단순화하면서도 엔터프라이즈급 품질을 제공합니다.

프리뷰 릴리스가 공개되었으며, Tiger Cloud에서 무료로 사용해볼 수 있습니다. AI 애플리케이션을 구축하는 개발자에게 특히 유용한 도구가 될 것입니다.

