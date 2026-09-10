import {
  useEffect,
  useState
} from "react";

const API_URL = import.meta.env.VITE_API_URL;

import "./Results.css";

function formatMoney(value) {
  const amount =
    Number(value || 0);

  if (amount >= 1000000) {
    return `€${(
      amount / 1000000
    ).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `€${(
      amount / 1000
    ).toFixed(0)}K`;
  }

  return `€${amount.toLocaleString(
    "en-US"
  )}`;
}

function formatFullMoney(value) {
  return `€${Number(
    value || 0
  ).toLocaleString(
    "en-US"
  )}`;
}

function Results() {
  const [data, setData] =
    useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    selectedResult,
    setSelectedResult
  ] = useState(null);

  const fetchResults =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/api/results`
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load results."
          );
        }

        setData(result);
      } catch (err) {
        console.error(
          "Results fetch error:",
          err
        );

        setError(
          err.message ||
            "Unable to load final results."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="results-page">
        <div className="results-loading">
          <div className="results-spinner">
            ⚽
          </div>

          <p>
            CALCULATING FINAL RESULTS...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-page">
        <div className="results-error-card">
          <p className="results-label">
            FINAL RESULTS
          </p>

          <h1>
            Results Unavailable
          </h1>

          <p>
            {error}
          </p>

          <button
            className="results-retry-button"
            onClick={
              fetchResults
            }
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  if (
    !data?.ready
  ) {
    return (
      <div className="results-page">
        <header className="results-header">
          <div>
            <p className="results-label">
              FINAL RESULTS
            </p>

            <h1>
              Results
            </h1>
          </div>
        </header>

        <section className="results-waiting-card">
          <div className="results-waiting-icon">
            ⏳
          </div>

          <h2>
            Results Are Not Ready
          </h2>

          <p>
            {data?.message ||
              "Complete the auction and final Best XI submissions first."}
          </p>
        </section>
      </div>
    );
  }

  const results =
    Array.isArray(
      data.results
    )
      ? data.results
      : [];

  const eligibleResults =
    results.filter(
      (item) =>
        item.eligible
    );

  const eliminatedResults =
    results.filter(
      (item) =>
        !item.eligible
    );

  return (
    <div className="results-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="results-header">
        <div>
          <p className="results-label">
            FINAL RESULTS
          </p>

          <h1>
            Beyond XI
          </h1>

          <p className="results-subtitle">
            Championship standings
          </p>
        </div>

        {data.champion && (
          <div className="champion-badge">
            <span>
              CHAMPION
            </span>

            <strong>
              {data.champion.teamName}
            </strong>

            <b>
              {Number(
                data.champion.points
              ).toFixed(2)}{" "}
              POINTS
            </b>
          </div>
        )}
      </header>

      {/* =====================================================
          QUICK SUMMARY
      ===================================================== */}

      <section className="results-summary-grid">
        <div className="results-summary-card">
          <span>
            TEAMS
          </span>

          <strong>
            {results.length}
          </strong>
        </div>

        <div className="results-summary-card">
          <span>
            ELIGIBLE
          </span>

          <strong>
            {
              eligibleResults.length
            }
          </strong>
        </div>

        <div className="results-summary-card">
          <span>
            ELIMINATED
          </span>

          <strong>
            {
              eliminatedResults.length
            }
          </strong>
        </div>
      </section>

      {/* =====================================================
          STANDINGS
      ===================================================== */}

      <section className="results-card">
        <div className="results-card-header">
          <div>
            <p className="results-label">
              CHAMPIONSHIP STANDINGS
            </p>

            <h2>
              Final Table
            </h2>
          </div>

          <span className="results-count">
            {eligibleResults.length}{" "}
            Eligible
          </span>
        </div>

        <div className="results-list">
          {results.map(
            (result) => (
              <div
                key={
                  result.teamId
                }
                className={`result-row ${
                  result.rank ===
                  1
                    ? "winner-row"
                    : ""
                } ${
                  !result.eligible
                    ? "eliminated-row"
                    : ""
                }`}
              >
                {/* Rank */}

                <div className="result-rank">
                  {result.rank ===
                  1 ? (
                    <span className="gold-trophy">
                      🏆
                    </span>
                  ) : result.rank ? (
                    <span>
                      {result.rank}
                    </span>
                  ) : (
                    <span className="eliminated-mark">
                      —
                    </span>
                  )}
                </div>

                {/* Team */}

                <div className="result-team-info">
                  <strong>
                    {result.teamName}
                  </strong>

                  <span>
                    {result.status}
                  </span>
                </div>

                {/* Points */}

                <div className="result-points">
                  {result.eligible ? (
                    <>
                      <strong>
                        {Number(
                          result.points
                        ).toFixed(
                          2
                        )}
                      </strong>

                      <span>
                        POINTS
                      </span>
                    </>
                  ) : (
                    <strong className="eliminated-text">
                      ELIMINATED
                    </strong>
                  )}
                </div>

                {/* Details */}

                <button
                  className="view-details-button"
                  onClick={() =>
                    setSelectedResult(
                      result
                    )
                  }
                >
                  VIEW DETAILS
                </button>
              </div>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          SCORING LEGEND
      ===================================================== */}

      <section className="scoring-card">
        <div>
          <p className="results-label">
            SCORING SYSTEM
          </p>

          <h2>
            Evaluation Criteria
          </h2>
        </div>

        <div className="scoring-grid">
          <div>
            <span>
              Squad Strength
            </span>

            <strong>
              30%
            </strong>
          </div>

          <div>
            <span>
              Squad Balance
            </span>

            <strong>
              20%
            </strong>
          </div>

          <div>
            <span>
              Value for Money
            </span>

            <strong>
              20%
            </strong>
          </div>

          <div>
            <span>
              Tactical Compatibility
            </span>

            <strong>
              15%
            </strong>
          </div>

          <div>
            <span>
              Rule Compliance
            </span>

            <strong>
              15%
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedResult && (
        <div
          className="result-modal-overlay"
          onClick={() =>
            setSelectedResult(
              null
            )
          }
        >
          <div
            className="result-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="result-modal-header">
              <div>
                <p className="results-label">
                  TEAM ANALYSIS
                </p>

                <h2>
                  {
                    selectedResult.teamName
                  }
                </h2>
              </div>

              <button
                className="result-modal-close"
                onClick={() =>
                  setSelectedResult(
                    null
                  )
                }
              >
                ×
              </button>
            </div>

            {/* Total */}

            <div className="details-total-card">
              <span>
                FINAL SCORE
              </span>

              <strong>
                {Number(
                  selectedResult.points
                ).toFixed(2)}
              </strong>

              <small>
                / 100
              </small>
            </div>

            {/* Criteria */}

            <div className="details-criteria">
              <div>
                <span>
                  Squad Strength
                </span>

                <strong>
                  {
                    selectedResult
                      .criteria
                      .squadStrength
                  }{" "}
                  / 30
                </strong>
              </div>

              <div>
                <span>
                  Squad Balance
                </span>

                <strong>
                  {
                    selectedResult
                      .criteria
                      .squadBalance
                  }{" "}
                  / 20
                </strong>
              </div>

              <div>
                <span>
                  Value for Money
                </span>

                <strong>
                  {
                    selectedResult
                      .criteria
                      .valueForMoney
                  }{" "}
                  / 20
                </strong>
              </div>

              <div>
                <span>
                  Tactical Compatibility
                </span>

                <strong>
                  {
                    selectedResult
                      .criteria
                      .tacticalCompatibility
                  }{" "}
                  / 15
                </strong>
              </div>

              <div>
                <span>
                  Rule Compliance
                </span>

                <strong>
                  {
                    selectedResult
                      .criteria
                      .ruleCompliance
                  }{" "}
                  / 15
                </strong>
              </div>
            </div>

            {/* Team details */}

            <div className="details-info-grid">
              <div>
                <span>
                  FORMATION
                </span>

                <strong>
                  {
                    selectedResult.formation ||
                      "—"
                  }
                </strong>
              </div>

              <div>
                <span>
                  SQUAD
                </span>

                <strong>
                  {
                    selectedResult.squadSize
                  }
                  /15
                </strong>
              </div>

              <div>
                <span>
                  TOTAL SPENT
                </span>

                <strong>
                  {formatMoney(
                    selectedResult.totalSpent
                  )}
                </strong>
              </div>

              <div>
                <span>
                  REMAINING PURSE
                </span>

                <strong>
                  {formatMoney(
                    selectedResult.purse
                  )}
                </strong>
              </div>
            </div>

            {/* Best XI */}

            <div className="details-best-xi">
              <div className="details-section-heading">
                <div>
                  <p className="results-label">
                    FINAL LINEUP
                  </p>

                  <h3>
                    Best XI
                  </h3>
                </div>

                <span>
                  {
                    selectedResult
                      .bestXI
                      .players
                      .length
                  }{" "}
                  / 11
                </span>
              </div>

              {selectedResult
                .bestXI
                .players
                .length ===
              0 ? (
                <div className="details-empty">
                  No Best XI submitted.
                </div>
              ) : (
                <div className="best-xi-result-list">
                  {selectedResult.bestXI.players.map(
                    (
                      player,
                      index
                    ) => (
                      <div
                        className="best-xi-result-row"
                        key={
                          player.id ||
                          index
                        }
                      >
                        <div className="best-xi-result-number">
                          {index +
                            1}
                        </div>

                        <div className="best-xi-result-player">
                          {player.image ? (
                            <img
                              src={
                                player.image.startsWith(
                                  "http"
                                )
                                  ? player.image
                                  : `${API_URL}${player.image}`
                              }
                              alt={
                                player.name
                              }
                            />
                          ) : (
                            <span>
                              ⚽
                            </span>
                          )}

                          <div>
                            <strong>
                              {
                                player.name
                              }
                            </strong>

                            <span>
                              {
                                player.position
                              }
                            </span>
                          </div>
                        </div>

                        <div className="best-xi-result-rating">
                          <span>
                            RATING
                          </span>

                          <strong>
                            {
                              player.rating
                            }
                          </strong>
                        </div>

                        <div className="best-xi-result-price">
                          <span>
                            PRICE
                          </span>

                          <strong>
                            {formatFullMoney(
                              player.soldPrice
                            )}
                          </strong>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;