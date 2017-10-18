---
author: kimjj81
comments: true
date: 2017-06-03 07:57:47+00:00
layout: post
link: https://windroamer.wordpress.com/2017/06/03/objective-c-literals/
slug: objective-c-literals
title: Objective-C Literals
wordpress_id: 5
categories:
- IOS
tags:
- literals
- Objective-C
- Programming
- Xcode
---

**[Objective-C](http://developer.apple.com/documentation/Cocoa/Conceptual/ObjectiveC/) Literals**

**Literals의 소개**

리터럴은 소스코드상에 표시된 고정된 값이다. 숫자, 문자, 집합형(배열형, 사전형)이 있다. [XCode](http://developer.apple.com/tools/xcode/) 4.4 부터 새롭게 추가 되었다. OSX 10.8과 [iOS](http://www.apple.com/ios) 5.1 부터 지원한다. OSX 10.7 에서도 지원하려면 OSX 10.8 SDK로 컴파일 해주기만 하면 된다. XCode 4.5 에 포함된 최고 버전의 SDK를 이용한다면 OSX 10.6과 iOS 4 이상에서 이용 가능하다. 자세한 사항은 예제만 봐도 바로 알 수 있을 것이다. 그리고 최신 사양 지원 문제 때문에 되도록 Apple [LLVM](http://llvm.org) 을 이용하는 것을 권장한다.

**숫자형**

NSNumber *theLetterZ = @'Z';          // equivalent to [NSNumber numberWithChar:'Z']

// integral literals.

NSNumber *fortyTwo = @42;             // equivalent to [NSNumber numberWithInt:42]

NSNumber *fortyTwoUnsigned = @42U;    // equivalent to [NSNumber numberWithUnsignedInt:42U]

NSNumber *fortyTwoLong = @42L;        // equivalent to [NSNumber numberWithLong:42L]

NSNumber *fortyTwoLongLong = @42LL;   // equivalent to [NSNumber numberWithLongLong:42LL]

// floating point literals.

NSNumber *piFloat = @3.141592654F;    // equivalent to [NSNumber numberWithFloat:3.141592654F]

NSNumber *piDouble = @3.1415926535;   // equivalent to [NSNumber numberWithDouble:3.1415926535]

// BOOL literals.

NSNumber *yesNumber = @YES;           // equivalent to [NSNumber numberWithBool:YES]

NSNumber *noNumber = @NO;             // equivalent to [NSNumber numberWithBool:NO]

#ifdef __cplusplus

NSNumber *trueNumber = @true;         // equivalent to [NSNumber numberWithBool:(BOOL)true]

NSNumber *falseNumber = @false;       // equivalent to [NSNumber numberWithBool:(BOOL)false]

#Endif

**주의사항**

1. 괄호 표현

#define INT_MAX   2147483647  /* max value for an int */

#define INT_MIN   (-2147483647-1) /* min value for an int */

위 예시에서 @INT_MIN 은 안된다. 왜냐하면 괄호로 되어 있기 때문이다. 괄호가 있는 것은 boxed expression 을 참조하라.

2. Long double 형

NSNumber 는 [long double](http://en.wikipedia.org/wiki/Long_double) 은 지원하지 않고 있다. 위에 나온 예시만 이용 할 것.

**Boxed 표현형**

괄호로 둘러싼 형태

// numbers.

NSNumber *smallestInt = @(-INT_MAX - 1);  // [NSNumber numberWithInt:(-INT_MAX - 1)]

NSNumber *piOverTwo = @(M_PI / 2);        // [NSNumber numberWithDouble:(M_PI / 2)]

// [enumerated types](http://en.wikipedia.org/wiki/Enumerated_type).

[typedef](http://en.wikipedia.org/wiki/Typedef) enum { [Red](http://www.simplyred.com), Green, Blue } Color;

NSNumber *favoriteColor = @(Green);       // [NSNumber numberWithInt:((int)Green)]

// strings.

NSString *path = @(getenv("PATH"));       // [NSString stringWithUTF8String:(getenv("PATH"))]

NSArray *pathComponents = [path componentsSeparatedByString:@":"];

예제1)

enum {

AVAudioQualityMin = 0,

AVAudioQualityLow = 0x20,

AVAudioQualityMedium = 0x40,

AVAudioQualityHigh = 0x60,

AVAudioQualityMax = 0x7F

};

- (AVAudioRecorder *)recordToFile:(NSURL *)fileURL {

NSDictionary *settings = @{ AVEncoderAudioQualityKey : @(AVAudioQualityMax) };

return [[AVAudioRecorder alloc] initWithURL:fileURL settings:settings error:NULL];

}

예제2)

typedef enum : unsigned char { Red, Green, Blue } Color;

NSNumber *red = @(Red), *green = @(Green), *blue = @(Blue); // => [NSNumber numberWithUnsignedChar:]

예제3)

typedef enum : unsigned char { Red, Green, Blue } Color;

Color col = Red;

NSNumber *nsCol = @(col); // => [NSNumber numberWithUnsignedChar:]

예제4) C String

int main(int [argc](http://en.wikipedia.org/wiki/Main_function), char *argv[])

{

NSMutableArray *args = [NSMutableArray new];

NSMutableDictionary *options = [NSMutableDictionary new];

while (--argc) {

const char *arg = *++argv;

if ([strncmp](http://en.wikipedia.org/wiki/String.h)(arg, "--", 2) == 0) {

options[@(arg + 2)] = @(*++argv);   // --key value

} else {

[args addObject:@(arg)];            // positional argument

}

}

}

**컨테이너 리터럴**

컨터이너 리터럴은 기본적으로 변경 할 수 없는 객체(immutable)이다.

NSDictionary *dictionary = @{

@"name" : NSUserName(),

@"date" : [NSDate date],

@"processInfo" : [NSProcessInfo processInfo]

};

이런식으로 하면 변경 가능한 객체를 간단히 생성 가능하다. (단점은 자동 완성이 잘 지원되지 않는다.)

NSMutableArray *food = [@[@“김치”,@“라면”,@“밥”] mutableCopy];

**Subscripting Method**

객체 치환 방식이다. 배열형과 사전형이 있다. 기존에는 replaceObjectAtIndex:withObject: 나 setObject:forKey: 같은 것을 호출해야 했다.

**배열형**

NSUInteger idx = ...;

NSMutableArray* object = [NSMutableArray new];

id value = object[idx];

object[idx] = @“abc”;

**사전형**

id key = ...;

id value = object[key];

object[key] = newValue;

현재는 정수형과 Objective-C 타입 객체에만 적용 된다.(C++ 안됨)

참조

[http://developer.apple.com/library/ios/#documentation/cocoa/conceptual/ProgrammingWithObjectiveC/FoundationTypesandCollections/FoundationTypesandCollections.html](http://developer.apple.com/library/ios/#documentation/cocoa/conceptual/ProgrammingWithObjectiveC/FoundationTypesandCollections/FoundationTypesandCollections.html)

[http://clang.llvm.org/docs/ObjectiveCLiterals.html](http://clang.llvm.org/docs/ObjectiveCLiterals.html)

[http://developer.apple.com/library/ios/#releasenotes/ObjectiveC/ObjCAvailabilityIndex/_index.html](http://developer.apple.com/library/ios/#releasenotes/ObjectiveC/ObjCAvailabilityIndex/_index.html)
