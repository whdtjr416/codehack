export const challenges = [
 {id:"encoding",title:"겹쳐진 메시지",category:"기초",points:100,level:"입문",time:"15분",summary:"두 겹의 인코딩 뒤에 숨은 첫 번째 flag를 찾아보세요.",body:"아래 문자열은 flag를 Base64로 바꾼 다음 hex로 표현한 것입니다. 역순으로 변환하세요.\n\n5a6d78685a33746d61584a7a6446397a6447567758324e305a6e303d",hints:["hex 두 글자는 한 바이트입니다.","Python의 bytes.fromhex와 base64.b64decode를 순서대로 사용하세요."],defense:"인코딩은 비밀을 보호할 수 있을까요? 인코딩과 암호화의 차이를 설명해보세요."},
 {id:"headers",title:"응답 속 작은 단서",category:"웹 보안",points:100,level:"입문",time:"10분",summary:"HTTP 응답을 읽고 서버가 노출한 정보를 찾아보세요.",body:"교육용 서버에서 캡처한 응답입니다. 헤더에 담긴 flag를 찾으세요.\n\nHTTP/1.1 200 OK\nContent-Type: text/html\nServer: training-server\nX-Training-Flag: flag{read_the_headers}\n\n<h1>Hello, analyst.</h1>",hints:["헤더는 빈 줄 이전에 있습니다.","X-Training-Flag 값을 확인하세요."],defense:"민감한 정보가 응답 헤더에 담기면 누가 볼 수 있나요? 노출을 줄이는 방법을 기록하세요."},
 {id:"ownership",title:"문서의 진짜 주인",category:"웹 보안",points:150,level:"입문",time:"20분",summary:"로그인만 확인하는 문서 서비스의 권한 검사를 분석하세요.",body:"다음은 가상 서비스의 코드입니다. alice가 bob의 문서 2를 요청해도 내용이 반환됩니다. 빈칸에 필요한 검사 종류를 영문으로 쓰세요.\n\nif user.is_logged_in:\n    return documents[document_id].content\n\n문서별 접근 권한을 확인하는 개념은 무엇일까요? 정답 형식: flag{영문개념}",hints:["인증(authentication)과 인가를 구분해보세요.","인가의 영문은 authorization입니다."],defense:"소유자 확인을 추가한 의사 코드를 작성하고, 타인 차단·소유자 허용·없는 문서 처리를 검증하세요. 저장소의 접근 제어 실습과 연결됩니다."},
 {id:"logs",title:"03:12의 접근 기록",category:"포렌식",points:150,level:"입문",time:"15분",summary:"허용된 접근 기록에서 다른 사용자의 문서를 읽은 계정을 찾아보세요.",body:"아래 로그에서 타인 소유 문서를 읽는 데 성공한 계정은 누구일까요? 차단된 시도와 구분하세요. 시간은 UTC입니다.\n\n03:10 user=alice doc=1 owner=alice status=200\n03:11 user=carol doc=2 owner=bob status=403\n03:12 user=alice doc=2 owner=bob status=200\n03:13 user=bob doc=2 owner=bob status=200\n\n정답 형식: flag{계정이름}",hints:["user와 owner가 다른 기록을 고르세요.","403은 거부, 이 로그의 200은 문서 반환 성공입니다."],defense:"발생 사실과 공격 의도에 대한 추정을 구분하고, 타임라인과 추가로 필요한 증거를 작성하세요."},
 {id:"xor",title:"한 바이트의 비밀",category:"암호",points:200,level:"초급",time:"25분",summary:"알려진 키로 XOR 변환된 바이트를 복원하세요.",body:"모든 바이트에 같은 키 0x23으로 XOR 연산을 적용했습니다. 다시 XOR하면 원문을 얻을 수 있습니다.\n\n454f4244585b4c517c4a507c5146554651504a414f465e\n\n정답은 flag{...} 형식입니다.",hints:["hex 문자열을 bytes.fromhex로 바꾸세요.","각 바이트 b에 b ^ 0x23을 적용한 뒤 문자열로 변환하세요."],defense:"단일 바이트 XOR가 실무 암호화에 적합하지 않은 이유와 검증된 암호 라이브러리를 사용하는 이유를 설명하세요."},
 {id:"reverse",title:"검증 함수를 거꾸로",category:"리버싱",points:200,level:"초급",time:"20분",summary:"간단한 검증 코드의 분기 조건을 거슬러 올라가세요.",body:"다음 교육용 코드가 True를 반환하는 candidate를 찾아 flag로 제출하세요.\n\ndef verify(candidate):\n    return candidate[::-1] == 'eruces'\n\n정답 형식: flag{candidate}",hints:["[::-1]은 문자열 순서를 뒤집습니다.","비교 대상 문자열을 뒤집어 candidate를 구하세요."],defense:"클라이언트에 정답 검증 코드를 두면 어떤 정보가 드러날까요? 서버 검증의 역할과 한계를 기록하세요."}
];
export const roadmap = [
 ["기초 도구와 첫 flag","Python·터미널·바이트","인코딩 문제 해결 + 변환 코드 재작성"],
 ["Linux와 네트워크","권한·프로세스·HTTP","최소 권한 설정 전후 기록"],
 ["인증과 접근 제어","인증·인가·소유권","타인 차단 + 소유자 허용 검증"],
 ["웹 취약점과 수정","입력 검증·SQL·XSS","취약점 수정 보고서 1편"],
 ["파일과 디지털 증거","시그니처·메타데이터·해시","분석 명령 + 원본 해시 기록"],
 ["로그에서 사건 찾기","타임라인·탐지·증거","사고 분석 보고서 1편"],
 ["암호와 비밀 관리","XOR·암호화·해시","암호 문제 풀이 + 방어 설명"],
 ["코드 읽기와 리버싱","분기·입력 검증","의사 코드 + 코드 리뷰 2건"],
 ["시스템과 메모리","메모리 오류·보호 기법","원인 수정 + 재검증 기록"],
 ["나의 주력 분야","주력 1개·보조 1개 선택","CTF 3문제 + 실무 산출물"],
 ["모의 대회","원할 때 도전·문제 배분","처음 보는 문제 풀이 + 복기"],
 ["포트폴리오 관리","재현·보고·회고","풀이와 보안·사고 보고서 축적"]
];
