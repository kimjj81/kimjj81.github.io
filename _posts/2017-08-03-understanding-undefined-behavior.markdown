---
author: kimjj81
comments: true
date: 2017-08-03 23:30:25+00:00
layout: post
link: https://windroamer.wordpress.com/2017/08/04/understanding-undefined-behavior/
slug: understanding-undefined-behavior
title: Understanding Undefined Behavior
wordpress_id: 502
categories:
- IOS
tags:
- DEBUG
- Programming
- WWDC-2017
- Xcode
---

# 소개


Undefined Behavior (이하 비정의 동작)을 이해하고 디버깅하는 방법을 소개하는 세션입니다. C 언어 계열(C/C++,ObjectiveC/C++)에 특히 유용한 세션이 되겠습니다.

바로 전에 관련된 글([WWDC 2017 – Finding Bugs Using XCode Runtime Tools](https://windroamer.wordpress.com/2017/08/02/wwdc-2017-finding-bugs-using-xcode-runtime-tools/))을 썼으니 먼저 읽고 오시면 더 좋겠습니다. 저번 포스트에도 몇가지 유형을 적었는데 실제로 200개 이상의 유형이 있다고 합니다.

[출처 : Understanding Undefined Behavior](https://developer.apple.com/videos/play/wwdc2017/407/)

참고링크



	
  * [Clang Documentation for Undefined Behavior Sanitizer](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)

	
  * [Code Diagnostics](https://developer.apple.com/documentation/code_diagnostics)

	
  * [Presentation Slides (PDF)](https://devstreaming-cdn.apple.com/videos/wwdc/2017/407kc2s6vvx95/407/407_understanding_undefined_behavior.pdf)


사실 이런 비정의된 동작들은 언어 차원에서 줄일 수 있는데, 성능과 타협을 본 것입니다. OS와 애플리케이션은 성능을 갖고, 나머지 빚더미(비정의 동작)는 개발자가 떠안게 된거죠.

몇가지 예제가 나오는데  [WWDC 2017 – Finding Bugs Using XCode Runtime Tools](https://windroamer.wordpress.com/2017/08/02/wwdc-2017-finding-bugs-using-xcode-runtime-tools/) 의 비정의 동작 부분에 나오는 것과 동일합니다.


# 1. 비정의 동작


일단 컴파일러에게 비정의 동작은 어떤 의미일까요? 컴파일러는 코드가 비정의 동작을 포함하고 있지 않다고 가정합니다. 왜냐면 비정의 동작이 코드에 있다면 이건 의미적으로(Semantic) 잘 정의된 코드가 아니기 때문입니다. 한마디로 당신을 믿는다는 거죠.

컴파일러는 최적화 작업을 하는데 일단 예제를 보겠습니다.

첫번째는 불필요하게 중복된 널 체크 제거하기 입니다. 아래처럼 코드 최적화가 이루어 집니다.

![407_understanding_undefined_behavior_pdf_43_171페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/407_understanding_undefined_behavior_pdf_43_171e18491e185a6e1848be185b5e1848ce185b5_.jpg)

다음은 쓸모 없는 코드 줄이기입니다. ![407_understanding_undefined_behavior_pdf_46_171페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/407_understanding_undefined_behavior_pdf_46_171e18491e185a6e1848be185b5e1848ce185b5_.jpg)

그러면 결과적으로 이렇게 되겠네요.

![407_understanding_undefined_behavior_pdf_48_171페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/407_understanding_undefined_behavior_pdf_48_171e18491e185a6e1848be185b5e1848ce185b5_.jpg)

그런데 여기서 우리가 파라미터로 NULL 을 보냈다고 칩시다. 그러면 버그가 발생하겠지요. 그런데, 최적화 한것과 최적화 하지 않은 버전은 서로 다른 곳에서 충돌이 발생합니다. 최적화 버전에서는 마지막 줄에서 충돌이 일어나고, 최적화 하지 않은 버전에서는 첫번째 줄에서 충돌이 일어납니다.

**이것은 버그 발생 지점과 버그 원인 지점이 굉장히 멀리 떨어져 있을 수 있다는 의미입니다.**

여기서 한번 최적화 옵션 순서를 바꿔볼까요.

![407_understanding_undefined_behavior_pdf_52_171페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/407_understanding_undefined_behavior_pdf_52_171e18491e185a6e1848be185b5e1848ce185b5_1.jpg)이번에는 Dead Code 제거부터 적용 했습니다. 그리고 불필요한 널포인트 체크를 했지요. 첫번째 최적화와 두번째 최적화는 분명 같은 코드인데 최적화 결과가 다릅니다. 아래와 같이 되지요. 보통은 2번째 컴파일러처럼 동작 할 것이지만 꼭 그런 보장이 없습니다. 그래서 1처럼 동작해서 파멸을 불러 올 수도 있지요.

![무제.jpg](https://windroamer.files.wordpress.com/2017/08/e18486e185aee1848ce185a6.jpg)

여기서 얻을 수 있는 교훈운 우리가 디버그 모드에서 릴리즈 모드로 바꿀 때, 최적화 옵션을 바꿀 때마다 서로 다른 결과를 얻을 수 있다는 사실입니다. 또한 컴파일러가 바뀔 때 다른 결과물이 나올 수 있습니다.

XCode 팀은 새로운 버전마다 더욱 작고 빠른 코드를 생성하는 컴파일러를 만듭니다. 때문에 새로운 컴파일러에서 그 전에 발견하지 못했던 비정의 동작들이 튀어 나올 수 있습니다. 어떤 옵션에서는 잘 되던것이 다른 옵션에선 버그가 될 수 있습니다. 심지어 어떤 버그는 해당 버그와 수천  라인 떨어진 곳에 원인이 있을 수 있고, 몇 시간 전에 실행했던 부분이 버그가 될 수도 있습니다.


<blockquote>비정의 동작과 관련된 이슈

> 
> 
	
>   * 비정의 동작은 예측 불가능하다.
> 
	
>   * 특정 수행 결과가 전체 프로그램에 영향을 줄 수 있다.
> 
	
>   * 버그는 그저 숨어 있을 수도 있다.
> 

</blockquote>




# 2. 비정의 동작의 보안 문제


한때 Heart Bleed 라는 보안 이슈가 크게 세계를 강타했습니다. Open SSL 에서 발견된건데, 한  패킷을 보내면 그 서버의 수KB 의 힙 정보를 받아 볼 수 있었죠. 이렇게 버그는 보안 문제를 일으 킬 수도 있습니다.



	
  * 버퍼 오버플로

	
  * 초기화되지 않은 변수 사용

	
  * 해제된 변수를 사용하기

	
  * 두번 해제하기

	
  * 자원 경쟁


실제로 Yosemite 를 릴리즈 하기 한달 전에 굉장히 많은 버그가 발생 했었는데 재현하기 쉽지 않았습니다. CFString 을 C 문자열로 변경하는 경우였는데, 자세한건 비디오에서 확인하시고, 버퍼 오버플로 버그가 발생했죠. 이 때 Address Sanitizer 를 이용해서 문제를 찾을 수 있었습니다. 잠재적인 버그일 경우가 많으므로, 초기부터 Memory Sanitizer 를 이용해서 버그를 발견하는게 좋습니다.

메모리 주소에 대한 비정의된 행위를 찾기 위해서 XCode는 5가지 도구를 제공합니다.

	
  * Compiler

	
  * Static Analyzer

	
  * Address Sanitizer

	
  * Thread Sanitizer

	
  * Undefined Behavior Sanitizer




### Compiler


일단 컴파일러에서 시작해 봅니다. 컴파일러 'Warning' 을 무시하지 마세요. 프로젝트 세팅에서 Editor->Validate Settings 를 참조하세요. XCode 가 발전하면서 계속해서 경고에 대한 부분도 발전하고 있습니다. 꼭 이용하세요.


### Analyzer


컴파일러는 한 부분에 집중하지만 분석기는 코드 전체를 살펴봅니다. 빌드 세팅에 'Analyzer During Build'  옵션을 켜면 빌드 할 때마다 같이 실행되니 더욱 좋습니다. CI와 같이 쓸 때는 Deep 모드로 사용해보세요. XCode 9 에서는  새로이 15개의 비정의 동작을 찾아 낼 수 있습니다.

![무제.jpg](https://windroamer.files.wordpress.com/2017/08/e18486e185aee1848ce185a61.jpg)


# 3. 언어


언어에서 안전한 구조를 제공한다면 그것을 이용하세요. ARC, C++ 스마트 포인터(std::shared_ptr, std::unique_ptr), 범위를 체크하는 컨테이너(NSArray) 같은 것을 말이죠.

그리고 Swift 를 써보세요. 앞서 얘기 했듯이 성능과 안정성에는 트레이드 오프가 있습니다. Swift는 다른 방식의 트레이드 오프를 취했고 기본적으로 더 안전하게 디자인 되었습니다.

Swift.org 에는 버그에 관한 내용들이 올라와 있으므로 참조 하십시요.


# 4. Swift


Swift 와 C 계열 언어와 아이점을 적어보았습니다. 아래와 같은 방식으로 Swift 는 몇몇 문제점을 극복했습니다.

![무제.jpg](https://windroamer.files.wordpress.com/2017/08/e18486e185aee1848ce185a63.jpg)


### 1. Optional Type


옵셔널 타입은 널포인터의 값을 참조하는 것을 방지합니다. 옵셔널 타입은 변수가 널일 수도 있다는 의미입니다. 그런데 강제로 값을 취하는 forced unwrap " ! " 을 남발하는 것을 권하지 않습니다.


#### 강제 언랩은 다음 경우에만 사용 합니다





	
  * 해당 변수가 절대 nil 이 아님을 보증 할 때

	
  * 타입 시스템에서 인코딩이 불가능할 때

	
  * 예 ) App bundle 에서 이미지를 읽어 올 때




#### 암묵적인 언랩드 옵셔널 (Cake!)


컴파일러는 사용전에 값을 체크하도록 강제하지 않습니다.

Swift 가 C 보다는 이런 면에서 안전(보안)합니다. 왜냐면 이건 정의된 행위이고, nil 을 마주치면 멈추도록 보장되어 있기 때문이죠.

"Now, this type should be used for properties that are guaranteed to have a value. However, they cannot be initialized in the constructor. Some of you might be using it for IB outlets." 이런 얘길 했는데 정확한 문맥이 안들어오네요.

아무튼 다른 타입의 묵시적인 Unwrapped Optional 이 Objective-C (C) 때문에 생겼습니다.

[code language="objc"]

- (nullable NSView *)ancestorSharedWithView:(nonnull NSView *)aView; // Objective-C

func ancestorShared(with view: NSView) -> NSView? // Swift

[/code]

위 예제처럼 Objective-C 의 Annotation 을 이용해서 Swift 와 자연스럽게 섞일 수 있습니다. Swift 와 Objective-C 를 같이 사용한다면 꼭 Annotation 을 사용하세요.

Annotation 을 이용하면 정적 분석기나 Undefined Behavior Sanitizer 의 도움도 받을 수 있습니다.


### 2. 명확한 초기화(Definite Initialization)


Swift 의 특징 중 하나는 멤버 변수가 초기화 되기 전에는 사용 할 수 없습니다. 꼭 초기화 되도록 하죠. 강제적입니다. 컴파일러가 초기화 안된 것은 모두 경고해 줍니다.


### 3. 버퍼, 정수 오버플로


이것은 보안의 가장 큰 원인들입니다. 오버 플로는 오직 정수에서만 발생하고 스위프트는 그럴 경우 프로그램을 중단시킵니다. Array, Int 연산 후에 발생합니다. 아마 이런 질문을 하실겁니다. "왜 런타임에서 체크하는게 좋은거죠?" 왜냐면 이게 다른 대안들보다 좋기 때문입니다. 이런 문제가 생기면 프로그램이 중단되죠. 그러면 디버깅 할 것입니다. 이건 아주 큰 보안성을 제공하는 것입니다.(잠재적으로 오버플로를 가지는 것보다는 죽여버리는게 낫다는 의미인듯)

한편 Integer Wrapping Behavior 가 필요하면 이런 연산자를 사용 할 수도 있습니다. &+, &- , &*


### 4. 그럼 Swift 에서는 비정의 행위가 없나요?


아뇨. 존재 합니다. 그러나 훨씬 적습니다. 그리고 역시 XCode 의 디버깅 툴의 도움을 받을 수 있습니다.

C 와 같이 쓰기 위해 UnsafePointer 같은 클래스들을 사용 할 수도 있습니다. 또한, 자원 경쟁이 있을 수도 있죠.


# 결론


언어적으로 룰을 잘 지키는 것이 가장 좋습니다. 그런데 어렵죠. 런타임에서 잡는건 좀 더 쉽습니다. 그러나 실행 오버헤드가 있죠. 이 둘 사이에서 균형을 잡고 XCode 도구를 이용해서 버그를 잡는것이 중요합니다.



	
  * 안전한 방식으로 프로그램을 코딩하세요(Swift 강추)

	
  * 디버깅 툴을 적극 활용하세요



