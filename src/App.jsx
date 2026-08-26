import { useState } from "react";

import "./index.css";

import AdminDashboard from "./pages/AdminDashboard";
import TeamDashboard from "./pages/TeamDashboard";
import BestXI from "./pages/BestXI";

function App() {
  const [loginType, setLoginType] =
    useState(null);

  const [adminLoggedIn, setAdminLoggedIn] =
    useState(false);

  const [teamLoggedIn, setTeamLoggedIn] =
    useState(false);

  const [loggedInTeamId, setLoggedInTeamId] =
    useState("");

  const [teamPage, setTeamPage] =
    useState("dashboard");

  /* =========================================================
     ADMIN
  ========================================================= */

  const [adminUsername, setAdminUsername] =
    useState("");

  const [adminPassword, setAdminPassword] =
    useState("");

  const [adminError, setAdminError] =
    useState("");

  /* =========================================================
     TEAM
  ========================================================= */

  const [teamUsername, setTeamUsername] =
    useState("");

  const [teamPassword, setTeamPassword] =
    useState("");

  const [teamError, setTeamError] =
    useState("");

  /* =========================================================
     ADMIN LOGIN
  ========================================================= */

  const handleAdminLogin =
    async () => {
      setAdminError("");

      if (
        !adminUsername ||
        !adminPassword
      ) {
        setAdminError(
          "Please enter username and password"
        );

        return;
      }

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/auth/admin-login",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  username:
                    adminUsername,

                  password:
                    adminPassword
                })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setAdminError(
            data.message ||
              "Invalid admin login"
          );

          return;
        }

        setAdminLoggedIn(true);
      } catch (error) {
        console.error(
          "Admin login error:",
          error
        );

        setAdminError(
          "Unable to connect to the server"
        );
      }
    };

  /* =========================================================
     TEAM LOGIN
  ========================================================= */

  const handleTeamLogin =
    async () => {
      setTeamError("");

      if (
        !teamUsername ||
        !teamPassword
      ) {
        setTeamError(
          "Please enter username and password"
        );

        return;
      }

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/auth/team-login",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  username:
                    teamUsername.trim(),

                  password:
                    teamPassword
                })
            }
          );

        const text =
          await response.text();

        let data;

        try {
          data =
            JSON.parse(
              text
            );
        } catch {
          data = {
            message:
              text ||
              "Server returned an invalid response"
          };
        }

        if (!response.ok) {
          setTeamError(
            data.message ||
              `Login failed (${response.status})`
          );

          return;
        }

        if (
          !data.teamId ||
          data.role !==
            "team"
        ) {
          setTeamError(
            "Login succeeded, but no valid team account was returned."
          );

          return;
        }

        setLoggedInTeamId(
          String(
            data.teamId
          )
        );

        /*
          Always start at the
          Team Dashboard after login.
        */

        setTeamPage(
          "dashboard"
        );

        setTeamLoggedIn(
          true
        );
      } catch (error) {
        console.error(
          "Team login error:",
          error
        );

        setTeamError(
          `Unable to connect to the server: ${error.message}`
        );
      }
    };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleAdminLogout =
    () => {
      setAdminLoggedIn(
        false
      );

      setAdminUsername("");
      setAdminPassword("");
      setAdminError("");
      setLoginType(null);
    };

  const handleTeamLogout =
    () => {
      setTeamLoggedIn(
        false
      );

      setLoggedInTeamId(
        ""
      );

      setTeamUsername("");
      setTeamPassword("");
      setTeamError("");
      setTeamPage(
        "dashboard"
      );

      setLoginType(null);
    };

  /* =========================================================
     ADMIN DASHBOARD
  ========================================================= */

  if (
    adminLoggedIn
  ) {
    return (
      <AdminDashboard
        onLogout={
          handleAdminLogout
        }
      />
    );
  }

  /* =========================================================
     TEAM PORTAL
  ========================================================= */

  if (
    teamLoggedIn
  ) {
    return (
      <div className="team-portal">

        {/* =================================================
            TEAM NAVIGATION
        ================================================= */}

        <header className="team-portal-nav">

          <div className="team-portal-brand">
            <strong>
              BEYOND XI
            </strong>

            <span>
              TEAM PORTAL
            </span>
          </div>

          <nav className="team-portal-menu">

            <button
              className={
                teamPage ===
                "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTeamPage(
                  "dashboard"
                )
              }
            >
              Dashboard
            </button>

            <button
              className={
                teamPage ===
                "best-xi"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTeamPage(
                  "best-xi"
                )
              }
            >
              Best XI
            </button>

            <button
              className={
                teamPage ===
                "trade"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTeamPage(
                  "trade"
                )
              }
            >
              Trade
            </button>

          </nav>

        </header>

        {/* =================================================
            TEAM CONTENT
        ================================================= */}

        <main className="team-portal-content">

          {teamPage ===
            "dashboard" && (
            <TeamDashboard
              teamId={
                loggedInTeamId
              }
              onLogout={
                handleTeamLogout
              }
            />
          )}

          {teamPage ===
            "best-xi" && (
            <BestXI
              teamId={
                loggedInTeamId
              }
            />
          )}

          {teamPage ===
            "trade" && (
            <section className="team-coming-soon">

              <div className="team-coming-soon-card">

                <p>
                  TEAM MARKET
                </p>

                <h1>
                  Trade
                </h1>

                <span>
                  The trade window will be
                  available when the admin opens it.
                </span>

              </div>

            </section>
          )}

        </main>

      </div>
    );
  }

  /* =========================================================
     ADMIN LOGIN
  ========================================================= */

  if (
    loginType ===
    "admin"
  ) {
    return (
      <div className="login-page">

        <div className="login-overlay">

          <div className="login-card">

            <h2>
              Admin Login
            </h2>

            <p className="login-subtitle">
              Access the auction
              control panel
            </p>

            <input
              type="text"
              placeholder="Admin Username"
              value={
                adminUsername
              }
              onChange={(e) =>
                setAdminUsername(
                  e.target.value
                )
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={
                adminPassword
              }
              onChange={(e) =>
                setAdminPassword(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  handleAdminLogin();
                }
              }}
            />

            {adminError && (
              <p
                style={{
                  color:
                    "#ff7777",

                  fontSize:
                    "13px",

                  marginBottom:
                    "12px",

                  textAlign:
                    "center"
                }}
              >
                {adminError}
              </p>
            )}

            <button
              className="primary-button"
              onClick={
                handleAdminLogin
              }
            >
              LOGIN
            </button>

            <button
              className="back-button"
              onClick={() => {
                setLoginType(
                  null
                );

                setAdminError(
                  ""
                );
              }}
            >
              ← Back
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     TEAM LOGIN
  ========================================================= */

  if (
    loginType ===
    "team"
  ) {
    return (
      <div className="login-page">

        <div className="login-overlay">

          <div className="login-card">

            <h2>
              Team Login
            </h2>

            <p className="login-subtitle">
              Enter your team
              credentials
            </p>

            <input
              type="text"
              placeholder="Team Username"
              value={
                teamUsername
              }
              onChange={(e) =>
                setTeamUsername(
                  e.target.value
                )
              }
              autoFocus
            />

            <input
              type="password"
              placeholder="Password"
              value={
                teamPassword
              }
              onChange={(e) =>
                setTeamPassword(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  handleTeamLogin();
                }
              }}
            />

            {teamError && (
              <p
                style={{
                  color:
                    "#ff7777",

                  fontSize:
                    "13px",

                  marginBottom:
                    "12px",

                  textAlign:
                    "center"
                }}
              >
                {teamError}
              </p>
            )}

            <button
              className="primary-button"
              onClick={
                handleTeamLogin
              }
            >
              LOGIN
            </button>

            <button
              className="back-button"
              onClick={() => {
                setLoginType(
                  null
                );

                setTeamUsername(
                  ""
                );

                setTeamPassword(
                  ""
                );

                setTeamError(
                  ""
                );
              }}
            >
              ← Back
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     MAIN LOGIN
  ========================================================= */

  return (
    <div className="login-page">

      <div className="login-overlay">

        <div className="brand">

          <div className="brand-small">
            THE ULTIMATE
          </div>

          <h1>
            BEYOND{" "}
            <span>
              XI
            </span>
          </h1>

          <p>
            FIFA FOOTBALL AUCTION
          </p>

        </div>

        <div className="login-card">

          <h2>
            Welcome
          </h2>

          <p className="login-subtitle">
            Enter the auction
            arena
          </p>

          <div className="login-options">

            <button
              className="login-option team"
              onClick={() =>
                setLoginType(
                  "team"
                )
              }
            >
              <div>

                <strong>
                  Team Login
                </strong>

                <small>
                  Enter your team's
                  auction portal
                </small>

              </div>
            </button>

            <button
              className="login-option admin"
              onClick={() =>
                setLoginType(
                  "admin"
                )
              }
            >
              <div>

                <strong>
                  Admin Login
                </strong>

                <small>
                  Manage and control
                  the auction
                </small>

              </div>
            </button>

          </div>

        </div>

        <div className="footer-text">
          BEYOND XI • FIFA
          FOOTBALL AUCTION
        </div>

      </div>

    </div>
  );
}

export default App;