---
author: kimjj81
comments: true
date: 2017-10-24 10:00:0+0900
layout: post
title: "Core Graphics - Quartz 2D 실전 예제"
categories: IOS
tags: Swift Xcode CoreGraphics Quartz Drawing Affine
---

# Graphic Context

그래픽 컨텍스트는 그리기의 목적지다. 모든 그리기 함수는 그래픽 컨텍스트에 적용된다. 그래픽 컨텍스트는 그리기와 관련된 환경 변수를 저장하고 있다. 색 공간, 색 영역, 메모리, 잘라내기 영역, 선 두께, 스타일, 폰트 등.  

* 클리핑 Clipping : 특정 영역만 남기고 잘라내는 동작.

# iOS 에서 그리기

UIView 객체가 생성되고 화면에 보여야 할 때, drawRect 가 호출된다. 이것이 호출되기 전에 그리기와 관련된 환경이 자동으로 생성되어 불투명한 속성의 CGContextRef 가 생성된다.   
이렇게 생성된 그래픽 컨텍스트는 UIGraphicGetCurrentContext() 함수를 호출해서 획득 할 수 있다.  
이전 문서에서 설명했듯이 UIKit 과 Quartz 는 좌표계가 다르다. 이 둘을 맞추기 위해서 UIKit 에서 CTM 의 Y에 -1을 곱하여 Y 축을 뒤집는다.   


# Bitmap 컨텍스트 생성하기

비트맵 컨텍스트는 이미지를 저장할 메모리 버퍼에 대한 포인터를 갖는다. 그래픽 컨텍스트에 그리기를 하면 이 메모리 버퍼가 업데이트 된다. 그래픽 컨텍스트를 해제 한 후, 지정했던 포맷의 비트맵 데이터를 얻을 수 있다.  

iOS 에서는 [UIGraphicsBeginImageContextWithOptions](https://developer.apple.com/documentation/uikit/1623912-uigraphicsbeginimagecontextwitho)를 이용해야 한다.  

MacOS 에서는 CGBitmapContextCreate 를 이용한다.

----

# 그리기 경로Path 이용하기

그리기 경로는 여러 선으로 이루어진 도형을 그리는 작업이다. 선이 아주 세부적으로 정의되어 있다면 마치 손으로 그린듯이 매끄러운 표현도 할 수 있을 것이다.  
그리기 경로는 '그리기 경로 만들기'와 '그리기 경로 칠하기'의 두가지 작업으로 분리되어 있다. 먼저 그리기 경로를 만들고 그 다음에 선을 그린다. 그리기 경로가 만들어지면 닫힌 경로 내부를 어떤 색으로 채울 수도 있다.  

# 그리기 위해 필요한 것들

그리기 경로는 선, 호, 구부러진 경로로 이루어 질 수 있다. 

* 점 Point : 점을 그리거나 선을 그리기 위해선 먼저 그리기 시작점을 이동해야 한다. 
[CGContextMoveToPoint](https://developer.apple.com/documentation/coregraphics/1454738-cgcontextmovetopoint) 함수를 이용해 이동한다.

* 선 Line : 위와 같이 그리기 시작점을 지정했으면 [CGContextAddLineToPoint](https://developer.apple.com/documentation/coregraphics/1455213-cgcontextaddlinetopoint) 함수로 선의 다른 지점을 지정한다. (선은 두 점을 잇는 가장 짧은 구간이다)  
또는 [CGContextAddLines](https://developer.apple.com/documentation/coregraphics/1455461-cgcontextaddlines) 함수에 CGPoint 배열을 넘겨서 여러 선을 한번에 그을 수도 있다.

* 호 Arc : 호는 원의 일부분이다. [CGContextAddArc](https://developer.apple.com/documentation/coregraphics/1455756-cgcontextaddarc) 함수를 통해 그릴 수 있다. 시작점, 반지름, 호의 시작 각도와 마지막 각도, 그릴 방향(시계, 반시계)을 정 할 수 있다. 각도는 라디안을 이용한다.   
[CGContextAddArcToPoint](https://developer.apple.com/documentation/coregraphics/1456238-cgcontextaddarctopoint) 함수는 2개의 탄젠트 라인을 이용해서 호를 그리는 방법을 제공한다. 그림에서 분홍색이 실제 그려지는 부분이다.
![CGContextAddArcToPoint](https://cl.ly/3w203K2m1m1O/download/Image%202017-10-24%20at%205.30.53%20%EC%98%A4%ED%9B%84.png)  

* 곡선 Curve : Quartz는 베이지어 커브를 제공한다. [CGContextAddCurveToPoint](https://developer.apple.com/documentation/coregraphics/1456393-cgcontextaddcurvetopoint)

# 그리기 영역 자르기 Clipping to a Path

특정 그리기 영역을 제외한 나머지 부분은 그리지 않게 할 수도 있다.

	원형으로 자르기 예제
	CGContextBeginPath (context);
	CGContextAddArc (context, w/2, h/2, ((w>h) ? h : w)/2, 0, 2*PI, 0);
	CGContextClosePath (context);
	CGContextClip (context);


----
이 뒤는 지겨워서 잠시 보류. -_-/~



----

# 참고

[Quartz 2D Programming](https://developer.apple.com/library/content/documentation/GraphicsImaging/Conceptual/drawingwithquartz2d/dq_context/dq_context.html#//apple_ref/doc/uid/TP30001066-CH203-SW9)

