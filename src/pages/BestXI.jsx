import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  io
} from "socket.io-client";

import "./BestXI.css";

const socket =
  io(
    "http://localhost:5000",
    {
      autoConnect:
        true
    }
  );

const DEFAULT_FORMATION =
  {
    goalkeeper:
      1,

    defender:
      4,

    midfield:
      3,

    attack:
      3
  };

const FORMATIONS = [
  {
    name:
      "4-3-3",

    goalkeeper:
      1,

    defender:
      4,

    midfield:
      3,

    attack:
      3
  },

  {
    name:
      "4-4-2",

    goalkeeper:
      1,

    defender:
      4,

    midfield:
      4,

    attack:
      2
  },

  {
    name:
      "4-2-3-1",

    goalkeeper:
      1,

    defender:
      4,

    midfield:
      5,

    attack:
      1
  },

  {
    name:
      "3-4-3",

    goalkeeper:
      1,

    defender:
      3,

    midfield:
      4,

    attack:
      3
  },

  {
    name:
      "3-5-2",

    goalkeeper:
      1,

    defender:
      3,

    midfield:
      5,

    attack:
      2
  },

  {
    name:
      "5-3-2",

    goalkeeper:
      1,

    defender:
      5,

    midfield:
      3,

    attack:
      2
  }
];

function BestXI({
  teamId
}) {
  const [
    squad,
    setSquad
  ] =
    useState([]);

  const [
    formation,
    setFormation
  ] =
    useState(
      DEFAULT_FORMATION
    );

  const [
    selectedPlayers,
    setSelectedPlayers
  ] =
    useState([]);

  const [
    submitted,
    setSubmitted
  ] =
    useState(false);

  const [
    submittedAt,
    setSubmittedAt
  ] =
    useState(null);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    saving,
    setSaving
  ] =
    useState(false);

  const [
    message,
    setMessage
  ] =
    useState("");

  const [
    error,
    setError
  ] =
    useState("");

  const clearMessages =
    () => {
      setMessage("");
      setError("");
    };

  const getImageUrl =
    (image) => {
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

      return `http://localhost:5000${image}`;
    };

  /* =======================================================
     FETCH BEST XI
  ======================================================= */

  const fetchBestXI =
    async () => {
      try {
        setLoading(
          true
        );

        const response =
          await fetch(
            `http://localhost:5000/api/teams/${teamId}/best-xi`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load Best XI."
          );
        }

        setSquad(
          Array.isArray(
            data.squad
          )
            ? data.squad
            : []
        );

        const savedFormation =
          data.bestXI
            ?.formation;

        if (
          savedFormation
        ) {
          setFormation({
            goalkeeper:
              Number(
                savedFormation.goalkeeper
              ),

            defender:
              Number(
                savedFormation.defender
              ),

            midfield:
              Number(
                savedFormation.midfield
              ),

            attack:
              Number(
                savedFormation.attack
              )
          });
        }

        const savedPlayers =
          Array.isArray(
            data.bestXI
              ?.players
          )
            ? data.bestXI.players.map(
                (player) =>
                  String(
                    player._id ||
                      player
                  )
              )
            : [];

        setSelectedPlayers(
          savedPlayers
        );

        setSubmitted(
          Boolean(
            data.bestXI
              ?.submitted
          )
        );

        setSubmittedAt(
          data.bestXI
            ?.submittedAt ||
            null
        );
      } catch (err) {
        console.error(
          "Best XI fetch error:",
          err
        );

        setError(
          err.message ||
            "Unable to load Best XI."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  useEffect(() => {
    if (!teamId) {
      setError(
        "Team could not be identified."
      );

      setLoading(
        false
      );

      return;
    }

    fetchBestXI();

    socket.emit(
      "joinAuction"
    );

    const handleTeamsUpdate =
      (updatedTeams) => {
        if (
          Array.isArray(
            updatedTeams
          )
        ) {
          const updatedTeam =
            updatedTeams.find(
              (team) =>
                String(
                  team._id
                ) ===
                String(
                  teamId
                )
            );

          if (
            updatedTeam
          ) {
            setSquad(
              Array.isArray(
                updatedTeam.players
              )
                ? updatedTeam.players
                : []
            );

            if (
              updatedTeam.bestXI
            ) {
              setSubmitted(
                Boolean(
                  updatedTeam
                    .bestXI
                    .submitted
                )
              );
            }
          }
        }
      };

    socket.on(
      "teams:update",
      handleTeamsUpdate
    );

    return () => {
      socket.off(
        "teams:update",
        handleTeamsUpdate
      );
    };
  }, [teamId]);

  /* =======================================================
     POSITION COUNTS
  ======================================================= */

  const selectedPlayerObjects =
    useMemo(
      () => {
        return squad.filter(
          (player) =>
            selectedPlayers.includes(
              String(
                player._id
              )
            )
        );
      },
      [
        squad,
        selectedPlayers
      ]
    );

  const selectedCounts =
    useMemo(
      () => {
        return {
          goalkeeper:
            selectedPlayerObjects.filter(
              (player) =>
                player.position ===
                "Goalkeeper"
            ).length,

          defender:
            selectedPlayerObjects.filter(
              (player) =>
                player.position ===
                "Defender"
            ).length,

          midfield:
            selectedPlayerObjects.filter(
              (player) =>
                player.position ===
                "Midfielder"
            ).length,

          attack:
            selectedPlayerObjects.filter(
              (player) =>
                player.position ===
                "Forward"
            ).length
        };
      },
      [
        selectedPlayerObjects
      ]
    );

  const totalPlayers =
    formation.goalkeeper +
    formation.defender +
    formation.midfield +
    formation.attack;

  const formationIsValid =
    totalPlayers ===
    11;

  const positionsMatch =
    selectedCounts.goalkeeper ===
      formation.goalkeeper &&
    selectedCounts.defender ===
      formation.defender &&
    selectedCounts.midfield ===
      formation.midfield &&
    selectedCounts.attack ===
      formation.attack;

  const readyToSubmit =
    formationIsValid &&
    positionsMatch &&
    selectedPlayers.length ===
      11;

  /* =======================================================
     CHOOSE FORMATION
  ======================================================= */

  const selectFormation =
    (newFormation) => {
      if (submitted) {
        return;
      }

      clearMessages();

      setFormation(
        {
          goalkeeper:
            Number(
              newFormation.goalkeeper
            ),

          defender:
            Number(
              newFormation.defender
            ),

          midfield:
            Number(
              newFormation.midfield
            ),

          attack:
            Number(
              newFormation.attack
            )
        }
      );

      setSelectedPlayers(
        []
      );
    };

  /* =======================================================
     SELECT PLAYER
  ======================================================= */

  const togglePlayer =
    (player) => {
      if (submitted) {
        return;
      }

      clearMessages();

      const playerId =
        String(
          player._id
        );

      const isSelected =
        selectedPlayers.includes(
          playerId
        );

      if (isSelected) {
        setSelectedPlayers(
          (
            current
          ) =>
            current.filter(
              (id) =>
                id !==
                playerId
            )
        );

        return;
      }

      if (
        selectedPlayers.length >=
        11
      ) {
        setError(
          "Your Best XI can contain only 11 players."
        );

        return;
      }

      let maxAllowed =
        0;

      switch (
        player.position
      ) {
        case "Goalkeeper":
          maxAllowed =
            formation.goalkeeper;
          break;

        case "Defender":
          maxAllowed =
            formation.defender;
          break;

        case "Midfielder":
          maxAllowed =
            formation.midfield;
          break;

        case "Forward":
          maxAllowed =
            formation.attack;
          break;

        default:
          maxAllowed =
            0;
      }

      if (
        maxAllowed ===
        0
      ) {
        setError(
          `${player.name} cannot be used in the selected formation.`
        );

        return;
      }

      const currentlySelected =
        selectedPlayerObjects.filter(
          (item) =>
            item.position ===
            player.position
        ).length;

      if (
        currentlySelected >=
        maxAllowed
      ) {
        setError(
          `You already selected the maximum number of ${player.position.toLowerCase()}s for this formation.`
        );

        return;
      }

      setSelectedPlayers(
        (
          current
        ) => [
          ...current,
          playerId
        ]
      );
    };

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  const saveDraft =
    async () => {
      clearMessages();

      if (
        !formationIsValid
      ) {
        setError(
          "The formation must contain exactly 11 players."
        );

        return;
      }

      if (
        selectedPlayers.length !==
        11
      ) {
        setError(
          "Select exactly 11 players before saving."
        );

        return;
      }

      if (
        !positionsMatch
      ) {
        setError(
          "Your selected players do not match the chosen formation."
        );

        return;
      }

      setSaving(
        true
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/teams/${teamId}/best-xi`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  formation,
                  players:
                    selectedPlayers
                })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to save Best XI."
          );
        }

        setMessage(
          "Best XI draft saved successfully."
        );

        await fetchBestXI();
      } catch (err) {
        console.error(
          "Save Best XI error:",
          err
        );

        setError(
          err.message ||
            "Failed to save Best XI."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* =======================================================
     FINAL SUBMIT
  ======================================================= */

  const submitBestXI =
    async () => {
      clearMessages();

      if (
        !readyToSubmit
      ) {
        setError(
          "Complete a valid 11-player Best XI before submitting."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Submit this Best XI as your final selection? You will not be able to change it afterward."
        );

      if (!confirmed) {
        return;
      }

      setSaving(
        true
      );

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/teams/${teamId}/best-xi/submit`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  formation,
                  players:
                    selectedPlayers
                })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to submit Best XI."
          );
        }

        setMessage(
          "Best XI submitted successfully."
        );

        setSubmitted(
          true
        );

        setSubmittedAt(
          data.bestXI
            ?.submittedAt ||
            new Date()
        );

        await fetchBestXI();
      } catch (err) {
        console.error(
          "Submit Best XI error:",
          err
        );

        setError(
          err.message ||
            "Failed to submit Best XI."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="best-xi-page">
        <div className="best-xi-loading">
          Loading Best XI...
        </div>
      </section>
    );
  }

  return (
    <section className="best-xi-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="best-xi-header">

        <div>

          <p className="best-xi-label">
            TEAM DRAFT
          </p>

          <h1>
            Best XI
          </h1>

          <p className="best-xi-subtitle">
            Choose your final starting
            eleven from your purchased squad.
          </p>

        </div>

        <div
          className={`best-xi-status ${
            submitted
              ? "submitted"
              : "draft"
          }`}
        >
          {submitted
            ? "SUBMITTED"
            : "DRAFT"}
        </div>

      </header>

      {message && (
        <div className="best-xi-success">
          {message}
        </div>
      )}

      {error && (
        <div className="best-xi-error">
          {error}
        </div>
      )}

      {/* ===================================================
          FORMATION
      =================================================== */}

      <section className="formation-section">

        <div className="section-heading">

          <div>

            <p className="best-xi-label">
              FORMATION
            </p>

            <h2>
              Choose your combination
            </h2>

          </div>

          <div className="formation-total">

            <span>
              PLAYERS
            </span>

            <strong
              className={
                formationIsValid
                  ? "valid"
                  : "invalid"
              }
            >
              {totalPlayers} / 11
            </strong>

          </div>

        </div>

        <div className="formation-grid">

          {FORMATIONS.map(
            (
              item
            ) => {

              const active =
                formation.goalkeeper ===
                  item.goalkeeper &&
                formation.defender ===
                  item.defender &&
                formation.midfield ===
                  item.midfield &&
                formation.attack ===
                  item.attack;

              return (
                <button
                  key={
                    item.name
                  }
                  className={`formation-card ${
                    active
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    selectFormation(
                      item
                    )
                  }
                  disabled={
                    submitted
                  }
                >

                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    {item.goalkeeper}
                    {" GK  •  "}
                    {item.defender}
                    {" DEF  •  "}
                    {item.midfield}
                    {" MID  •  "}
                    {item.attack}
                    {" ATT"}
                  </span>

                </button>
              );
            }
          )}

        </div>

        <div className="custom-formation">

          <p className="best-xi-label">
            CUSTOM COMBINATION
          </p>

          <div className="custom-formation-grid">

            <label>

              <span>
                GOALKEEPER
              </span>

              <input
                type="number"
                min="1"
                max="1"
                value={
                  formation.goalkeeper
                }
                disabled
              />

            </label>

            <label>

              <span>
                DEFENDER
              </span>

              <input
                type="number"
                min="2"
                max="5"
                value={
                  formation.defender
                }
                disabled={
                  submitted
                }
                onChange={(
                  event
                ) => {
                  const value =
                    Number(
                      event.target.value
                    );

                  if (
                    value >=
                      2 &&
                    value <=
                      5
                  ) {
                    selectFormation({
                      ...formation,

                      defender:
                        value
                    });
                  }
                }}
              />

            </label>

            <label>

              <span>
                MIDFIELD
              </span>

              <input
                type="number"
                min="2"
                max="5"
                value={
                  formation.midfield
                }
                disabled={
                  submitted
                }
                onChange={(
                  event
                ) => {
                  const value =
                    Number(
                      event.target.value
                    );

                  if (
                    value >=
                      2 &&
                    value <=
                      5
                  ) {
                    selectFormation({
                      ...formation,

                      midfield:
                        value
                    });
                  }
                }}
              />

            </label>

            <label>

              <span>
                ATTACK
              </span>

              <input
                type="number"
                min="1"
                max="5"
                value={
                  formation.attack
                }
                disabled={
                  submitted
                }
                onChange={(
                  event
                ) => {
                  const value =
                    Number(
                      event.target.value
                    );

                  if (
                    value >=
                      1 &&
                    value <=
                      5
                  ) {
                    selectFormation({
                      ...formation,

                      attack:
                        value
                    });
                  }
                }}
              />

            </label>

          </div>

        </div>

      </section>

      {/* ===================================================
          POSITION REQUIREMENTS
      =================================================== */}

      <section className="requirements-section">

        <div className="requirement-card">

          <span>
            GK
          </span>

          <strong>
            {selectedCounts.goalkeeper}
            {" / "}
            {formation.goalkeeper}
          </strong>

        </div>

        <div className="requirement-card">

          <span>
            DEF
          </span>

          <strong>
            {selectedCounts.defender}
            {" / "}
            {formation.defender}
          </strong>

        </div>

        <div className="requirement-card">

          <span>
            MID
          </span>

          <strong>
            {selectedCounts.midfield}
            {" / "}
            {formation.midfield}
          </strong>

        </div>

        <div className="requirement-card">

          <span>
            ATT
          </span>

          <strong>
            {selectedCounts.attack}
            {" / "}
            {formation.attack}
          </strong>

        </div>

      </section>

      {/* ===================================================
          PLAYERS
      =================================================== */}

      <section className="players-section">

        <div className="section-heading">

          <div>

            <p className="best-xi-label">
              YOUR SQUAD
            </p>

            <h2>
              Select your players
            </h2>

          </div>

          <div className="selection-counter">

            {selectedPlayers.length}
            {" / 11"}

          </div>

        </div>

        {squad.length ===
        0 ? (

          <div className="empty-best-xi">

            <h3>
              No players in your squad
            </h3>

            <p>
              Purchase players during the
              auction before creating your Best XI.
            </p>

          </div>

        ) : (

          <div className="draft-player-grid">

            {squad.map(
              (
                player
              ) => {

                const playerId =
                  String(
                    player._id
                  );

                const selected =
                  selectedPlayers.includes(
                    playerId
                  );

                const positionKey =
                  player.position ===
                  "Goalkeeper"
                    ? "goalkeeper"
                    : player.position ===
                      "Defender"
                    ? "defender"
                    : player.position ===
                      "Midfielder"
                    ? "midfield"
                    : "attack";

                const positionLimit =
                  formation[
                    positionKey
                  ];

                const currentPositionCount =
                  selectedCounts[
                    positionKey
                  ];

                const positionFull =
                  currentPositionCount >=
                  positionLimit;

                const disabled =
                  submitted ||
                  (
                    !selected &&
                    (
                      selectedPlayers.length >=
                        11 ||
                      positionFull
                    )
                  );

                return (
                  <button
                    type="button"
                    key={
                      playerId
                    }
                    className={`draft-player-card ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      togglePlayer(
                        player
                      )
                    }
                    disabled={
                      disabled
                    }
                  >

                    <div className="draft-player-image">

                      {player.image ? (

                        <img
                          src={getImageUrl(
                            player.image
                          )}
                          alt={
                            player.name
                          }
                        />

                      ) : (

                        <div className="draft-no-image">
                          ⚽
                        </div>

                      )}

                    </div>

                    <div className="draft-player-info">

                      <div className="draft-player-position">
                        {
                          player.position
                        }
                      </div>

                      <h3>
                        {
                          player.name
                        }
                      </h3>

                      <p>
                        Rating{" "}
                        {
                          player.rating
                        }
                        {" • "}
                        {
                          player.category
                        }
                      </p>

                      <small>
                        €
                        {Number(
                          player.soldPrice ||
                            0
                        ).toLocaleString(
                          "en-US"
                        )}
                      </small>

                    </div>

                    <div className="draft-check">

                      {selected
                        ? "✓"
                        : "+"}

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* ===================================================
          SUBMISSION
      =================================================== */}

      <section className="best-xi-submit-section">

        {submitted ? (

          <div className="submitted-panel">

            <div>

              <span>
                BEST XI SUBMITTED
              </span>

              <strong>
                Your final starting XI is locked.
              </strong>

              {submittedAt && (
                <small>
                  Submitted on{" "}
                  {new Date(
                    submittedAt
                  ).toLocaleString()}
                </small>
              )}

            </div>

            <div className="submitted-check">
              ✓
            </div>

          </div>

        ) : (

          <div className="draft-submit-panel">

            <div>

              <p className="best-xi-label">
                FINAL SUBMISSION
              </p>

              <h3>
                {readyToSubmit
                  ? "Your Best XI is ready."
                  : "Complete your Best XI before submitting."}
              </h3>

              <p>
                You can change the formation
                and players until you submit.
              </p>

            </div>

            <div className="draft-actions">

              <button
                type="button"
                className="save-draft-button"
                onClick={
                  saveDraft
                }
                disabled={
                  saving ||
                  !readyToSubmit
                }
              >
                {saving
                  ? "SAVING..."
                  : "SAVE DRAFT"}
              </button>

              <button
                type="button"
                className="submit-xi-button"
                onClick={
                  submitBestXI
                }
                disabled={
                  saving ||
                  !readyToSubmit
                }
              >
                {saving
                  ? "SUBMITTING..."
                  : "SUBMIT BEST XI"}
              </button>

            </div>

          </div>

        )}

      </section>

    </section>
  );
}

export default BestXI;