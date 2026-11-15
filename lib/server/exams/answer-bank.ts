import "server-only";
export const extraQuizKeys: Record<string, { answer: number; explanation: string }> = {
  "q-sys-04": {
    answer: 0,
    explanation: "디렉터리의 x는 탐색 권한이다. 목록 읽기 r, 항목 생성·삭제 w와 구분한다.",
  },
  "q-sys-05": {
    answer: 2,
    explanation:
      "umask는 허용 비트를 제거하는 마스크다. 666 & ~027 = 640이며 단순 산술 뺄셈으로 일반화하지 않는다.",
  },
  "q-sys-06": {
    answer: 0,
    explanation:
      "SUID는 실행 파일의 유효 UID에 영향을 준다. 과도한 SUID 프로그램은 권한 상승 위험을 키운다.",
  },
  "q-sys-07": {
    answer: 2,
    explanation:
      "sticky bit는 공유 디렉터리에서 파일 소유자·디렉터리 소유자·특권 사용자 외의 삭제·이름 변경을 제한한다.",
  },
  "q-sys-08": {
    answer: 0,
    explanation: "ASLR은 메모리 배치를 무작위화한다. 메모리 오류 자체를 제거하는 대책은 아니다.",
  },
  "q-sys-09": {
    answer: 2,
    explanation:
      "실행 불가 메모리 정책은 데이터 영역에서 코드가 실행되는 것을 제한한다. 우회 가능성과 원인 수정은 별도로 고려한다.",
  },
  "q-sys-10": {
    answer: 0,
    explanation:
      "스택 카나리는 버퍼와 제어 정보 사이 보호 값의 손상을 검사한다. 모든 메모리 오류를 탐지하지는 않는다.",
  },
  "q-sys-11": {
    answer: 2,
    explanation:
      "최소 권한은 서비스 침해 시 영향을 제한한다. 필요한 권한을 목록화하고 정상 동작을 재검증한다.",
  },
  "q-sys-12": {
    answer: 0,
    explanation:
      "패치는 테스트와 복구 계획을 포함한 변경 관리로 수행해야 가용성 위험을 줄일 수 있다.",
  },
  "q-sys-13": {
    answer: 2,
    explanation:
      "RAM은 전원 종료와 실행 상태 변화로 증거가 사라질 수 있어 수집 순서에서 휘발성을 고려한다.",
  },
  "q-sys-14": {
    answer: 0,
    explanation:
      "시각 정규화와 원래 시간 보존이 필요하다. 장비 간 시계 차이는 사건 순서를 왜곡할 수 있다.",
  },
  "q-sys-15": {
    answer: 2,
    explanation:
      "중앙 수집은 로컬 로그 삭제에 대비한다. 전송 보호·접근 통제·수집 누락 점검도 필요하다.",
  },
  "q-sys-16": {
    answer: 0,
    explanation:
      "사용자별 salt는 동일 비밀번호 해시의 반복을 줄인다. 계산 비용을 조절하는 전용 알고리즘을 사용한다.",
  },
  "q-sys-17": {
    answer: 2,
    explanation:
      "디스크 암호화는 분실 매체의 오프라인 열람 방어에 유용하다. 실행 중 접근 통제와는 역할이 다르다.",
  },
  "q-sys-18": {
    answer: 0,
    explanation:
      "컨테이너는 커널을 공유하므로 과도한 capability와 호스트 자원 마운트가 격리 위험을 키운다.",
  },
  "q-sys-19": {
    answer: 2,
    explanation:
      "개인 식별 가능한 계정과 감사 로그는 누가 어떤 특권 작업을 했는지 추적하는 근거가 된다.",
  },
  "q-sys-20": {
    answer: 0,
    explanation: "정기 복원 시험은 백업 파일의 사용 가능성과 복구 시간·데이터 범위를 검증한다.",
  },
  "q-net-04": {
    answer: 1,
    explanation:
      "UDP는 데이터그램 전달을 제공한다. 필요한 신뢰성은 상위 애플리케이션에서 구현할 수 있다.",
  },
  "q-net-05": {
    answer: 3,
    explanation: "/26의 마지막 옥텟 블록 크기는 64다. 130은 128~191 구간에 속한다.",
  },
  "q-net-06": {
    answer: 1,
    explanation:
      "호스트 비트는 5개로 주소 32개다. 일반적인 서브넷에서는 네트워크와 브로드캐스트 주소를 제외해 30개다.",
  },
  "q-net-07": {
    answer: 3,
    explanation:
      "ARP는 같은 링크에서 IP에 대응하는 MAC 주소를 구한다. 원격 목적지는 보통 게이트웨이의 MAC을 사용한다.",
  },
  "q-net-08": {
    answer: 1,
    explanation: "MX 레코드는 도메인의 메일 교환 서버를 지정한다. A·AAAA·TXT와 목적이 다르다.",
  },
  "q-net-09": {
    answer: 3,
    explanation:
      "Stateful 방화벽은 연결 상태 테이블을 유지해 허용된 흐름의 반환 트래픽 등을 판단한다.",
  },
  "q-net-10": {
    answer: 1,
    explanation: "탐지와 차단은 다른 역할이다. 인라인 차단은 오탐 시 정상 통신에도 영향을 준다.",
  },
  "q-net-11": {
    answer: 3,
    explanation:
      "반개방 연결을 많이 만들면 연결 대기 자원이 소모될 수 있다. SYN cookie 등 완화 기법을 검토한다.",
  },
  "q-net-12": {
    answer: 1,
    explanation:
      "DNSSEC는 서명 검증으로 DNS 데이터 위변조를 확인한다. 질의 자체의 암호화와 구분한다.",
  },
  "q-net-13": {
    answer: 3,
    explanation: "VPN 인증이 끝나도 애플리케이션은 자원별 권한을 별도로 검사해야 한다.",
  },
  "q-net-14": {
    answer: 1,
    explanation: "NAT는 주소와 경우에 따라 포트를 변환한다. 방화벽 정책과 보안 기능은 별개다.",
  },
  "q-net-15": {
    answer: 3,
    explanation: "VLAN 분리만으로 라우팅을 통한 통신이 차단되지는 않는다. 경계 정책을 검증한다.",
  },
  "q-net-16": {
    answer: 1,
    explanation: "서버 인증서가 요청 호스트에 적합하고 신뢰 가능한 체인으로 검증되는지 확인한다.",
  },
  "q-net-17": {
    answer: 3,
    explanation:
      "HSTS는 HTTPS 강제 정책이다. 최초 방문과 사전 탑재 여부 같은 적용 범위도 고려한다.",
  },
  "q-net-18": {
    answer: 1,
    explanation:
      "응답 부재는 단서일 뿐이다. 필터링·손실·호스트 상태를 구분하는 추가 증거가 필요하다.",
  },
  "q-net-19": {
    answer: 3,
    explanation: "수집 단계에서 빠진 패킷은 표시 필터를 바꿔 복원할 수 없다.",
  },
  "q-net-20": {
    answer: 1,
    explanation: "신원·장치·자원·위험 등의 맥락으로 필요한 접근을 검증하고 최소 권한을 적용한다.",
  },
  "q-app-04": {
    answer: 2,
    explanation:
      "CSRF는 피해자 브라우저의 인증 상태를 악용한다. 토큰·Origin 검증·SameSite 등을 요청 특성에 맞게 조합한다.",
  },
  "q-app-05": {
    answer: 0,
    explanation:
      "객체 ID를 알고 있다는 사실은 권한의 근거가 아니다. 서버에서 요청 주체와 자원 관계를 검사한다.",
  },
  "q-app-06": {
    answer: 2,
    explanation:
      "인증 전 식별자가 인증 후에도 유지되면 공격자가 사전에 정한 세션을 악용할 수 있다.",
  },
  "q-app-07": {
    answer: 0,
    explanation: "Secure는 전송 조건, HttpOnly는 스크립트 접근 제한과 관련된다.",
  },
  "q-app-08": {
    answer: 2,
    explanation:
      "CORS는 브라우저의 출처 간 읽기 정책이다. 비브라우저 클라이언트의 요청을 인증하는 수단이 아니다.",
  },
  "q-app-09": {
    answer: 0,
    explanation:
      "서버가 URL을 요청할 때 최종 목적지와 재해석된 주소, 프로토콜, 네트워크 경계를 검증한다.",
  },
  "q-app-10": {
    answer: 2,
    explanation:
      "문자열 접두사만으로 경계가 보장되지 않을 수 있다. 경로 정규화 후 실제 루트 포함 관계를 검증한다.",
  },
  "q-app-11": {
    answer: 0,
    explanation:
      "업로드는 여러 검증과 저장·서빙 정책을 조합해야 한다. 한 가지 단서만으로 안전성을 보장하지 않는다.",
  },
  "q-app-12": {
    answer: 2,
    explanation: "데이터 파싱과 코드·객체 생성 경계를 분리하고 허용된 스키마를 검증한다.",
  },
  "q-app-13": {
    answer: 0,
    explanation: "재설정 토큰은 계정 통제 권한을 부여하므로 저장·전송·소비 과정도 보호해야 한다.",
  },
  "q-app-14": {
    answer: 2,
    explanation: "수정 가능한 필드를 명시적으로 선택하고 보호 필드의 변경 권한을 별도로 검증한다.",
  },
  "q-app-15": {
    answer: 0,
    explanation: "UI 제한은 사용 편의 기능이며 서버 권한 검사의 대체가 아니다.",
  },
  "q-app-16": {
    answer: 2,
    explanation:
      "CSP는 리소스 로드·스크립트 실행 정책을 제한한다. 컨텍스트에 맞는 출력 처리와 함께 사용한다.",
  },
  "q-app-17": {
    answer: 0,
    explanation:
      "공격 억제와 정상 사용자 가용성을 함께 고려해야 하며 분산 출발지에도 대응해야 한다.",
  },
  "q-app-18": {
    answer: 2,
    explanation: "값 바인딩과 SQL 식별자 처리는 다르다. 제한된 허용 목록으로 구조를 선택한다.",
  },
  "q-app-19": {
    answer: 0,
    explanation:
      "개인 응답은 캐시 키·private/no-store 등 요구에 맞는 정책과 실제 중간 캐시 동작을 확인한다.",
  },
  "q-app-20": {
    answer: 2,
    explanation:
      "공격자 목적지로의 이동은 피싱 흐름 등에 악용될 수 있으므로 목적지 경계를 검증한다.",
  },
  "q-gen-04": {
    answer: 3,
    explanation:
      "기밀성은 정보의 비인가 공개를 방지하는 목표다. 무결성은 비인가 변경 방지와 관련된다.",
  },
  "q-gen-05": {
    answer: 1,
    explanation:
      "무결성은 정확성과 변경 통제를 다룬다. 암호화만으로 인증된 무결성이 항상 제공되는 것은 아니다.",
  },
  "q-gen-06": {
    answer: 3,
    explanation: "대칭키 방식은 효율적이지만 통신 당사자 사이 안전한 키 분배·보관이 필요하다.",
  },
  "q-gen-07": {
    answer: 1,
    explanation:
      "해시 출력 공간은 유한하므로 충돌은 존재한다. 안전한 해시는 실용적으로 충돌과 역상을 찾기 어렵게 설계한다.",
  },
  "q-gen-08": {
    answer: 3,
    explanation:
      "충돌 공격은 공격자가 두 입력을 모두 선택할 수 있다는 점에서 주어진 입력의 제2역상 공격과 구분된다.",
  },
  "q-gen-09": {
    answer: 1,
    explanation:
      "HMAC은 비밀키와 해시 함수를 사용해 메시지 무결성과 키 보유자에 의한 인증을 제공한다.",
  },
  "q-gen-10": {
    answer: 3,
    explanation:
      "AEAD는 암호문 보호와 인증 태그 검증을 결합한다. nonce 재사용 등 사용 조건을 지켜야 한다.",
  },
  "q-gen-11": {
    answer: 1,
    explanation:
      "nonce의 고유성은 암호 모드의 보안 가정이다. 임의 값 생성만으로 중복 관리가 충분한지 검토한다.",
  },
  "q-gen-12": {
    answer: 3,
    explanation: "PFS는 일회성 키 교환 등으로 과거 세션과 장기 인증 키의 의존성을 줄인다.",
  },
  "q-gen-13": {
    answer: 1,
    explanation:
      "인증서는 발급자 서명으로 공개키와 주체의 연결을 증명하며 체인·폐기·기간을 검증한다.",
  },
  "q-gen-14": {
    answer: 3,
    explanation:
      "키 교체와 키 폐기는 다르다. 과거 데이터 접근, 백업, 보존 요건과 유출 범위를 함께 고려한다.",
  },
  "q-gen-15": {
    answer: 1,
    explanation: "위험은 가능성과 영향, 기존 통제와 운영 맥락을 함께 평가한다.",
  },
  "q-gen-16": {
    answer: 3,
    explanation:
      "ALE=SLE×ARO 모델에서 5천만×0.2=1천만이다. 실제 판단에는 추정의 불확실성을 함께 고려한다.",
  },
  "q-gen-17": {
    answer: 1,
    explanation:
      "역할에 권한을 묶고 사용자에 역할을 할당한다. 역할 설계와 과도한 겸임을 관리해야 한다.",
  },
  "q-gen-18": {
    answer: 3,
    explanation: "ABAC는 다양한 속성 조합을 활용하지만 정책 복잡도와 속성 신뢰성 관리가 중요하다.",
  },
  "q-gen-19": {
    answer: 1,
    explanation: "서로 보완하는 통제를 겹쳐 단일 방어 실패의 영향을 줄인다.",
  },
  "q-gen-20": {
    answer: 3,
    explanation: "위험 수용은 책임 있는 의사결정이며 통제 불가능성을 감추는 행위가 아니다.",
  },
  "q-gov-04": {
    answer: 0,
    explanation:
      "문서 계층은 조직마다 명칭이 다를 수 있지만 상위 원칙과 실행 기준을 연결해야 한다.",
  },
  "q-gov-05": {
    answer: 2,
    explanation: "민감한 작업의 요청·승인·실행·검토를 나눠 단일 주체의 부정·오류를 억제한다.",
  },
  "q-gov-06": {
    answer: 0,
    explanation: "직무 이동 때 과거 권한을 회수하지 않으면 누적 권한이 생길 수 있다.",
  },
  "q-gov-07": {
    answer: 2,
    explanation: "위탁·공급망 관계에서도 데이터와 시스템에 대한 통제·책임을 명확하게 해야 한다.",
  },
  "q-gov-08": {
    answer: 0,
    explanation:
      "필요성·목적·법적 근거를 확인하고 과도한 수집을 피한다. 구체적 요건은 적용 법령으로 검토한다.",
  },
  "q-gov-09": {
    answer: 2,
    explanation: "보존 의무가 있는 항목과 목적 달성 후 파기할 항목을 구분하고 접근을 제한한다.",
  },
  "q-gov-10": {
    answer: 0,
    explanation:
      "가명처리는 재식별 위험과 추가 정보의 분리·접근 통제를 고려해야 한다. 법적 범주는 적용 규정을 확인한다.",
  },
  "q-gov-11": {
    answer: 2,
    explanation: "정보의 이동과 저장 위치를 알면 누락된 통제와 불필요한 복제를 찾을 수 있다.",
  },
  "q-gov-12": {
    answer: 0,
    explanation:
      "권리 행사 처리에도 본인 확인, 타인의 권리 보호, 적용 법령에 따른 절차가 필요하다.",
  },
  "q-gov-13": {
    answer: 2,
    explanation: "차단 과정도 기록하고 증거 훼손 위험, 서비스 영향, 의사결정 책임을 함께 고려한다.",
  },
  "q-gov-14": {
    answer: 0,
    explanation: "통지·신고는 법령과 적용 조건에 따라 다르므로 최신 원문과 사실관계를 확인한다.",
  },
  "q-gov-15": {
    answer: 2,
    explanation: "RTO는 복구 시간, RPO는 데이터 손실 허용 범위와 관련된 복구 시점 목표다.",
  },
  "q-gov-16": {
    answer: 0,
    explanation: "BIA는 시간에 따른 업무 중단 영향을 파악해 복구 자원과 우선순위의 근거를 만든다.",
  },
  "q-gov-17": {
    answer: 2,
    explanation: "훈련은 계획의 실제 실행 가능성을 검증하고 개선하는 과정이다.",
  },
  "q-gov-18": {
    answer: 0,
    explanation: "감사 범위·기준·증거와 독립적인 판단을 갖춰 결과의 신뢰성을 높인다.",
  },
  "q-gov-19": {
    answer: 2,
    explanation: "참여율은 한 지표이며 실제 행동과 사고 예방·신고 품질을 함께 확인한다.",
  },
  "q-gov-20": {
    answer: 0,
    explanation:
      "법률·시행령·고시 등은 시점과 조건에 따라 적용이 달라진다. 조문과 시행일을 함께 확인한다.",
  },
};
