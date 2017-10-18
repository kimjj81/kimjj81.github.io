---
author: kimjj81
comments: true
date: 2017-08-09 02:17:03+00:00
layout: post
link: https://windroamer.wordpress.com/2017/08/09/xcode-%ed%8c%8c%ec%9d%bc-%eb%82%b4-%ea%b5%ac%eb%b6%84%ec%9d%84-%ec%9c%84%ed%95%9c-%ec%a3%bc%ec%84%9d-%eb%8b%ac%ea%b8%b0/
slug: xcode-%ed%8c%8c%ec%9d%bc-%eb%82%b4-%ea%b5%ac%eb%b6%84%ec%9d%84-%ec%9c%84%ed%95%9c-%ec%a3%bc%ec%84%9d-%eb%8b%ac%ea%b8%b0
title: XCode - 파일 내 구분을 위한 주석 달기
wordpress_id: 922
categories:
- IOS
tags:
- Annotation
- Comment
- Objective-C
- Swift
- Xcode
---

Objective-C 에서 XCode 의 메소드 탐색 기능을 활용 할 때 #pragma mark 를 사용했다.


<blockquote>#pragma mark - Start</blockquote>


라고 했을 때 아래 처럼 나온다.

![AppDelegate_m_—_Edited.jpg](https://windroamer.files.wordpress.com/2017/08/appdelegate_m_e28094_edited.jpg)

Swift 에서는 보통 2가지 방식을 이용하는 것 같다. extension 을 쓰는 것과, 주석을 이용하는 것이다.


## 1. Extension


Extension 을 이용해서 구분을 하는 방식이 있다.

[code language="swift"]


class PTSummaryViewController: UIViewController{
..........
}





extension PTSummaryViewController : UITableViewDataSource{
.........
}


[/code]

![Item-0_및_Item-1_및_Item-0.jpg](https://windroamer.files.wordpress.com/2017/08/item-0_e18486e185b5e186be_item-1_e18486e185b5e186be_item-0.jpg)

이렇게 하면 위와 같이 Extension 을 기준으로 탐색을 할 수 있다. 그러나 그것에 관한 설명이 없기 때문에 #pragma mark 처럼 강력 하지는 않다.


## 2. 주석 이용하기


3가지 주석을 이용 할 수 있다. XCode 버전 몇 부터 지원했던건지 잘 모르겠지만, 여튼 Objective-C 사용 할 적에는 #pragma mark 를 썼으므로 알 필요가 없었고, swift 는 extension 을 많이 이용해서 잘 모르는 사람도 있는 것 같다. 중요한 점은 대문자로 써야 한다는 것과 콜론을 꼭 붙여 써야 한다는 점이다.



	
  1. MARK:          설명

	
  2. FIXME:         고쳐야 할 것

	
  3. TODO:           할 일

	
  4. -                      구분선 추가


예제

![PTSummaryViewController_swift.jpg](https://windroamer.files.wordpress.com/2017/08/ptsummaryviewcontroller_swift1.jpg)

밑줄 친 데로 하면 아래와 같이 나온다. MARK, TODO, FIXME 마다 아이콘이 다름을 볼 수 있다. 예제에서는 모두 - 를 추가하여 구분선이 들어가있고, - 를 빼면 구분선이 없어진다.

![PTSummaryViewController_swift.jpg](https://windroamer.files.wordpress.com/2017/08/ptsummaryviewcontroller_swift.jpg)

Extension 방식보다는 XCode 주석을 통해 구분하는 방식이 설명을 적을 수 있어서 더 나아보인다.
