---
title: iOS 멀티 스레드를 고려한 변수 사용
date: 2017-06-03 08:19:01+00:00
slug: ios-multithreading-variable-usage
categories:
- IOS
tags:
- Concurrency
- Objective-C
- Programming
---










### Multithread








![](https://windroamer.files.wordpress.com/2017/06/2f5f8-1n7u0ceowiwd6thrldpxqcg.png)





그림 1. iOS App’s Threads


모든 iOS Multithread 앱이며, 간단하면서도 유의해야 할 원칙들이 있다.






	
  1. 모든 UI 갱신에 관련된 작업은 main thread (그림 1의 Thread 1) 에서 수행되어야 한다.

	
  2. Thread-unsafe 변수는 서로다른 스레드에서 동시에 접근하면 위험하다.




여기에서는 2번째 경우에 관해 얘기를 하겠다. 이것이 중요한 이유는 이런 것들을 잘 지키지 않으면 프로그램이 죽기 때문이다. 왜 죽는지 디버깅 하기도 까다롭다.




이하 함수와 메소드는 모두 함수로 적겠습니다.





### Mutable , Immutable




기본적으로 Immutable instance는 Thread-safe 하다. 여러 스레드에서 한번에 접근한다 해도 문제가 없다는 의미다. Mutable Instance 를 만약 읽기 용도로만 이용한다면 문제가 없을 수도 있다. 그러나, Mutable Instance 를 하나 이상의 스레드에서 변경 중일 때 다른 스레드가 접근하면 문제가 생길 것이다. Mutable Instance가 멤버 변수이거나, 함수들 사이에 전달 된다면 그때는 Lock을 고려 해야 한다.




프로그래밍을 하다 애매하다 싶은게 있으면 해당 클래스의 문서를 참고하면 Thread-safe, unsafe 에 대한 얘기들이 나오니 관련된 얘기가 나오면 꼭 숙지하고 있는 게 좋겠다.





### Property Attribute




스레드와 관련된 Property Attirbute 는 atomic, nonatomic 이 있다. atomic 키워드는 해당 프로퍼티가 동시에 접근 할 수 없게한다. 따라서 Mutable 멤버 변수는 atomic 으로 하는게 나을 것이다. 다만 atomic 은 속도면에서 불리함 이있으니 Mutable Instance 라도 변경중에 절대 동시 접근 할 일이 없다면 nonatomic 으로 해도 될 것이다. 즉, 어떻게 설계하느냐에 따라 달라 질 수 있다.





### Synchronized




함수를 실행 할 때 특정 구간에서 특정 자원을 접근 할 때 동시에 접근 하지 못하게 하고 싶을 때 해당 부분을 Lock 할 수 있다. 그러면 한 스레드에서 그 구간을 끝낼 때 까지 다른 스레드에서 접근 할 수 없게 된다. 이때, Deadlock 을 유의 할 것.





[**Deadlock - Wikipedia**
_In concurrent computing, a deadlock is a state in which each member of a group of actions, is waiting for some other…_en.wikipedia.org](https://en.wikipedia.org/wiki/Deadlock)




Objective-c 에서는 간단하게 아래와 같이 @synchonized 구문을 이용해서 Lock을 할 수 있다. Block 하는 방식은 프로그래밍에는 유용하나 성능 저하를 가져오니 프로그램의 성격에 맞춰 적용해야 할 것이다.


[code language="objc"]
<p class="graf graf--h3 graf-after--pre">- (void)myMethod:(id)anObj
{
@synchronized(anObj)
{
// Everything between the braces is protected by the @synchronized directive.
}
}</p>
[/code]





















### GDC




GDC는 동시성 프로그래밍을 위한 도구이다. Thread 프로그래밍과 비슷하지만 Thread 프로그래밍은 복잡하고 구현이 어렵기 때문에 Apple 에서는 좀 더 간단하면서 효율적인 것을 만들어냈다.




GDC 에서도 위에서 얘기한 것들을 숙지하며 사용 해야 한다.





### in Swift




Swift 에서 다뤄볼만한 점은 structure 와 class 이다. structure 는 value type 이고 class 는 reference type 이다. value type 의 특징은 call by value 로 동작한다는 점이다. class는 call by reference 이고.




그래서 structure type 은 파라미터로 전달 될 때 thread safe 하다. structure type 이 성능면에서도 class 보다 낫다고 하니 설계 할 때 고려 사항이 될 만하다. class 는 Objective-C 와 동일하다.




생각해볼 점 : structure 가 멤버 변수일 경우





### 결론




Thread-unsafe 한 변수를 이용 한다면, 변경 중에 동시 접근하는 경우가 생기는지 확인해야 한다. 그러지 않으면 앱이 쥐도새도 모르게 죽는다. View, ViewController 의 Life-cycle , Event 에 관계된 함수에서는 특히 주의해야 한다.





### 참조




[**Synchronization**
_Explains how to use threads in Cocoa applications._developer.apple.com](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/Multithreading/ThreadSafety/ThreadSafety.html#//apple_ref/doc/uid/10000057i-CH8-SW1)




[**Dispatch Queues**
_Explains how to implement concurrent code paths in an application._developer.apple.com](https://developer.apple.com/library/content/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html)




[**The Swift Programming Language (Swift 3.1): Classes and Structures**
_The definitive guide to Swift, Apple's new programming language for building iOS, macOS, watchOS, and tvOS apps._developer.apple.com](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/ClassesAndStructures.html#//apple_ref/doc/uid/TP40014097-CH13-ID82)
