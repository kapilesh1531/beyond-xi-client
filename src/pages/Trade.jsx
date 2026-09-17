import {
  useEffect,
  useMemo,
  useState
} from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://beyond-xi-server-production.up.railway.app";;

import { io } from "socket.io-client";

import "./Trade.css";

const socket = io(
  API_URL,
  {
    autoConnect: true
  }
);

function Trade({ teamId }) {
  const [team, setTeam] = useState(null);

  const [tradeStatus, setTradeStatus] =
    useState({
      status: "Closed",
      durationMinutes: 10,
      openedAt: null,
      endsAt: null,
      closedAt: null
    });

  const [teams, setTeams] = useState([]);

  const [requests, setRequests] =
    useState([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState("");

  const [offeredPlayerId, setOfferedPlayerId] =
    useState("");

  const [requestedPlayerId, setRequestedPlayerId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [now, setNow] =
    useState(Date.now());

  /* =========================================================
     CLEAR MESSAGES
  ========================================================= */

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /* =========================================================
     FETCH TEAM
  ========================================================= */

  const fetchTeam = async () => {
    if (!teamId) {
      setError(
        "Team account could not be identified."
      );

      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/teams/${teamId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load team."
        );
      }

      setTeam(data);
    } catch (err) {
      console.error(
        "Fetch team error:",
        err
      );

      setError(
        err.message ||
          "Unable to load team details."
      );
    }
  };

  /* =========================================================
     FETCH TRADE STATUS
  ========================================================= */

  const fetchTradeStatus = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/trade/status`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load trade status."
        );
      }

      setTradeStatus(data);
    } catch (err) {
      console.error(
        "Fetch trade status error:",
        err
      );
    }
  };

  /* =========================================================
     FETCH TEAMS
  ========================================================= */

  const fetchTeams = async () => {
    if (!teamId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/trade/teams/${teamId}/options`
      );

      const data = await response.json();

      if (!response.ok) {
        setTeams([]);
        return;
      }

      setTeams(
        Array.isArray(data.teams)
          ? data.teams
          : []
      );
    } catch (err) {
      console.error(
        "Fetch trade teams error:",
        err
      );

      setTeams([]);
    }
  };

  /* =========================================================
     FETCH REQUESTS
  ========================================================= */

  const fetchRequests = async () => {
    if (!teamId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/trade/requests/${teamId}`
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setRequests(
        Array.isArray(data.requests)
          ? data.requests
          : []
      );
    } catch (err) {
      console.error(
        "Fetch trade requests error:",
        err
      );
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchTeam(),
        fetchTradeStatus(),
        fetchRequests()
      ]);

      setLoading(false);
    };

    loadData();
  }, [teamId]);

  /* =========================================================
     CLOCK / STATUS POLLING
  ========================================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());

      fetchTradeStatus();
      fetchRequests();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [teamId]);

  /* =========================================================
     FETCH OTHER TEAMS WHEN TRADE OPENS
  ========================================================= */

  useEffect(() => {
    if (
      tradeStatus.status === "Open"
    ) {
      fetchTeams();
    } else {
      setTeams([]);
    }
  }, [
    tradeStatus.status,
    teamId
  ]);

  /* =========================================================
     SOCKET.IO
  ========================================================= */

  useEffect(() => {
    socket.emit("joinAuction");

    const handleTradeUpdate =
      (data) => {
        if (!data) {
          return;
        }

        setTradeStatus(
          (current) => ({
            ...current,
            ...data
          })
        );

        fetchRequests();

        if (
          data.status === "Open"
        ) {
          fetchTeams();
        }
      };

    const handleTeamsUpdate =
      (updatedTeams) => {
        if (
          !Array.isArray(
            updatedTeams
          )
        ) {
          return;
        }

        const updatedTeam =
          updatedTeams.find(
            (item) =>
              String(item._id) ===
              String(teamId)
          );

        if (updatedTeam) {
          setTeam(
            updatedTeam
          );
        }

        fetchRequests();

        if (
          tradeStatus.status ===
          "Open"
        ) {
          fetchTeams();
        }
      };

    const handleTradeRequestsUpdate =
      () => {
        fetchRequests();

        if (
          tradeStatus.status ===
          "Open"
        ) {
          fetchTeams();
        }
      };

    socket.on(
      "trade:update",
      handleTradeUpdate
    );

    socket.on(
      "teams:update",
      handleTeamsUpdate
    );

    socket.on(
      "trade:requests:update",
      handleTradeRequestsUpdate
    );

    return () => {
      socket.off(
        "trade:update",
        handleTradeUpdate
      );

      socket.off(
        "teams:update",
        handleTeamsUpdate
      );

      socket.off(
        "trade:requests:update",
        handleTradeRequestsUpdate
      );
    };
  }, [
    teamId,
    tradeStatus.status
  ]);

  /* =========================================================
     TEAM DATA
  ========================================================= */

  const squad =
    Array.isArray(
      team?.players
    )
      ? team.players
      : [];

  const currentPurse =
    Number(
      team?.purse || 0
    );

  const selectedTeam =
    teams.find(
      (item) =>
        String(
          item._id
        ) ===
        String(
          selectedTeamId
        )
    );

  const offeredPlayer =
    squad.find(
      (player) =>
        String(
          player._id
        ) ===
        String(
          offeredPlayerId
        )
    );

  const requestedPlayer =
    selectedTeam?.players?.find(
      (player) =>
        String(
          player._id
        ) ===
        String(
          requestedPlayerId
        )
    );

  /* =========================================================
     TRADE VALUE CALCULATION
  =========================================================

     IMPORTANT:

     We use soldPrice from the auction.

     Example:

     You give 15M
     You receive 20M

     Difference = +5M
     You pay 5M

     You give 20M
     You receive 15M

     Difference = -5M
     You receive 5M
  ========================================================= */

  const offeredValue =
    Number(
      offeredPlayer?.soldPrice ??
        offeredPlayer?.basePrice ??
        0
    );

  const requestedValue =
    Number(
      requestedPlayer?.soldPrice ??
        requestedPlayer?.basePrice ??
        0
    );

  const purseDifference =
    requestedValue -
    offeredValue;

  const amountToPay =
    Math.max(
      0,
      purseDifference
    );

  const amountToReceive =
    Math.max(
      0,
      -purseDifference
    );

  const purseAfterTrade =
    currentPurse -
    amountToPay +
    amountToReceive;

  const hasEnoughPurse =
    currentPurse >=
    amountToPay;

  /* =========================================================
     REQUEST ARRAYS
  ========================================================= */

  const incomingRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            String(
              request.toTeam?._id ||
                request.toTeam
            ) ===
              String(teamId) &&
            request.status ===
              "Pending"
        ),
      [
        requests,
        teamId
      ]
    );

  const outgoingRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            String(
              request.fromTeam?._id ||
                request.fromTeam
            ) ===
              String(teamId) &&
            request.status ===
              "Pending"
        ),
      [
        requests,
        teamId
      ]
    );

  /* =========================================================
     TIMER
  ========================================================= */

  const remainingMilliseconds =
    tradeStatus.endsAt
      ? Math.max(
          0,
          new Date(
            tradeStatus.endsAt
          ).getTime() -
            now
        )
      : 0;

  const totalSeconds =
    Math.floor(
      remainingMilliseconds /
        1000
    );

  const minutes =
    Math.floor(
      totalSeconds /
        60
    );

  const seconds =
    totalSeconds %
    60;

  const timerText =
    `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;

  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  const formatMoney =
    (value) =>
      `€${Number(
        value || 0
      ).toLocaleString(
        "en-US"
      )}`;

  /* =========================================================
     RESET TRADE SELECTION
  ========================================================= */

  const resetTradeSelection =
    () => {
      setSelectedTeamId("");
      setOfferedPlayerId("");
      setRequestedPlayerId("");
    };

  /* =========================================================
     SEND TRADE REQUEST
  ========================================================= */

  const sendTradeRequest =
    async () => {
      clearMessages();

      if (
        tradeStatus.status !==
        "Open"
      ) {
        setError(
          "Trade window is closed."
        );

        return;
      }

      if (
        !offeredPlayerId ||
        !selectedTeamId ||
        !requestedPlayerId
      ) {
        setError(
          "Select your player, the other team, and the requested player."
        );

        return;
      }

      /*
        Do one frontend purse check
        before sending.
      */

      if (
        !hasEnoughPurse
      ) {
        setError(
          `You need ${formatMoney(
            amountToPay
          )} for the trade difference, but your remaining purse is only ${formatMoney(
            currentPurse
          )}.`
        );

        return;
      }

      setActionLoading(
        true
      );

      try {
        const response =
          await fetch(
            `${API_URL}/api/trade/request`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  fromTeamId:
                    teamId,

                  toTeamId:
                    selectedTeamId,

                  offeredPlayerId:
                    offeredPlayerId,

                  requestedPlayerId:
                    requestedPlayerId
                })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to send trade request."
          );

          return;
        }

        setMessage(
          amountToPay > 0
            ? `Trade request sent. If accepted, you will pay ${formatMoney(
                amountToPay
              )}.`
            : amountToReceive > 0
            ? `Trade request sent. If accepted, you will receive ${formatMoney(
                amountToReceive
              )}.`
            : "Trade request sent. No purse adjustment is required."
        );

        resetTradeSelection();

        await fetchRequests();
      } catch (err) {
        console.error(
          "Send trade error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =========================================================
     ACCEPT TRADE
  ========================================================= */

  const acceptTrade =
    async (requestId) => {
      clearMessages();

      if (
        tradeStatus.status !==
        "Open"
      ) {
        setError(
          "Trade window is closed."
        );

        return;
      }

      setActionLoading(
        true
      );

      try {
        const response =
          await fetch(
            `${API_URL}/api/trade/request/${requestId}/accept`,
            {
              method:
                "POST"
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to accept trade."
          );

          return;
        }

        const difference =
          Number(
            data.trade
              ?.purseDifference ||
              0
          );

        const payer =
          data.trade?.payer;

        let resultMessage =
          "Trade completed successfully.";

        if (
          difference > 0
        ) {
          if (
            String(payer) ===
            String(teamId)
          ) {
            resultMessage =
              `Trade completed. You paid ${formatMoney(
                difference
              )}.`;
          } else {
            resultMessage =
              `Trade completed. You received ${formatMoney(
                difference
              )}.`;
          }
        }

        setMessage(
          resultMessage
        );

        await fetchTeam();
        await fetchRequests();
        await fetchTeams();
      } catch (err) {
        console.error(
          "Accept trade error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =========================================================
     REJECT
  ========================================================= */

  const rejectTrade =
    async (requestId) => {
      clearMessages();

      try {
        const response =
          await fetch(
            `${API_URL}/api/trade/request/${requestId}/reject`,
            {
              method:
                "POST"
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to reject trade."
          );

          return;
        }

        setMessage(
          "Trade request rejected."
        );

        await fetchRequests();
      } catch (err) {
        console.error(
          "Reject trade error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelTrade =
    async (requestId) => {
      clearMessages();

      try {
        const response =
          await fetch(
            `${API_URL}/api/trade/request/${requestId}/cancel`,
            {
              method:
                "POST"
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to cancel trade."
          );

          return;
        }

        setMessage(
          "Trade request cancelled."
        );

        await fetchRequests();
      } catch (err) {
        console.error(
          "Cancel trade error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="trade-page">

        <div className="trade-loading">
          Loading trade market...
        </div>

      </section>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="trade-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="trade-header">

        <div>

          <p className="trade-label">
            TEAM MARKET
          </p>

          <h1>
            Trade
          </h1>

          <p className="trade-subtitle">
            Exchange players with other teams
            during the official trade window.
          </p>

        </div>

        <div
          className={`trade-status ${
            tradeStatus.status.toLowerCase()
          }`}
        >
          {tradeStatus.status}
        </div>

      </header>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {message && (
        <div className="trade-success">
          {message}
        </div>
      )}

      {error && (
        <div className="trade-error">
          {error}
        </div>
      )}

      {/* =====================================================
          TRADE WINDOW
      ===================================================== */}

      <section className="trade-window-card">

        <div>

          <p className="trade-label">
            TRADE WINDOW
          </p>

          <h2>
            {tradeStatus.status ===
            "Open"
              ? "Trading is live"
              : tradeStatus.status ===
                "Ended"
              ? "Trading has ended"
              : "Trading is closed"}
          </h2>

        </div>

        {tradeStatus.status ===
          "Open" && (

          <div className="trade-countdown">

            <span>
              TIME REMAINING
            </span>

            <strong>
              {timerText}
            </strong>

          </div>

        )}

      </section>

      {/* =====================================================
          TRADE BUILDER
      ===================================================== */}

      {tradeStatus.status ===
      "Open" ? (

        <section className="trade-builder">

          <div className="trade-builder-header">

            <div>

              <p className="trade-label">
                PROPOSE TRADE
              </p>

              <h2>
                Player Swap
              </h2>

            </div>

            <span>
              PLAYER ↔ PLAYER
            </span>

          </div>

          <div className="trade-builder-grid">

            {/* YOUR PLAYER */}

            <div className="trade-builder-column">

              <label>
                YOUR PLAYER
              </label>

              <select
                value={
                  offeredPlayerId
                }
                onChange={(event) =>
                  setOfferedPlayerId(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select your player
                </option>

                {squad.map(
                  (player) => (
                    <option
                      key={
                        player._id
                      }
                      value={
                        player._id
                      }
                    >
                      {
                        player.name
                      }
                      {" — "}
                      {
                        player.position ||
                        "Unknown"
                      }
                      {" — "}
                      {formatMoney(
                        player.soldPrice ??
                          player.basePrice ??
                          0
                      )}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="trade-arrow">
              ⇄
            </div>

            {/* OTHER TEAM */}

            <div className="trade-builder-column">

              <label>
                TRADE WITH
              </label>

              <select
                value={
                  selectedTeamId
                }
                onChange={(event) => {

                  setSelectedTeamId(
                    event.target.value
                  );

                  setRequestedPlayerId(
                    ""
                  );

                }}
              >

                <option value="">
                  Select team
                </option>

                {teams.map(
                  (otherTeam) => (
                    <option
                      key={
                        otherTeam._id
                      }
                      value={
                        otherTeam._id
                      }
                    >
                      {
                        otherTeam.club?.name ||
                        otherTeam.username ||
                        "Team"
                      }
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* =================================================
              REQUESTED PLAYER
          ================================================= */}

          <div className="trade-request-player">

            <label>
              PLAYER YOU WANT
            </label>

            <select
              value={
                requestedPlayerId
              }
              disabled={
                !selectedTeam
              }
              onChange={(event) =>
                setRequestedPlayerId(
                  event.target.value
                )
              }
            >

              <option value="">
                {selectedTeam
                  ? "Select their player"
                  : "Select a team first"}
              </option>

              {selectedTeam?.players?.map(
                (player) => (
                  <option
                    key={
                      player._id
                    }
                    value={
                      player._id
                    }
                  >
                    {
                      player.name
                    }
                    {" — "}
                    {
                      player.position ||
                      "Unknown"
                    }
                    {" — "}
                    {formatMoney(
                      player.soldPrice ??
                        player.basePrice ??
                        0
                    )}
                  </option>
                )
              )}

            </select>

          </div>

          {/* =================================================
              PURSE PREVIEW
          ================================================= */}

          {offeredPlayer &&
            requestedPlayer && (

            <div className="trade-value-preview">

              <div className="trade-value-header">

                <div>

                  <p className="trade-label">
                    TRADE VALUE
                  </p>

                  <h3>
                    Purse Impact
                  </h3>

                </div>

                <span>
                  AUCTION VALUES
                </span>

              </div>

              <div className="trade-value-grid">

                {/* OFFER */}

                <div className="trade-value-box">

                  <span>
                    YOU OFFER
                  </span>

                  <strong>
                    {
                      offeredPlayer.name
                    }
                  </strong>

                  <small>
                    Auction Value
                  </small>

                  <b>
                    {formatMoney(
                      offeredValue
                    )}
                  </b>

                </div>

                {/* ARROW */}

                <div className="trade-value-arrow">
                  ⇄
                </div>

                {/* RECEIVE */}

                <div className="trade-value-box">

                  <span>
                    YOU RECEIVE
                  </span>

                  <strong>
                    {
                      requestedPlayer.name
                    }
                  </strong>

                  <small>
                    Auction Value
                  </small>

                  <b>
                    {formatMoney(
                      requestedValue
                    )}
                  </b>

                </div>

              </div>

              {/* DIFFERENCE */}

              <div
                className={`trade-difference ${
                  amountToPay > 0
                    ? "pay"
                    : amountToReceive > 0
                    ? "receive"
                    : "equal"
                }`}
              >

                <div>

                  <span>
                    TRADE DIFFERENCE
                  </span>

                  <strong>

                    {amountToPay > 0
                      ? `YOU PAY ${formatMoney(
                          amountToPay
                        )}`
                      : amountToReceive > 0
                      ? `YOU RECEIVE ${formatMoney(
                          amountToReceive
                        )}`
                      : "NO PURSE ADJUSTMENT"}

                  </strong>

                </div>

              </div>

              {/* PURSE */}

              <div className="purse-preview-grid">

                <div>

                  <span>
                    CURRENT PURSE
                  </span>

                  <strong>
                    {formatMoney(
                      currentPurse
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    PURSE AFTER TRADE
                  </span>

                  <strong
                    className={
                      !hasEnoughPurse
                        ? "insufficient"
                        : ""
                    }
                  >
                    {formatMoney(
                      purseAfterTrade
                    )}
                  </strong>

                </div>

              </div>

              {!hasEnoughPurse && (
                <div className="trade-insufficient">

                  <strong>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px", marginRight: "4px" }}>warning</span>
                    Insufficient purse
                  </strong>

                  <span>
                    You need{" "}
                    {formatMoney(
                      amountToPay
                    )}{" "}
                    for this trade difference.
                  </span>

                </div>
              )}

            </div>

          )}

          {/* =================================================
              SEND
          ================================================= */}

          <button
            type="button"
            className="send-trade-button"
            onClick={
              sendTradeRequest
            }
            disabled={
              actionLoading ||
              !offeredPlayerId ||
              !selectedTeamId ||
              !requestedPlayerId ||
              !hasEnoughPurse
            }
          >
            {actionLoading
              ? "SENDING..."
              : "SEND TRADE REQUEST"}
          </button>

        </section>

      ) : (

        <section className="trade-closed-card">

          <div className="trade-closed-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>
              {tradeStatus.status === "Ended" ? "check_circle" : "lock"}
            </span>
          </div>

          <h2>
            {tradeStatus.status ===
            "Ended"
              ? "Trade Window Ended"
              : "Trade Window Closed"}
          </h2>

          <p>
            {tradeStatus.status ===
            "Ended"
              ? "Trading is finished. You can now finalize your Best XI."
              : "The administrator has not opened the trade window yet."}
          </p>

        </section>

      )}

      {/* =====================================================
          INCOMING REQUESTS
      ===================================================== */}

      <section className="trade-requests-section">

        <div className="trade-section-heading">

          <div>

            <p className="trade-label">
              INCOMING
            </p>

            <h2>
              Trade Requests
            </h2>

          </div>

          <span>
            {incomingRequests.length}
          </span>

        </div>

        {incomingRequests.length ===
        0 ? (

          <div className="trade-empty">
            No pending incoming requests.
          </div>

        ) : (

          <div className="trade-request-list">

            {incomingRequests.map(
              (request) => (

                <div
                  className="trade-request-card"
                  key={
                    request._id
                  }
                >

                  <div className="trade-request-main">

                    <p className="request-team-label">
                      FROM
                    </p>

                    <strong>
                      {
                        request
                          .fromTeam
                          ?.club
                          ?.name ||
                        request
                          .fromTeam
                          ?.username ||
                        "Team"
                      }
                    </strong>

                    <div className="trade-swap-display">

                      <div>

                        <span>
                          OFFERING
                        </span>

                        <b>
                          {
                            request
                              .offeredPlayer
                              ?.name
                          }
                        </b>

                        <small>
                          {formatMoney(
                            request
                              .offeredPlayer
                              ?.soldPrice ||
                              0
                          )}
                        </small>

                      </div>

                      <i>
                        ⇄
                      </i>

                      <div>

                        <span>
                          REQUESTING
                        </span>

                        <b>
                          {
                            request
                              .requestedPlayer
                              ?.name
                          }
                        </b>

                        <small>
                          {formatMoney(
                            request
                              .requestedPlayer
                              ?.soldPrice ||
                              0
                          )}
                        </small>

                      </div>

                    </div>

                  </div>

                  <div className="trade-request-actions">

                    <button
                      type="button"
                      className="accept-trade-button"
                      onClick={() =>
                        acceptTrade(
                          request._id
                        )
                      }
                      disabled={
                        actionLoading ||
                        tradeStatus.status !==
                          "Open"
                      }
                    >
                      ACCEPT
                    </button>

                    <button
                      type="button"
                      className="reject-trade-button"
                      onClick={() =>
                        rejectTrade(
                          request._id
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      REJECT
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* =====================================================
          OUTGOING REQUESTS
      ===================================================== */}

      <section className="trade-requests-section">

        <div className="trade-section-heading">

          <div>

            <p className="trade-label">
              OUTGOING
            </p>

            <h2>
              Your Requests
            </h2>

          </div>

          <span>
            {outgoingRequests.length}
          </span>

        </div>

        {outgoingRequests.length ===
        0 ? (

          <div className="trade-empty">
            No pending outgoing requests.
          </div>

        ) : (

          <div className="trade-request-list">

            {outgoingRequests.map(
              (request) => (

                <div
                  className="trade-request-card"
                  key={
                    request._id
                  }
                >

                  <div className="trade-request-main">

                    <p className="request-team-label">
                      TO
                    </p>

                    <strong>
                      {
                        request
                          .toTeam
                          ?.club
                          ?.name ||
                        request
                          .toTeam
                          ?.username ||
                        "Team"
                      }
                    </strong>

                    <div className="trade-swap-display">

                      <div>

                        <span>
                          YOU OFFER
                        </span>

                        <b>
                          {
                            request
                              .offeredPlayer
                              ?.name
                          }
                        </b>

                        <small>
                          {formatMoney(
                            request
                              .offeredPlayer
                              ?.soldPrice ||
                              0
                          )}
                        </small>

                      </div>

                      <i>
                        ⇄
                      </i>

                      <div>

                        <span>
                          YOU WANT
                        </span>

                        <b>
                          {
                            request
                              .requestedPlayer
                              ?.name
                          }
                        </b>

                        <small>
                          {formatMoney(
                            request
                              .requestedPlayer
                              ?.soldPrice ||
                              0
                          )}
                        </small>

                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="cancel-trade-button"
                    onClick={() =>
                      cancelTrade(
                        request._id
                      )
                    }
                    disabled={
                      actionLoading ||
                      tradeStatus.status !==
                        "Open"
                    }
                  >
                    CANCEL
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </section>
  );
}

export default Trade;
