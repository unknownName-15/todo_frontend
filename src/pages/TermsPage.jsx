export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '80px auto', padding: '0 20px', lineHeight: '1.8' }}>
      <h1>서비스 이용약관</h1>
      <p>최종 수정일: 2026년 3월 31일</p>

      <h2>1. 서비스 개요</h2>
      <p>SESSION TASK는 할일 관리 및 Google Calendar 연동 서비스를 제공합니다.</p>

      <h2>2. 서비스 이용</h2>
      <p>본 서비스는 Google 계정을 통해 로그인하여 이용할 수 있습니다.</p>

      <h2>3. 금지 행위</h2>
      <p>서비스를 악용하거나 타인에게 피해를 주는 행위를 금지합니다.</p>

      <h2>4. 서비스 변경 및 중단</h2>
      <p>운영자는 사전 공지 없이 서비스를 변경하거나 중단할 수 있습니다.</p>

      <h2>5. 문의</h2>
      <p>서비스 관련 문의: {'[EMAIL_ADDRESS]'}</p>
    </div>
  );
}