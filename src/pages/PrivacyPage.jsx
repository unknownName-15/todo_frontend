import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="privacy-wrapper">
      {/* 메인으로 돌아가기 버튼 */}
      <div className="back-nav">
        <a href="/" className="back-link">
          <i className="ri-arrow-left-line"></i>
          <span>BACK TO MAIN</span>
        </a>
      </div>

      <header className="privacy-header">
        <span className="last-updated">LAST UPDATED: MARCH 31, 2026</span>
        <h1 className="privacy-title">Privacy Policy</h1>
        <p className="privacy-intro">
          SESSION TASK는 사용자의 개인정보 보호를 최우선으로 생각합니다. 
          본 방침은 서비스 이용 시 수집되는 정보와 그 활용 방안에 대해 설명합니다.
        </p>
      </header>

      <section className="privacy-content">
        <div className="privacy-section">
          <div className="section-num">01</div>
          <div className="section-body">
            <h2>수집하는 개인정보</h2>
            <p>
              <span className="highlight">SESSION TASK</span>는 Google 로그인을 통해 
              이메일 주소와 Google Calendar 접근 권한을 수집합니다.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <div className="section-num">02</div>
          <div className="section-body">
            <h2>개인정보 이용 목적</h2>
            <p>수집된 정보는 할일 관리 및 Google Calendar 연동 서비스 제공 목적으로만 사용됩니다.</p>
          </div>
        </div>

        <div className="privacy-section">
          <div className="section-num">03</div>
          <div className="section-body">
            <h2>개인정보 보관 기간</h2>
            <p>서비스 탈퇴 시 모든 개인정보는 즉시 삭제됩니다.</p>
          </div>
        </div>

        <div className="privacy-section">
          <div className="section-num">04</div>
          <div className="section-body">
            <h2>제3자 제공</h2>
            <p>수집된 개인정보는 어떠한 경우에도 제3자에게 제공되거나 외부로 유출되지 않습니다.</p>
          </div>
        </div>

        <div className="privacy-section">
          <div className="section-num">05</div>
          <div className="section-body">
            <h2>문의</h2>
            <p>개인정보 관련 문의사항, 오류 제보 등은 아래의 이메일로 연락 주시기 바랍니다.</p>
            <div className="contact-box">
              sessiontask.help@gmail.com
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}