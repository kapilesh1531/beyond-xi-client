import {
  useState
} from "react";
const API_URL = import.meta.env.VITE_API_URL || "https://beyond-xi-server-production.up.railway.app";

import "./index.css";

import AdminDashboard
  from "./pages/AdminDashboard";

import TeamDashboard
  from "./pages/TeamDashboard";

import BestXI
  from "./pages/BestXI";

import Trade
  from "./pages/Trade";

import Presentation
  from "./pages/Presentation";

import Results
  from "./pages/Results.jsx";


function App() {
  /* =========================================================
     LOGIN STATE
  ========================================================= */

  const [
    loginType,
    setLoginType
  ] = useState(null);

  const [
    adminLoggedIn,
    setAdminLoggedIn
  ] = useState(false);

  const [
    teamLoggedIn,
    setTeamLoggedIn
  ] = useState(false);

  const [
    loggedInTeamId,
    setLoggedInTeamId
  ] = useState("");


  /* =========================================================
     TEAM PAGE
  ========================================================= */

  const [
    teamPage,
    setTeamPage
  ] = useState(
    "dashboard"
  );


  /* =========================================================
     ADMIN LOGIN
  ========================================================= */

  const [
    adminUsername,
    setAdminUsername
  ] = useState("");

  const [
    adminPassword,
    setAdminPassword
  ] = useState("");

  const [
    adminError,
    setAdminError
  ] = useState("");

  const [
    adminLoading,
    setAdminLoading
  ] = useState(false);


  /* =========================================================
     TEAM LOGIN
  ========================================================= */

  const [
    teamUsername,
    setTeamUsername
  ] = useState("");

  const [
    teamPassword,
    setTeamPassword
  ] = useState("");

  const [
    teamError,
    setTeamError
  ] = useState("");

  const [
    teamLoading,
    setTeamLoading
  ] = useState(false);


  /* =========================================================
     ADMIN LOGIN
  ========================================================= */

  const handleAdminLogin =
    async () => {
      setAdminError("");

      if (
        !adminUsername.trim() ||
        !adminPassword
      ) {
        setAdminError(
          "Please enter username and password."
        );

        return;
      }

      setAdminLoading(
        true
      );

      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/admin-login`,
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
                    adminUsername.trim(),

                  password:
                    adminPassword
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
              "Server returned an invalid response."
          };
        }

        if (!response.ok) {
          setAdminError(
            data.message ||
            "Invalid admin username or password."
          );

          return;
        }

        setAdminLoggedIn(
          true
        );

        setLoginType(
          null
        );

      } catch (error) {
        console.error(
          "Admin login error:",
          error
        );

        setAdminError(
          "Unable to connect to the server."
        );

      } finally {
        setAdminLoading(
          false
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
        !teamUsername.trim() ||
        !teamPassword
      ) {
        setTeamError(
          "Please enter username and password."
        );

        return;
      }

      setTeamLoading(
        true
      );

      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/team-login`,
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
              "Server returned an invalid response."
          };
        }

        if (!response.ok) {
          setTeamError(
            data.message ||
            `Login failed (${response.status}).`
          );

          return;
        }

        /*
          Your backend should return:

          {
            role: "team",
            teamId: "..."
          }
        */

        if (
          !data.teamId
        ) {
          setTeamError(
            "Login succeeded, but no team account was returned."
          );

          return;
        }

        setLoggedInTeamId(
          String(
            data.teamId
          )
        );

        setTeamPage(
          "dashboard"
        );

        setTeamLoggedIn(
          true
        );

        setLoginType(
          null
        );

      } catch (error) {
        console.error(
          "Team login error:",
          error
        );

        setTeamError(
          `Unable to connect to the server: ${error.message}`
        );

      } finally {
        setTeamLoading(
          false
        );
      }
    };


  /* =========================================================
     ADMIN LOGOUT
  ========================================================= */

  const handleAdminLogout =
    () => {
      setAdminLoggedIn(
        false
      );

      setAdminUsername(
        ""
      );

      setAdminPassword(
        ""
      );

      setAdminError(
        ""
      );

      setLoginType(
        null
      );
    };


  /* =========================================================
     TEAM LOGOUT
  ========================================================= */

  const handleTeamLogout =
    () => {
      setTeamLoggedIn(
        false
      );

      setLoggedInTeamId(
        ""
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

      setTeamPage(
        "dashboard"
      );

      setLoginType(
        null
      );
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
     PRESENTATION PORTAL
  ========================================================= */

  if (
    loginType ===
    "presentation"
  ) {
    return (
      <Presentation />
    );
  }


  /* =========================================================
     TEAM PORTAL
  ========================================================= */

  if (teamLoggedIn) {
    return (
      <div className="team-portal">
        {/* ===================================================
            TOP NAVIGATION
        =================================================== */}
        <header className="team-portal-nav">
          <div className="team-portal-brand">
            <strong>
              <span className="material-symbols-outlined">sports_soccer</span>
              Beyond XI
            </strong>
            <span>Team Portal</span>
          </div>

          <nav className="team-portal-menu">
            <button
              type="button"
              className={teamPage === "dashboard" ? "active" : ""}
              onClick={() => setTeamPage("dashboard")}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </button>

            <button
              type="button"
              className={teamPage === "best-xi" ? "active" : ""}
              onClick={() => setTeamPage("best-xi")}
            >
              <span className="material-symbols-outlined">groups</span>
              Best XI
            </button>

            <button
              type="button"
              className={teamPage === "trade" ? "active" : ""}
              onClick={() => setTeamPage("trade")}
            >
              <span className="material-symbols-outlined">swap_horiz</span>
              Trade
            </button>

            {/* Add Results Tab */}
            <button
              type="button"
              className={teamPage === "results" ? "active" : ""}
              onClick={() => setTeamPage("results")}
            >
              <span className="material-symbols-outlined">emoji_events</span>
              Results
            </button>
          </nav>
        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}
        <main className="team-portal-content">
          {teamPage === "dashboard" && (
            <TeamDashboard
              teamId={loggedInTeamId}
              onLogout={handleTeamLogout}
            />
          )}

          {teamPage === "best-xi" && (
            <BestXI
              teamId={loggedInTeamId}
            />
          )}

          {teamPage === "trade" && (
            <Trade
              teamId={loggedInTeamId}
            />
          )}
          {/* Render Results Page */}
          {teamPage === "results" && (
            <Results />
          )}
        </main>
      </div>
    );
  }

  /* =========================================================
     ADMIN LOGIN
  ========================================================= */

  if (loginType === "admin") {
    return (
      <div className="login-page">
        <div className="login-overlay">
          <div className="login-card">
            <h2>Admin Login</h2>
            <p className="login-subtitle">
              Access the auction control panel
            </p>

            <input
              type="text"
              placeholder="Admin Username"
              value={adminUsername}
              onChange={(event) => setAdminUsername(event.target.value)}
              autoFocus
              disabled={adminLoading}
            />

            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !adminLoading) {
                  handleAdminLogin();
                }
              }}
              disabled={adminLoading}
            />

            {adminError && (
              <p className="login-error">
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>warning</span>
                {adminError}
              </p>
            )}

            <button
              type="button"
              className="primary-button"
              onClick={handleAdminLogin}
              disabled={adminLoading}
            >
              {adminLoading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() => {
                setLoginType(null);
                setAdminUsername("");
                setAdminPassword("");
                setAdminError("");
              }}
              disabled={adminLoading}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     TEAM LOGIN
  ========================================================= */

  if (loginType === "team") {
    return (
      <div className="login-page">
        <div className="login-overlay">
          <div className="login-card">
            <h2>Team Login</h2>
            <p className="login-subtitle">
              Enter your team credentials
            </p>

            <input
              type="text"
              placeholder="Team Username"
              value={teamUsername}
              onChange={(event) => setTeamUsername(event.target.value)}
              autoFocus
              disabled={teamLoading}
            />

            <input
              type="password"
              placeholder="Password"
              value={teamPassword}
              onChange={(event) => setTeamPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !teamLoading) {
                  handleTeamLogin();
                }
              }}
              disabled={teamLoading}
            />

            {teamError && (
              <p className="login-error">
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>warning</span>
                {teamError}
              </p>
            )}

            <button
              type="button"
              className="primary-button"
              onClick={handleTeamLogin}
              disabled={teamLoading}
            >
              {teamLoading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() => {
                setLoginType(null);
                setTeamUsername("");
                setTeamPassword("");
                setTeamError("");
              }}
              disabled={teamLoading}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back
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
        {/* ===================================================
            BRAND
        =================================================== */}
        <div className="brand">
          <div className="brand-small">
            The Ultimate
          </div>
          <h1>
            Beyond <span>XI</span>
          </h1>
          <p>
            FIFA Football Auction
          </p>
        </div>

        {/* ===================================================
            LOGIN CARD
        =================================================== */}
        <div className="login-card">
          <h2>Welcome</h2>
          <p className="login-subtitle">
            Enter the auction arena
          </p>

          <div className="login-options">
            {/* =================================================
                PRESENTATION
            ================================================= */}
            <button
              type="button"
              className="login-option presentation"
              onClick={() => {
                setLoginType("presentation");
              }}
            >
              <div className="login-option-icon">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <div>
                <strong>Presentation</strong>
                <small>Display the live auction</small>
              </div>
            </button>

            {/* =================================================
                TEAM
            ================================================= */}
            <button
              type="button"
              className="login-option team"
              onClick={() => {
                setLoginType("team");
                setTeamError("");
              }}
            >
              <div className="login-option-icon">
                <span className="material-symbols-outlined">shield</span>
              </div>
              <div>
                <strong>Team Login</strong>
                <small>Enter your team's auction portal</small>
              </div>
            </button>

            {/* =================================================
                ADMIN
            ================================================= */}
            <button
              type="button"
              className="login-option admin"
              onClick={() => {
                setLoginType("admin");
                setAdminError("");
              }}
            >
              <div className="login-option-icon">
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </div>
              <div>
                <strong>Admin Login</strong>
                <small>Manage and control the auction</small>
              </div>
            </button>
          </div>
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}
        <div className="footer-text">
          Beyond XI • FIFA Football Auction
        </div>
      </div>

    </div>
  );
}


export default App;
