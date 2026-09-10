import {
  useEffect,
  useState
} from "react";

const API_URL = import.meta.env.VITE_API_URL;

import { io } from "socket.io-client";

import "./TeamDashboard.css";

const socket = io(
  API_URL,
  {
    autoConnect: true
  }
);

function TeamDashboard({
  teamId,
  onLogout
}) {
  const [team, setTeam] =
    useState(null);

  const [auction, setAuction] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================================
     FETCH TEAM
  ========================================================= */

  const fetchTeam = async () => {
    if (!teamId) {
      setError(
        "Team account could not be identified."
      );

      setLoading(false);
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/admin/teams/${teamId}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load team details."
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
    } finally {
      setLoading(false);
    }
  };

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

      setAuction(
        data.auction ||
          data
      );
    } catch (err) {
      console.error(
        "Fetch auction error:",
        err
      );
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchTeam();
    fetchAuction();
  }, [teamId]);

  /* =========================================================
     SOCKET UPDATES
  ========================================================= */

  useEffect(() => {
    socket.emit(
      "joinAuction"
    );

    const handleAuctionUpdate =
      (updatedAuction) => {
        if (
          updatedAuction
        ) {
          setAuction(
            updatedAuction
          );
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
              String(
                item._id
              ) ===
              String(
                teamId
              )
          );

        if (updatedTeam) {
          setTeam(
            updatedTeam
          );
        }
      };

    const handlePlayersUpdate =
      () => {
        fetchTeam();
      };

    socket.on(
      "auction:update",
      handleAuctionUpdate
    );

    socket.on(
      "teams:update",
      handleTeamsUpdate
    );

    socket.on(
      "players:update",
      handlePlayersUpdate
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

      socket.off(
        "players:update",
        handlePlayersUpdate
      );
    };
  }, [teamId]);

  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  const formatMoney = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-US"
    );
  };

  /* =========================================================
     IMAGE URL
  ========================================================= */

  const getImageUrl = (
    image
  ) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      )
    ) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="team-dashboard">

        <div className="team-loading">
          Loading team dashboard...
        </div>

      </section>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  const squad =
    Array.isArray(
      team?.players
    )
      ? team.players
      : [];

  const purse =
    Number(
      team?.purse || 0
    );

  const totalSpent =
    squad.reduce(
      (
        total,
        player
      ) =>
        total +
        Number(
          player?.soldPrice || 0
        ),
      0
    );

  const goalkeeperCount =
    squad.filter(
      (player) =>
        player?.position ===
        "Goalkeeper"
    ).length;

  const defenderCount =
    squad.filter(
      (player) =>
        player?.position ===
        "Defender"
    ).length;

  const midfielderCount =
    squad.filter(
      (player) =>
        player?.position ===
        "Midfielder"
    ).length;

  const forwardCount =
    squad.filter(
      (player) =>
        player?.position ===
        "Forward"
    ).length;

  const currentPlayer =
    auction?.currentPlayer ||
    null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="team-dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="team-dashboard-header">

        <div className="team-identity">

          <div className="team-logo">

            {team?.club?.logo ? (

              <img
                src={getImageUrl(
                  team.club.logo
                )}
                alt={
                  team.club.name ||
                  "Club"
                }
              />

            ) : (

              <span>
                {(
                  team?.club?.name ||
                  "TEAM"
                )
                  .slice(
                    0,
                    2
                  )
                  .toUpperCase()}
              </span>

            )}

          </div>

          <div>

            <p className="team-label">
              TEAM DASHBOARD
            </p>

            <h1>
              {team?.club?.name ||
                "Your Team"}
            </h1>

            <span className="team-username">
              @{team?.username ||
                "team"}
            </span>

          </div>

        </div>

        <div className="team-header-actions">

          <div className="team-purse-card">

            <span>
              REMAINING PURSE
            </span>

            <strong>
              €
              {formatMoney(
                purse
              )}
            </strong>

          </div>

          <button
            className="team-logout-button"
            onClick={
              onLogout
            }
          >
            LOGOUT
          </button>

        </div>

      </header>

      {error && (
        <div className="team-error">
          {error}
        </div>
      )}

      {/* =====================================================
          AUCTION STATUS
      ===================================================== */}

      <section className="team-auction-status">

        <div>

          <p className="team-section-label">
            LIVE AUCTION
          </p>

          <h2>
            {auction?.status ||
              "Not Started"}
          </h2>

          <p className="team-auction-description">
            Player selection is being
            conducted manually by the admin.
          </p>

        </div>

        <div
          className={`team-auction-badge ${
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

      </section>

      {/* =====================================================
          CURRENT PLAYER - INFORMATION ONLY
      ===================================================== */}

      {currentPlayer && (
        <section className="team-current-player-section">

          <div className="team-section-label">
            CURRENT AUCTION PLAYER
          </div>

          <div className="team-current-player-card">

            <div className="team-current-player-image">

              {currentPlayer.image ? (

                <img
                  src={getImageUrl(
                    currentPlayer.image
                  )}
                  alt={
                    currentPlayer.name
                  }
                />

              ) : (

                <div className="team-no-image">
                  NO IMAGE
                </div>

              )}

            </div>

            <div className="team-current-player-info">

              <h2>
                {
                  currentPlayer.name
                }
              </h2>

              <div className="team-player-tags">

                <span>
                  {
                    currentPlayer.position ||
                    "Unknown"
                  }
                </span>

                <span>
                  {
                    currentPlayer.category ||
                    "—"
                  }
                </span>

                <span>
                  Rating{" "}
                  {
                    currentPlayer.rating ??
                    "—"
                  }
                </span>

                <span>
                  {
                    currentPlayer.nationality ||
                    "—"
                  }
                </span>

              </div>

              <div className="team-current-player-price">

                <div>

                  <span>
                    BASE PRICE
                  </span>

                  <strong>
                    €
                    {formatMoney(
                      currentPlayer.basePrice
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    STATUS
                  </span>

                  <strong>
                    Being auctioned
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          SQUAD SUMMARY
      ===================================================== */}

      <section className="team-squad-section">

        <div className="team-squad-header">

          <div>

            <p className="team-section-label">
              MY SQUAD
            </p>

            <h2>
              {squad.length}
              <span>
                {" / 15 Players"}
              </span>
            </h2>

            <p className="team-squad-subtitle">
              Your purchased players
            </p>

          </div>

          <div className="team-squad-finance">

            <div>

              <span>
                REMAINING PURSE
              </span>

              <strong>
                €
                {formatMoney(
                  purse
                )}
              </strong>

            </div>

            <div>

              <span>
                TOTAL SPENT
              </span>

              <strong>
                €
                {formatMoney(
                  totalSpent
                )}
              </strong>

            </div>

          </div>

        </div>

        {/* ===================================================
            POSITION SUMMARY
        =================================================== */}

        <div className="team-position-summary">

          <div className="position-summary-card">

            <span>
              GK
            </span>

            <strong>
              {goalkeeperCount}
            </strong>

            <small>
              Goalkeepers
            </small>

          </div>

          <div className="position-summary-card">

            <span>
              DEF
            </span>

            <strong>
              {defenderCount}
            </strong>

            <small>
              Defenders
            </small>

          </div>

          <div className="position-summary-card">

            <span>
              MID
            </span>

            <strong>
              {midfielderCount}
            </strong>

            <small>
              Midfielders
            </small>

          </div>

          <div className="position-summary-card">

            <span>
              FWD
            </span>

            <strong>
              {forwardCount}
            </strong>

            <small>
              Forwards
            </small>

          </div>

        </div>

        {/* ===================================================
            SQUAD PLAYERS
        =================================================== */}

        {squad.length ===
        0 ? (

          <div className="empty-team-squad">

            <div className="empty-squad-icon">
              ⚽
            </div>

            <h3>
              No players acquired yet
            </h3>

            <p>
              Players purchased during
              the auction will appear here.
            </p>

          </div>

        ) : (

          <div className="team-squad-grid">

            {squad.map(
              (
                player,
                index
              ) => (

                <article
                  className="team-squad-player-card"
                  key={
                    player?._id ||
                    index
                  }
                >

                  <div className="team-squad-player-image">

                    {player?.image ? (

                      <img
                        src={getImageUrl(
                          player.image
                        )}
                        alt={
                          player.name
                        }
                      />

                    ) : (

                      <div className="squad-placeholder-image">
                        ⚽
                      </div>

                    )}

                  </div>

                  <div className="team-squad-player-content">

                    <div className="team-squad-player-top">

                      <span className="player-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span className="player-position">
                        {
                          player?.position ||
                          "—"
                        }
                      </span>

                    </div>

                    <h3>
                      {
                        player?.name ||
                        "Unknown Player"
                      }
                    </h3>

                    <p>
                      {
                        player?.nationality ||
                        "Unknown"
                      }
                      {" • "}
                      Rating{" "}
                      {
                        player?.rating ??
                        "—"
                      }
                    </p>

                    <div className="team-squad-player-footer">

                      <div>

                        <span>
                          CATEGORY
                        </span>

                        <strong>
                          {
                            player?.category ||
                            "—"
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          BOUGHT FOR
                        </span>

                        <strong>
                          €
                          {formatMoney(
                            player?.soldPrice ||
                              0
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

      {/* =====================================================
          SQUAD FOOTER
      ===================================================== */}

      <section className="team-squad-footer">

        <div>

          <p className="team-section-label">
            SQUAD STATUS
          </p>

          <h3>
            {squad.length ===
            15
              ? "Squad Complete"
              : `${15 - squad.length} spots remaining`}
          </h3>

        </div>

        <div className="squad-progress">

          <div className="squad-progress-track">

            <div
              className="squad-progress-fill"
              style={{
                width: `${Math.min(
                  (squad.length /
                    15) *
                    100,
                  100
                )}%`
              }}
            />

          </div>

          <span>
            {squad.length} / 15
          </span>

        </div>

      </section>

    </section>
  );
}

export default TeamDashboard;