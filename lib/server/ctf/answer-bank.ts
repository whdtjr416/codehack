import "server-only";
export const extraCtfAnswers: Record<string, string> = {
  "ctf-base64": "flag{packet_note}",
  "ctf-hex": "flag{safe_copy}",
  "ctf-binary": "flag{byte}",
  "ctf-decimal": "flag{trace}",
  "ctf-url": "flag{audit_trail}",
  "ctf-html": "flag{alert}",
  "ctf-little-endian": "flag{12345678}",
  "ctf-big-endian": "flag{443}",
  "ctf-json-escape": "flag{log}",
  "ctf-base32": "flag{evidence}",
  "ctf-double-url": "flag{case_file}",
  "ctf-hex-base64": "flag{secure_lab}",
  "ctf-caesar": "flag{secure}",
  "ctf-atbash": "flag{audit}",
  "ctf-xor-byte": "flag{key_check}",
  "ctf-xor-key": "flag{57}",
  "ctf-modular": "flag{10}",
  "ctf-inverse": "flag{15}",
  "ctf-rsa-factor": "flag{53_61}",
  "ctf-rsa-private": "flag{103}",
  "ctf-dh-shared": "flag{13}",
  "ctf-hash-candidate": "flag{beta}",
  "ctf-reused-pad": "flag{V}",
  "ctf-affine": "flag{hello}",
  "ctf-rev-slice": "flag{resume}",
  "ctf-rev-add": "flag{42}",
  "ctf-rev-subtract": "flag{63}",
  "ctf-rev-xor-int": "flag{127}",
  "ctf-rev-shift": "flag{25}",
  "ctf-rev-and": "flag{205}",
  "ctf-rev-byte-wrap": "flag{14}",
  "ctf-rev-array": "flag{code}",
  "ctf-rev-index": "flag{scrt}",
  "ctf-rev-loop": "flag{55}",
  "ctf-rev-branch": "flag{11}",
  "ctf-rev-checksum": "flag{38}",
  "ctf-rev-rotate": "flag{3}",
  "ctf-rev-constraints": "flag{14_9}",
  "ctf-for-jpeg": "flag{jpeg}",
  "ctf-for-pdf": "flag{pdf}",
  "ctf-for-zip": "flag{zip}",
  "ctf-for-utc": "flag{00:30}",
  "ctf-for-order": "flag{C_B_A}",
  "ctf-for-gap": "flag{503}",
  "ctf-for-pid": "flag{20}",
  "ctf-for-denied": "flag{60}",
  "ctf-for-first-export": "flag{73}",
  "ctf-for-hash-match": "flag{copyA}",
  "ctf-for-offset": "flag{2}",
  "ctf-for-extension": "flag{pdf}",
  "ctf-for-session-log": "flag{alice}",
  "ctf-for-duration": "flag{105}",
  "ctf-net26": "flag{192.0.2.128}",
  "ctf-broadcast27": "flag{198.51.100.95}",
  "ctf-net28": "flag{203.0.113.96}",
  "ctf-hosts29": "flag{6}",
  "ctf-mask": "flag{255.255.240.0}",
  "ctf-tcp-flags": "flag{SYN_ACK}",
  "ctf-dns-type": "flag{AAAA}",
  "ctf-tcp-next": "flag{1120}",
  "ctf-route": "flag{C}",
  "ctf-firewall-order": "flag{allow}",
  "ctf-ip-version": "flag{4}",
  "ctf-ttl": "flag{61}",
  "ctf-sys-mode750": "flag{750}",
  "ctf-sys-mode600": "flag{600}",
  "ctf-sys-umask027": "flag{640}",
  "ctf-sys-dir-mask": "flag{700}",
  "ctf-sys-uid": "flag{1007}",
  "ctf-sys-effective": "flag{0}",
  "ctf-sys-octal-bit": "flag{644}",
  "ctf-sys-sticky": "flag{sticky}",
  "ctf-sys-suid": "flag{suid}",
  "ctf-sys-process-owner": "flag{1002}",
  "ctf-sys-cap-mask": "flag{1}",
  "ctf-sys-path-order": "flag{/opt/tools}",
  "ctf-web-idor": "flag{idor}",
  "ctf-web-html-sink": "flag{2}",
  "ctf-web-sql-line": "flag{2}",
  "ctf-web-httponly": "flag{HttpOnly}",
  "ctf-web-status-auth": "flag{401}",
  "ctf-web-status-forbidden": "flag{403}",
  "ctf-web-csrf": "flag{csrf}",
  "ctf-web-ssrf": "flag{ssrf}",
  "ctf-web-mass-assignment": "flag{role}",
  "ctf-web-cache-header": "flag{no-store}",
  "ctf-web-session-rotation": "flag{regeneration}",
  "ctf-web-redirect-host": "flag{redirect.example.test}",
};
export const extraCtfSolutions: Record<
  string,
  { answer: string; explanation: string[]; code?: string }
> = {
  "ctf-base64": {
    answer: "flag{packet_note}",
    explanation: ["Base64 디코딩 결과는 packet_note다. 패딩 =는 원문 문자가 아니다."],
  },
  "ctf-hex": {
    answer: "flag{safe_copy}",
    explanation: ["각 두 자리 hex를 바이트로 해석하면 safe_copy다."],
  },
  "ctf-binary": {
    answer: "flag{byte}",
    explanation: ["각 바이트의 십진수는 98,121,116,101이며 byte다."],
  },
  "ctf-decimal": {
    answer: "flag{trace}",
    explanation: ["chr(116),chr(114),chr(97),chr(99),chr(101)을 이어 붙인다."],
  },
  "ctf-url": {
    answer: "flag{audit_trail}",
    explanation: ["%5F는 ASCII 밑줄이다."],
  },
  "ctf-html": {
    answer: "flag{alert}",
    explanation: ["십진수 문자 참조 97,108,101,114,116은 alert다."],
  },
  "ctf-little-endian": {
    answer: "flag{12345678}",
    explanation: ["낮은 주소에 최하위 바이트 78이 있으므로 표시 순서는 12345678이다."],
  },
  "ctf-big-endian": {
    answer: "flag{443}",
    explanation: ["0x01BB=1×256+187=443이다."],
  },
  "ctf-json-escape": {
    answer: "flag{log}",
    explanation: ["Unicode 코드 포인트 U+006C,U+006F,U+0067은 log다."],
  },
  "ctf-base32": {
    answer: "flag{evidence}",
    explanation: ["Base32 디코딩 결과는 evidence다."],
  },
  "ctf-double-url": {
    answer: "flag{case_file}",
    explanation: ["첫 번째는 case%5Ffile, 두 번째는 case_file이다."],
  },
  "ctf-hex-base64": {
    answer: "flag{secure_lab}",
    explanation: ["hex를 바이트로 되돌리고 그 바이트를 Base64 디코딩한다."],
  },
  "ctf-caesar": {
    answer: "flag{secure}",
    explanation: ["각 문자를 3칸 뒤로 이동하면 secure다."],
  },
  "ctf-atbash": {
    answer: "flag{audit}",
    explanation: ["z→a,f→u,w→d,r→i,g→t이므로 audit다."],
  },
  "ctf-xor-byte": {
    answer: "flag{key_check}",
    explanation: ["각 바이트에 다시 0x35를 XOR하면 key_check다."],
  },
  "ctf-xor-key": {
    answer: "flag{57}",
    explanation: ["0x41 XOR 0x16 = 0x57이다."],
  },
  "ctf-modular": {
    answer: "flag{10}",
    explanation: ["125를 23으로 나누면 나머지가 10이다."],
  },
  "ctf-inverse": {
    answer: "flag{15}",
    explanation: ["7×15=105이고 105 mod26=1이다."],
  },
  "ctf-rsa-factor": {
    answer: "flag{53_61}",
    explanation: ["53×61=3233이다. 실제 RSA는 훨씬 큰 소수와 안전한 패딩을 사용한다."],
  },
  "ctf-rsa-private": {
    answer: "flag{103}",
    explanation: ["7×103=721=120×6+1이다."],
  },
  "ctf-dh-shared": {
    answer: "flag{13}",
    explanation: ["8^6 mod23=13이다. 공개 매개변수 검증과 인증은 별도로 필요하다."],
  },
  "ctf-hash-candidate": {
    answer: "flag{beta}",
    explanation: [
      "후보 각각의 SHA-256을 계산해 비교하면 beta가 일치한다. 줄바꿈은 포함하지 않는다.",
    ],
  },
  "ctf-reused-pad": {
    answer: "flag{V}",
    explanation: ["P2=C1 XOR C2 XOR P1=0x56, ASCII V다."],
  },
  "ctf-affine": {
    answer: "flag{hello}",
    explanation: ["5의 mod26 역원은 21이다. x=21(y-8) mod26로 복원하면 hello다."],
  },
  "ctf-rev-slice": {
    answer: "flag{resume}",
    explanation: ["비교 문자열 emuser를 뒤집으면 resume다."],
  },
  "ctf-rev-add": {
    answer: "flag{42}",
    explanation: ["59-17=42다."],
  },
  "ctf-rev-subtract": {
    answer: "flag{63}",
    explanation: ["100-37=63이다."],
  },
  "ctf-rev-xor-int": {
    answer: "flag{127}",
    explanation: ["0x55 XOR 0x2A =0x7F=127이다."],
  },
  "ctf-rev-shift": {
    answer: "flag{25}",
    explanation: ["왼쪽 3비트 이동은 음수가 아닌 이 범위에서 8배이므로 200/8=25다."],
  },
  "ctf-rev-and": {
    answer: "flag{205}",
    explanation: ["하위 8비트 0xCD=205만 남는다."],
  },
  "ctf-rev-byte-wrap": {
    answer: "flag{14}",
    explanation: ["270 mod256=14다."],
  },
  "ctf-rev-array": {
    answer: "flag{code}",
    explanation: ["99,111,100,101은 code다."],
  },
  "ctf-rev-index": {
    answer: "flag{scrt}",
    explanation: ["0,2,4,6 위치의 문자는 s,c,r,t다."],
  },
  "ctf-rev-loop": {
    answer: "flag{55}",
    explanation: ["1+4+9+16+25=55다."],
  },
  "ctf-rev-branch": {
    answer: "flag{11}",
    explanation: ["첫 분기에서4, 두 번째 분기에서11이 된다."],
  },
  "ctf-rev-checksum": {
    answer: "flag{38}",
    explanation: ["97+98+99=294이고 294 mod256=38이다."],
  },
  "ctf-rev-rotate": {
    answer: "flag{3}",
    explanation: ["왼쪽 이동 결과 하위 바이트2에 최상위 비트1을 오른쪽 끝으로 넣어3이다."],
  },
  "ctf-rev-constraints": {
    answer: "flag{14_9}",
    explanation: ["두 식을 더하면 2a=28이다. a=14,b=9다."],
  },
  "ctf-for-jpeg": {
    answer: "flag{jpeg}",
    explanation: ["JPEG의 시작 마커는 FF D8이며 뒤에 FF 마커가 따른다."],
  },
  "ctf-for-pdf": {
    answer: "flag{pdf}",
    explanation: ["%PDF-는 PDF 헤더다. 형식 식별이 파일의 안전성을 보장하지는 않는다."],
  },
  "ctf-for-zip": {
    answer: "flag{zip}",
    explanation: [
      "PK 로컬 파일 헤더는 ZIP 형식에서 사용된다. Office 문서 등도 ZIP 컨테이너를 사용한다.",
    ],
  },
  "ctf-for-utc": {
    answer: "flag{00:30}",
    explanation: ["UTC+9에서 9시간을 빼면 같은 날00:30이다."],
  },
  "ctf-for-order": {
    answer: "flag{C_B_A}",
    explanation: ["UTC 기준 C01:00,B01:02,A01:05다."],
  },
  "ctf-for-gap": {
    answer: "flag{503}",
    explanation: ["기대 연속 범위에서503이 없다. 누락 원인은 수집·생성 로그를 추가 확인한다."],
  },
  "ctf-for-pid": {
    answer: "flag{20}",
    explanation: ["worker의 ppid 필드가20이다. 최초 실행 주체와 직접 부모를 구분한다."],
  },
  "ctf-for-denied": {
    answer: "flag{60}",
    explanation: ["5건 중3건 실패로60%다."],
  },
  "ctf-for-first-export": {
    answer: "flag{73}",
    explanation: ["사용자와 행동 조건을 모두 만족하는73을 선택한다."],
  },
  "ctf-for-hash-match": {
    answer: "flag{copyA}",
    explanation: [
      "copyA의 값이 일치한다. 예시의 축약 해시만으로 실제 증거의 동일성을 확정하지 않는다.",
    ],
  },
  "ctf-for-offset": {
    answer: "flag{2}",
    explanation: ["41 42 43은 ABC이며 세 번째 바이트의 오프셋은2다."],
  },
  "ctf-for-extension": {
    answer: "flag{pdf}",
    explanation: ["헤더는 PDF다. 확장자는 쉽게 변경 가능하다."],
  },
  "ctf-for-session-log": {
    answer: "flag{alice}",
    explanation: ["sid=sA를 공유한 req1의 계정은alice다. 세션 탈취 여부는 추가 증거가 필요하다."],
  },
  "ctf-for-duration": {
    answer: "flag{105}",
    explanation: ["1분45초이므로105초다."],
  },
  "ctf-net26": {
    answer: "flag{192.0.2.128}",
    explanation: ["주소 범위는 192.0.2.128~192.0.2.191이며 총 64개다. 요구한 값은 192.0.2.128다."],
  },
  "ctf-broadcast27": {
    answer: "flag{198.51.100.95}",
    explanation: [
      "주소 범위는 198.51.100.64~198.51.100.95이며 총 32개다. 요구한 값은 198.51.100.95다.",
    ],
  },
  "ctf-net28": {
    answer: "flag{203.0.113.96}",
    explanation: [
      "주소 범위는 203.0.113.96~203.0.113.111이며 총 16개다. 요구한 값은 203.0.113.96다.",
    ],
  },
  "ctf-hosts29": {
    answer: "flag{6}",
    explanation: ["주소 범위는 192.0.2.16~192.0.2.23이며 총 8개다. 요구한 값은 6다."],
  },
  "ctf-mask": {
    answer: "flag{255.255.240.0}",
    explanation: ["앞20비트를1로 두면255.255.240.0이다."],
  },
  "ctf-tcp-flags": {
    answer: "flag{SYN_ACK}",
    explanation: ["0x12=18=2+16이다."],
  },
  "ctf-dns-type": {
    answer: "flag{AAAA}",
    explanation: ["QTYPE28은 IPv6 주소를 나타내는 AAAA다."],
  },
  "ctf-tcp-next": {
    answer: "flag{1120}",
    explanation: ["데이터120바이트를 소비하므로1000+120=1120이다."],
  },
  "ctf-route": {
    answer: "flag{C}",
    explanation: ["목적지는/26 C에 포함되고 이것이 가장 구체적인 경로다."],
  },
  "ctf-firewall-order": {
    answer: "flag{allow}",
    explanation: ["첫 규칙에 일치하므로 뒤 deny에 도달하지 않는다."],
  },
  "ctf-ip-version": {
    answer: "flag{4}",
    explanation: ["0x45의 상위 니블은4다. 하위5는 IPv4 헤더 길이와 관련된다."],
  },
  "ctf-ttl": {
    answer: "flag{61}",
    explanation: ["64-3=61이다. 초기 TTL만으로 OS를 단정하지 않는다."],
  },
  "ctf-sys-mode750": {
    answer: "flag{750}",
    explanation: ["rwx=7,r-x=5,---=0이다."],
  },
  "ctf-sys-mode600": {
    answer: "flag{600}",
    explanation: ["rw-=6,---=0,---=0이다."],
  },
  "ctf-sys-umask027": {
    answer: "flag{640}",
    explanation: ["666 & ~027 =640이다."],
  },
  "ctf-sys-dir-mask": {
    answer: "flag{700}",
    explanation: ["그룹과 기타 권한이 모두 마스킹된다."],
  },
  "ctf-sys-uid": {
    answer: "flag{1007}",
    explanation: ["세 번째 콜론 필드가 UID다."],
  },
  "ctf-sys-effective": {
    answer: "flag{0}",
    explanation: ["effective_uid가 권한 판정에 사용되는 핵심 ID 중 하나다."],
  },
  "ctf-sys-octal-bit": {
    answer: "flag{644}",
    explanation: ["그룹6에서 쓰기2를 제거하면4다."],
  },
  "ctf-sys-sticky": {
    answer: "flag{sticky}",
    explanation: ["sticky bit는 공유 디렉터리의 타인 파일 삭제를 제한한다."],
  },
  "ctf-sys-suid": {
    answer: "flag{suid}",
    explanation: ["특수 비트4는 SUID,2는 SGID,1은 sticky다."],
  },
  "ctf-sys-process-owner": {
    answer: "flag{1002}",
    explanation: ["명령이 worker인 행의 UID를 읽는다."],
  },
  "ctf-sys-cap-mask": {
    answer: "flag{1}",
    explanation: ["5의 비트101에서100을 제거하면001이다."],
  },
  "ctf-sys-path-order": {
    answer: "flag{/opt/tools}",
    explanation: ["PATH는 왼쪽부터 검색한다. 신뢰하지 않는 쓰기 가능한 경로를 앞에 두면 위험하다."],
  },
  "ctf-web-idor": {
    answer: "flag{idor}",
    explanation: ["타인 객체에 대한 인가 누락으로 IDOR에 해당한다."],
  },
  "ctf-web-html-sink": {
    answer: "flag{2}",
    explanation: ["innerHTML 대입이 HTML 파싱 지점이다. 텍스트 표시에는 textContent를 사용한다."],
  },
  "ctf-web-sql-line": {
    answer: "flag{2}",
    explanation: ["2번 줄에서 문자열 결합으로 코드·데이터 경계가 사라진다."],
  },
  "ctf-web-httponly": {
    answer: "flag{HttpOnly}",
    explanation: ["HttpOnly는 JavaScript의 쿠키 API 접근을 제한한다."],
  },
  "ctf-web-status-auth": {
    answer: "flag{401}",
    explanation: ["제공된 정책에서 미인증은401이다."],
  },
  "ctf-web-status-forbidden": {
    answer: "flag{403}",
    explanation: ["제공된 정책에서 로그인했지만 권한이 없으므로403이다."],
  },
  "ctf-web-csrf": {
    answer: "flag{csrf}",
    explanation: ["브라우저가 자동 전송하는 인증 쿠키를 악용한 위조 요청은 CSRF다."],
  },
  "ctf-web-ssrf": {
    answer: "flag{ssrf}",
    explanation: ["서버가 공격자 지정 목적지로 요청하는 SSRF 위험이다."],
  },
  "ctf-web-mass-assignment": {
    answer: "flag{role}",
    explanation: ["role은 보호 필드인데 전체 body 대입으로 변경될 수 있다."],
  },
  "ctf-web-cache-header": {
    answer: "flag{no-store}",
    explanation: [
      "no-store는 응답 저장 금지를 지시한다. private는 공유 캐시 제한으로 의미가 다르다.",
    ],
  },
  "ctf-web-session-rotation": {
    answer: "flag{regeneration}",
    explanation: ["인증 후 세션 ID 재발급으로 기존 식별자의 악용 위험을 줄인다."],
  },
  "ctf-web-redirect-host": {
    answer: "flag{redirect.example.test}",
    explanation: ["@ 앞은 userinfo 부분이다. 실제 호스트는 @ 뒤의 redirect.example.test다."],
  },
};
