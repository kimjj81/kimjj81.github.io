---
author: kimjj81
comments: true
date: 2017-06-04 14:20:43+00:00
excerpt: swift properties, concurrency programming
layout: post
link: https://windroamer.wordpress.com/2017/06/04/properties-in-swift-concurrency/
slug: properties-in-swift-concurrency
title: Properties in Swift , Concurrency
wordpress_id: 21
categories:
- IOS
tags:
- Atomic
- Concurrency
- GCD
- Properties
- Swift
---

# 프로퍼티 properties?




프로퍼티는 값을 클래스, 구조체, 열거형에 연결 한 메소드이다. 흔히 말하는 Getter, Setter 를 의미한다. 계산된 프로퍼티(Computed Properties)는 클래스, 구조체, 열거형에서 쓸 수 있다. 저장형 프로퍼티(Stored Properties)는 클래스, 구조체에서만 쓸 수 있다.




프로퍼티가 특정 인스턴스가 아니라 타입 자체와 연관되어 있는 경우에 타입 프로퍼티(Type Properties)라고 한다. 




Swift 에서는 프로퍼티 변화를 감지하기 위해 willSet, didSet 을 지원한다. Objective-C에서 Key-value Observing 을 이용하는 것보다 더욱 간편하고, 코드가 밀집되어 있다.




이어서 볼 내용은 프로퍼티의 종류 그리고 동시성 프로그래밍에서 고려 할 내용이다.





##  저장형 프로퍼티(Stored Properties)




<blockquote>

> 
> 예제
> 
> 

> 
> struct FullName {
  let familyName:String
  var firstName:String
}
> 
> 
</blockquote>




var는 변수, let 은 상수. 따라서, 위 예제에서 familyName 은 변경 할 수 없고, firstName 은 변경 가능하다. 클래스와 구조체 사이에 다른 점이 있으므로 유의해야 한다. 구조체의 인스턴스(Value Type)가  상수(let)으로 선언되면 해당 구조체의 모든 프로퍼티가 변경 불가능하다. 그러나 클래스의 인스턴스(Reference Type)는 상수로 선언 되어도 프로퍼티가 변수(var) 타입이면 변경 가능하다.




스위프트는 값 타입(Value Type) 과 참조 타입(Reference Type)이 서로 다른 동작을 할 때가 있으므로 유의해야 한다.



<table cellpadding="0" cellspacing="0" >
<tbody >
<tr >

<td valign="top" >**프로퍼티 변경 가능 여부**
</td>

<td valign="top" >


**상수(let) 프로퍼티**



</td>

<td valign="top" >


**변수(var) 프로퍼티**



</td>

<td valign="top" >**선언 예제**
</td>
</tr>
<tr >

<td valign="top" >**Const Value Type**
</td>

<td valign="top" >불가
</td>

<td valign="top" >**불가**
</td>

<td valign="top" >let obj = Array()
</td>
</tr>
<tr >

<td valign="top" >**Variable Value Type**
</td>

<td valign="top" >불가
</td>

<td valign="top" >가능
</td>

<td valign="top" >var obj = Array()
</td>
</tr>
<tr >

<td valign="top" >**Const Reference Type**
</td>

<td valign="top" >불가
</td>

<td valign="top" >**가능**
</td>

<td valign="top" >let view = View()
</td>
</tr>
<tr >

<td valign="top" >**Variable Reference Type**
</td>

<td valign="top" >불가
</td>

<td valign="top" >가능
</td>

<td valign="top" >var view = View()
</td>
</tr>
</tbody>
</table>


<blockquote>

> 
> 예제
> 
> 

> 
> var myName = FullName(familyName:"Kim", firstName:"Jeongjin")
myName.firstName = "Jinsu" // Ok
let sisterName = FullName(familyName:"Kim", firstName:"Jeongyeon")
sisterName.firstName = "Taeyeon" // Error, sisterName 이 let 으로 선언 되었기 때문
> 
> 
</blockquote>




## 




## 지연된 저장형 프로퍼티(Lazy Stored Properties)




지연된 프로퍼티는 초기화 때 값이 계산되지 않으며, 처음 사용 할 때 계산된다. "lazy" 한정자를 통해 지정 할 수 있다. 지연된 저장형 프로퍼티는 인스턴스 밖의 상황에 따라 좌우되는데, 해당 인스턴스가 초기화를 마치기 전까지 밖의 상황이 확정되지 않을 경우에 사용한다. 혹은, 프로퍼티 꽤나 많은 계산을 하거나 복잡 하며 해당 프로퍼티가 사용 안 할 수도 있는 경우 불필요한 자원 낭비를 방지 하기 위해 사용 될 수 있다.





<blockquote>

> 
> 주의 사항 
> 
> 

> 
> 1. 지연된 프로퍼티는 꼭 변수(var) 타입이어야 한다. 상수형 프로퍼티는 초기화가 끝나기 전에 값이 지정되어야 한다. 하지만, 지연된 프로퍼티는 초기화가 끝나도 값이 지정되지 않기 때문에, 상수형(let)으로 지정 할 수 없다.
> 
> 

> 
> 2. 초기화 되지 않은 지연된 프로퍼티가 여러 쓰레드에서 동시에 사용된다면, 딱 한번만 초기화(initializer) 된다는 보장이 없다.
> 
> 
</blockquote>




## 




## 계산된 프로퍼티 (Computed Properties)




선언된 타입의 변수가 존재 하는 것이 아니라, 해당 타입의 setter, getter 만 존재하는 형태.





<blockquote>

> 
> 주의 사항 : 계산된 프로퍼티는 무조건 var 로 선언해야 한다. 왜냐면 let 은 초기화가 끝난 다음에는 언제라도 같은 값을 얻을 수 있다는 것을 명시하기 때문이다. 
> 
> 
</blockquote>




축약형






	
  1. setter 축약형 : newValue 파라미터 생략 가능




<blockquote>

> 
> struct FullName {
  var firstName:String {
    set {  // setter (newValue) 가 원래 형태
       this.firstName = newValue
  }
}
> 
> 
</blockquote>


    2. 읽기 전용 getter 축약형


<blockquote>

> 
> struct FullName {
  var koreanOrderName:string {  // get 과 괄호 생략
      return "\(familyName) \(firstName)"
   }
}
> 
> 
</blockquote>




## 




## 감시하기


1. willSet


묵시적으로 제공되는 파라미터는 newValue 이며 사용자가 변경 할 수 있다.. 값이 바뀌기 전에 호출된다.




2. didSet




묵시적으로 제공되는 파라미터는 oldValue가 있으며 사용자가 변경 할 수 있다. 값이 바뀐 후 호출된다.





## 
타입 프로퍼티(Type properties)




타입 프로퍼티는 클래스 변수와 비슷하다고 보면 된다. 일반적인 프로퍼티가 인스턴스마다 생성되는 반면, 타입 프로퍼티는 해당 타입에 생성되고, 딱 1개만 존재하게 된다.




저장형 타입 프로퍼티는 변수, 상수 둘 다 가능하다. 계산형 타입 프로퍼티는 인스턴스 프로퍼티처럼 상수(var)로만 선언 해야한다.




주의 사항




저장형 타입 프로퍼티는 생성자가 따로 없기 때문에 꼭 기본 값을 선언 해야 한다. 또한, 저장형 타입 프로퍼티는 언제나 지연되어 초기화 되므로 lazy 키워드를 쓸 필요가 없다. 여러 스레드에서 동시에 접근 하는 경우가 있다 하더라도 신경 쓸 필요가 없다.




static 한정자만 붙여 주면 된다.





<blockquote>

> 
> 예제
> 
> 

> 
> struct someStruct {
static  TotalInstanceCount:Int = 0
}
> 
> 
</blockquote>




## 동시성 프로그래밍


멀티 스레드 프로그래밍 같은 동시성 프로그래밍을 하면 동시에 접근하는 자원이 읽기 용도로 사용되면 문제가 없지만 변경 가능 할 경우 문제가 발생 할 수 있다. Objective-C 에서는 프로퍼티 한정자에 atomic , nonatomic 키워드를 제공해서 이 문제를 풀 수 있게 해두었다. (atomic 은 한번에 한 스레드에서만 접근 가능하고 한 스레드에서 사용 중이면 그 스레드가 자원을 다 사용 할 때 가지 다른 스레드는 대기하게 된다. nonatomic 은 동시에 여러 스레드에서 해당 자원을 사용 가능하다.)

그러나 Swift 에서는 이런 한정자를 제공하지 않는다. 따라서 Thread-Safe 한 방법에 대해 꼭 염두를 둬야 하며, 프로퍼티의 Thread-Safe 이용 방법에 대해서 설명하려 한다.

한 자원에 하나의 스레드만 접근 할 수 있도록 하려면 동기화 기법을 이용하면 되는데, Swift 에서는 다른 방법들은 번거로우므로 GCD 만 이용 하는 것을 추천한다.(pthread_mutex_t, Foundation.Lock)

또한, 동기화 프로그래밍은 성능 문제를 야기 할 수 있으나 아마 특수한 경우를 제외하곤 성능 문제보다 프로그램 안정성 문제가 발생하는 경우가 대부분일 테니 동시성 프로그래밍의 가능성을 검토해서 동기화 기법을 적극 사용하는 것이 좋을 것이다. 성능에 관한 부분은 여기에선 생략한다. (일반적으로 iOS에서 성능은 UI가 60fps 를 달성 하는 것을 기준으로 삼으면 된다.)

일반적으로 Swift 에서 생성자는 nonatomic 하다.
<table cellpadding="0" width="569" style="height:195px;" cellspacing="0" >
<tbody >
<tr >

<td valign="top" >**종류**
</td>

<td valign="top" >**Atomic 여부**
</td>
</tr>
<tr >

<td valign="top" >**전역 변수의 생성자(Global variables' initializer)**
</td>

<td valign="top" >atomic 하게 실행 됨
</td>
</tr>
<tr >

<td valign="top" >**타입 프로퍼티(Type Property, Class Property)**
</td>

<td valign="top" >nonatomic
</td>
</tr>
<tr >

<td valign="top" >**인스턴스의 프로퍼티(Instance Property)**
</td>

<td valign="top" >nonatomic
</td>
</tr>
<tr >

<td valign="top" >**지연된 프로퍼티(Lazy Stored Property)**
</td>

<td valign="top" >nonatomic
</td>
</tr>
</tbody>
</table>


<blockquote>

> 
> Swift 에서 atomic 하게 프로퍼티 이용하는 예제
> 
> 

> 
> class MyObject {
private let internalState: Int
private let internalQueue: DispatchQueue
var state: Int {
get {
return internalQueue.sync { internalState }
}
set (newState) {
internalQueue.sync { internalState = newState }
}
}
}
> 
> 
</blockquote>




또한, **동시성** 프로그래밍을 할 때 생성자와 소멸자에서 생성 소멸에 관한 것을 담당하려 하지 말고 상태를 저장해서 Activated, Invalidated 상태를 확인 하도록 한다. 그리고 상태와 연관된 동작을 하는 메소드를 만들어서 명시적으로 호출하도록 한다. 그러면 생성자, 소멸자에만 프로퍼티의 생성 주기를 위임하는 것보다 안전하게 메모리를 관리 할 수 있다. 아래 Concurrent Programming with GCD in Swift 3 의 Active/Invalidate Pattern 을 참조하면 좋을 것이다.





## 요약




프로퍼티의 종류에 대해 알아보았고, 각각의 경우에 유의해야 할 사항도 짚어보았다. 더 나아가서 동시성 프로그래밍에 필요한 동기화 방법과 유의 사항에 대해 설명하였다.





## 참고 링크




[Properties : The Swift Programming Language (Swift 3.1)](https://developer.apple.com/library/content/documentation/Swift/Conceptual/Swift_Programming_Language/Properties.html#//apple_ref/doc/uid/TP40014097-CH14-ID254)




[Concurrent Programming With GCD in Swift 3](https://developer.apple.com/videos/play/wwdc2016/720/)
