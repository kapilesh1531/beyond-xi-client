import {
  useEffect,
  useState
} from "react";
const API_URL = import.meta.env.VITE_API_URL;

import { io } from "socket.io-client";
import "./LiveAuction.css";

const socket = io(
  API_URL,
  {
    autoConnect: true
  }
);

function LiveAuction() {
  const [auction, setAuction] =
    useState(null);

  const [teams, setTeams] =
    useState([]);

  const [selectedTeamId, setSelectedTeamId] =
    useState("");

  const [finalBid, setFinalBid] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================================
     FETCH AUCTION
  ========================================================= */

  const fetchAuction = async () => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/auction`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load auction."
        );
      }

      /*
        Support both:
        { auction: {...} }
        and
        direct auction object.
      */

      setAuction(
        data.auction ||
          data
      );
    } catch (err) {
      console.error(
        "Fetch auction error:",
        err
      );

      setError(
        "Unable to load auction."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH TEAMS
  ========================================================= */

  const fetchTeams = async () => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/admin/teams`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load teams."
        );
      }

      setTeams(
        Array.isArray(data)
          ? data.filter(
              (team) =>
                team.isActive !==
                false
            )
          : []
      );
    } catch (err) {
      console.error(
        "Fetch teams error:",
        err
      );

      setError(
        "Unable to load teams."
      );
    }
  };

  /* =========================================================
     INITIAL LOAD + SOCKETS
  ========================================================= */

  useEffect(() => {
    fetchAuction();
    fetchTeams();

    socket.emit(
      "joinAuction"
    );

    const handleAuctionUpdate =
      (updatedAuction) => {
        setAuction(
          updatedAuction
        );

        setSelectedTeamId("");
        setFinalBid("");
      };

    const handleTeamsUpdate =
      (updatedTeams) => {
        if (
          Array.isArray(
            updatedTeams
          )
        ) {
          setTeams(
            updatedTeams.filter(
              (team) =>
                team.isActive !==
                false
            )
          );
        }
      };

    socket.on(
      "auction:update",
      handleAuctionUpdate
    );

    socket.on(
      "teams:update",
      handleTeamsUpdate
    );

    return () => {
      socket.off(
        "auction:update",
        handleAuctionUpdate
      );

      socket.off(
        "teams:update",
        handleTeamsUpdate
      );
    };
  }, []);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /* =========================================================
     START AUCTION
  ========================================================= */

  const startAuction = async () => {
    clearMessages();
    setActionLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auction/start`,
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
            "Unable to start auction."
        );

        return;
      }

      setAuction(
        data.auction ||
          data
      );

      setSelectedTeamId("");
      setFinalBid("");

      setMessage(
        "Auction started successfully."
      );
    } catch (err) {
      console.error(
        "Start auction error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     PAUSE AUCTION
  ========================================================= */

  const pauseAuction = async () => {
    clearMessages();
    setActionLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auction/pause`,
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
            "Failed to pause auction."
        );

        return;
      }

      setAuction(
        data.auction ||
          data
      );

      setMessage(
        "Auction paused."
      );
    } catch (err) {
      console.error(
        "Pause error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     RESUME AUCTION
  ========================================================= */

  const resumeAuction = async () => {
    clearMessages();
    setActionLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auction/resume`,
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
            "Failed to resume auction."
        );

        return;
      }

      setAuction(
        data.auction ||
          data
      );

      setMessage(
        "Auction resumed."
      );
    } catch (err) {
      console.error(
        "Resume error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     END AUCTION MANUALLY
  ========================================================= */

  const endAuction = async () => {
    clearMessages();

    const confirmed = window.confirm(
      "Are you sure you want to END the auction now? All teams that do not satisfy the squad rules will be directly eliminated."
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auction/end`,
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
            "Failed to end auction."
        );

        return;
      }

      setAuction(
        data.auction ||
          data
      );

      setSelectedTeamId("");
      setFinalBid("");

      setMessage(
        data.message ||
          "Auction ended successfully."
      );

      await fetchTeams();
    } catch (err) {
      console.error(
        "End auction error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     RECORD SOLD
  ========================================================= */

  const sellPlayer = async () => {
    clearMessages();

    if (!selectedTeamId) {
      setError(
        "Please select the winning team."
      );

      return;
    }

    const price =
      Number(
        String(finalBid).replace(/,/g, "")
      );

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError(
        "Please enter the final sale amount."
      );

      return;
    }

    const currentPlayer =
      auction?.currentPlayer;

    if (!currentPlayer) {
      setError(
        "No current player is available."
      );

      return;
    }

    const basePrice =
      Number(
        currentPlayer.basePrice ||
          0
      );

    if (
      price <
      basePrice
    ) {
      setError(
        "Final sale amount cannot be below the base price."
      );

      return;
    }

    const selectedTeam =
      teams.find(
        (team) =>
          String(
            team._id
          ) ===
          String(
            selectedTeamId
          )
      );

    if (!selectedTeam) {
      setError(
        "Winning team could not be found."
      );

      return;
    }

    const purse =
      Number(
        selectedTeam.purse ||
          0
      );

    if (
      price >
      purse
    ) {
      setError(
        "The selected team does not have enough purse."
      );

      return;
    }

    const currentSquadSize =
      Array.isArray(
        selectedTeam.players
      )
        ? selectedTeam.players.length
        : 0;

    if (
      currentSquadSize >= 15
    ) {
      setError(
        "This team already has a full squad of 15 players."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Record ${currentPlayer.name} as SOLD to ${
          selectedTeam.club?.name ||
          selectedTeam.username
        } for €${price.toLocaleString(
          "en-US"
        )}?`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auction/manual-sell`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                teamId:
                  selectedTeamId,

                finalPrice:
                  price
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to record sale."
        );

        return;
      }

      /*
        Backend returns the fresh auction
        after updating Player + Team.
      */

      setAuction(
        data.auction ||
          auction
      );

      setSelectedTeamId("");
      setFinalBid("");

      /*
        Refresh team data immediately.
        Socket update will also refresh it,
        but this guarantees the current
        page shows the new purse/squad.
      */

      await fetchTeams();

      setMessage(
        `${currentPlayer.name} sold successfully.`
      );
    } catch (err) {
      console.error(
        "Manual sell error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     MARK UNSOLD
  ========================================================= */

  const markUnsold = async () => {
    clearMessages();

    const currentPlayer =
      auction?.currentPlayer;

    const confirmed =
      window.confirm(
        `Mark ${
          currentPlayer?.name ||
          "this player"
        } as UNSOLD?`
      );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auction/unsold`,
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
            "Failed to mark player unsold."
        );

        return;
      }

      setAuction(
        data.auction ||
          auction
      );

      setSelectedTeamId("");
      setFinalBid("");

      setMessage(
        "Player marked UNSOLD."
      );
    } catch (err) {
      console.error(
        "Unsold error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     NEXT PLAYER
  ========================================================= */

  const nextPlayer = async () => {
    clearMessages();
    setActionLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auction/next`,
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
            "Failed to load next player."
        );

        return;
      }

      setAuction(
        data.auction ||
          data
      );

      setSelectedTeamId("");
      setFinalBid("");

      setMessage(
        data.message ||
          "Next player loaded."
      );
    } catch (err) {
      console.error(
        "Next player error:",
        err
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="live-auction-page">
        <div className="auction-loading">
          Loading auction...
        </div>
      </section>
    );
  }

  const currentPlayer =
    auction?.currentPlayer ||
    null;

  const basePrice =
    Number(
      currentPlayer?.basePrice ||
        0
    );

  const selectedTeam =
    teams.find(
      (team) =>
        String(
          team._id
        ) ===
        String(
          selectedTeamId
        )
    );

  const isLive =
    auction?.status ===
    "Live";

  const isPaused =
    auction?.status ===
    "Paused";

  const isCompleted =
    auction?.status ===
    "Completed";

  return (
    <section className="live-auction-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="auction-page-header">

        <div>

          <p className="section-label">
            MANUAL AUCTION CONTROL
          </p>

          <h1>
            Live Auction
          </h1>

        </div>

        <div
          className={`auction-status-badge ${
            auction?.status
              ?.toLowerCase()
              .replace(
                /\s+/g,
                "-"
              ) ||
            "not-started"
          }`}
        >
          {auction?.status ||
            "Not Started"}
        </div>

      </header>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {message && (
        <div className="auction-success">
          {message}
        </div>
      )}

      {error && (
        <div className="auction-error">
          {error}
        </div>
      )}

      {/* =====================================================
          START
      ===================================================== */}

      {(auction?.status ===
        "Not Started" ||
        !auction) && (
        <div className="auction-restart-panel">

          <div className="completed-auction-message">

            <strong>
              Auction ready to start.
            </strong>

            <span>
              Start the auction when everything
              is ready.
            </span>

          </div>

          <button
            className="auction-primary-button start-again-button"
            onClick={
              startAuction
            }
            disabled={
              actionLoading
            }
          >
            START AUCTION
          </button>

        </div>
      )}

      {/* =====================================================
          PAUSE / RESUME / END
      ===================================================== */}

      {isLive && (
        <div className="auction-control-bar">
          <button
            className="auction-secondary-button"
            onClick={
              pauseAuction
            }
            disabled={
              actionLoading
            }
          >
            PAUSE AUCTION
          </button>

          <button
            className="auction-danger-button"
            onClick={
              endAuction
            }
            disabled={
              actionLoading
            }
          >
            END AUCTION
          </button>
        </div>
      )}

      {/* =====================================================
          RESUME
      ===================================================== */}

      {isPaused && (
        <div className="auction-control-bar">
          <button
            className="auction-primary-button"
            onClick={
              resumeAuction
            }
            disabled={
              actionLoading
            }
          >
            RESUME AUCTION
          </button>

          <button
            className="auction-danger-button"
            onClick={
              endAuction
            }
            disabled={
              actionLoading
            }
          >
            END AUCTION
          </button>
        </div>
      )}

      {/* =====================================================
          COMPLETED
      ===================================================== */}

      {isCompleted ? (

        <div className="auction-empty">

          <div className="auction-empty-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>check_circle</span>
          </div>

          <h2>
            Auction Completed
          </h2>

          <p>
            Start a new auction when you
            are ready.
          </p>

        </div>

      ) : currentPlayer ? (

        <div className="auction-layout">

          {/* =================================================
              CURRENT PLAYER
          ================================================= */}

          <div className="current-player-card">

            <div className="auction-card-label">
              CURRENT PLAYER
            </div>

            <div className="player-display">

              <div className="auction-player-image">

                {currentPlayer.image ? (
                  <img
                    src={
                      currentPlayer.image.startsWith(
                        "http"
                      )
                        ? currentPlayer.image
                        : `${API_URL}${currentPlayer.image}`
                    }
                    alt={
                      currentPlayer.name
                    }
                  />
                ) : (
                  <div className="no-player-image">
                    NO IMAGE
                  </div>
                )}

              </div>

              <div className="auction-player-details">

                <h2>
                  {
                    currentPlayer.name
                  }
                </h2>

                <div className="player-meta">

                  <span>
                    {
                      currentPlayer.position
                    }
                  </span>

                  <span>
                    {
                      currentPlayer.category
                    }
                  </span>

                  <span>
                    Rating{" "}
                    {
                      currentPlayer.rating
                    }
                  </span>

                  <span>
                    {
                      currentPlayer.nationality
                    }
                  </span>

                </div>

                <div className="auction-price-grid">

                  <div>

                    <span>
                      BASE PRICE
                    </span>

                    <strong>
                      €
                      {basePrice.toLocaleString(
                        "en-US"
                      )}
                    </strong>

                  </div>

                </div>

                <div className="highest-bidder">

                  <span>
                    AUCTION STATUS
                  </span>

                  <strong>
                    Awaiting final result
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FINAL RESULT
          ================================================= */}

          <div className="auction-controls-card">

            <div className="auction-card-label">
              FINAL AUCTION RESULT
            </div>

            <p className="manual-auction-note">
              Select the winning team and enter the final sale amount.
            </p>

            <label className="manual-field-label">

              WINNING TEAM

              <select
                className="manual-select"
                value={
                  selectedTeamId
                }
                onChange={(event) => {
                  clearMessages();

                  setSelectedTeamId(
                    event.target.value
                  );
                }}
                disabled={
                  actionLoading ||
                  !isLive
                }
              >

                <option value="">
                  Select winning team
                </option>

                {teams.map(
                  (team) => (
                    <option
                      key={
                        team._id
                      }
                      value={
                        team._id
                      }
                    >
                      {team.club?.name ||
                        team.username}
                      {" — €"}
                      {Number(
                        team.purse ||
                          0
                      ).toLocaleString(
                        "en-US"
                      )}
                    </option>
                  )
                )}

              </select>

            </label>

            <label className="manual-field-label">

              FINAL SALE AMOUNT

              <div className="manual-price-input">

                <span>
                  €
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    finalBid
                  }
                  placeholder="e.g. 10,000,000"
                  onChange={(event) => {
                    clearMessages();

                    const raw = event.target.value.replace(/[^0-9]/g, "");
                    if (!raw) {
                      setFinalBid("");
                      return;
                    }

                    const formatted = Number(raw).toLocaleString("en-US");
                    setFinalBid(formatted);
                  }}
                  disabled={
                    actionLoading ||
                    !isLive
                  }
                />

              </div>

            </label>

            {selectedTeam && (
              <div className="selected-team-info">

                <span>
                  REMAINING TEAM PURSE
                </span>

                <strong>
                  €
                  {Number(
                    selectedTeam.purse ||
                      0
                  ).toLocaleString(
                    "en-US"
                  )}
                </strong>

              </div>
            )}

            <button
              className="sell-button"
              onClick={
                sellPlayer
              }
              disabled={
                actionLoading ||
                !isLive ||
                !selectedTeamId ||
                !finalBid
              }
            >
              {actionLoading
                ? "RECORDING..."
                : "RECORD SOLD"}
            </button>

            <button
              className="unsold-button"
              onClick={
                markUnsold
              }
              disabled={
                actionLoading ||
                !isLive
              }
            >
              MARK UNSOLD
            </button>

            <button
              className="next-player-button"
              onClick={
                nextPlayer
              }
              disabled={
                actionLoading ||
                !isLive
              }
            >
              NEXT PLAYER
            </button>

            <button
              className="end-auction-button"
              onClick={
                endAuction
              }
              disabled={
                actionLoading
              }
            >
              END AUCTION
            </button>

            <div className="auction-position">

              <span>
                AUCTION POSITION
              </span>

              <strong>
                {Number(
                  auction?.currentPlayerIndex ??
                    0
                ) + 1}
                {" / "}
                {auction?.playerPool
                  ?.length || 0}
              </strong>

            </div>

          </div>

        </div>

      ) : (

        <div className="auction-empty">

          <div className="auction-empty-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>sports_soccer</span>
          </div>

          <h2>
            Auction Not Started
          </h2>

          <p>
            Start the auction to display
            the first player.
          </p>

        </div>

      )}

    </section>
  );
}

export default LiveAuction;