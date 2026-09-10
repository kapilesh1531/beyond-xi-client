import {
  useEffect,
  useState
} from "react";

const API_URL = import.meta.env.VITE_API_URL;

import {
  io
} from "socket.io-client";

import Results from "./Results";

import "./Presentation.css";


const socket = io(
  API_URL,
  {
    autoConnect: true
  }
);


function Presentation() {

  const [
    activeTab,
    setActiveTab
  ] = useState("live");

  const [
    auction,
    setAuction
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");


  /* =========================================================
     FETCH CURRENT AUCTION
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

      setError("");

    } catch (err) {

      console.error(
        "Presentation auction error:",
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
     SOCKET.IO
  ========================================================= */

  useEffect(() => {

    fetchAuction();

    socket.emit(
      "joinAuction"
    );


    const handleAuctionUpdate =
      (updatedAuction) => {

        console.log(
          "Presentation update:",
          updatedAuction
        );

        setAuction(
          updatedAuction
        );

        setError("");

      };


    socket.on(
      "auction:update",
      handleAuctionUpdate
    );


    return () => {

      socket.off(
        "auction:update",
        handleAuctionUpdate
      );

    };

  }, []);


  /* =========================================================
     BUILD PLAYER IMAGE URL
  ========================================================= */

  const getPlayerImageUrl = (
    image
  ) => {

    if (!image) {
      return null;
    }

    // Already a complete URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // Handle /uploads/...
    if (
      image.startsWith("/")
    ) {
      return `${API_URL}${image}`;
    }

    // Handle uploads/... without /
    return `${API_URL}/${image}`;

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (
      <div className="presentation-page">

        <div className="presentation-overlay"></div>

        <div className="presentation-loading">
          LOADING AUCTION...
        </div>

      </div>
    );

  }


  const currentPlayer =
    auction?.currentPlayer ||
    null;


  const playerImage =
    getPlayerImageUrl(
      currentPlayer?.image
    );


  /* =========================================================
     AUCTION STATUS
  ========================================================= */

  let auctionStatus =
    "NOT STARTED";


  if (auction?.status) {

    switch (
      auction.status
    ) {

      case "Live":
        auctionStatus = "LIVE";
        break;

      case "Paused":
        auctionStatus = "PAUSED";
        break;

      case "Completed":
        auctionStatus = "COMPLETED";
        break;

      case "Not Started":
        auctionStatus = "NOT STARTED";
        break;

      default:
        auctionStatus =
          auction.status.toUpperCase();

    }

  }


  return (

    <div className="presentation-page">

      <div className="presentation-overlay"></div>


      <div className="presentation-content">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="presentation-header">

          <div className="presentation-brand">

            <span className="brand-small">
              BEYOND XI
            </span>

            <h1>
              UCL FOOTBALL AUCTION
            </h1>

          </div>


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav className="presentation-navigation">

            <button
              type="button"
              className={
                activeTab === "live"
                  ? "presentation-nav-btn active"
                  : "presentation-nav-btn"
              }
              onClick={() =>
                setActiveTab("live")
              }
            >
              LIVE AUCTION
            </button>


            <button
              type="button"
              className={
                activeTab === "results"
                  ? "presentation-nav-btn active"
                  : "presentation-nav-btn"
              }
              onClick={() =>
                setActiveTab("results")
              }
            >
              RESULTS
            </button>

          </nav>

        </header>


        {/* =================================================
            LIVE AUCTION
        ================================================= */}

        {activeTab === "live" && (

          <main className="presentation-section">

            <div className="section-title">

              <span></span>

              <h2>
                LIVE AUCTION
              </h2>

            </div>


            {error && (

              <div className="presentation-error">
                {error}
              </div>

            )}


            {!currentPlayer ? (

              <div className="presentation-empty">

                <div className="empty-icon">
                  ⚽
                </div>

                <h2>
                  {auctionStatus === "COMPLETED"
                    ? "AUCTION COMPLETED"
                    : "AUCTION NOT STARTED"}
                </h2>

                <p>
                  {auctionStatus === "COMPLETED"
                    ? "The live auction has ended."
                    : "The current player will appear here when the auction starts."}
                </p>

              </div>

            ) : (

              <div className="live-player-card">


                {/* =================================================
                    PLAYER IMAGE
                ================================================= */}

                <div className="player-image-wrapper">

                  {playerImage ? (

                    <img
                      src={playerImage}
                      alt={currentPlayer.name}
                      className="player-image"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";

                        const fallback =
                          event.currentTarget
                            .parentElement
                            ?.querySelector(
                              ".image-fallback"
                            );

                        if (fallback) {
                          fallback.style.display =
                            "flex";
                        }
                      }}
                    />

                  ) : null}


                  <div
                    className="image-fallback"
                    style={{
                      display: playerImage
                        ? "none"
                        : "flex"
                    }}
                  >
                    NO IMAGE
                  </div>

                </div>


                {/* =================================================
                    PLAYER DETAILS
                ================================================= */}

                <div className="player-information">

                  <div className="current-player-label">
                    CURRENT PLAYER
                  </div>


                  <h2 className="player-name">
                    {currentPlayer.name}
                  </h2>


                  <div className="player-tags">

                    {currentPlayer.position && (

                      <span>
                        {currentPlayer.position}
                      </span>

                    )}


                    {currentPlayer.category && (

                      <span>
                        {currentPlayer.category}
                      </span>

                    )}


                    {currentPlayer.rating !==
                      undefined && (

                      <span>
                        Rating{" "}
                        {currentPlayer.rating}
                      </span>

                    )}


                    {currentPlayer.nationality && (

                      <span>
                        {currentPlayer.nationality}
                      </span>

                    )}

                  </div>


                  {/* =================================================
                      BASE PRICE
                  ================================================= */}

                  <div className="base-price-card">

                    <div className="card-label">
                      BASE PRICE
                    </div>


                    <div className="base-price">

                      €

                      {Number(
                        currentPlayer.basePrice ||
                        0
                      ).toLocaleString(
                        "en-US"
                      )}

                    </div>

                  </div>


                  {/* =================================================
                      AUCTION STATUS
                  ================================================= */}

                  <div className="auction-status-card">

                    <div className="card-label">
                      AUCTION STATUS
                    </div>


                    <div
                      className={`auction-status ${auctionStatus.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {auctionStatus}
                    </div>

                  </div>

                </div>

              </div>

            )}

          </main>

        )}


        {/* =================================================
            RESULTS
            USE YOUR EXISTING RESULTS PAGE
        ================================================= */}

        {activeTab === "results" && (

          <main className="presentation-results-section">

            <Results />

          </main>

        )}

      </div>

    </div>

  );

}


export default Presentation;