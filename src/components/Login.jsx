import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@300;400;500&display=swap');

  .menuiq-login * { box-sizing: border-box; margin: 0; padding: 0; }

  .menuiq-login {
    font-family: 'Outfit', sans-serif;
    background: #F7F5F0;
    color: #111111;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* LEFT PANEL */
  .miq-left {
    position: relative;
    padding: 48px 56px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: miqFadeUp 0.5s ease both;
  }
  .miq-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 80%, rgba(214,59,31,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 80% 20%, rgba(201,146,42,0.06) 0%, transparent 60%);
    pointer-events: none;
  }

  .miq-logo {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Lufga', sans-serif;
    font-size: 24px; /* text-2xl */
    font-weight: 800; /* font-extrabold */
    letter-spacing: normal;
    text-decoration: none;
    color: #e05046;
  }

  .miq-left-body {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-bottom: 48px;
  }

  .miq-eyebrow {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #D63B1F;
    font-weight: 500;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .miq-eyebrow::before {
    content: '';
    display: block;
    width: 24px;
    height: 2px;
    background: #D63B1F;
    border-radius: 2px;
  }

  .miq-tagline {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(32px, 3.5vw, 46px);
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -0.02em;
    color: #111111;
    margin-bottom: 28px;
  }
  .miq-tagline em {
    font-style: italic;
    color: #D63B1F;
  }

  .miq-tagline-sub {
    font-size: 15px;
    color: #6B6B6B;
    line-height: 1.65;
    max-width: 340px;
    font-weight: 300;
    margin-bottom: 48px;
  }

  /* Price card */
  .miq-price-card {
    background: #FFFFFF;
    border: 1px solid #E2DDD6;
    border-radius: 10px;
    padding: 20px 22px;
    max-width: 340px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
    animation: miqFloat 6s ease-in-out infinite;
  }
  @keyframes miqFloat {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }

  .miq-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }
  .miq-card-title {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #6B6B6B;
  }
  .miq-live-dot {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    color: #D63B1F;
  }
  .miq-live-dot-circle {
    width: 7px;
    height: 7px;
    background: #D63B1F;
    border-radius: 50%;
    animation: miqPulse 1.8s ease-in-out infinite;
  }
  @keyframes miqPulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.4; transform: scale(1.3); }
  }

  .miq-price-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 11px;
  }
  .miq-price-row:last-child { margin-bottom: 0; }
  .miq-price-label { flex: 1; }
  .miq-price-name { font-size: 13px; font-weight: 500; color: #111111; }
  .miq-price-desc { font-size: 11px; color: #6B6B6B; }
  .miq-price-bar-wrap { flex: 1.2; }
  .miq-price-bar { height: 3px; border-radius: 2px; }
  .miq-price-amt { font-size: 13px; font-weight: 500; color: #111111; width: 44px; text-align: right; }

  .miq-card-footer {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #E2DDD6;
    font-size: 11px;
    color: #6B6B6B;
    display: flex;
    justify-content: space-between;
  }
  .miq-card-footer a { color: #D63B1F; text-decoration: none; font-weight: 500; }

  .miq-stats {
    display: flex;
    gap: 36px;
    margin-top: 40px;
  }
  .miq-stat-num {
    font-family: 'Outfit', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #111111;
    letter-spacing: -0.02em;
  }
  .miq-stat-label {
    font-size: 12px;
    color: #6B6B6B;
    margin-top: 2px;
  }

  /* RIGHT PANEL */
  .miq-right {
    background: #FFFFFF;
    border-left: 1px solid #E2DDD6;
    padding: 48px 64px;
    display: flex;
    flex-direction: column;
    animation: miqFadeUp 0.5s ease 0.08s both;
  }

  .miq-right-top {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: auto;
  }
  .miq-right-top span { font-size: 14px; color: #6B6B6B; }
  .miq-right-top a {
    font-size: 14px;
    font-weight: 500;
    color: #D63B1F;
    text-decoration: none;
    margin-left: 6px;
    transition: color .2s;
  }
  .miq-right-top a:hover { color: #B83018; }

  .miq-form-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 380px;
    margin: 0 auto;
    width: 100%;
  }

  .miq-form-heading {
    font-family: 'Outfit', sans-serif;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #111111;
    margin-bottom: 6px;
  }
  .miq-form-sub {
    font-size: 14px;
    color: #6B6B6B;
    margin-bottom: 36px;
    font-weight: 300;
  }

  .miq-field { margin-bottom: 20px; }
  .miq-field label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #111111;
    margin-bottom: 8px;
    letter-spacing: 0.01em;
  }
  .miq-field input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #E2DDD6;
    border-radius: 6px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    color: #111111;
    background: #F7F5F0;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
    -webkit-appearance: none;
  }
  .miq-field input::placeholder { color: #B0AAA0; }
  .miq-field input:focus {
    border-color: #D63B1F;
    box-shadow: 0 0 0 3px rgba(214,59,31,0.1);
    background: #fff;
  }

  .miq-field-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .miq-field-row label { margin-bottom: 0; }
  .miq-forgot {
    font-size: 12px;
    color: #D63B1F;
    text-decoration: none;
    font-weight: 500;
    transition: color .2s;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
  }
  .miq-forgot:hover { color: #B83018; }

  .miq-remember {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    cursor: pointer;
  }
  .miq-remember input[type="checkbox"] {
    width: 16px;
    height: 16px;
    border: 1.5px solid #E2DDD6;
    border-radius: 3px;
    cursor: pointer;
    accent-color: #D63B1F;
  }
  .miq-remember span {
    font-size: 13px;
    color: #6B6B6B;
    user-select: none;
  }

  .miq-btn-primary {
    width: 100%;
    padding: 14px;
    background: #D63B1F;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background .2s, transform .15s;
    margin-bottom: 16px;
  }
  .miq-btn-primary:hover { background: #B83018; transform: translateY(-1px); }
  .miq-btn-primary:active { transform: translateY(0); }
  .miq-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

  .miq-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }
  .miq-divider hr { flex: 1; border: none; border-top: 1px solid #E2DDD6; }
  .miq-divider span { font-size: 12px; color: #6B6B6B; }

  .miq-btn-google {
    width: 100%;
    padding: 13px;
    background: transparent;
    border: 1.5px solid #E2DDD6;
    border-radius: 6px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #111111;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: border-color .2s, background .2s;
  }
  .miq-btn-google:hover { border-color: #6B6B6B; background: #F7F5F0; }

  .miq-right-bottom {
    text-align: center;
    font-size: 12px;
    color: #6B6B6B;
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid #E2DDD6;
  }
  .miq-right-bottom a { color: #6B6B6B; text-decoration: underline; }

  @keyframes miqFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 840px) {
    .menuiq-login { grid-template-columns: 1fr; }
    .miq-left { display: none; }
    .miq-right { padding: 48px 32px; }
  }
`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.98 10.72A5.41 5.41 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.94H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.06l3.02-2.34z" fill="#FBBC05"/>
    <path d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94L3.98 7.28C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function MenuIQLogin({
  onLogin = () => {},
  onGoogleLogin = () => {},
  onForgotPassword = () => {},
  onSignUp = () => {},
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onLogin({ email, password, remember });
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="menuiq-login">

        {/* LEFT: brand / value prop */}
        <div className="miq-left">
          <a className="miq-logo" href="#">
            <span>MenuIQ</span>
          </a>

          <div className="miq-left-body">
            <p className="miq-eyebrow">London restaurant intelligence</p>
            <h1 className="miq-tagline">
              Know exactly what<br /><em>your rivals charge</em>
            </h1>
            <p className="miq-tagline-sub">
              MenuIQ scans Uber Eats daily so London restaurant owners always know how their prices compare — and when to move.
            </p>

            {/* Live price comparison card */}
            <div className="miq-price-card">
              <div className="miq-card-header">
                <span className="miq-card-title">Margherita Pizza · Soho</span>
                <span className="miq-live-dot">
                  <span className="miq-live-dot-circle" />
                  Live
                </span>
              </div>

              {[
                { name: "You", desc: "Margherita 12\"", color: "#111", width: "72%", price: "£11.50" },
                { name: "Slice & Dice", desc: "Margherita Regular", color: "#D63B1F", width: "88%", price: "£13.90" },
                { name: "Pizza Primo", desc: "Classic Margherita", color: "#C9922A", width: "65%", price: "£10.50" },
              ].map((row) => (
                <div className="miq-price-row" key={row.name}>
                  <div className="miq-price-label">
                    <div className="miq-price-name">{row.name}</div>
                    <div className="miq-price-desc">{row.desc}</div>
                  </div>
                  <div className="miq-price-bar-wrap">
                    <div className="miq-price-bar" style={{ background: row.color, width: row.width }} />
                  </div>
                  <div className="miq-price-amt">{row.price}</div>
                </div>
              ))}

              <div className="miq-card-footer">
                <span>Updated 6 min ago · 4 competitors nearby</span>
                <a href="#">Refresh</a>
              </div>
            </div>

            <div className="miq-stats">
              {[
                { num: "500+", label: "Restaurants" },
                { num: "12", label: "London areas" },
                { num: "Daily", label: "Price refresh" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="miq-stat-num">{s.num}</div>
                  <div className="miq-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: login form */}
        <div className="miq-right">
          <div className="miq-right-top">
            <span>No account?</span>
            <a href="#" onClick={(e) => { e.preventDefault(); onSignUp(); }}>
              Start free trial
            </a>
          </div>

          <div className="miq-form-wrap">
            <h2 className="miq-form-heading">Welcome back</h2>
            <p className="miq-form-sub">Log in to your MenuIQ dashboard</p>

            <form onSubmit={handleLogin}>
              <div className="miq-field">
                <label htmlFor="miq-email">Email address</label>
                <input
                  id="miq-email"
                  type="email"
                  placeholder="you@restaurant.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="miq-field">
                <div className="miq-field-row">
                  <label htmlFor="miq-password">Password</label>
                  <button
                    type="button"
                    className="miq-forgot"
                    onClick={onForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="miq-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <label className="miq-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me for 30 days</span>
              </label>

              <button
                type="submit"
                className="miq-btn-primary"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Log in"}
              </button>
            </form>

            <div className="miq-divider">
              <hr /><span>or</span><hr />
            </div>

            <button className="miq-btn-google" onClick={onGoogleLogin} type="button">
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          <div className="miq-right-bottom">
            By continuing, you agree to MenuIQ's{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>

      </div>
    </>
  );
}
