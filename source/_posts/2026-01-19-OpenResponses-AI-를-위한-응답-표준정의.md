---
title: OpenResponses - AI 를 위한 응답 표준정의
date: 2026-01-19 15:16:03
tags: llm, api, agent, open, ai
---

출처 : https://www.openresponses.org/
저장소 : https://github.com/openresponses/openresponses

## Open Responses 소개

Open Responses는 OpenAI API 에서 영감을 받아 정한 다양한 벤더의 LLM 추론을 위한 오픈소스 규약이다.  
에이전트 개발자, MLOps, 서빙하는 사람은 알아야 겠다.

    Open Responses is an open-source specification for multi-provider, interoperable LLM interfaces insired by the OpenAI Responses API. It defines a shared request/response model, streaming semantics, and tool invocation patterns so clients and providers can exchange structured inputs and outputs in a consistent shape.

    At a high level, the spec centers on:

    An agentic loop that lets models emit tool calls, receive results, and continue.
    Items as the atomic unit of context, with clear state machines and streaming updates.
    Semantic streaming events (not raw text deltas) for predictable, provider-agnostic clients.
    Extensibility for provider-specific tools and item types without breaking the core schema.

## [목차](https://www.openresponses.org/specification)

### 동기

- 하나의 스펙으로 많은 LLM 에 적용하기 위함
- 조합가능한 에이전트 루프 : 단일화된 스트리밍, 툴 실행, 메시지 오케스트레이션
- 평가와 라우팅을 쉽게
- 공급자 API 청사진 제시

### Key Principles

- Agentic Loop : 에이전틱 루프는 모델이 여러가지 일을 하고 결과를 다시 받아서 완료 조건(exit criteria)이 될 때까지 반복 작업을 한다. 이러한 에이전트 루프의 흐름 제어에 대한 공통 패턴을 정의.  
- Items → Items : Open Responses 기본 단위. 아이템은 입력이 될 수도, 출력이 될 수도 있음. 아이템 타입에 대해 정의.  
- Semantic events : 스트림을 처리하기 위한 이벤트 정의. 예 ) response.in_progress -> response.completed  
- State machines : Open Responses 개체의 상태들 정의  

### Specification

- HTTP Requests : 헤더 정의
- HTTP Responses : 헤더와 바디 정의. 정의된 이벤트가 type 필드에 입력된 것을 볼 수 있다.    
예제
event: response.output_text.delta
data: { "type":"response.output_text.delta","sequence_number":10,"item_id":"msg_07315d23576898080068e95daa2e34819685fb0a98a0503f78","output_index":0,"content_index":0,"delta":" a","logprobs":[],"obfuscation":"Wd6S45xQ7SyQLT"}
- Items  
  - 아이템은 다양할 수 있다. 현재는 "message" 와 "function_call" 정의 됨. "type"필드로 구분.
    예)   "type": "response.output_item.added", "type": "response.content_part.added", "type": "response.output_text.delta", "type": "message", "type": "function_call",
  - 상태 : "status" 필드에 상태를 표시한다. in_progress, incomplete, completed
  - 아이템 타입 확장 : Open Response 정의에 없는 타입을 사용 할 수 있으며, 그럴 땐 공급자 고유 타입(canonical provider slug) 말머리를 사용해야 한다. 예)   "type": "openai:web_search_call"
- Content : 사용자와 모델간에 주고받는 원천 데이터(raw material)를 표현한다. UserContent, ModelContent 정의.
  현재는 UserContent 는 텍스트, 이미지, 오디오등 을 정의한 반면 ModelContent 는 텍스트로 한정했다. 추후 확장.  
- Reasoning : 내부 추론 노출. content, encyrypted_content, summary
- Errors  
- Streaming  
  객체 부분 업데이트 - response.output_text.delta, response.function_call_arguments.delta  
  객체 상태 - response.in_progress, response.completed, response.failed  
- Tools : 외부 도구, 공급자 내부 도구 구분
- previous_response_id : 대화를 이어가기 위한 구분자
- tool_choice : 도구 사용 제어. auto, required, none
- truncation : 입력 길이 관리. auto(입력이 너무 길어도 알아서 자름) , disabled(너무 길면 에러 발생)
- service_tier : 서비스 티어 관리.  
- Implementing Open Responses : API 사양 그대로 구현하거나, Open Responses를 상위로 갖는 형태 허용
- The Agentic loop : 루프 단계 정의 "분석, 툴 호출, 결과 반환, 최종 응답"  
- Extending Open Responses

참고 : https://github.com/openresponses/openresponses/blob/main/public/openapi/openapi.json

