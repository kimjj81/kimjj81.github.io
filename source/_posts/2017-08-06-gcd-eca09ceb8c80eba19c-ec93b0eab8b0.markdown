---
title: GCD 제대로 쓰기
date: 2017-08-06 08:33:10+00:00
slug: using-gcd-properly
categories:
- IOS
tags:
- GCD
- Objective-C
- Programming
- Swift
- WWDC-2017
- Xcode
---

출처 : [Modernizing Grand Central Dispatch Usage WWDC 2017](https://developer.apple.com/videos/play/wwdc2017/706/)


# GCD 최적화 하기


결론부터 말하자면, GCD Queue (다른 동시성 프로그래밍 기법도 동일한 원리가 적용될 것이다)를 이용 할 때 1)**너무 잦은 Context Switching 이 일어나게 프로그래밍 하지 말라는 것**이다. 또한 2)**GCD 큐의 계층화를 최적화** 하라. 이것만 개선해도 1.3배의 속도 증가가 나왔다.

이런 견지에서 애플은 iOS, Mac OSX 양측 모두에서 성능 개선을 계속해 나가고 있고 iOS 11, High Sierra 에서 확연히 성능이 증가했다고 말하고 있다.


# 1. 병렬 프로그래밍




<blockquote>**병렬(Parallel) 프로그래밍**

밀접히 관련된 연산들이 동시에 실행 되는 것

**동시성(Concurrency) 프로그래밍**

독립적으로 실행되는 동작들의 조합</blockquote>


아래 슬라이드를 보면 이해가 바로 갈것이다. 이미지에 필터를 처리 하는건 1가지 필터 함수가 있을 테고, 그것을 이미지 전체에 걸쳐 계산하는 것이다. 그런데 만약 코어가 8개라면 이미지를 8의 배수로 등분하여 각각의 코어에 할 당하면 이론상 8배의 속도 향상이 있을 것이다.

![706_modernizing_grand_central_dispatch_usage.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage.jpg)

![706_modernizing_grand_central_dispatch_usage2.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage2.jpg)

애플에서는 병렬  프로그래밍에 도움을 주는 프레임워크를 제공하고 있습니다.

Accelerate , Metal 2, Core ML , Core Animation 이 그것들이죠.


# 2. GCD 로 병렬 프로그래밍하기















DispatchQueue.concurrentPerform은 명시적으로 병렬 프로그래밍을 하는 방식입니다.

[code language="objc"]
&amp;amp;amp;lt;div class="page" title="Page 18"&amp;amp;amp;gt;&amp;amp;amp;lt;div class="section"&amp;amp;amp;gt;&amp;amp;amp;lt;div class="layoutArea"&amp;amp;amp;gt;&amp;amp;amp;lt;div class="column"&amp;amp;amp;gt;
DispatchQueue.concurrentPerform(1000) { i in /* iteration i */ } // swift

&amp;amp;amp;lt;div class="page" title="Page 19"&amp;amp;amp;gt;&amp;amp;amp;lt;div class="section"&amp;amp;amp;gt;&amp;amp;amp;lt;div class="layoutArea"&amp;amp;amp;gt;&amp;amp;amp;lt;div class="column"&amp;amp;amp;gt;
dispatch_apply(DISPATCH_APPLY_AUTO, 1000, ^(size_t i){ /* iteration i */ }) //Objective-C
&amp;amp;amp;lt;/div&amp;amp;amp;gt;&amp;amp;amp;lt;/div&amp;amp;amp;gt;&amp;amp;amp;lt;/div&amp;amp;amp;gt;&amp;amp;amp;lt;/div&amp;amp;amp;gt;&amp;amp;amp;lt;/div&amp;amp;amp;gt;&amp;amp;amp;lt;/div&amp;amp;amp;gt;&amp;amp;amp;lt;/div&amp;amp;amp;gt;&amp;amp;amp;lt;/div&amp;amp;amp;gt;
[/code]


##  반복 횟수 최적화


그런데, 어떻게 하면 병렬 프로그래밍의 이득을 얻을 수 있을가요? 다음과 같은 상황을 생각해 봅시다.

이렇게 동작을 3등분 했습니다.














<blockquote>DispatchQueue.concurrentPerform(3) { i in /* iteration i */ }</blockquote>


그럼 아마 이런식으로 배분이 될 것입니다. (코어가 3개라면 말이죠)  그러면 2번째 코어는 놀게 되네요. 효율이 약간 떨어지게 됩니다.

![706_modernizing_grand_central_dispatch_usage_pdf_22_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_22_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

코드를 바꿔서 이터레이션이 11 이 되도록 해봅시다.














<blockquote>DispatchQueue.concurrentPerform(11) { i in /* iteration i */ }</blockquote>














![706_modernizing_grand_central_dispatch_usage_pdf_26_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_26_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

그냥 봐도 좀 더 효율적으로 바뀌었지요. 코어가 쉬고 있지 않으니까요.

그러면 이터레이션 단위를 크게 할 수록(작업 단위를 잘게 쪼갤수록) 더욱 코어 활용도가 높아지겠네요. 맞나요? (아닌가요? 왜 그럴까요?)


## 동시성 프로그래밍





동시성은 독립된 태스크들의 집합입니다.  UI, Networking, Database 같은 시스템들이 각기 독립적으로 존재하며 실행되지요.

아래 그림은 UI, Database, Networking 컴포넌트가 독립적으로 동작하고 코어에서 이것들을 어떻게 할당하는지 대략적으로 보여준 것입니다. UI는 우선순위가 높으므로 터치 이벤트가 발생 했을 때 데이터베이스가 잠쉬 쉬고 UI가 실행되는 것을 나타내고 있습니다.

![706_modernizing_grand_central_dispatch_usage_pdf_38_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_38_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

※ 시스템 코어가 어떻게 돌아가는지 눈으로 확인하고 싶다면 [System trace in depth](https://developer.apple.com/videos/play/wwdc2016/411/) 세션을 보세요. Instruments 를 통해 아래 그림처럼 볼 수 있습니다.










![706_modernizing_grand_central_dispatch_usage_pdf_40_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_40_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)


## 컨텍스트 스위칭





OS는 어느 순간에 어떤 부분이 실행 될지(어떤 쓰레드가 CPU를 점유 할 지) 선택 할 수 있습니다.  그럼 어느 순간에 새로운 쓰레드가 선택 될 까요?



	
  * 우선순위가 높은 쓰레드가 CPU를 점유합니다.

	
  * 현재 작업이 끝났을 때

	
  * 자원을 획득하길 기다릴 때

	
  * 비동기 요청이 끝났을 때


이렇게 필요와 우선 순위마다 활성화되는 쓰레드가 바뀜으로써 반응성이 좋아질 수 있다는 것이 동시성 프로그래밍의 힘이죠.


## 과도한 컨텍스트 스위칭


그러나 과도한 컨텍스트 스위칭이 일어나는 것은  경계해야 합니다. 아래 그림에서 흰색은 컨텍스트 스위칭을 나타내는데 이것도 다 비용입니다. 너무 낮은 컨텍스트 스위칭은 CPU 자원을 소모해버립니다.

![706_modernizing_grand_central_dispatch_usage_pdf_49_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_49_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)










분명 컨텍스트 스위칭은 필요한 것이지만 아래와 같은 행위들이 **너무 많이** 일어나면 효율이 떨어지게 됩니다.












	
  * 자원의 독점적 접근을 위한 대기 반복

	
  * 독립적 동작들 사이의 스위칭 반복

	
  * 쓰레드 사이에 오퍼레이션이 왔다 갔다 하는것이 반복 되는 것


너무 잦은 컨텍스트 스위칭이 발생 하게 하는 것 보다는 자원 점유를 직렬화 하거나 순차적으로 진행되도록 함으로써 컨텍스트 스위칭을 적게 하는게 나을 수 있습니다.


## 자원 획득 경쟁(Lock Contention)


자원 획득에 관한 정책은 매우 유용합니다. 어떤 자원이 필요한 쓰레드가 해당 자원을 소유하고 있지 못하면 CPU는 그 쓰레드를 실행시킬 필요가 없지요. 불필요하게 CPU 자원을 소모하는 일을 방지해줍니다.

자원 획득에 관한 정책은 Unfair, Fair 두가지가 있습니다.
<table cellpadding="0" cellspacing="0" >
<tbody >
<tr >

<td >
</td>

<td valign="top" >**Unfair**
</td>

<td valign="top" >


**Fair**



</td>
</tr>
<tr >

<td valign="top" >**가능한**** ****타입**
</td>

<td valign="top" >os_unfair_lock
</td>

<td valign="top" >pthread_mutext_t , NSLock

DispatchQueue.sync
</td>
</tr>
<tr >

<td valign="top" >**자원**** ****독점**** ****재획득****
Contented lock re-acquisition**
</td>

<td valign="top" >독점 훔치기 가능
</td>

<td valign="top" >다음 대기자에 컨텍스트 스위칭이 발생
</td>
</tr>
<tr >

<td valign="top" >**대기자**** ****기아**** ****상태****(****자원**** ****획득**** ****방지****)
Subject to waiter starvation**
</td>

<td valign="top" >원함
</td>

<td valign="top" >원치 않음
</td>
</tr>
</tbody>
</table>
일반적으로 unfair 타입이 객체, 전역 상태, 프로퍼티에 적당할겁니다.


## 잠금 소유권(Lock Ownership)


잠금 소유권은 CPU가 어떤 쓰레드를 선택해야 할지 도움을 줍니다. 높은 순위의 쓰레드가 대기중인 경우나, 낮은 순위의 쓰레드가 오너쉽을 가지고 있어서 발생하는 문제점을 해결해줍니다.

잠금에 대해 어떤 정책을 사용할 것인지에 따라 아래와 같이 결정하는게 도움이 됩니다.

![706_modernizing_grand_central_dispatch_usage_pdf_76_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_76_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)


# 3. GCD 로 동시성 프로그래밍하기


그동안 GCD 세션이 WWDC 에서 다뤄졌습니다. 더 관심이 있다면 아래 아티클을 찾아보세요.















	
  * Simplifying iPhone App Development with Grand Central Dispatch, 2010

	
  * Asynchronous Design Patterns with Blocks, GCD, and XPC, 2012

	
  * Power, Performance, and Diagnostics: What's new in GCD and XPC, 2014

	
  * Building Responsive and Efficient Apps with GCD, 2015

	
  * Concurrent Programming with GCD in Swift 3, 2016


[letmecompile.com : GCD 튜토리얼](http://www.letmecompile.com/gcd-%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC/)









## 직렬 디스패치 큐(Serial Dispatch Queue)





	
  * 상호 배제(Mutual Exclusion)

	
  * FIFO 순서

	
  * 원자성을 보존하며 큐에 삽입(Concurrent atomic enqueue)

	
  * 큐에 삽입 할 때와 마찬가지로, 원자적으로 큐에서 제거 됨(Single dequeuer)










## 큐 계층도 구성하기


S : 자원, Q : 큐 , EQ : 상호 배제 큐(Mutual Exclusive Queue)

![706_modernizing_grand_central_dispatch_usage_pdf_99_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_99_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

이런식으로 큐를 구성 할 수 있습니다. 그러면 큐 Q1, Q2를 EQ에서 총체적으로 관리하게 됩니다. 누가 먼저 실행 될지 EQ 에서 선택하는 것이지요. 직렬 큐라면 특정 순서를 만들어서 순서대로 실행될겁니다.


## QOS (Quality Of Service)


그래서 이런 식으로 시스템 큐가 구성되어 있습니다. 상위에 있는 것이 우선 순위가 높습니다.

[Power, Performance and Diagnostics: What's new in GCD and XPC, 2014](https://developer.apple.com/videos/play/wwdc2014/716/) 에서 다뤄졌던 내용도 있으니 먼저 보고 오는게 좋겠습니다.

![706_modernizing_grand_central_dispatch_usage_pdf_107_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_107_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

비디오 21분 50초쯤 부터 나오는 내용인데, 애플 OS의 QoS는 이렇게 구성했고, 큐 우선순위를 통해서 이벤트 발생 순서에  상관 없이 UI 처럼 높은 우선순위의 동작부터 처리하게 되어 있다고 합니다.



























## ※ 좋다고 남발하는 것 피하기








	
  * 반복적인 자원에 독점적 접근을 위해 대기

	
  * 반복적인 독립된 동작 스위칭

	
  * 반복적인 쓰레드간의 오퍼레이션 이동







## GCD  잘 구성하기


네트워크 연결을 한다고 가정합시다. 아마 한번에 여러 네트워크 연결이 생길 수 있을 것이고, 한 커넥션마다 하나의 큐를 생성해서 처리한다고 칩시다. 그러면 아래의 그림과 같은 상태가 될 것입니다. 하나의 큐마다 하나의 쓰레드가 생성 됩니다.

![706_modernizing_grand_central_dispatch_usage_pdf_131_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_131_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

그러면 앞에서 얘기한데로 컨텍스트 스위칭이 많이 발생 할 것입니다. 좀 더 개선해보죠.

![706_modernizing_grand_central_dispatch_usage_pdf_135_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_135_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

이렇게 단일한 상호 배제 큐로 바꾸어  봤습니다. 그러면 쓰레드가 한개만 생성되어 컨텍스트 스위칭이 줄어들게 됩니다. 오버헤드가 사라지는 것이죠.

실제로 애플에서 이런 방식을 통해서 처음에 언급했던 1.3배의 성능 향상을 이끌어 냈습니다.


## 경계 없는 동시성을 피하기


= 반복적인 독립된 오퍼레이션간의 스위칭

만약 전역 큐에 많은 아이템들이 할당 된다면



	
  * 만약 일감들이 블록되면, 더 많은 쓰레드가 생성 될 것이고

	
  * 이건 쓰레드 폭발로 이어질 수 있다 (Thread Explosion)


더 자세한 내용은 다음을 참조
[Building Responsive and Efficient Apps with GCD](https://developer.apple.com/videos/play/wwdc2015/718/)


### 좋은 동시성 프로그래밍 전략





	
  * 고정된 갯수의 직렬 큐 계층 만들기

	
  * 각 계층간에는 발생하는 일은 큰 덩어리로 만들어지게 하라

	
  * 한 계층 내의 일은 크기가 작으면 좋다




## 




## 4. 단일한 큐 구분자Unified queue identity


Mac OSX Sierra, iOS 10 이전에는 아래 그림과 같이 큐가 동작했습니다. 어떤 동작을 하고 있을 때 높은 순위의 작업이 발생하면 다른 쓰레드가 하나 생겨났죠. S1 -> S2 그리고 큐 동작은 그림처럼 진행 됐을 겁니다. 그런데, 이게 대체 무슨 이점이 있을까요? 컨텍스트 스위칭으로 비용만 들 뿐이었습니다.

![706_modernizing_grand_central_dispatch_usage_pdf_191_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_191_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

그리고 High Sierra, iOS 11 에서는 이렇게 바꾸었습니다. (Unified queue)

![706_modernizing_grand_central_dispatch_usage_pdf_195_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_195_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)

EQ (Exculusive Queue) 가 CPU 를 점유 하는 것이라는 것을 알게 됐으며, 어떤 이벤트가 발생해서 어떤 일이 일어나던지 신경쓰지 않게 되었습니다. 그냥 큐를 실행하기만 하면 되니까요.

그럼 어떻게 두번째 이벤트가 방해 없이 발생 할 수 있을건지 의문이 생길 겁니다.

![706_modernizing_grand_central_dispatch_usage_pdf_198_245페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/706_modernizing_grand_central_dispatch_usage_pdf_198_245e18491e185a6e1848be185b5e1848ce185b5_.jpg)그림에서 보듯이 새로운 이벤트(S2)가 생기면 다음 이벤트가 E2에 있다는 것만 표시해줍니다. 그러면 순차적으로 실해되는 것이죠.

또한 이 방식을 이용함으로써 런타임 도구를 통해서 최적화에 대한 힌트를 얻을 수 있게 되었습니다.


## 5. 최신 코드로 교체 (Modernizing Existing Code)





	
  1. 활성화 후 디스패치 오브젝트를 변경금지

	
  2. 큐 계층을 보호한다




### 1. 활성화 후 디스패치 오브젝트를 변경 금지


오브젝트의 프로퍼티는 활성화 되기 전에 지정한다. 1. 소스 핸들러, 2. 타겟 큐














<blockquote>let mySource = DispatchSource.makeReadSource(fileDescriptor: fd, queue: myQueue)
mySource.setEventHandler(qos: .userInteractive) { ... }

mySource.setCancelHandler { close(fd) }
mySource.activate() 

mySource.setTarget(queue: otherQueue) <- 활성 화 후 큐를 바꾸면 안된다.</blockquote>


만약 이것을 어긴다면 미래에 예측하고 있는 것들이 바뀌고, 최적화 했던 것들, 우선순위 뒤바뀜 정정 기능이 잘 못 될 것이며 다른 문제들도 야기 할 수 있다.


### 2. 큐 계층 보호





큐 계층이 변경 됐을 때 우선순위와 소유권 스냅샷이 더이상 유효하지 않을 수 있다.



	
  * 우선순위 뒤바뀜 정정의 파괴

	
  * Direct handoff 최적화 파괴

	
  * 이벤트 전달 최적화 파괴


때문에 큐 계층이 변경되는 것을 지양해야 하는데, 만약 여러 팀끼리 협업하거나 다른 회사 제품을 쓰거나 하면 이런 것을 지키기 힘들 수 있다. 이 때 작년에 소개된 "static queue hierarchy" 기법을 이용하여 계층을 보호 할 수 있다. 단, 이것은 Objective-C 에 해당하는 것이며 Swift 는 이미 적용되고 있는 부분이다.


<blockquote>기존코드

> 
> 

> 
> 

> 
> 

> 
> 

Q1 = dispatch_queue_create("Q1", DISPATCH_QUEUE_SERIAL)
dispatch_set_target_queue(Q1, EQ)


> 
> 

> 
> 

> 
> 

> 
> </blockquote>







<blockquote> 새로운 코드
Q1 = dispatch_queue_create_with_target("Q1", DISPATCH_QUEUE_SERIAL, EQ)</blockquote>





45분 부터는 여러 기법을 이용해서 문제점을 찾고 최적화 하는 방법에 대해 소개하고 있다. XCode 9 이 정식 출시 되면 관련된 Instuments 도구도 같이 나올 것 같다.















# 요약





	
  * 모든 코어가 '잘 활용'되도록 하자

	
  * 작업 크기를 적당히 하자

	
  * 동시성 프로그래밍에 적절한 코드 전략(granularity)을 선택하자(계층, 큐의 수)

	
  * 최신 GCD 코드를 사용하자

	
  * 문제를 해결하기 위한 툴을 사용하자
