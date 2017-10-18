---
author: kimjj81
comments: true
date: 2017-07-30 01:06:46+00:00
layout: post
link: https://windroamer.wordpress.com/2017/07/30/wwdc-2017-debugging-with-xcode-9-%ec%9a%94%ec%95%bd/
slug: wwdc-2017-debugging-with-xcode-9-%ec%9a%94%ec%95%bd
title: WWDC 2017 - Debugging with Xcode 9 요약
wordpress_id: 153
categories:
- IOS
tags:
- DEBUG
- WWDC-2017
- Xcode
---

출처 :https://developer.apple.com/videos/play/wwdc2017/404/

원격 디버깅, SprikteKit, SceneKit 디버깅에 대해 설명한 세션.


# 1. 원격 디버깅


드디어 원격 디버깅이 가능해졌다. 카메라, AR 개발, 노트북 AC 전원이 아닐 때, 애플 TV 개발 할 때, 그냥 USB 꼽기 싫을 때, TV OS 앱을 개발 할 때 아주 유용하다.














<blockquote>**요구사항 **

iPhone, iPad, or iPod Touch running iOS 11
Apple TV running tvOS 11
macOS 10.12.4+
XCode 9</blockquote>


원격 디버깅이라고 안되는건 없다고 보면 되겠다.


#  2. 준비하기




설정은 간단하다. 아래와  같이 디바이스 관리 창을 열고,




XCode - Windows - Devices and simulators (단축키 Shift + Command + 2)
















"1" 번을 누르면 "2" 처럼 지구본 모양이 생긴다.
















![Devices_및_WMCamera_m_및_PageAlignedArray_swift.png](https://windroamer.files.wordpress.com/2017/07/devices_ebb08f_wmcamera_m_ebb08f_pagealignedarray_swift.png)



















Apple TV 는 본인이 없어서 첨부된 키노트 이미지를 대신한다.




연결하면 이렇게 인증 코드를 한번 넣게 되는 듯.




USB, Wireless, Wired Network 모두 지원한다고.







![https___devstreaming-cdn_apple_com_videos_wwdc_2017_404z7uj3xincdb0_404_404_debugging_with_xcode_9_pdf.png](https://windroamer.files.wordpress.com/2017/07/https___devstreaming-cdn_apple_com_videos_wwdc_2017_404z7uj3xincdb0_404_404_debugging_with_xcode_9_pdf.png)










보통은 다른 설정은 필요 없지만 특수한 경우 IP를 직접 입력해서 사용 할 수도 있다고 한다.




아이폰이 엄청 많은 환경에서나 사용하려나?







여튼, 원격으로 연결된 디바이스는 아래 그림처럼 XCode 실행 타겟에 지구본 아이콘이 표시 된다.




![WMCamera_m_및_Devices.png](https://windroamer.files.wordpress.com/2017/07/wmcamera_m_ebb08f_devices.png)







# 3. 디버거 향상




특정 조건을 만족 할 때 브레이크를 걸어주는 옵션이 디버깅 할 때 종종 쓰이는데 이 때 특정 조건을 만났을 때 수행하는 액션쪽에 변화가 생겼다. 밑의 그림처럼 코드 자동 완성 기능이 들어갔다.




또한 옵션이 지정된 브레이크 포인트는 빨간색 네모의 브레이크 포인트 아이콘처럼 뾰족한 부분이 흰색으로 표시된다.





# ![extract-35.jpg](https://windroamer.files.wordpress.com/2017/07/extract-35.jpg)




# 4. UI 계층도


원래부터 있던 기능이긴 한데 디버깅 하다가 아래 화살표로 표시한 버튼을 누르면 3D로 뷰 계층을 보여주고 각종 정보를 볼 수 있다.


# ![extract-38.jpg](https://windroamer.files.wordpress.com/2017/07/extract-381.jpg)




## SpriteKit


SpriteKit 은 2D 에 쓰이는데, 이젠 여기도 잘 된다고. 멋진 UI 만들고 싶으면 SpriteKit 써보라는 얘기도.

![extract-41.jpg](https://windroamer.files.wordpress.com/2017/07/extract-41.jpg)


## SceneKit


SceneKit 은 3D 용인데 물론 여기에도 잘 된다는 소개.

![extract-46.jpg](https://windroamer.files.wordpress.com/2017/07/extract-46.jpg)

이 세션은 기능 소개 위주 였고, 심각하게 고민해서 볼 부분은 없었던 것 같다.


# 5. One more 자랑


SceneKit 을 이용해서 디버그 시각화 툴도 만들었다고 소개하는 부분

Debug Navigation 을 고 아래 버튼을 누르면 여러 옵션을 볼 수 있다.

![extract-52.jpg](https://windroamer.files.wordpress.com/2017/07/extract-52.jpg)



![Item-0_및_Item-1_및_Item-0_및_Item-0.png](https://windroamer.files.wordpress.com/2017/07/item-0_ebb08f_item-1_ebb08f_item-0_ebb08f_item-0.png)

메모리 시각화 한 부분은 참 좋은데 얼마나 잘 써먹으려면 여러 전략이 필요 할 것 같다.
