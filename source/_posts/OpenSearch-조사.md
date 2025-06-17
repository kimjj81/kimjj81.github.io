---
title: OpenSearch 조사
tags: OpenSearch Analyzer Tokenizer Ranking Index LLM-Driven-Study
---

후기 : 다 읽고나니 GPT4.1의 일반 대화로는 질문 외 다른 중요한 사항들에 대해서는 부족한 부분이 많았음.  
딥리서치를 해서 결과를 비교해야 겠음.

---

OpenSearch 에 대해 공부하기 위해 조사한 사항.  GPT 4.1


질문 
elasticsearch 와 opensearch 에 대해 공부하고 싶은데 검색엔진에 대해 내가 피상적으로 알고 있는 사항을 얘기할 테니 맞는지 틀린건 어떤건지 알려줘. 또한 검색엔진에 대해 알아야 할 기반 지식도 같이 알려줘.

검색엔진은 비정형 텍스트 데이터를 전문 검색하기 위해 일반적으로 사용 됨.

또는 여러 종류의 데이터를 구분해서 입력 할 수 있으며 메타데이터 설정을 해야 함. 예를 들어 상품 검색을 하기 위해서 '_product' 인덱스를 만들고 [가격, 상품설명, 성별, 카테고리 이름]으로 구성된 데이터를 입력 할 수 있어.

이렇게 구성된것은 ranking 함수를 사용해서 결과 정렬에 이용 할 수 있어.

전문 검색은 전문검색을 위한 알고리즘을 이용해 순위를 생성하고 인덱스를 생성해. 전문검색의 대표적인 알고리즘은 BM25 야.

---
아주 정확하게 개념을 잡으셨고, 일부는 더 깊게 들어갈 수 있습니다. 말씀해주신 내용을 `사실 여부와 근거`를 중심으로 하나씩 피드백하고, `검색엔진(특히 Elasticsearch, OpenSearch)에서 반드시 알아야 할 기반 지식`도 추가로 정리해드립니다.

---

	5.	Query / Filter
	•	Query: 점수(스코어)가 붙는 검색 (ex: “~와 비슷한 문서”)
	•	Filter: 스코어 없음, 딱 맞는 값만 필터링 (ex: 가격 < 10000)

## `1.` `“검색엔진은 비정형 텍스트 데이터를 전문 검색하기 위해 일반적으로 사용 됨.”`

- `맞음.`
    
    - 검색엔진(Elasticsearch/OpenSearch 등)은 로그, 문서, 게시글 등 비정형 텍스트 데이터의 “전문(full-text)” 검색을 위해 널리 쓰입니다.
        
    - 참고: [Elastic 공식문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
        
    - `비정형`: 스키마가 고정되어 있지 않거나, 텍스트 기반의 데이터(문장, 단락 등).
        
    

---

## `2.` 

## `“여러 종류의 데이터를 구분해서 입력할 수 있으며 메타데이터 설정을 해야 함.”`

- `맞음.`
    
    - 인덱스는 ‘테이블’과 유사한 개념이고, 각 인덱스에는 다양한 필드(메타데이터 포함)를 가질 수 있습니다.
        
    - 상품 인덱스에 [가격, 상품설명, 성별, 카테고리] 등 원하는 필드 구성 가능.
        
    - 필드마다 타입을 지정(예: keyword, text, integer, date 등)해야 검색 성능에 최적화됨.
        
    - 참고: [Elasticsearch Mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)
        
    

---

## `3.` 

## `“이렇게 구성된 것은 ranking 함수를 사용해서 결과 정렬에 이용 할 수 있어.”`

- `맞음.`
    
    - “랭킹 함수”는 사용자의 질의(query)에 얼마나 잘 맞는지를 “점수(score)”로 계산하고, 이 점수에 따라 결과를 정렬합니다.
        
    - 기본 랭킹 알고리즘은 BM25.
        
    - 필요하다면, `사용자 정의 랭킹(score script)` 도 가능.
        
    

---

## `4.` 

## `“전문 검색은 전문검색을 위한 알고리즘을 이용해 순위를 생성하고 인덱스를 생성해.”`

- `절반만 맞음.`
    
    - 인덱스 생성과 랭킹 알고리즘은 분리된 개념입니다.
        
    - `인덱스 생성:` 데이터를 빠르게 찾기 위한 자료구조(역색인, inverted index)를 만드는 것.
        
    - `랭킹 알고리즘:` 검색 시 질의와 문서의 유사도(점수)를 계산해 결과를 정렬하는 것.
        
    - 실제로는 인덱싱 단계에서 역색인을 만들고, 검색 단계에서 BM25(혹은 다른 알고리즘)를 써서 랭킹.
        
    

---

## `5.` 

## `“전문검색의 대표적인 알고리즘은 BM25 야.”`

- `맞음.`
    
    - BM25는 현재까지 실무에서 가장 널리 쓰이는 `“문서-쿼리 간 유사도 점수”` 산정 알고리즘입니다.
        
    - Elasticsearch, OpenSearch의 기본(full-text) 스코어링 알고리즘.
        
    - 참고: [BM25 - Wikipedia](https://en.wikipedia.org/wiki/Okapi_BM25), [Elasticsearch - Relevance](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
        
    

---

# `검색엔진(Elasticsearch, OpenSearch) 기초적으로 알아야 할 개념`

1. `Index / Document / Field`
    
    - `Index:` 데이터 집합(=RDB의 테이블).
        
    - `Document:` 한 개의 레코드/row.
        
    - `Field:` Document의 속성(=RDB의 컬럼).
        
    
2. `Mapping (매핑)`
    
    - 각 필드의 데이터 타입 및 인덱싱 옵션 정의.
        
    - text(전문검색용), keyword(정확 매칭용), integer, date 등.
    - RDBMS의 Schema 에 대응
    
    
3. `Inverted Index (역색인)`
    
    - 텍스트를 빠르게 검색하기 위한 핵심 자료구조.
        
    - 각 “단어”가 어디 문서에 있는지 역방향으로 매핑.
        
    
4. `Analyzer / Tokenizer`
    
    - 텍스트를 “토큰(단어)” 단위로 쪼개고, 소문자화, 불용어(stopword) 제거 등 전처리.
        
    - 한글, 영어, 기타 언어마다 Analyzer가 다름.
        
    - 예시: “여성 청바지” → [여성, 청바지]로 분해
        
    
5. `Query / Filter`
    
    - `Query:` 점수(스코어)가 붙는 검색 (ex: “~와 비슷한 문서”)
        
    - `Filter:` 스코어 없음, 딱 맞는 값만 필터링 (ex: 가격 < 10000)
        
    - 둘의 차이를 이해하는 것이 중요
        
    
6. `Scoring (BM25 등)`
    
    - 검색 결과의 순위를 결정하는 알고리즘 (BM25, TF-IDF 등)
        
    - 쿼리와 문서의 관련도를 수치화
        
    
7. `Aggregation (집계)`
    
    - SQL의 GROUP BY와 유사. 카테고리별 상품 수, 가격대 분포 등 집계 질의 지원
        
    
8. `분산 구조`
    
    - 데이터 샤딩(shard), 레플리카(replica) 구조. 수평 확장 지원
        
    
9. `OpenSearch vs Elasticsearch`
    
    - OpenSearch는 AWS 주도로 만들어진 Elasticsearch 오픈소스 분기(fork).
        
    - 대부분의 기본 사용법은 동일하나, 플러그인 및 일부 기능에서 차이 존재.
        
    - 참고: [공식 FAQ](https://opensearch.org/docs/latest/faq/)
        
    

---

# `실용 예시`

  

상품 인덱스 생성 (Elasticsearch 예시, OpenSearch도 거의 동일)

```
PUT /products
{
  "mappings": {
    "properties": {
      "name": { "type": "text" },
      "description": { "type": "text" },
      "price": { "type": "integer" },
      "gender": { "type": "keyword" },
      "category": { "type": "keyword" }
    }
  }
}
```

상품 검색 예시 (쿼리 + 필터)

```
POST /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "description": "청바지" } }
      ],
      "filter": [
        { "term": { "gender": "female" } }
      ]
    }
  }
}
```

---

# `추천 학습 자료`

- [Elasticsearch 공식 Getting Started](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html)
    
- [OpenSearch 공식 문서](https://opensearch.org/docs/latest/)
    
- [BM25 설명 (Elastic 블로그)](https://www.elastic.co/kr/blog/practical-bm25-part-1-how-bm25-works)
    
- [유튜브: “Elasticsearch, OpenSearch 차이와 기본”](https://www.youtube.com/results?search_query=elasticsearch+opensearch+%EC%B0%A8%EC%9D%B4)
    

---

## `요약`

- 전체적으로 개념 잘 잡으셨고, `인덱스 구조와 랭킹 함수의 차이`만 조금 보완하면 더 완벽.
    
- 반드시 알아야 할 기반 개념은 `역색인, 매핑, analyzer, query/filter, scoring` 등.
    
- Elasticsearch와 OpenSearch는 거의 동일하지만, 오픈소스 분기로 약간의 차이 존재.
    

  

`더 구체적으로 궁금한 주제(예: 한글 분석기, 쿼리 최적화, 랭킹 커스터마이즈 등) 있으면 추가로 질문 주셔도 됩니다.`

---
추가 질문
1. 언어별 형태소 분석기의 대표적인 예(한글, 영어, 일본어, 범용)
2. 형태소 분석기를 통한 데이터를 입력해야 하는지, 데이터를 입력 할 때 형태소 분석기를 지정하면 되는지?
3. 쿼리 최적화가 RDBMS와 다른점은?
---

## `1. 언어별 형태소 분석기의 대표적인 예`

  

`형태소 분석기(Morphological Analyzer)`는 언어마다 다릅니다.

Elasticsearch/OpenSearch에서 자주 쓰이는 대표적인 분석기를 기준으로 정리합니다.

  

### `한글`

- `Nori`:
    
    - Elasticsearch/Opensearch의 공식 한글 형태소 분석기
        
    - [공식 문서](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-nori.html)
        
    
- `Mecab`:
    
    - 오픈소스 한글(및 일본어) 형태소 분석기. Python, Java 등 바인딩 많음
        
    - [공식 깃허브](https://github.com/SOMJANG/Mecab-ko-for-Google-Colab)
        
    - Elastic/Opensearch 직접 연동은 제한적(플러그인 필요)
        
    
- `OpenKoreanText` (구 Twitter Korean Text):
    
    - Java 기반 한글 분석, Spark 등에서 널리 사용
        
    - [공식 깃허브](https://github.com/open-korean-text/open-korean-text)
        
    

  

### `영어`

- `Standard analyzer` (Elasticsearch 기본):
    
    - 토크나이저 + 불용어(stopwords) 처리 등 내장
        
    
- `Snowball`:
    
    - 어간 추출(stemming) 지원, 여러 언어 지원
        
    
- `Porter`:
    
    - 고전적인 어간 추출 알고리즘
        
    

  

### `일본어`

- `Kuromoji`:
    
    - Elasticsearch/Opensearch 공식 일본어 형태소 분석기
        
    - [공식 문서](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-kuromoji.html)
        
    
- `Mecab`:
    
    - 일본어 분석에 가장 널리 쓰임
        
    

  

### `범용`

- `Standard analyzer`:
    
    - 영어 및 라틴계 언어에 적합
        
    
- `ICU analyzer`:
    
    - 다양한 언어 지원(Unicode 기반), Elastic 공식 플러그인
        
    - [공식 문서](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html)
        
    
- `NLP 라이브러리`
    
    - Elasticsearch와 직접 연동은 아니지만, spaCy, NLTK, Stanza 등도 범용 형태소 분석 지원
        
    

---

## `2. 형태소 분석기 적용:` 

## `입력 데이터 vs 인덱스 매핑`

  

### `요점`

- `데이터를 입력할 때 미리 형태소 분석한 결과를 저장하는 게 아님!`
    
- `인덱스를 만들 때(매핑 정의 시) “어떤 analyzer(형태소 분석기)”를 쓸지 필드별로 지정`
    
- 이후 `문서가 인덱싱(저장)될 때 자동으로 analyzer가 동작`
    
- 쿼리할 때도 analyzer 지정 가능 (ex: 검색어도 같은 분석기로 쪼갬)
    

  

### `실제 예시`

  

#### `1. 인덱스 매핑 시 분석기 지정`

```
PUT /korean_docs
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_korean_analyzer": {
          "type": "nori"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "my_korean_analyzer"
      }
    }
  }
}
```

- 이러면 content 필드는 `입력할 때마다 Nori 형태소 분석기가 자동 적용`
    

  

#### `2. 쿼리 시 analyzer 지정`

```
GET /korean_docs/_search
{
  "query": {
    "match": {
      "content": {
        "query": "청바지를 샀어요",
        "analyzer": "my_korean_analyzer"
      }
    }
  }
}
```

- 보통 인덱스 시에 지정한 분석기가 쿼리에도 자동 적용되므로 명시하지 않아도 됨
    

  

`결론:`

- 데이터를 사전에 형태소 분석해서 넣는 게 아니라, `인덱스 필드에 분석기를 지정하면 Elasticsearch/OpenSearch가 알아서 처리`
    
- 특별한 경우(예: pre-tokenized field 등)만 미리 토큰화된 데이터를 입력할 때가 있음
    

---

## `3. 쿼리 최적화: RDBMS와의 차이점`

  

### `RDBMS 쿼리 최적화`

- `인덱스, 조인, 정규화/비정규화, 쿼리 플랜 등`이 중심
    
- 일반적으로 `정확한 값 기반 필터링`(where, join, group by 등)이 많음
    
- `관계형 데이터`의 최적화(중복 최소화, 데이터 일관성)가 주 목적
    

  

### `Elasticsearch/OpenSearch 쿼리 최적화의 차이`

  

#### `주요 차이점`

- `1. 스코어 기반 검색과 랭킹 중심`
    
    - “정확하게 일치”보다 “얼마나 비슷한가”(relevance)가 더 중요함
        
    - 쿼리 튜닝의 목표가 `정확도와 속도의 균형`임
        
    
- `2. 역색인(inverted index) 기반 구조`
    
    - 대부분의 최적화는 “역색인 구조에 적합한 쿼리 작성”
        
    - 불필요한 scoring을 피하고, filter 쿼리로 분리(필터는 빠름, 점수 없음)
        
    
- `3. 분산(샤드, 레플리카) 기반`
    
    - 데이터가 여러 서버로 나뉘어 저장됨
        
    - 샤드 수, 레플리카 구성에 따라 성능 달라짐
        
    
- `4. Analyzer/Tokenizer 영향`
    
    - 쿼리 성능에 텍스트 분석기(형태소 분석, ngram, edge ngram 등)의 영향이 매우 큼
        
    - 잘못된 analyzer 설정 → 인덱스 폭증/검색 속도 저하
        
    
- `5. Aggregation/집계 쿼리 최적화`
    
    - 집계(aggregation)는 RDB의 group by와 유사하나, 분산환경에서 성능 튜닝 필요
        
    

  

#### `예시: 쿼리 최적화 팁`

- `filter`와 `must` 구분 사용 (filter는 scoring하지 않아 속도 빠름)
    
- `source 필드 최소화` (_source: false 또는 필요한 필드만 요청)
    
- `샤드/레플리카 튜닝`
    
- `쿼리 프로파일링` (_search/profile 사용)
    
- `Bulk indexing`(대량 인덱싱은 한번에)
    

  

#### `참고`

- [Elasticsearch Query Optimization Tips](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-search-speed.html)
    
- [공식 RDBMS vs Elasticsearch 구조 비교](https://www.elastic.co/guide/en/elasticsearch/reference/current/sql-limitations.html)
    

---

## `정리/요약`

1. `언어별 형태소 분석기`
    
    - 한글: Nori, Mecab, OpenKoreanText
        
    - 영어: Standard, Snowball, Porter
        
    - 일본어: Kuromoji, Mecab
        
    - 범용: ICU, spaCy 등
        
    
2. `형태소 분석기 지정:`
    
    - `입력 데이터 자체를 분석해서 저장하는 것이 아님`
        
    - `인덱스 매핑에서 analyzer 지정` → Elasticsearch/OpenSearch가 자동 적용
        
    
3. `쿼리 최적화의 차이:`
    
    - RDBMS는 인덱스/정확매칭 중심
        
    - 검색엔진은 `역색인, 랭킹, 분산 구조, analyzer` 영향이 크고, filter/must 구분, aggregation 튜닝 등이 중심
        
    

  

필요하면 각 주제별 더 깊은 예제/튜닝 방법도 제공 가능합니다!

궁금한 부분 있으면 더 구체적으로 질문 주세요.

---

`참고:`

- [Elasticsearch 공식 분석기 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis.html)
    
- [Nori 분석기 소개 블로그](https://www.elastic.co/kr/blog/nori-the-official-elasticsearch-plugin-for-korean-language-analysis)
    
- [쿼리 최적화 가이드](https://opensearch.org/docs/latest/tuning-your-cluster/)

---

## Stopword 에 관해

https://github.com/apache/lucene/blob/main/lucene/analysis/common/src/resources/org/apache/lucene/analysis/cjk/stopwords.txt 
기본적으로 한중일에 대해서 불용어 처리가 없다.


`stop word(불용어) 처리기`는 검색엔진에서 “의미 없는 단어”(예: 영어의 “the”, “is”, “at” 또는 한국어의 “은”, “는”, “이”, “가” 등)를 인덱스와 쿼리에서 `자동으로 제거`하여 검색 효율과 정확도를 높이는 데 사용합니다.


아래는 `Elasticsearch / OpenSearch에서 stop word 처리기를 사용하는 방법`을 설명합니다.

---

## `1.` 

## `stop word의 기본 원리`

- `인덱싱 시:`
    
    Analyzer가 텍스트를 토큰(단어)으로 분리할 때, stop word에 해당하는 단어는 `자동으로 제거`됨 → 인덱스 크기 및 검색 속도 향상.
    
- `검색(쿼리) 시:`
    
    입력 쿼리에서도 stop word가 제거되어, 실제로 검색에 의미 있는 단어만 남음.
    

---

## `2.` 

## `Elasticsearch/OpenSearch에서 stop word 적용 방법`

  

### `A. 내장 analyzer 사용 (자동 적용)`

- `영어의 경우:`
    
    standard, english analyzer 등은 기본적으로 stop word 처리가 내장되어 있음.
    
- `예시`
    

```
PUT /myindex
{
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "english"
      }
    }
  }
}
```

- → english analyzer에는 불용어 리스트가 이미 포함되어 있음.
    

  

### `B. 커스텀 analyzer에서 stop word 처리기 지정`

- 직접 원하는 불용어 리스트를 지정하거나, 내장 stop word filter를 명시적으로 추가할 수 있음.
    

  

#### `예시 1: 영어 커스텀 불용어 처리기`

```
PUT /customstopindex
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_english_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "english_stop"
          ]
        }
      },
      "filter": {
        "english_stop": {
          "type": "stop",
          "stopwords": "_english_"    // 내장 영어 불용어
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "my_english_analyzer"
      }
    }
  }
}
```

#### `예시 2: 한글 커스텀 불용어 처리기`

- 한글은 내장 불용어 리스트가 제한적이므로 직접 지정하는 것이 일반적
    

```
PUT /koreanindex
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_korean_analyzer": {
          "type": "custom",
          "tokenizer": "nori_tokenizer",
          "filter": [
            "lowercase",
            "my_korean_stop"
          ]
        }
      },
      "filter": {
        "my_korean_stop": {
          "type": "stop",
          "stopwords": ["은", "는", "이", "가", "를", "을", "와", "과", "의"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "my_korean_analyzer"
      }
    }
  }
}
```

---

### `3. 동작 확인 (예시)`

  

`분석 API로 동작 확인`

```
POST /koreanindex/_analyze
{
  "analyzer": "my_korean_analyzer",
  "text": "이 상품은 청바지입니다"
}
```

→ 결과 토큰에서 "이", "은" 등은 제거됨.

실제로 쿼리 시에도 동일하게 처리되어, “청바지” 같은 의미 있는 단어만 인덱싱/검색됨.

---

## `4.` 

## `참고자료`

- [공식 Stop Token Filter 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-stop-tokenfilter.html)
- [AWS OpeaSearch Nori 불용어 플러그인](https://aws.amazon.com/ko/blogs/tech/amazon-opensearch-service-korean-nori-plugin-for-analysis/)

---

## `정리`

- `stop word 처리기는 analyzer 설정에 filter로 추가`
- `영어 등 일부 언어는 내장 stopword set 사용 가능`
- `한글 등은 직접 리스트 지정 필요`
- `인덱스 및 쿼리 양쪽 모두에서 stopword가 제거되어 의미 있는 검색 결과를 얻을 수 있음`
- Nori 는 기본 설치, 은전한닢은 플러그인 설치 필요 

 기타 더 읽어본 것
 - https://helloworld.kurly.com/blog/2023-review-opensearch/ 컬리에서 opensearch 도입 후기
	 - 성능 테스트 : [Ngrinder](https://naver.github.io/ngrinder/) 
 - https://danawalab.github.io/elastic/2023/01/05/MecabVsNori.html 다나와 기술 블로그 Nori, Mecab-Ko
	 - 사전 크기에 따라 인덱스 성능도 변화됨. 사전은 어떻게 유지관리 하는지가 문제가 될 수 있겠음
 - https://www.elastic.co/kr/blog/nori-the-official-elasticsearch-plugin-for-korean-language-analysis 
 - 우리나라 말은 합성어도 중요하기 때문에 decompound_mode 의 mixed 를 사용하는 것이 좋을 듯함.
 - https://velog.io/@window/Elasticsearch%ED%98%95%ED%83%9C%EC%86%8C-%EB%B6%84%EC%84%9D%EA%B8%B0 좀 더 자세한 nori 의 사용법. 한문->한자 등. 
 - CJK analyzer (불용어도 포함) https://docs.opensearch.org/docs/latest/analyzers/language-analyzers/cjk/ 

- LLM 도 쓴다고? 이건 나중에 https://docs.opensearch.org/docs/latest/ml-commons-plugin/pretrained-models/ 