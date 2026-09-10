import {
  useEffect,
  useMemo,
  useState
} from "react";

import "./BestXI.css";


const FORMATIONS = [
  {
    name: "4-3-3",
    goalkeeper: 1,
    defender: 4,
    midfield: 3,
    attack: 3
  },
  {
    name: "4-4-2",
    goalkeeper: 1,
    defender: 4,
    midfield: 4,
    attack: 2
  },
  {
    name: "4-2-3-1",
    goalkeeper: 1,
    defender: 4,
    midfield: 5,
    attack: 1
  },
  {
    name: "3-4-3",
    goalkeeper: 1,
    defender: 3,
    midfield: 4,
    attack: 3
  },
  {
    name: "3-5-2",
    goalkeeper: 1,
    defender: 3,
    midfield: 5,
    attack: 2
  },
  {
    name: "5-3-2",
    goalkeeper: 1,
    defender: 5,
    midfield: 3,
    attack: 2
  }
];


const DEFAULT_FORMATION = {
  goalkeeper: 1,
  defender: 4,
  midfield: 3,
  attack: 3
};


function BestXI({
  teamId
}) {

  const [
    team,
    setTeam
  ] = useState(null);

  const [
    squad,
    setSquad
  ] = useState([]);

  const [
    formation,
    setFormation
  ] = useState(
    DEFAULT_FORMATION
  );

  const [
    selectedPlayers,
    setSelectedPlayers
  ] = useState([]);

  const [
    tradeStatus,
    setTradeStatus
  ] = useState("Closed");

  const [
    submitted,
    setSubmitted
  ] = useState(false);

  const [
    submittedAt,
    setSubmittedAt
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    message,
    setMessage
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");


  /* =========================================================
     CLEAR MESSAGES
  ========================================================= */

  const clearMessages = () => {
    setMessage("");
    setError("");
  };


  /* =========================================================
     IMAGE
  ========================================================= */

  const getImageUrl = (
    image
  ) => {

    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:5000${image}`;
  };


  /* =========================================================
     FETCH BEST XI
  ========================================================= */

  const fetchBestXI = async () => {

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

      setTeam(
        data.team ||
        null
      );

      setSquad(
        Array.isArray(
          data.squad
        )
          ? data.squad
          : []
      );

      if (
        data.bestXI?.formation
      ) {

        setFormation({
          goalkeeper:
            Number(
              data.bestXI.formation
                .goalkeeper
            ),

          defender:
            Number(
              data.bestXI.formation
                .defender
            ),

          midfield:
            Number(
              data.bestXI.formation
                .midfield
            ),

          attack:
            Number(
              data.bestXI.formation
                .attack
            )
        });
      }

      setSelectedPlayers(
        Array.isArray(
          data.bestXI?.players
        )
          ? data.bestXI.players.map(
              (player) =>
                String(
                  player._id ||
                  player
                )
            )
          : []
      );

      setSubmitted(
        Boolean(
          data.bestXI?.submitted
        )
      );

      setSubmittedAt(
        data.bestXI?.submittedAt ||
        null
      );

      setTradeStatus(
        data.tradeStatus ||
        "Closed"
      );

    } catch (err) {

      console.error(
        "Fetch Best XI error:",
        err
      );

      setError(
        err.message ||
        "Unable to load Best XI."
      );

    } finally {

      setLoading(false);

    }
  };


  /* =========================================================
     FETCH TRADE STATUS
  ========================================================= */

  const fetchTradeStatus =
    async () => {

      try {

        const response =
          await fetch(
            "http://localhost:5000/api/trade/status"
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.status
        ) {

          setTradeStatus(
            data.status
          );
        }

      } catch (err) {

        console.error(
          "Trade status error:",
          err
        );

      }
    };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    fetchBestXI();
    fetchTradeStatus();

  }, [teamId]);


  /* =========================================================
     TRADE STATUS POLLING
  ========================================================= */

  useEffect(() => {

    const interval =
      setInterval(
        () => {
          fetchTradeStatus();
        },
        1000
      );

    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  /* =========================================================
     SELECTED PLAYER OBJECTS
  ========================================================= */

  const selectedPlayerObjects =
    useMemo(
      () =>
        squad.filter(
          (player) =>
            selectedPlayers.includes(
              String(player._id)
            )
        ),
      [
        squad,
        selectedPlayers
      ]
    );


  /* =========================================================
     POSITION COUNTS
  ========================================================= */

  const counts =
    useMemo(
      () => ({

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

      }),
      [
        selectedPlayerObjects
      ]
    );


  /* =========================================================
     FORMATION VALIDATION
  ========================================================= */

  const totalPlayers =
    formation.goalkeeper +
    formation.defender +
    formation.midfield +
    formation.attack;

  const formationValid =
    totalPlayers === 11;

  const positionsValid =
    counts.goalkeeper ===
      formation.goalkeeper &&
    counts.defender ===
      formation.defender &&
    counts.midfield ===
      formation.midfield &&
    counts.attack ===
      formation.attack;

  const elevenSelected =
    selectedPlayers.length === 11;

  const ready =
    formationValid &&
    positionsValid &&
    elevenSelected;

  const finalSubmissionAvailable =
    tradeStatus === "Ended" &&
    ready &&
    !submitted;


  /* =========================================================
     FORMATION
  ========================================================= */

  const chooseFormation =
    (item) => {

      if (submitted) {
        return;
      }

      clearMessages();

      setFormation({

        goalkeeper:
          item.goalkeeper,

        defender:
          item.defender,

        midfield:
          item.midfield,

        attack:
          item.attack

      });

      setSelectedPlayers([]);

    };


  /* =========================================================
     PLAYER SELECTION
  ========================================================= */

  const togglePlayer =
    (player) => {

      if (submitted) {
        return;
      }

      clearMessages();

      const id =
        String(
          player._id
        );

      if (
        selectedPlayers.includes(
          id
        )
      ) {

        setSelectedPlayers(
          (current) =>
            current.filter(
              (playerId) =>
                playerId !== id
            )
        );

        return;
      }

      if (
        selectedPlayers.length >=
        11
      ) {

        setError(
          "Only 11 players can be selected."
        );

        return;
      }

      let key =
        "attack";

      if (
        player.position ===
        "Goalkeeper"
      ) {

        key =
          "goalkeeper";

      } else if (
        player.position ===
        "Defender"
      ) {

        key =
          "defender";

      } else if (
        player.position ===
        "Midfielder"
      ) {

        key =
          "midfield";
      }

      if (
        counts[key] >=
        formation[key]
      ) {

        setError(
          `The selected formation limit for ${player.position} has been reached.`
        );

        return;
      }

      setSelectedPlayers(
        (current) => [
          ...current,
          id
        ]
      );

    };


  /* =========================================================
     SAVE DRAFT
  ========================================================= */

  const saveDraft =
    async () => {

      clearMessages();

      if (submitted) {

        setError(
          "Final Best XI is already locked."
        );

        return;
      }

      if (!ready) {

        setError(
          "Select exactly 11 players that match your formation."
        );

        return;
      }

      setSaving(true);

      try {

        const response =
          await fetch(
            `http://localhost:5000/api/teams/${teamId}/best-xi`,
            {
              method: "PUT",

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
            "Failed to save draft."
          );
        }

        setMessage(
          "Best XI draft saved successfully."
        );

        setSubmitted(false);

      } catch (err) {

        console.error(
          "Save draft error:",
          err
        );

        setError(
          err.message ||
          "Failed to save draft."
        );

      } finally {

        setSaving(false);

      }
    };


  /* =========================================================
     FINAL SUBMIT
  ========================================================= */

  const submitFinal =
    async () => {

      clearMessages();

      if (
        tradeStatus !==
        "Ended"
      ) {

        setError(
          "Final Best XI submission is available only after the trade window has ended."
        );

        return;
      }

      if (submitted) {

        setError(
          "Your Best XI has already been submitted."
        );

        return;
      }

      if (!ready) {

        setError(
          "Select a valid 11-player Best XI first."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Submit your final Best XI? You will not be able to change it afterward."
        );

      if (!confirmed) {
        return;
      }

      setSaving(true);

      try {

        const response =
          await fetch(
            `http://localhost:5000/api/teams/${teamId}/best-xi/submit`,
            {
              method: "POST",

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
            "Failed to submit final Best XI."
          );
        }

        setSubmitted(
          true
        );

        setSubmittedAt(
          data.bestXI?.submittedAt ||
          new Date()
        );

        setMessage(
          "Final Best XI submitted successfully. Your team is now locked."
        );

      } catch (err) {

        console.error(
          "Final Best XI error:",
          err
        );

        setError(
          err.message ||
          "Failed to submit final Best XI."
        );

      } finally {

        setSaving(false);

      }
    };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <section className="best-xi-page">

        <div className="best-xi-loading">
          Loading Best XI...
        </div>

      </section>
    );

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="best-xi-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="best-xi-header">

        <div>

          <p className="best-xi-label">
            TEAM DRAFT
          </p>

          <h1>
            Best XI
          </h1>

          <p className="best-xi-subtitle">
            Build your strongest starting eleven
            from your final squad.
          </p>

        </div>

        <div
          className={`best-xi-status ${
            submitted
              ? "submitted"
              : tradeStatus ===
                "Ended"
              ? "final"
              : "draft"
          }`}
        >
          {submitted
            ? "LOCKED"
            : tradeStatus ===
              "Ended"
            ? "FINAL OPEN"
            : "DRAFT"}
        </div>

      </header>


      {/* =====================================================
          MESSAGE
      ===================================================== */}

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


      {/* =====================================================
          FORMATION
      ===================================================== */}

      <section className="formation-section">

        <div className="section-heading">

          <div>

            <p className="best-xi-label">
              FORMATION
            </p>

            <h2>
              Choose your formation
            </h2>

          </div>

          <div className="formation-total">

            <span>
              SELECTED
            </span>

            <strong
              className={
                ready
                  ? "valid"
                  : "invalid"
              }
            >
              {selectedPlayers.length}
              {" / 11"}
            </strong>

          </div>

        </div>


        <div className="formation-grid">

          {FORMATIONS.map(
            (item) => {

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
                  type="button"
                  key={
                    item.name
                  }
                  className={`formation-card ${
                    active
                      ? "active"
                      : ""
                  }`}
                  disabled={
                    submitted
                  }
                  onClick={() =>
                    chooseFormation(
                      item
                    )
                  }
                >

                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    {item.goalkeeper}
                    {" GK • "}
                    {item.defender}
                    {" DEF • "}
                    {item.midfield}
                    {" MID • "}
                    {item.attack}
                    {" ATT"}
                  </span>

                </button>
              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          POSITION COUNTS
      ===================================================== */}

      <section className="requirements-section">

        <div className="requirement-card">

          <span>
            GK
          </span>

          <strong>
            {counts.goalkeeper}
            {" / "}
            {formation.goalkeeper}
          </strong>

        </div>


        <div className="requirement-card">

          <span>
            DEF
          </span>

          <strong>
            {counts.defender}
            {" / "}
            {formation.defender}
          </strong>

        </div>


        <div className="requirement-card">

          <span>
            MID
          </span>

          <strong>
            {counts.midfield}
            {" / "}
            {formation.midfield}
          </strong>

        </div>


        <div className="requirement-card">

          <span>
            FWD
          </span>

          <strong>
            {counts.attack}
            {" / "}
            {formation.attack}
          </strong>

        </div>

      </section>


      {/* =====================================================
          SQUAD
      ===================================================== */}

      <section className="players-section">

        <div className="section-heading">

          <div>

            <p className="best-xi-label">
              YOUR SQUAD
            </p>

            <h2>
              Select your starting eleven
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
              Your purchased players will
              appear here.
            </p>

          </div>

        ) : (

          <div className="draft-player-grid">

            {squad.map(
              (player) => {

                const id =
                  String(
                    player._id
                  );

                const isSelected =
                  selectedPlayers.includes(
                    id
                  );

                return (
                  <button
                    type="button"
                    key={id}
                    className={`draft-player-card ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    disabled={
                      submitted
                    }
                    onClick={() =>
                      togglePlayer(
                        player
                      )
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
                          player.position ||
                          "Unknown"
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
                          player.rating ??
                          "—"
                        }

                        {" • "}

                        {
                          player.category ||
                          "—"
                        }
                      </p>

                      <small>
                        {formatPlayerValue(
                          player
                        )}
                      </small>

                    </div>


                    <div className="draft-check">
                      {isSelected
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


      {/* =====================================================
          VALIDATION
      ===================================================== */}

      {!submitted && (

        <section className="best-xi-validation">

          {!formationValid && (
            <div>
              ⚠ Formation must contain exactly
              11 players.
            </div>
          )}


          {formationValid &&
            selectedPlayers.length !==
              11 && (

              <div>
                Select{" "}
                {11 -
                  selectedPlayers.length}
                {" more player"}
                {11 -
                  selectedPlayers.length !==
                  1
                  ? "s"
                  : ""}
                .
              </div>

            )}


          {formationValid &&
            selectedPlayers.length ===
              11 &&
            !positionsValid && (

              <div>
                ⚠ Selected players do not match
                your chosen formation.
              </div>

            )}


          {ready && (

            <div className="validation-good">
              ✓ Your Best XI is valid and ready.
            </div>

          )}

        </section>

      )}


      {/* =====================================================
          SUBMISSION
      ===================================================== */}

      <section className="best-xi-submit-section">

        {submitted ? (

          <div className="submitted-panel">

            <div>

              <p className="best-xi-label">
                FINAL BEST XI
              </p>

              <h3>
                Best XI Submitted
              </h3>

              <span>
                Your final XI is locked and
                will be used for Results.
              </span>

              {submittedAt && (

                <small>
                  Submitted:{" "}
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

                {tradeStatus !==
                "Ended"
                  ? "Final submission is locked"
                  : ready
                  ? "Your Best XI is ready"
                  : "Complete your Best XI"}

              </h3>

              <p>

                {tradeStatus !==
                "Ended"
                  ? "Save your draft now and make changes after trading ends."
                  : "Submit your final eleven when you are satisfied with your selection."}

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
                  submitted ||
                  !ready
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
                  submitFinal
                }
                disabled={
                  saving ||
                  !finalSubmissionAvailable
                }
              >

                {tradeStatus !==
                "Ended"
                  ? "SUBMIT AFTER TRADE"
                  : saving
                  ? "SUBMITTING..."
                  : "SUBMIT FINAL BEST XI"}

              </button>

            </div>

          </div>

        )}

      </section>

    </section>
  );
}


/* =========================================================
   HELPER
========================================================= */

function formatPlayerValue(
  player
) {

  const value =
    Number(
      player.soldPrice ??
      player.basePrice ??
      0
    );

  if (!value) {
    return "Value unavailable";
  }

  return `€${value.toLocaleString(
    "en-US"
  )}`;
}


export default BestXI;