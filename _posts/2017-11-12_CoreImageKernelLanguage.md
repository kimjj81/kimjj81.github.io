---
author: kimjj81
comments: true
date: 2017-11-12 10:00:0+0900
layout: post
title: "Core Image Kernal Language"
categories: IOS
tags: Xcode CoreGraphics Quartz Drawing Affine CoreImage
---

# Core Image Kernal Language

Core Image Kernal Language는 사용자 정의 이미지 처리 필터를  위한 함수, 데이터 타입을 제공한다.  
이미지 처리를 위해 OpenGL Shading Language(glslang)도 사용 할 수 있다.  
다시 말하면 이 문서는 Core Image Kernal 파일을 만들기 위한 언어에 대한 것이다.

## 함수

### compare

```genType compare (genType x, genType y, genType z)```

x < 0 ? y : z 값을 반환.   
*genType*은 임의의 벡터 타입.

### cos_

```genType cos_ (genType x)```

x가 [-pi,pi] 사이 값이어야 한다는 점만 빼면 *cos (x)* 과 유사하다.  
*genType*은 임의의 벡터 타입.

### cossin

```vec2 cossin (float x)```

vec2 (cos (x), sin (x)) 값을 반환한다.

### cossin_

```vec2 cossin_ (float x)```

vec2 (cos (x), sin (x)) 값을 반환한다.  
*x* 는 [–pi, pi] 범위에 있어야 한다.

### destCoord

```varying vec2 destCoord ()```

현재 계산되고 있는 픽셀의 현재 작업 영역 좌표계에 해당하는 위치를 반환한다.  
목표 공간(destination space)은 이미지가 렌더링되는 좌표 공간을 가리킨다.

### premultiply

```vec4 premultiply (vec4 color)```

색상 파라미터의 RGB 요소를 그것의 알파 컴포넌트만큼 곱한다.  
Multiplies the red, green, and blue components of the color parameter by its alpha component.

### sample

```vec4 sample (uniform sampler src, vec2 point)```

샘플러 src 의 point 위치로부터 생성된 픽셀 값을 반환한다. point 는 sampler 공간에 기술되어 있다.

### samplerCoord

```varying vec2 samplerCoord (uniform sampler src)```

샘플러 공간에 존재하는 샘플러 src의 좌표를 반환한다.  샘플러 src 는 현재 출력 픽셀과 연관이 있다. 어떤 행렬 변형 연산이 src 에 적용된 출력 픽셀이라도 말이다. 샘플 공간은 텍스쳐가 시작된 좌표 공간을 지시한다.  
Returns the position, in sampler space, of the sampler src that is associated with the current output pixel (that is, after any transformation matrix associated with src is applied). The sample space refers to the coordinate space of that you are texturing from.   

만약 데이터가 타일 모양이라면, 샘플 좌표는 (dx/dy)의 오프셋을 가질 것이다. *samplerTransform* 함수를 이용해서 샘플러 위치를 대상 위치로 변환 할 수 있다.  
Note that if your source data is tiled, the sample coordinate will have an offset (dx/dy). You can convert a destination location to the sampler location using the samplerTransform function.

### samplerExtent

```uniform vec4 samplerExtent (uniform sampler src)```

전체 좌표계(world coordinates)에 있는 샘플러 영역을 반환한다. 반환값 형식을 [x, y, width, height] 이다.

### samplerOrigin

```uniform vec2 samplerOrigin (uniform sampler src)```

*samplerExtent (src).xy.* 와 동일하다.

### samplerSize

```uniform vec2 samplerSize (uniform sampler src)```

*samplerExtent (src).zw.* 와 동일하다.

### samplerTransform

```vec2 samplerTransform (uniform sampler src, vec2 point)```

첫번째 아규먼트에서 원본 공간의 좌표 공간에 해당하는 위치를 반환한다. 원본은 두번째 아규먼트인 point 가 속한 작업 공간(working-space)에 정의된 위치와 연관되어 있다.  (작업 공간 좌표는 그것에 적용된 어떤 변형이라도 모두 반영함을 명심하라.)  
Returns the position in the coordinate space of the source (the first argument) that is associated with the position defined in working-space coordinates (the second argument). (Keep in mind that the working space coordinates reflect any transformations that you applied to the working space.)

예를 들어, 작업 공간의 픽셀 하나를 수정한다면, 원본 이미지의 해당 픽셀을 둘러싸고 있는 픽셀들을 순회해야 한다.  아마 다음과 같은 명령과 비슷한 것을 할 것이다. d 는 작업 공간의 수정한 픽셀위 위치이다. 이미지는 픽셀들의 원본 이미지이다.

For example, if you are modifying a pixel in the working space, and you need to retrieve the pixels that surround this pixel in the original image, you would make calls similar to the following, where d is the location of the pixel you are modifying in the working space, and image is the image source for the pixels.

    samplerTransform(image, d + vec2(-1.0,-1.0));
    samplerTransform(image, d + vec2(+1.0,-1.0));
    samplerTransform(image, d + vec2(-1.0,+1.0));
    samplerTransform(image, d + vec2(+1.0,+1.0));

### sin_

```genType sin_ (genType x)```

x가 [-pi,pi] 사이의 값이어야 하는 것을 제외하면 sin (x) 와 비슷하다.  genType 은 임의의 벡터 타입이다.

### sincos

```vec2 sincos (float x)```

vec2 (sin (x), cos (x)) 값 반환.

### sincos_

```vec2 sincos_ (float x)```

vec2 (sin (x), cos (x)) 반환. x는 [–pi, pi] 범위여야 한다.

### tan_

```genType tan_ (genType x)```

tan (x) 와 같다. 단, x 는 [–pi, pi] 범위 이어야 한다. genType 은 임의의 벡터 타입이다.

### unpremultiply

```vec4 unpremultiply (vec4 color)```


만약 color 파라미터의 알파가 0보다 크면, RGB 컴포넌트를 알파로 나눈다. 만약 알파가 0이면 color 를 반환한다.

## 데이터 타입

### sampler

CISampler 에서 전해진 샘플러를 명세한다. CISampler 는 데이터에서 샘플을 얻기 위해 사용된다.  

### __color

현재 CIContext 작업 공간 영역과 색을 맞추기 위해 필요한 커널 파라미터 타입을 명세한다.

### __table

Lookup 테이블에서  값을 가져오는 샘플러를 위한 특별한 기호(flag)
__table 은 샘플러 타입보다 무조건 앞에 와야 한다. 이 기호를 보고 Core Image 가 World 좌표계를 이용한 테이블 값을 샘플링하지 않게 한다.  
The __table flag must precede the sampler type. The flag ensures that Core Image does not sample the table values using world coordinates.

예를 들어, *shadematerial* 이라고  명명된 커널에서 Lookup 테이블 샘플러를 이용하기 위해, 커널 정의를 이렇게 하면...

>kernel vec4 shadedmaterial(sampler heightfield, __table sampler envmap, float surfaceScale, vec2 envscaling)

__table 기호가 envmap 샘플러 값이 변형되지 않도록 방지한다. 만약 음영처리 kernel 이 아핀 변형의 연속상에 있는 경우라도 그러하다. 만약 샘플러에 이런식으로 표시하지 않는다면, 음영 처리 필터가 회전을 위한 아핀 변환을 하고, 회전된 값에서 환경 맵에 있는 lookup table 의 값을 참조하게 된다. 그러면 lookup table 은 단순히 데이터의 집합이기 때문에 틀린 값이 된다.  
Using the __table flag prevents the envmap sampler values from being transformed, even if the shaded material kernel gets inserted into a filter chain with an affine transform. If you don’t tag the sampler this way and you chain the shaded material filter to an affine transform for rotation, then looking up values in the environment map results in getting rotated values, which is not correct because the lookup table is simply a data collection
    
## 예약어(Keywords)
	
### kernel

커널 루틴을 명세한다. 커널 루틴은 CIKernel class 에 의해 추출되고 컴파일 된다. 커널은 출력 이미지의 단일 픽셀을 계산하기 위해 필요한 계산식을 캡슐화 한다.  
Specifies a kernel routine. Kernel routines are extracted and compiled by the CIKernel class. A kernel encapsulates the computation required to compute a single pixel in the output image.

모든 커널은 그것의 반환 타입에 대한 커널 키워드에 의해 표시된다. 커널의 내재된 반환 타입은 vec4 이어야 한다. Core Image 는 현재 평가된 입력 픽셀에 대해 출력 픽셀을 반환하기 위하여 이 타입을 필요로 한다.  
커널에 대한 모든 파라미터는 묵시적으로 uniform 으로 표시된다.(implicitly marked uniform) 파라미터가 *out* 이나 *inout*으로 선언 할 수 없다.

커널 루틴에 다음 타입을 건넬 수 있다  
* sampler: 커널을 적용 할 때 CISampler Object 가 필요하다.
* __table: 샘플러 타입에 대한 수식어 A qualifier for a sampler type. float, vec2, vec3, vec4: NSNumber 나 CIVector 에 필요
* __color:  프로그램에 전달 될 때 CIContext 작업 색상 공간에 일치되는 색상. 커널에 적용 할 때 CIColor 객체가 필요하다. 커널 프로그램에서는 미리 곱셈 된 RGBA 형식의 vec4 형식가 된다.

## 지원하지 않는 것

OpenGL Shading 언어 소스 코드 전처리기를 지원하지 않는다. 또한 다음 타입도 구현되지 않았다.

* Data types : mat2, mat3, mat4, struct, arrays

* 구문: continue, break, discard. 다른 제어문은 지원한다. (if, for, while, do while) 단, 컴파일 시에 반복문을 추론 할 수 있을 경우에만.

* 표현식 : % << >> | & ^ || && ^^ ~

* 내장 함수: ftransform, matrixCompMult, dfdx, dfdy, fwidth, noise1, noise2, noise3, noise4, refract

# 출처 

[Core Image Kernal Language](https://developer.apple.com/library/content/documentation/GraphicsImaging/Reference/CIKernelLangRef/Introduction/Introduction.html#//apple_ref/doc/uid/TP40004397-CH1-SW1)  
# 참조

* [Core Image Reference Collection](https://developer.apple.com/documentation/coreimage) 이미지 처리를 정의하기 위한 클래스와 필터 정의.

* [Core Image Programming Guide](https://developer.apple.com/library/content/documentation/GraphicsImaging/Conceptual/CoreImaging/ci_intro/ci_intro.html#//apple_ref/doc/uid/TP30001185) 사용자 정의 이미지 처리 필터를 만들고 이미지 유닛으로 패키지 하는 방법 수록. 또한, 몇가지 커널 루틴 예제도 제공한다.

* [OpenGL Shading Language](http://www.opengl.org/documentation/glsl/), glslang (OpenGL Shading Language) 레퍼런스 제공.