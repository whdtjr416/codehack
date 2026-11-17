import type { CodingCheck, CodingSource, CodingTask } from "./types.ts";

export const codingGroups = ["HTML 기초", "CSS 기초", "웹사이트 만들기"] as const;
const element = (label: string, selector: string, min = 1): CodingCheck => ({
  label,
  kind: "element",
  selector,
  min,
});
const attr = (
  label: string,
  selector: string,
  attribute: string,
  pattern = "\\S",
): CodingCheck => ({ label, kind: "attribute", selector, attribute, pattern });
const style = (
  label: string,
  selector: string,
  property: string,
  values: string[] | number,
): CodingCheck => ({
  label,
  kind: "style",
  selector,
  property,
  ...(typeof values === "number" ? { min: values } : { values }),
});
const layout = (
  label: string,
  selector: string,
  mode: CodingCheck["layout"],
  mobile = false,
): CodingCheck => ({
  label,
  kind: "layout",
  selector,
  layout: mode,
  ...(mobile ? { viewport: "mobile" as const } : {}),
});
const source = (html: string, css = ""): CodingSource => ({ html, css });

function html(
  id: string,
  title: string,
  prompt: string,
  theory: string,
  hint: string,
  solution: string,
  checks: CodingCheck[],
  starter = "<!-- 이곳에 HTML을 작성하세요. -->",
): CodingTask {
  return {
    id: `coding-html-${id}`,
    title,
    group: "HTML 기초",
    level: "입문",
    prompt,
    theory,
    hint,
    explanation: `${theory} 예시의 문구는 바꿔도 됩니다. 요구한 요소와 속성이 실제 화면에 나타나는지 확인하세요.`,
    starter: source(starter),
    solution: source(solution),
    checks,
  };
}
const profile = `<main class="profile-card">
  <img src="avatar.svg" alt="프로필 그림" width="72" height="72">
  <h1>김개발</h1>
  <p>웹 개발을 배우고 있습니다.</p>
  <a href="mailto:hello@example.com">연락하기</a>
</main>`;
const tiles = `<section class="projects">
  <article><h2>프로필 페이지</h2><p>HTML로 나를 소개합니다.</p></article>
  <article><h2>카페 소개</h2><p>CSS로 화면을 꾸밉니다.</p></article>
  <article><h2>학습 기록</h2><p>배운 내용을 정리합니다.</p></article>
</section>`;
function css(
  id: string,
  title: string,
  prompt: string,
  theory: string,
  hint: string,
  answer: string,
  checks: CodingCheck[],
  markup = profile,
  starter = "/* 이곳에 CSS를 작성하세요. */",
): CodingTask {
  return {
    id: `coding-css-${id}`,
    title,
    group: "CSS 기초",
    level: ["grid", "responsive", "card"].includes(id) ? "초급" : "입문",
    prompt,
    theory,
    hint,
    explanation: `${theory} 브라우저가 계산한 스타일과 실제 배치를 검사하므로 같은 결과를 만드는 다른 CSS도 사용할 수 있습니다.`,
    starter: source(markup, starter),
    solution: source(markup, answer),
    checks,
  };
}

const profileCss = `* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 32px 20px;
  font-family: system-ui, sans-serif;
  color: #202020;
  background: #f3f3f3;
}
.profile-card {
  max-width: 420px;
  margin: 32px auto;
  padding: 32px;
  text-align: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
}
.profile-card img { border-radius: 50%; }
.profile-card a {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 20px;
  background: #202020;
  color: white;
  border-radius: 6px;
  text-decoration: none;
}`;
const siteTwo = `<header class="site-header">
  <strong>김개발</strong>
  <nav aria-label="사이트 메뉴">
    <a href="#about">소개</a>
    <a href="#projects">프로젝트</a>
    <a href="#contact">연락처</a>
  </nav>
</header>
${profile.replace('<main class="profile-card">', '<main id="about" class="profile-card">')}
<footer>직접 만든 포트폴리오</footer>`;
const siteTwoCss =
  profileCss +
  `
.site-header {
  max-width: 960px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
nav { display: flex; gap: 16px; }
nav a { color: inherit; }
footer { margin: 32px 0; text-align: center; }`;
const siteThree = siteTwo.replace(
  "<footer>",
  `${tiles.replace('class="projects"', 'id="projects" class="projects"')}\n<footer>`,
);
const siteThreeCss =
  siteTwoCss +
  `
.projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 960px; margin: 24px auto; }
.projects article { min-width: 0; padding: 20px; background: white; border: 1px solid #ddd; border-radius: 8px; }
.projects h2 { font-size: 18px; }`;
const contact = `<section id="contact">
  <h2>연락처</h2>
  <ul class="skills"><li>HTML</li><li>CSS</li><li>반응형 디자인</li></ul>
  <a href="mailto:hello@example.com">hello@example.com</a>
</section>`;
const siteFour = siteThree.replace("<footer>", `${contact}\n<footer>`);
const siteFourCss =
  siteThreeCss +
  `
#contact { max-width: 960px; margin: 32px auto; }
.skills { display: flex; flex-wrap: wrap; gap: 16px; padding: 0; list-style: none; }
.skills li { padding: 6px 12px; background: #e4e4e4; border-radius: 4px; }`;
const siteFiveCss =
  siteFourCss +
  `
@media (max-width: 600px) {
  .site-header { flex-direction: column; align-items: flex-start; }
  .projects { grid-template-columns: 1fr; }
  .profile-card { width: 100%; padding: 24px; }
}`;
const siteSix = siteFour.replace(
  "<header",
  '<a class="skip" href="#about">본문으로 이동</a>\n<header',
);
const siteSixCss =
  siteFiveCss +
  `
a:focus-visible { outline: 3px solid #2459a6; outline-offset: 4px; }
.skip { display: inline-block; margin-bottom: 16px; color: #202020; }
img { max-width: 100%; height: auto; }`;
const profileChecks = [
  element("이름과 소개 작성", ".profile-card h1"),
  element("소개 문단 작성", ".profile-card p"),
  attr("연락처 링크 연결", ".profile-card a", "href", "^mailto:.+@.+"),
  layout("카드를 가운데 배치", ".profile-card", "center"),
  style("카드 안쪽 여백 24px 이상", ".profile-card", "padding-top", 24),
];
const structureChecks = [
  element("페이지 머리말과 메뉴", "header nav a", 3),
  attr("소개 영역으로 이동", "nav a", "href", "^#about$"),
  element("소개 영역 유지", "main#about h1"),
  element("꼬리말 작성", "footer"),
];
const projectChecks = [
  element("프로젝트 카드 3개", "#projects article", 3),
  element("각 프로젝트 제목", "#projects article h2", 3),
  layout("큰 화면에서 카드 가로 배치", "#projects", "columns"),
];
const contactChecks = [
  element("기술 목록 3개", ".skills li", 3),
  attr("연락처 이메일 링크", "#contact a", "href", "^mailto:.+@.+"),
  attr("연락처 메뉴 연결", "nav a", "href", "^#contact$"),
];
const responsiveChecks = [
  layout("휴대폰에서 한 열로 배치", "#projects", "stack", true),
  layout("휴대폰에서 가로 넘침 없음", "body", "fits", true),
  layout("큰 화면에서 카드 가로 배치", "#projects", "columns"),
];

const projectSteps: Omit<CodingTask, "id" | "group" | "level" | "previousId">[] = [
  {
    title: "프로필 카드 만들기",
    prompt:
      "이름·소개·연락처를 담은 카드를 가운데 배치하세요. 지금부터 만든 코드를 다음 단계에서 이어 씁니다.",
    theory:
      "HTML은 정보의 구조를, CSS는 모양과 배치를 담당합니다. 카드의 최대 너비와 자동 좌우 여백을 사용하면 작은 화면에도 대응하기 쉽습니다.",
    hint: ".profile-card 안에 h1, p, 이메일 링크를 넣고 max-width, margin: auto, padding을 적용하세요.",
    explanation:
      "카드에 의미 있는 HTML을 먼저 작성하고 CSS를 추가합니다. 연락처는 mailto: 링크로 연결합니다. 다음 단계는 이 코드를 그대로 이어받습니다.",
    starter: source(
      "<!-- .profile-card 안에 이름, 소개, 연락처를 만드세요. -->",
      "/* 카드 배치를 작성하세요. */",
    ),
    solution: source(profile, profileCss),
    checks: profileChecks,
  },
  {
    title: "메뉴와 페이지 구조",
    prompt:
      "기존 카드를 유지하고 header·nav·footer를 추가하세요. 메뉴는 소개·프로젝트·연락처 세 개입니다.",
    theory:
      "header, nav, main, footer는 페이지 각 부분의 역할을 설명합니다. #about 링크는 id가 about인 요소로 이동합니다.",
    hint: '카드의 main에 id="about"을 지정하고 nav 안에 href="#about" 링크를 넣으세요.',
    explanation:
      "지금은 소개 영역만 있고 프로젝트와 연락처 영역은 다음 단계에서 만듭니다. 메뉴의 이름과 목적지는 일관되게 유지합니다.",
    starter: source(profile, profileCss),
    solution: source(siteTwo, siteTwoCss),
    checks: [...profileChecks, ...structureChecks],
  },
  {
    title: "프로젝트 목록 만들기",
    prompt:
      "id가 projects인 영역에 제목과 설명이 있는 프로젝트 카드 3개를 추가하세요. 큰 화면에서는 가로로 배치합니다.",
    theory:
      "각 프로젝트는 독립된 article로 묶습니다. Grid의 repeat(3, 1fr)은 같은 너비의 세 열을 만듭니다.",
    hint: "#projects 안에 article 세 개를 만들고 display: grid; grid-template-columns: repeat(3, 1fr);를 적용하세요.",
    explanation:
      "article 안에 h2와 설명 문단을 배치합니다. 각 카드에 min-width: 0을 지정하면 긴 내용이 열을 밀어내는 것을 줄일 수 있습니다.",
    starter: source(siteTwo, siteTwoCss),
    solution: source(siteThree, siteThreeCss),
    checks: [...structureChecks, ...projectChecks],
  },
  {
    title: "기술과 연락처 추가",
    prompt:
      "기술 3개를 담은 .skills 목록과 #contact 영역을 추가하세요. 연락처 메뉴가 이 영역을 가리키게 만드세요.",
    theory:
      "나열된 기술은 ul과 li로 표현합니다. 페이지 내부 이동은 #id, 이메일 작성은 mailto: 주소를 사용합니다.",
    hint: '#contact 안에 .skills 목록과 이메일 링크를 넣으세요. 메뉴의 href="#contact"와 id를 맞춥니다.',
    explanation:
      "실제 연락처를 공개할지는 직접 결정하세요. 학습 중에는 hello@example.com 같은 예시 주소를 사용할 수 있습니다.",
    starter: source(siteThree, siteThreeCss),
    solution: source(siteFour, siteFourCss),
    checks: [...structureChecks, ...projectChecks, ...contactChecks],
  },
  {
    title: "휴대폰 화면에 맞추기",
    prompt:
      "390px 화면에서 프로젝트를 세로로 배치하고 가로 스크롤을 없애세요. 큰 화면의 가로 배치는 유지합니다.",
    theory:
      "미디어 쿼리로 화면 너비에 따라 스타일을 바꿉니다. 고정 너비 대신 최대 너비와 유연한 열 크기를 사용합니다.",
    hint: "@media (max-width: 600px) 안에서 #projects 또는 .projects의 grid-template-columns를 1fr로 바꾸세요.",
    explanation:
      "채점은 960px와 390px에서 각각 실행됩니다. 미리보기의 화면 버튼으로 직접 두 배치를 확인하세요.",
    starter: source(siteFour, siteFourCss),
    solution: source(siteFour, siteFiveCss),
    checks: [...contactChecks, ...responsiveChecks],
  },
  {
    title: "포트폴리오 사이트 완성",
    prompt:
      "이미지 대체 텍스트와 본문 바로가기 링크를 확인하고 전체 사이트를 마무리하세요. 완성한 HTML 파일을 내려받아 브라우저에서 열어보세요.",
    theory:
      "alt는 이미지의 목적을 설명합니다. 본문 바로가기는 키보드 사용자가 반복되는 메뉴를 건너뛸 수 있게 합니다. 자동 검사와 함께 글자 가독성·내용·링크를 직접 확인합니다.",
    hint: 'img에 alt를 넣고, header 앞에 href="#about"인 .skip 링크를 추가하세요. :focus-visible로 키보드 위치를 표시하면 좋습니다.',
    explanation:
      "구조·반응형·기본 접근성 조건을 확인한 정적 사이트입니다. 다운로드 파일에는 HTML과 CSS, 연습용 프로필 이미지가 포함되며 코드핵의 채점 코드는 포함되지 않습니다.",
    starter: source(siteFour, siteFiveCss),
    solution: source(siteSix, siteSixCss),
    checks: [
      ...profileChecks,
      ...structureChecks,
      ...projectChecks,
      ...contactChecks,
      ...responsiveChecks.filter((x) => x.viewport),
      attr("이미지 대체 텍스트", ".profile-card img", "alt"),
      attr("본문 바로가기", "a.skip", "href", "^#about$"),
    ],
  },
];

export const codingTasks: CodingTask[] = [
  html(
    "heading",
    "첫 제목과 소개",
    "h1 제목과 p 소개 문단을 하나씩 작성하세요.",
    "h1은 페이지의 대표 제목, p는 문단입니다. 시작 태그와 닫는 태그 사이에 내용을 넣습니다.",
    "<h1>내 이름</h1> 다음에 <p>소개</p>를 작성하세요.",
    "<h1>김개발</h1>\n<p>처음 만든 웹페이지입니다.</p>",
    [element("대표 제목 작성", "h1"), element("소개 문단 작성", "p")],
  ),
  html(
    "sections",
    "제목의 계층",
    "h1 한 개 아래에 h2 소제목 두 개와 문단 두 개를 작성하세요.",
    "제목 단계는 글자 크기가 아니라 문서의 구조를 나타냅니다. 큰 제목 아래 세부 주제를 h2로 구분합니다.",
    "소개와 관심 분야를 각각 h2와 p로 작성하세요.",
    "<h1>내 소개</h1>\n<h2>관심 분야</h2>\n<p>웹 개발</p>\n<h2>학습 목표</h2>\n<p>나만의 사이트 완성</p>",
    [
      element("대표 제목", "h1"),
      element("소제목 두 개", "h2", 2),
      element("설명 문단 두 개", "p", 2),
    ],
  ),
  html(
    "emphasis",
    "중요한 내용 강조",
    "문단 안에 strong으로 중요한 내용, em으로 강조할 내용을 표시하세요.",
    "strong은 중요성, em은 문맥상 강세를 표현합니다. 단순한 장식은 CSS로 처리합니다.",
    "p 내부의 일부 단어를 strong과 em으로 감싸세요.",
    "<p><strong>직접 작성</strong>하고 <em>계속 수정</em>하며 배웁니다.</p>",
    [element("중요성 표시", "p strong"), element("문맥상 강조", "p em")],
  ),
  html(
    "links",
    "링크 연결",
    "a 태그로 HTTPS 링크와 이메일 링크를 하나씩 만드세요.",
    "a의 href는 이동할 목적지입니다. mailto: 주소는 이메일 작성 기능을 연결합니다. 미리보기에서는 외부 이동을 실행하지 않습니다.",
    'href="https://example.com"과 href="mailto:hello@example.com"을 사용하세요.',
    '<a href="https://example.com">프로젝트 보기</a>\n<a href="mailto:hello@example.com">연락하기</a>',
    [
      attr("HTTPS 링크", "a", "href", "^https://.+"),
      attr("이메일 링크", "a", "href", "^mailto:.+@.+"),
    ],
  ),
  html(
    "image",
    "이미지와 대체 텍스트",
    "연습 이미지 avatar.svg를 넣고 alt로 이미지의 의미를 설명하세요. 아래에 설명 문단도 넣습니다.",
    "img는 닫는 태그가 없는 요소입니다. src는 이미지 경로, alt는 이미지를 보지 못할 때 전달할 설명입니다.",
    '<img src="avatar.svg" alt="프로필 그림" width="96" height="96">를 참고하세요.',
    '<img src="avatar.svg" alt="내 프로필 그림" width="96" height="96">\n<p>나를 소개하는 그림입니다.</p>',
    [
      attr("이미지 경로", "img", "src"),
      attr("대체 텍스트", "img", "alt"),
      element("그림 설명", "p"),
    ],
  ),
  html(
    "list",
    "관심 분야 목록",
    "ul 안에 세 개의 li로 관심 분야를 적으세요.",
    "ul은 순서 없는 목록입니다. 항목은 각각 li로 표현하며 줄바꿈만으로 목록 구조를 대신하지 않습니다.",
    "<ul> 안에 <li>...</li>를 세 번 넣으세요.",
    "<ul>\n  <li>웹 개발</li>\n  <li>리눅스</li>\n  <li>보안</li>\n</ul>",
    [element("목록 항목 세 개", "ul > li", 3)],
  ),
  html(
    "steps",
    "순서 있는 작업",
    "ol로 세 단계의 작업 순서를 작성하세요.",
    "ol은 순서가 의미를 가지는 목록입니다. 브라우저가 항목 번호를 표시합니다.",
    "설계, 구현, 확인을 각각 li로 작성해보세요.",
    "<ol>\n  <li>구조 설계</li>\n  <li>코드 작성</li>\n  <li>결과 확인</li>\n</ol>",
    [element("순서 항목 세 개", "ol > li", 3)],
  ),
  html(
    "table",
    "작은 정보 표",
    "caption 제목, th 두 개, 데이터 행 한 개 이상이 있는 table을 만드세요.",
    "표는 행과 열 사이 관계가 있는 정보를 표현합니다. th는 머리글, td는 데이터 셀입니다.",
    "table 안에 caption, tr, th, td를 사용하세요.",
    "<table>\n  <caption>학습 기록</caption>\n  <tr><th>분야</th><th>완료</th></tr>\n  <tr><td>HTML</td><td>8개</td></tr>\n</table>",
    [
      element("표 제목", "table caption"),
      element("열 머리글 두 개", "table th", 2),
      element("데이터 셀 두 개", "table td", 2),
    ],
  ),
  html(
    "form",
    "이름 입력 폼",
    "form 안에 label과 이름 입력란, 제출 버튼을 만드세요. label의 for와 input의 id를 연결합니다.",
    "label을 입력란과 연결하면 이름표를 눌러도 입력란에 초점이 이동합니다. 여기서는 폼 화면만 만들며 실제 전송은 하지 않습니다.",
    '<label for="name">이름</label>과 <input id="name" name="name">를 연결하세요.',
    '<form>\n  <label for="name">이름</label>\n  <input id="name" name="name">\n  <button type="submit">확인</button>\n</form>',
    [
      { label: "입력란과 이름표 연결", kind: "labels", selector: "form input" },
      element("제출 버튼", 'form button[type="submit"]'),
    ],
  ),
  html(
    "email",
    "필수 이메일 입력",
    "이메일 입력란을 type=email, required로 만들고 label과 제출 버튼을 연결하세요.",
    "type=email은 이메일 형태 검사를, required는 필수 입력 검사를 지정합니다. 실제 서비스는 서버에서도 값을 검증해야 합니다.",
    "input에 type, id, name, required 속성을 추가하세요.",
    '<form>\n  <label for="email">이메일</label>\n  <input id="email" name="email" type="email" required>\n  <button type="submit">등록</button>\n</form>',
    [
      element("필수 이메일 입력란", 'form input[type="email"][required]'),
      { label: "입력란 이름표", kind: "labels", selector: "form input" },
      element("등록 버튼", 'button[type="submit"]'),
    ],
  ),
  html(
    "semantic",
    "페이지의 큰 구조",
    "header 안에 nav, main 안에 h1, 마지막에 footer를 작성하세요.",
    "의미 있는 요소는 문서의 역할을 전달합니다. main은 핵심 내용, nav는 주요 탐색, footer는 끝부분의 정보를 담습니다.",
    "메뉴와 본문을 서로 다른 영역으로 나누세요.",
    '<header><nav><a href="#about">소개</a></nav></header>\n<main id="about"><h1>내 웹사이트</h1></main>\n<footer>직접 만들었습니다.</footer>',
    [
      element("탐색 영역", "header nav"),
      element("본문 제목", "main h1"),
      element("꼬리말", "footer"),
    ],
  ),
  html(
    "profile",
    "소개 페이지 조합",
    "main 안에 이름, 소개, 대체 텍스트가 있는 이미지와 이메일 링크를 조합하세요.",
    "페이지 구조를 먼저 완성한 다음 CSS를 추가합니다. 태그의 순서는 읽는 흐름과 맞아야 합니다.",
    "앞서 만든 h1, p, img, a를 main으로 묶으세요.",
    profile,
    [
      element("본문 제목", "main h1"),
      element("소개 문단", "main p"),
      attr("프로필 이미지 설명", "main img", "alt"),
      attr("이메일 연결", "main a", "href", "^mailto:.+@.+"),
    ],
  ),
  css(
    "color",
    "글자색 바꾸기",
    "h1의 글자색을 #2459a6으로 바꾸세요.",
    "선택자는 스타일을 적용할 요소를 고릅니다. color 속성은 글자의 색을 지정합니다.",
    "h1 { color: #2459a6; } 형태로 작성하세요.",
    "h1 { color: #2459a6; }",
    [style("제목 색상 적용", "h1", "color", ["rgb(36, 89, 166)"])],
  ),
  css(
    "type",
    "글자 크기와 줄 간격",
    "h1을 32px 이상, p를 18px 이상으로 설정하고 p의 줄 높이를 28px 이상으로 만드세요.",
    "font-size는 글자 크기, line-height는 줄 높이입니다. 본문에 충분한 줄 간격을 둡니다.",
    "p { font-size: 18px; line-height: 1.6; }를 참고하세요.",
    "h1 { font-size: 32px; }\np { font-size: 18px; line-height: 1.6; }",
    [
      style("제목 32px 이상", "h1", "font-size", 32),
      style("본문 18px 이상", "p", "font-size", 18),
      style("줄 높이 28px 이상", "p", "line-height", 28),
    ],
  ),
  css(
    "background",
    "배경과 카드 구분",
    "body 배경은 #f3f3f3, .profile-card 배경은 흰색으로 만드세요.",
    "background-color는 요소의 배경색입니다. 페이지와 카드의 배경을 구분하면 영역을 읽기 쉽습니다.",
    "body와 .profile-card 선택자에 각각 배경색을 지정하세요.",
    "body { background-color: #f3f3f3; }\n.profile-card { background-color: white; }",
    [
      style("페이지 배경", "body", "background-color", ["rgb(243, 243, 243)"]),
      style("흰색 카드", ".profile-card", "background-color", ["rgb(255, 255, 255)"]),
    ],
  ),
  css(
    "spacing",
    "카드 안팎 여백",
    ".profile-card에 안쪽 여백 24px, 바깥 위쪽 여백 32px 이상을 주세요.",
    "padding은 테두리 안쪽, margin은 요소 바깥의 여백입니다. 서로 다른 역할을 구분합니다.",
    "padding: 24px; margin-top: 32px;을 사용하세요.",
    ".profile-card { padding: 24px; margin-top: 32px; }",
    [
      style("안쪽 위 여백", ".profile-card", "padding-top", 24),
      style("안쪽 좌우 여백", ".profile-card", "padding-left", 24),
      style("바깥 위 여백", ".profile-card", "margin-top", 32),
    ],
  ),
  css(
    "border",
    "테두리와 둥근 모서리",
    ".profile-card에 1px 이상의 실선 테두리와 12px 이상의 둥근 모서리를 적용하세요.",
    "border는 두께·종류·색을 지정합니다. border-radius는 모서리의 곡률입니다.",
    "border: 1px solid #ccc; border-radius: 12px;을 참고하세요.",
    ".profile-card { border: 1px solid #ccc; border-radius: 12px; }",
    [
      style("테두리 두께", ".profile-card", "border-top-width", 1),
      style("실선 테두리", ".profile-card", "border-top-style", ["solid"]),
      style("둥근 모서리", ".profile-card", "border-top-left-radius", 12),
    ],
  ),
  css(
    "center",
    "카드 가운데 배치",
    ".profile-card의 최대 너비를 420px로 지정하고 가로 가운데에 놓으세요.",
    "블록 요소에 최대 너비와 좌우 자동 여백을 지정하면 부모 안에서 가운데 정렬할 수 있습니다.",
    "max-width: 420px; margin: 24px auto;를 사용하세요.",
    ".profile-card { max-width: 420px; margin: 24px auto; }",
    [
      style("최대 너비 420px", ".profile-card", "max-width", ["420px"]),
      layout("가로 가운데 정렬", ".profile-card", "center"),
    ],
  ),
  css(
    "button",
    "연락처 버튼 꾸미기",
    "연락처 링크를 inline-block으로 만들고 위아래 10px, 좌우 20px 이상의 여백과 검은 배경·흰 글자를 적용하세요.",
    "링크는 원래 인라인 요소입니다. inline-block을 쓰면 한 줄 안에서 상자처럼 여백과 크기를 다룰 수 있습니다.",
    ".profile-card a 선택자에 display, padding, background, color를 지정하세요.",
    ".profile-card a { display: inline-block; padding: 10px 20px; background: #202020; color: white; }",
    [
      style("인라인 블록", ".profile-card a", "display", ["inline-block"]),
      style("버튼 세로 여백", ".profile-card a", "padding-top", 10),
      style("버튼 가로 여백", ".profile-card a", "padding-left", 20),
      style("흰색 글자", ".profile-card a", "color", ["rgb(255, 255, 255)"]),
      style("어두운 배경", ".profile-card a", "background-color", ["rgb(32, 32, 32)"]),
    ],
  ),
  css(
    "flex",
    "메뉴 가로 배치",
    "nav를 Flex로 바꾸고 메뉴를 가로로, 간격 16px 이상으로 배치하세요.",
    "Flex는 한 축을 따라 항목을 배치합니다. gap은 항목 사이 간격을 지정합니다.",
    "nav { display: flex; gap: 16px; }를 작성하세요.",
    "nav { display: flex; gap: 16px; }",
    [
      style("Flex 배치", "nav", "display", ["flex"]),
      style("메뉴 간격", "nav", "column-gap", 16),
      layout("메뉴 가로 정렬", "nav", "columns"),
    ],
    '<nav><a href="#about">소개</a><a href="#projects">프로젝트</a><a href="#contact">연락처</a></nav>',
  ),
  css(
    "grid",
    "프로젝트 카드 그리드",
    ".projects를 Grid로 만들고 카드 3개를 가로로 배치하세요. 간격은 16px 이상입니다.",
    "Grid는 행과 열로 배치합니다. repeat(3, 1fr)은 가용 공간을 세 열로 나눕니다.",
    ".projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }를 참고하세요.",
    ".projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }",
    [
      style("Grid 배치", ".projects", "display", ["grid"]),
      style("열 간격", ".projects", "column-gap", 16),
      layout("카드 가로 배치", ".projects", "columns"),
    ],
    tiles,
  ),
  css(
    "image",
    "프로필 이미지 크기",
    "이미지를 72×72px로 만들고 원형으로 표시하세요. object-fit: cover도 적용합니다.",
    "width와 height는 표시 크기, object-fit은 이미지가 상자에 맞는 방식입니다. 50%의 모서리 반경으로 원형을 만듭니다.",
    "img에 width, height, border-radius, object-fit을 지정하세요.",
    "img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; }",
    [
      style("이미지 너비", "img", "width", ["72px"]),
      style("이미지 높이", "img", "height", ["72px"]),
      style("원형 이미지", "img", "border-top-left-radius", ["50%", "36px"]),
      style("이미지 채우기", "img", "object-fit", ["cover"]),
    ],
  ),
  css(
    "responsive",
    "작은 화면에서 한 열",
    "큰 화면은 3열을 유지하고 390px 화면에서는 카드들을 세로 한 열로 바꾸세요.",
    "@media 안의 CSS는 조건에 맞는 화면에서만 적용됩니다. 큰 화면과 작은 화면을 함께 검증합니다.",
    "@media (max-width: 600px) 안에 grid-template-columns: 1fr;를 작성하세요.",
    ".projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }\n@media (max-width: 600px) {\n  .projects { grid-template-columns: 1fr; }\n}",
    [
      layout("큰 화면 가로 배치", ".projects", "columns"),
      layout("작은 화면 세로 배치", ".projects", "stack", true),
      layout("작은 화면 가로 넘침 없음", ".projects", "fits", true),
    ],
    tiles,
    ".projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }\n/* 작은 화면 규칙을 추가하세요. */",
  ),
  css(
    "card",
    "프로필 카드 스타일 완성",
    "최대 너비 420px의 흰 카드를 가운데 배치하고 안쪽 여백 24px 이상, 모서리 12px 이상을 적용하세요.",
    "여러 속성을 함께 적용하되 색상·여백·크기·배치의 역할을 구분합니다. 작은 화면에서 넘치지 않는지도 확인합니다.",
    "앞서 학습한 max-width, margin, padding, background, border-radius를 조합하세요.",
    profileCss,
    [
      style("최대 너비", ".profile-card", "max-width", ["420px"]),
      style("흰색 배경", ".profile-card", "background-color", ["rgb(255, 255, 255)"]),
      style("안쪽 여백", ".profile-card", "padding-top", 24),
      style("모서리 반경", ".profile-card", "border-top-left-radius", 12),
      layout("가운데 정렬", ".profile-card", "center"),
      layout("휴대폰 화면 안에 표시", ".profile-card", "fits", true),
    ],
  ),
  ...projectSteps.map((step, i): CodingTask => ({
    ...step,
    id: `coding-site-${i + 1}`,
    group: "웹사이트 만들기",
    level: i < 2 ? "초급" : "중급",
    ...(i ? { previousId: `coding-site-${i}` } : {}),
  })),
];
