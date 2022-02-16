#version - 0.0.92 ( 22/02/04 10:29 ) 김봉우

1. StrokeHeader fullscreen 에 따른 이미지 변경
2. Main bg 변경
3. worklist key 고정

#version - 0.0.91 ( 22/01/17 13:37 ) 김봉우

1. Sign in 클릭시 progress button 적용

#version - 0.0.90 ( 22/01/13 20:58 ) 김봉우

1. Product manual PDF -> Instruction for Use 로 문구변경

#version - 0.0.89 ( 22/01/11 17:22 ) 김봉우

1. cacheCloud Selector 개수 제한 추가

#version - 0.0.88 ( 22/01/07 15:40 ) 김지훈

1. license status 따라 상태값 변경

#version - 0.0.87 ( 22/01/06 15:03 ) 김봉우

1. Setting 다이얼로그 수정
2. dialog css 수정 및 caution svg 추가
3. license limit count 근접 기준 변경
4. footer 변경

#version - 0.0.86 ( 22/01/04 10:58 ) 김봉우

1. LicenseToast flow 변경에 따른 수정
2. footer, strokeFooter 라이센스 Text color 변경
3. passwordChange 문구 수정
4. myAccount 다이얼로그 유지 수정

#version - 0.0.85 ( 21/12/31 10:08 ) 김봉우

1. dropdown textOverflow(...) 처리
2. 비밀번호 정규식 추가
   1. 숫자, 소문자, 대문자, 특수문자, 10~20자 확인
3. 임시 비밀번호, 내정보 비밀번호 변경 수정
   1. 비밀번호 정규식에 따른 에러메시지 적용
4. npm install he @types/he
   1. 특수문자 언어 디코드 라이브러리 추가
5. LockMode 수정
   1. 메시지 수정, errMsg 노출 막기
6. Worklist hasPermission 추가, 모두 선택 수정
   1. Permission 여부에 따라 모두 체크 기능 수정
7. dialog에 있는 X자 표시 제거
8. pdf 다운로드 버튼 및 기능 추가(진행중)
   1. API_URL support 및 다운로드 기능
9. licenseToast 변경
   1. 라이선스 유효기간 - 라이선스 횟수 - 유저의 유효기간 체크
   2. 멀티로 띄우기
10. Footer hasUpload 상태 추가
    1. 업로드 중일때 확인
11. pdf 다운로드 추가

#version - 0.0.84 ( 21/12/23 14:06) 김지훈

1. bg, logo 추가
2. 라이센스 validation 추가
3. responseData 코멘트 추가

#version - 0.0.83 (21/12/21 10:45) 김봉우

1. errorCode 추가
2. ResponseData mutate 정리
3. DICOM Tag 순서 정리

#version - 0.0.82 ( 21/12/20 13:00) 김지훈

1. plus, minus icon 추가
2. licenseToast css bug 수정 및 내용 추가
3. table filter시 색변경 bug 수정

#version - 0.0.81 ( 21/12/15 10:51 ) 김봉우

1. Dicom Tag 추가

#version - 0.0.80 ( 21/12/10 17:03) 김봉우

1. cornerstone, vtk, itk 제거
2. API_URL GZIP 관련 주소 추가

#version - 0.0.79 ( 21/12/09 09:48) 김지훈

1. 재 배포 v0.0.79

#version - 0.0.78 ( 21/12/08 15:24) 김지훈

1. worklist column width 조절 기능 버그 fix - dist 안지움

#version - 0.0.77 ( 21/12/08 14:14) 김지훈

1. 비밀번호 필수 변경후 flag 변경 기능 수정

#version - 0.0.76 ( 21/12/02 10:29 ) 김지훈

1. importing 상태 store 추가
2. login background css 수정
3. sign out message 수정
4. setting 변경 confirm 수정
5. strokeheader main 이동 추가
6. worklist 권한별 삭제 버튼/체크박스 렌더링 수정

#version - 0.0.75 ( 21/11/30 17:02 ) 김지훈

1. PeriodInput 기간 설정
2. dropmsgimage (2d 추가)
3. changepassword 임시비밀번호 수정
4. myaccout sign out 수정
5. setting confirm 수정

#version - 0.0.74 ( 21/11/30 09:29 ) 김지훈

1. table column width (마우스)조절 기능 추가
2. Service Worker 관리 로직 변경
3. Table Filter tr -> div로 변경
4. Operator My Data 제거

#version - 0.0.73 ( 21/11/25 14:12 ) 김봉우

1. fileUpload blobToFile 로직 추가
2. dateFormat getDateTime 로직 수정
3. DropMsgImage 수정

#version - 0.0.72 ( 21/11/25 08:25 ) 김지훈

1. font 삭제

#version - 0.0.70, 0.0.71 ( 21/11/24 17:20 ) 김지훈

1. font-Noto Sans KR 추가

#version - 0.0.69 ( 21/11/24 14:30 ) 김지훈

1. svg 추가
2. DropMsgImage Component 추가

#version - 0.0.68 ( 21/11/23 15:15 ) 김봉우

1. MyAccount css 수정
2. footer, strokefooter 언어팩 삭제
3. MyAccount position 제거
4. Company 초기값 설정

#version - 0.0.67 ( 21/11/18 09:56 ) 김지훈

1. strokelogin simple captcha 수정
2. strokebasedialog close 수정
3. strokefooter border 및 배경색 수정

#version - 0.0.66 ( 21/11/17 17:09 ) 김대원

1. Admin Component 업데이트

#version - 0.0.65 ( 21/11/17 16:41 ) 김봉우

1. BaseDialog 수정

#version - 0.0.64 ( 21/11/17 11:40 ) 김봉우

1. LicenseToast 추가

#version - 0.0.63 ( 21/11/17 10:37 ) 김지훈

1. dropdownmenu bug fix

#version - 0.0.62 ( 21/11/16 14:35 ) 김지훈

1. svg icon 추가
2. stroke dialog 'none' type 추가

#version - 0.0.61 ( 21/11/16 10:27 ) 김지훈

1. dataimport image(SVG) 추가
2. dropdownmenu fix

#version - 0.0.60 ( 21/11/15 16:47 ) 김봉우

1. Stroke(infomation, setting, myAccount) 디자인 변경
2. ErrorCode 언어팩 추가 적용
3. Worklist FailCode 추가에 따른 Worklist row item 추가변경
4. Package.json 수정(svg 이미지 이동 적용)

#version - 0.0.59 ( 21/11/15 09:28 ) 김지훈

1. DropDownMenu 검색기능 돋보기 추가

#version - 0.0.58 ( 21/11/12 17:50 ) 김성진

1. simple text captcha 컴포넌트 추가
2. 스트로크 계열 로그인 화면에 simple text captcha 표시 및 로직 처리
3. mpdia, 스트로크 계열 제품 captcha 로직 분리

#version - 0.0.57 ( 21/11/12 16:38 ) 김지훈

1. 0.0.56 publish 이상으로 다시 publish

#version - 0.0.56 ( 21/11/12 16:18 ) 김지훈

1. dropdownMenu search 기능 추가

#version - 0.0.55 ( 21/11/12 14:36 )

1. API_URL WORKLIST_DUPLICATE 추가
2. DropdownImage border 수정
3. API_URL WORKLIST GET, POST 관련 URL 수정
4. PeriodInput Today, 3D, 1W, 1M 관련 로직 수정

#version - 0.0.54 ( 21/11/11 14:42 )

1. 로그인 input 붉은색(err box) bug fix
2. 임시비밀번호 alert msg 변경
3. stroke footer css 수정
4. 라이센스 dto 변경 및 화면 적용
5. 회사 정보 API 호출 적용
6. my account/stroke myaccount err msg 추가 및 수정

#version - 0.0.53 ( 21/11/10 17:39 )

1. passwordChange modal 사용법 변경
2. modal store 추가
3. LocalStorage User Session expiry Date - 8시간 고정 (추후 duration time 으로 변경할 가능 있음)
