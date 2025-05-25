---
author: kimjj81
comments: true
date: 2017-08-02 12:58:26+00:00
layout: post
link: https://windroamer.wordpress.com/2017/08/02/wwdc-2017-finding-bugs-using-xcode-runtime-tools/
slug: wwdc-2017-finding-bugs-using-xcode-runtime-tools
title: WWDC 2017 - Finding Bugs Using XCode Runtime Tools
wordpress_id: 233
categories:
- IOS
tags:
- WWDC-2017
---

원본 주소 [https://developer.apple.com/videos/play/wwdc2017/406/](https://developer.apple.com/videos/play/wwdc2017/406/)


# 1. 소개


XCode Runtime Tools 를 통해서 버그를 찾는 기법을 소개하는 세션이다.
아래와 같은 내용을 다룰 예정이다.



	
  * [Clang Documentation for Address Sanitizer](https://clang.llvm.org/docs/AddressSanitizer.html)

	
    * Heap, Stack, Global 변수의 Out-of-bound

	
    * 메모리 해제 후 사용 시도

	
    * 리턴 후 사용 시도

	
    * 접근 가능 범위 밖에서 사용 시도

	
    * 잘못된 메모리 해제(중복, 유효하지 않은 변수)

	
    * 메모리 누수




	
  * [Clang Documentation for Thread Sanitizer](https://clang.llvm.org/docs/ThreadSanitizer.html)

	
    * 자원 경쟁 상태를 체크하는 도구

	
    * 컴파일 도구와 런타임 라이브러리로 구성됨




	
  * [Clang Documentation for Undefined Behavior Sanitizer](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)

	
    * 컴파일 타임에 "Undefined"를 찾는 도구

	
    * 미할당, null pointer

	
    * 정수 오버플로, float-type 이용시 종단에 발생 하는 오버플로




	
  * [Code Diagnostics](https://developer.apple.com/documentation/code_diagnostics)

	
    * XCode 도구로 왼쪽 상단의 Product-Scheme-Edit Scheme 에서 설정 가능

	
    * 위에 언급한 도구를 켤 수 있다.




	
  * [Enabling Malloc Debugging Features](https://developer.apple.com/library/content/documentation/Performance/Conceptual/ManagingMemory/Articles/MallocDebug.html)

	
    * 메모리와 관련된 기초적인 내용부터 심화있게 언급한 문서이므로 이 비디오를 보고나서 한번따로 정독하는게 좋을 것 같다.




	
  * [Threading Programming Guide](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/Multithreading/Introduction/Introduction.html#//apple_ref/doc/uid/10000057i-CH1-SW1)

	
    * 쓰레드 프로그래밍에 관한 내용으로 안에 링크를 타고 동시성 프로그래밍에 관한 것도 같이 읽어 보는 것을 추천

	
    * 내가 쓴 글 두개도 같이 읽어보시면 도움이 될 것 입니다.

	
      * [Properties in Swift , Concurrency](https://windroamer.wordpress.com/2017/06/04/properties-in-swift-concurrency/)

	
      * [iOS 멀티 스레드를 고려한 변수 사용](https://windroamer.wordpress.com/2017/06/03/ios-%eb%a9%80%ed%8b%b0-%ec%8a%a4%eb%a0%88%eb%93%9c%eb%a5%bc-%ea%b3%a0%eb%a0%a4%ed%95%9c-%eb%b3%80%ec%88%98-%ec%82%ac%ec%9a%a9/)







	
  * [Undefined Behavior Sanitizer](https://developer.apple.com/documentation/code_diagnostics/undefined_behavior_sanitizer)

	
    * 런타임 중 0으로 나누기, [잘못 정렬된 포인터 불러오기](https://developer.apple.com/documentation/code_diagnostics/undefined_behavior_sanitizer/misaligned_pointer), dereferencing null pointer ([잘못된 Null pointer 사용](http://story.wisedog.net/null-pointer-dereference-란/)) , 같은 잘못된 행위를 하려는 것을 잡는 툴입니다.

	
    * XCode 9.0 이상






	
  * [슬라이드 링크 Presentation Slides (PDF)](https://devstreaming-cdn.apple.com/videos/wwdc/2017/406hi7pbvl7ez0j/406/406_finding_bugs_using_xcode_runtime_tools.pdf)







 ![extract-22.jpg](https://windroamer.files.wordpress.com/2017/08/extract-221.jpg)










# 2. Main Thread Checker


UI 업데이트처럼 메인 쓰레드에서만 실행되어야 하는 동작들이 있다. 이것을 위반하는지 Main Thread Checker 가 검토해준다.

메인 쓰레드에서 수행 되야 할 UI 함수가 백그라운드 쓰레드에서 실행되면 UI 업데이트가 안되거나, 화면이 깨지거나, 데이터가 오염되거나, 앱이 죽는 경우가 발생한다.

메인 쓰레드에 사용될 함수가 백그라운드에서 호출 될 경우 XCode 9 에서는 ![extract-17.png](https://windroamer.files.wordpress.com/2017/08/extract-17.png) 아이콘을 표시해주고, 메인 쓰레드에서 실행하라는 경고문구를 보여준다.

OperationQueue(in Swift)에 관련된 쓰레드가 있다.

예를 들어 비동기식 호출에 클로저를 사용하는 경우가 많다. 이 클로저가 어느 쓰레드에서 실행되야 할지 만들 수 있게 하는 것이 좋다. 다르게 표현하면 파라미터로 OperationQueue 가 들어가야 할지 설계 할 때 숙고해보는 것이 좋다.

AppKit, UIKit, WebKit API 에 사용되며, Swift 와 C 언어도 지원한다.


# 3. Address Sanitizer


XCode 7.0 부터 소개 된 도구인데, 더 관심이 있다면 [Advanced Debugging and the Address Sanitizer](https://developer.apple.com/videos/play/wwdc2015/413/) 세션을 먼저 보고 오는 것을 추천한다.

Address Sanitizer 에 대해 위에 적은 것을 다시 서술하면 다음과 같다.   밑줄 친건 이번에 새로 추가된 것이다.



	
  * Heap, Stack, Global 변수의 Out-of-bound

	
  * 메모리 해제 후 사용 시도

	
  * 리턴 후 사용 시도

	
  * 접근 가능 범위 밖에서 사용 시도

	
  * 잘못된 메모리 해제(중복, 유효하지 않은 변수)

	
  * 메모리 누수


2년 전에 소개한것 처럼 다음과 같이 해제된 메모리를 다시 사용 하려 할 때 어떤 문제가 생기는지 잡아준다.

![extract-29.jpg](https://windroamer.files.wordpress.com/2017/08/extract-29.jpg)


## Use of out of scope stack memory


[code language="cpp"]

int *integer_pointer = NULL;
if (is_com_condition_true()) {
int value = cal_value();
integer_pointer =  value;
}
*integer_pointer = 42; // Error

[/code]

단, 이건 성능저하가 꽤 심하기 때문에 선택사항으로 남겨뒀다. 필요하다면 옵션에서 켜야 한다.


## Address Sanitizer and Swift


스위프트는 여러 제약 사항 때문에 훨씬 안전한 언어긴 하지만, Objective-C 와 섞어 쓰는 경우가 있다. 이 때도 Address Sanitizer 가 유용 하게 쓰일 수 있다.

또한 Swift 에서는 포인터를 위해서 UnsafePointer 와 다른 여러 포인터 클래스를 제공하는데 되도록이면 안쓰는것을 권장한다. (※ MetalKit 같은 포인터를 자주 사용하게 된다.)

Address Sanitizer 는 인스턴스가 어디에서 생성되고, 어디에서 소멸 됐는지 추적해 주기 때문에 많은 도움이 된다.

디버깅 중 변수를 오른 클릭해서 "View Memory of ..." 을 실행하면

![extract-35.jpg](https://windroamer.files.wordpress.com/2017/08/extract-35.jpg)

이처럼 메모리에 관한 내용을 볼 수 있다. 오른쪽에서 검은 색은 아직 살아있는 내용들이고, 회색은 무효한 메모리 (Invalid memory, Poisoned Memory) 라고 한다.![extract-37.jpg](https://windroamer.files.wordpress.com/2017/08/extract-37.jpg)

그리고 디버깅 콘솔에서 "memory history" 명령을 이용하면 아래와 같이 정보를 얻을 수 있다.

![IMG_0013.jpg](https://windroamer.files.wordpress.com/2017/08/img_00131.jpg)


# 4. Thread Sanitizer


Thread Sanitizer 는 멀티 쓰레딩에서 발생 할  수 있는 문제를 해결 할 수 있다. 자원 경쟁 문제를 찾을 수 있다. 쓰레드에 관한 문제는 타이밍에 굉장히 민감하기 때문에 재현이 어렵다. 하지만 Thread Sanitizer 를 이용하면 이 문제를 해결 할 수 있다.

64비트 컴퓨터와 64비트 시뮬레이터에서만 사용 가능하다.

[Thread Sanitizer and Static Analysis](https://developer.apple.com/videos/play/wwdc2016/412/) 도 같이 보는 것이 좋다.


### 자원 경쟁(Data Races)





	
  * 변경 가능한 공유 자원의 비동기적 접근

	
  * 메모리 오염과 충돌을 일으킨다

	
  * C, Objective-C 심지어 Swift 도 자유로울 순 없다


예제

![https___devstreaming-cdn_apple_com_videos_wwdc_2017_406hi7pbvl7ez0j_406_406_finding_bugs_using_xcode_runtime_tools_pdf.jpg](https://windroamer.files.wordpress.com/2017/08/https___devstreaming-cdn_apple_com_videos_wwdc_2017_406hi7pbvl7ez0j_406_406_finding_bugs_using_xcode_runtime_tools_pdf.jpg)

위는 자원 경쟁이 일어난다. 따라서 아래 처럼 DispatchQueue를 이용해서 경쟁을 해결 할 수 있다.

![https___devstreaming-cdn_apple_com_videos_wwdc_2017_406hi7pbvl7ez0j_406_406_finding_bugs_using_xcode_runtime_tools_pdf.jpg](https://windroamer.files.wordpress.com/2017/08/https___devstreaming-cdn_apple_com_videos_wwdc_2017_406hi7pbvl7ez0j_406_406_finding_bugs_using_xcode_runtime_tools_pdf1.jpg)

GCD 에 대해 더 알고 싶다면 [Concurrent Programming With GCD in Swift 3](https://developer.apple.com/videos/play/wwdc2016/720/) 를 참조하라.

WWDC 2017 에서도 GCD 에 관한 세션이 있으므로 같이 봐도 좋겠다. [Modernizing Grand Central Dispatch Usage](https://developer.apple.com/videos/play/wwdc2017/706/)

Memory Sanitizer 는 Raw data 를 접근 할 때 이용 하는데 반해 동기화 문제는 콜렉션 같은 큰 데이터에서 발생하는 문제이다. Mutable 데이터를 다룰 때 문제가 자주 있어서 XCode 9에 추가되었다.  이런 문제로 곤란을 격었던 사람들에게 매우도움이 될 것이다.

다시 요약 하자면 일단 Scheme에서 Memory Sanitizer 옵션을 켜고, 직접 실행을 해서 문제를 발견한다. 그리고 Mutable 데이터를 수정 할 때 자원 경쟁이 일어나지 않기 위해 DispatchQueue를 하나 생성한다.  (비디오 26분부터 참조)


## Swift 에서 접근 경쟁





	
  * 모든 구조체에서 발생.

	
  * 구조체의 내용을 변경하는 메소드(**mutate method**)는 '전체 구조체' 인스턴스에 대해 독점권을 가져야 한다.

	
  * 클래스는 Mutate method 가 없으므로 위와 같이 하진 않지만, 프로퍼티에 대해서는 독점적으로 사용해야 한다.

	
  * 독점적 = 한번에 한 쓰레드

	
  * Swift 4 에서 추가

	
  * 컴파일 타임, 런타임 양측에서 모두 강제된다.


**Swift 예제**

![IMG_0014.PNG](https://windroamer.files.wordpress.com/2017/08/img_0014.png)![IMG_0015.PNG](https://windroamer.files.wordpress.com/2017/08/img_0015.png)

구조체와 Mutate Method 에 대한 예제는 아래와 같다.

![IMG_0016.PNG](https://windroamer.files.wordpress.com/2017/08/img_0016.png)

위에 언급 했듯이 구조체 인스턴스 전체에 대해 독점적으로 사용해야 하기 때문에 위처럼 하면 해결이 안된다. 구조체 인스턴스를 이용하는 부분에서 해줘야 한다.

그러나 클래스의 경우는 구조체와 다르므로 아래 처럼 내부 DispatchQueue를 만들어서 해결 할 수 있다.

![IMG_0017.PNG](https://windroamer.files.wordpress.com/2017/08/img_0017.png)


# 5. Undefined Behavior Sanitizer


XCode 9 에 새로 추가된 기능입니다. 앞서 나왔던 다른 도구와 다른 점은 C 언어 계열의 '안전하지 못한' 구조를 체크해주는 기능입니다.

참고 : [Understanding Undefined Behavior](https://developer.apple.com/videos/play/wwdc2017/407/)

위 링크는  Undefined Behavior (이하 비정의 동작)이 왜 있으며, 앱에 어떤 영향을 주는지 설명해줄 겁니다.

다음과 같은 오류들을 검출 할 수 있습니다.



	
  1. C++ Dynamic Type Violation

	
  2. Invalid Float Cast

	
  3. Integer Overflow

	
  4. Invalid Shift Exponent

	
  5. Invalid Boolean

	
  6. Invalid Variable-Length Array

	
  7. Invalid Integer Cast

	
  8. Reached Unreachable Code

	
  9. Missing Return Value 

	
  10. Invalid Object Size 

	
  11. Nonnull Assignment Violation 

	
  12. Nonnull Parameter Violation 

	
  13. Nonnull Return Value Violation 

	
  14. Alignment Violation 

	
  15. Invalid Enum 

	
  16. Integer Division by Zero 

	
  17. Invalid Shift Base 

	
  18. Null Dereference 

	
  19. Out-of-Bounds Array Access


아이고 많기도 하네요. 일단 3가지 Integer Overflow, Alignment Violation, Nonnull Return value Violation 에 대해서만 살펴봅니다.


### 1. Integer Overflow


정수 넘침은 보안 문제도 일으 킬 수 있습니다. 모든 정수 넘침이 비정의 동작인 것은 아닙니다. Unsigned Integer 같은 경우가 예외입니다. (※ 좀 더 자세한 예제는 여기에선 나오지 않습니다)

아래와 같이 무엇이 잘못 되었는지 알 수 있게 되죠.

![IMG_0018.PNG](https://windroamer.files.wordpress.com/2017/08/img_0018.png)


### 2. Alignment Violation


모든 C 언어 변수들은 고유의 크기에 따라 저장되고 불러져야 되어야 하는데 이것을 위반 했을 때 발생한다. 이 문제는 아주 사소한 것이라 찾기 힘들다. 또한, 릴리즈 할 때 컴파일러가 최적화 옵션을 켠다. 이때 만약 메모리 정렬이 잘못되어 있다면 실행중에 죽는 문제를 발생 시킬 여지가 있다. 이런 종류의 버그는 저장 장치에 Serialize, Deserialize 할 때 자주 발생한다. 또한 소켓 통신에서....

예제는 소켓 통신인데, 아래처럼 처음에 "Hey Kuba!" 라 보내고, 그 다음에 "How's ......" 을 보낸 경우, int 가 4바이트이기 때문에 3번째 이미지에서 보듯이 두번째 패킷에서 에러가 발생 하게 된다.![IMG_0020](https://windroamer.files.wordpress.com/2017/08/img_0020.png)![IMG_0019](https://windroamer.files.wordpress.com/2017/08/img_0019.png)![IMG_0021](https://windroamer.files.wordpress.com/2017/08/img_0021.png)

이를 해결하기 위한 방법은 비디오에 나와있다.


### 3. Nonnull return violation


"nonnull"이라 표시되어 있는데 어쨌든 nil 을 리턴 했을 때 발생하는 문제다. 이건 C 와 Swift 코드가 섞여 있을 때 문제를 유발 할 수 있다. 따라서 두개를 섞어 사용한다면 비정의 동작 탐지를 켜는것을 추천한다.

아래 예제를 보면 이해 할 수 있을 것이다.

![406_finding_bugs_using_xcode_runtime_tools_pdf_178_192페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/406_finding_bugs_using_xcode_runtime_tools_pdf_178_192e18491e185a6e1848be185b5e1848ce185b5_.jpg)

아래 설정을 통해 켜고 끌 수 있다.![406_finding_bugs_using_xcode_runtime_tools_pdf_180_192페이지_.jpg](https://windroamer.files.wordpress.com/2017/08/406_finding_bugs_using_xcode_runtime_tools_pdf_180_192e18491e185a6e1848be185b5e1848ce185b5_.jpg)


### Continuous Integration


품질을 높이기 위해 CI 도 이용하세요.

참고 : [Continuous Integration and Code Coverage in Xcode](https://developer.apple.com/videos/play/wwdc2015/410/)


# 요약


앞서 꾸준히 얘기했듯이 Runtime Tool 은 오버헤드가 크긴한데, 매우 강력한 툴이고 코드 자체의 품질을 높이는데 큰 기여를 할 수 있기 때문에 꼭 사용하길 권합니다. CI 툴과도 같이 이용 할 수 있는데, 환경에 따라 켜고 끄고 테스트 해보길 원합니다.
