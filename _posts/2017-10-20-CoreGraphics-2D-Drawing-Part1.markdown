---
author: kimjj81
comments: true
date: 2017-10-20 10:40:0+0900
layout: post
title: "Core Graphics - Quartz 2D 기본편"
categories: IOS
tags: Swift Xcode CoreGraphics Quartz Drawing Affine
---

이 문서에서는 Quartz 를 이용하여 출력하는 방법을 소개합니다.  
그리기 위치 설정, 회전, 확대, 축소에 관한 내용이 담겨 있습니다.  
이번에는 기초적인 부분을 설명하고 다음 장에 더욱 자세한 사용법을 소개하겠습니다.  


# Core Graphics
<https://developer.apple.com/documentation/coregraphics>
 
Quartz 기반의 2D 그리기 도구로 Path , 안티얼라이싱, 그레디언트, 이미지, 색 관리, PDF 등등의 기능을 제공한다.  
접두사로 CG를 사용한다.  


----   

## 용어 정리

### CGContext
<https://developer.apple.com/documentation/coregraphics/cgcontext>

Quartz 의 2D 출력 대상이다. 그래픽 컨텍스트는 그리기 데이터와 그리기 위한 모든 장치 정보를 가지고 있다. 그리기 대상은 어플리케이션의 윈도, 비트맵 이미지, PDF, 프린터가 될 수 있다.

### CGLayer
<https://developer.apple.com/documentation/coregraphics/cglayer>
그리기 행위를 재활용하기 위해서 Core Graphics 에서 쓰는 장치이다. View는 CGLayer 를 가지고 있고, 실제 그리기는 CGLayer 에 그린다. 저수준 API 라 속도가 빠르다.   

### Quartz

쿼츠 프레임워크는 2D 그리기 프레임워크이며 해상도와 장치에 독립적이다.  
투명한 레이어, 패쓰 기반 그리기, 메모리(offscreen)에 그리기 : 더블 렌더링, 향상된 색 제어, 안티 얼라이싱, PDF 생성, 출력, 파싱 기능을 제공한다.  
여담으로 iOS 11부터 PDFKit 이 제공된다. 그 이전에도 제공하던 API가 있지만 기능이 너무 제한적이었다.

----
## iOS 에서 Quartz 사용하기

QuartzCore 를 import 한다.   

Quartz 2D 그리기 모델은 두가지 좌표계가 있다.
- User Space Coordinate 사용자 좌표계
 - 도큐먼트 페이지를 표시하는 좌표계.  사용자 좌표계는 실제 디바이스와 관계없는 부동소수점으로 표시된다. 어떤 문서를 실제 화면에 출력하거나 프린트 할 때, 쿼츠가 사용자 좌표계를 디바이스 좌표계로 맵핑해준다.  
- Device space  디바이스 좌표계
 - 실제 기기의 해상도를 표시하는 좌표계.

또한, 일반적인 모니터나 문서의 좌표계는 X 가 오른쪽으로 증가하고, Y가 아래로 증가한다. 그러나 Quartz CTM 은 X가 오른쪽으로 증가하고 Y가 위로 증가한다.  Quartz CTM 을 변형시키면 아래 그림의 방향대로 움직인 다는 것을 염두에 두어야 한다.

![CTM coordinate](https://cl.ly/1O0I2v0j2t3m/download/[6484ea62ed55938535168cc47e9c6d8a]_Image%202017-10-23%20at%2011.05.56%20%EC%98%A4%ED%9B%84.png){:class="img-responsive"}
 
### CTM
사용자 영역의 그리기를 수정하기 위하여 CTM - the Current Transform Matrix 에 특정 연산을 할 수 있다. 그래픽 컨텍스트의 초기 CTM 은 단위행렬identity matrix 로 생성된다.  CTM 을 수정하기 위하여 Quartz 의 변환 함수를 쓸 수 있다. 그러면 사용자 영역에 그리는 동작이 변경 된다. 바꿔 말하면 사용자 영역에 그리는 행위는 CTM 을 수정하는 행위가 수반된다.  
CTM 은 행렬이니, 선형대수학의 행렬 계산을 알면 이해하는데 도움이 된다.  

아래 예제 코드는 Objective-C 기준으로 작성되어 있다. Objective-C 는 C 와 호환되며, Quartz 코드는 구조적 프로그램 스타일로 작성되어 있다. Swift 최신 버전에 대응하는 Quatz 코드는 객체지향 방식으로 되어있다. 따라서 Objective-C 에서 CGContextXXX 로 쓸 수 있는 함수를 Swift 에서는 CGContext 인스턴스 메소드에서 대응하는 메소드를 찾을 수 있다.

예를 들면 아래 처럼 대응 할 수 있다.

Objective-C                                                        | Swift 
----------------------------------------------|-----
 CGContextSaveGState(CGContextRef context)|let context = CGContext....... <br> context.saveGState()

#### 용어 

- Translate : 그리는 위치를 이동한다.
- Rotate : 회전
- Scale : 확대 , 축소
- Concatenate : 두개의 행렬을 연결하는 것으로 행렬 곱연산을 통해 이루어진다.

### CTM 변환

CTM을 변환하는 것은 컨텐츠를 변형시키는 것이 아니라 좌표계를 움직이는 것이다. 예를 들어, CTM 에 (10,10) 만큼 변화를 준다면 그리기 기준점이 (10,10)으로 이동하는 것이다. 그러므로 CTM 에 변형을 하기 전에 그 전의 상태를 기억해둬야 한다.


	CGContextSaveGState(context)
	CGContextRestoreGState(context)
	
#### 이동(Translate)

	CGContextTranslateCTM (myContext, 100, 50);
	
#### 회전

회전의 단위는 radian 이다. [라디안 - 위키페디아](https://ko.wikipedia.org/wiki/%EB%9D%BC%EB%94%94%EC%95%88)  
회전축의 기본 점은 (0,0) 이다. 만약 CTM을 이동했다면 이동한 지점이 회전축이 될 것이다.


	CGContextRotateCTM (myContext, radians(–45.));  
	
	// 라디안 - 각 변환
	#include <math.h>
	static inline double radians (double degrees) \
	 {return degrees * M_PI/180;}

#### 확대 축소

확대 축소 파라미터 X, Y 가 0~1사이면 축소가 되고, 1보다 크면 확대가 된다. X, Y 가 0보다 작을 경우 축으로 뒤집게 된다. 

	CGContextScaleCTM (myContext, .5, .75);

#### 행렬 연결

CTM 변환을 연속적으로 수행하는 것인데, CTM에 행렬 곱을 함으로써 수행 할 수 있다.

[void CGContextConcatCTM(CGContextRef c, CGAffineTransform transform);](https://developer.apple.com/documentation/coregraphics/1454897-cgcontextconcatctm)

다른 방법으로는, CTM 의 스테이트를 저장하지 않고(CGContextSaveGState를 호출 하지 않고) 연속적으로 CTM 변환 함수들을 호출 하면 된다.

	예)
	CGContextTranslateCTM (myContext, w,h);
	CGContextRotateCTM (myContext, radians(-180.));

#### 아핀 변형 Affine Transforms

Function                                   |Use                                                                     
------------------------------|-----------------------------------------------
CGAffineTransformMakeTranslation|원점에서 x,y 만큼 이동하는 행렬을 만드는 함수
CGAffineTransformTranslate|기존에 있는 아핀 변형 행렬에 이동을 수행하는 함수
CGAffineTransformMakeRotation|좌표계를 얼만큼 회전 시킬 지 새로 정하는 행렬을 만드는 함수. 파라미터는 라디안.
CGAffineTransformRotate|기존에 있는 아핀 변형 행렬에 회전을 추가하는 함수
CGAffineTransformMakeScale|좌표계를 X축, Y축으로 각각 확대/축소를 하는 아핀 변환 행렬을 만드는 함수
CGAffineTransformScale|기존에 있는 아핀 변환 행렬에 확대/축소를 추가하는 함수
CGAffineTransformInvert|기존에 수행했던 변환을 되돌리고 싶을 때 사용. 일반적으로는 State를 저장했다 복원하기 때문에 잘 사용하지 않는다.
CGPointApplyAffineTransform|전체 공간에 대해 변환을 수행하는게 아닌 특정 포인트에 대해서 수행하는 함수
CGSizeApplyAffineTransform|사이즈에 대해서 위와 대응되는 함수
CGRectApplyAffineTransform|사각 영역에 대해 위와 대응되는 함수
CGAffineTransformMake|변환 행렬을 직접 만들 때 사용하는 함수

----


### 아핀 행렬의 수학적 기초

아핀 행렬은 3x3 행렬로 구성된다. 가장 오른쪽 열은 0, 0, 1 이 되는데 이것은 concatenation 을 위해 필요한 부분이다. 변환 행렬식은 2 * 3 행렬이면 되지만, 행렬곱은 선행 행렬의 열의 갯수와 후행 행렬의 행의 갯수가 같아야 하기 때문에 변환을 연쇄하기 위해서 3 * 3 행렬로 했다.

x,y 값을 아핀 변환 한 결과를 x', y' 라고 하고 아핀 행렬이 다음과 같이 되어있다면

![Affine Matrics](https://cl.ly/0L1I2L2u163g/download/Image%202017-10-24%20at%2012.26.12%20%EC%98%A4%ED%9B%84.png)

x' = ax+cy+t<sub>x</sub>  
y' = bx+dy+t<sub>y  

이 된다.

### 단위 행렬

단위 행렬

-----
1 0 0  
0 1 0  
0 0 1

-----

위 식에 입력해보면  

x' = x*1 + y*0 + 0 = x  
y' = x*1 + y*1 + 0 = y   

### 아핀 이동

-----
1 0 0  
0 1 0  
t<sub>x</sub> t<sub>y</sub> 1  

----

x' = x + t<sub>x</sub>  
y' = y + t<sub>y</sub>  

### 아핀 확대 축소

----
s<sub>x</sub> 0 0   
0 s<sub>y</sub> 0  
0 0 1  

----

x' = x * s<sub>x</sub>  
y' = y * s<sub>y</sub>

### 회전

----
cos*a*  | sin*a*  | 0  
-sin*a* | cos*a* | 0  
 0          |  0       |  1   

----

x' = *x*cos*a*-*y*sin*a*  
y' = *x*sin*a* + *y*cos*a*

### Concatenate 

둘 이상의 행렬을 연환하여 계산하는 것인데, 행렬 곱과 같다. 사칙연산의 곱셈과는 다르게 행렬 곱은 비가환적이므로(a * b 와 b * a 가 같지 않다) 순서에 주의해야 한다.  



위 내용은 [위키페디아의 아핀 행렬](https://en.wikipedia.org/wiki/Affine_transformation#Image_transformation)을 보면 직관적으로 알 수 있습니다.  
[애플 문서 Quartz : The Math behind the Matrics](https://developer.apple.com/library/content/documentation/GraphicsImaging/Conceptual/drawingwithquartz2d/dq_affine/dq_affine.html#//apple_ref/doc/uid/TP30001066-CH204-CJBECIAD) 에도 설명되어 있으니, 도표만 보면 바로 이해가 가실겁니다.


 

# 참고 

[Quartz Introduction](https://developer.apple.com/library/content/documentation/GraphicsImaging/Conceptual/drawingwithquartz2d/Introduction/Introduction.html#//apple_ref/doc/uid/TP30001066)  

[Draing printing iOS](https://developer.apple.com/library/content/documentation/2DDrawing/Conceptual/DrawingPrintingiOS/Introduction/Introduction.html#//apple_ref/doc/uid/TP40010156-CH1-SW1)

[Drawing with Quartz 2d](https://developer.apple.com/library/content/documentation/GraphicsImaging/Conceptual/drawingwithquartz2d/dq_affine/dq_affine.html)

[CTM 변형](https://stackoverflow.com/questions/31501735/ios-draw-image-with-cgcontext-and-transform?answertab=active#tab-top)
