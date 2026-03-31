import React from 'react';
// 별도의 CSS 임포트 없이 App.css의 스타일을 공유합니다.

export default function TermsPage() {
  return (
    <div className="privacy-wrapper">
      <div className="back-nav">
        <a href="/" className="back-link">
          <i className="ri-arrow-left-line"></i>
          <span>BACK TO MAIN</span>
        </a>
      </div>
      <header className="privacy-header">
        <span className="last-updated">LAST UPDATED: MARCH 31, 2026</span>
        <h1 className="privacy-title">Terms of Service</h1>
        <p className="privacy-intro">
          SESSION TASK 서비스 이용을 환영합니다. 
          본 약관은 사용자가 서비스를 이용함에 있어 필요한 권리와 의무를 규정합니다.
        </p>
      </header>

      <section className="privacy-content">
        <div className="privacy-section">
          <div className="section-num">01</div>
          <div className="section-body">
            <h2>서비스 개요</h2>
            <p>
              <span className="highlight">SESSION TASK</span>는 사용자의 생산성 향상을 위한 
              할일 관리 및 Google Calendar 연동 서비스를 제공합니다.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <div className="section-num">02</div>
          <div className="section-body">
            <h2>서비스 이용</h2>
            <p>
              본 서비스는 Google 계정을 통한 간편 로그인을 통해 이용할 수 있으며, 
              로그인 시 서비스 제공에 필요한 최소한의 권한을 요청할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <div className="section-num">03</div>
          <div className="section-body">
            <h2>금지 행위</h2>
            <p>
              시스템의 보안을 위협하거나, 비정상적인 방법으로 서비스를 이용하는 행위, 
              타인에게 피해를 주는 행위는 엄격히 금지됩니다.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <div className="section-num">04</div>
          <div className="section-body">
            <h2>서비스 변경 및 중단</h2>
            <p>
              더 나은 서비스 제공을 위해 운영자는 사전 공지 없이 기능을 변경하거나 
              운영상 필요한 경우 서비스를 일시 중단할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="privacy-section">
          <div className="section-num">05</div>
          <div className="section-body">
            <h2>문의</h2>
            <p>이용약관 및 서비스 운영, 오류 제보 등에 관한 문의는 아래의 채널을 이용해 주세요.</p>
            <div className="contact-box">
              sessiontask.help@gmail.com
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}