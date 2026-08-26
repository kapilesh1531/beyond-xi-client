import {
  useEffect,
  useRef,
  useState
} from "react";

import { io } from "socket.io-client";

import LiveAuction from "./LiveAuction";

import "./AdminDashboard.css";

const socket = io(
  "http://localhost:5000",
  {
    autoConnect: true
  }
);

function AdminDashboard({
  onLogout
}) {
  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [teams, setTeams] =
    useState([]);

  const [players, setPlayers] =
    useState([]);

  const [clubs, setClubs] =
    useState([]);

  const [loadingTeams, setLoadingTeams] =
    useState(true);

  const [loadingPlayers, setLoadingPlayers] =
    useState(true);

  const [loadingClubs, setLoadingClubs] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================================
     MODALS
  ========================================================= */

  const [showAddTeam, setShowAddTeam] =
    useState(false);

  const [showAddClub, setShowAddClub] =
    useState(false);

  const [showAddPlayer, setShowAddPlayer] =
    useState(false);

  const [showImportClubs, setShowImportClubs] =
    useState(false);

  const [showImportPlayers, setShowImportPlayers] =
    useState(false);

  const [showDeleteAll, setShowDeleteAll] =
    useState(false);

  /* =========================================================
     TEAM FORM
  ========================================================= */

  const [teamClubId, setTeamClubId] =
    useState("");

  const [teamUsername, setTeamUsername] =
    useState("");

  const [teamPassword, setTeamPassword] =
    useState("");

  /* =========================================================
     CLUB FORM
  ========================================================= */

  const [clubName, setClubName] =
    useState("");

  const [clubCountry, setClubCountry] =
    useState("");

  const [clubLogo, setClubLogo] =
    useState("");

  /* =========================================================
     PLAYER FORM
  ========================================================= */

  const [playerName, setPlayerName] =
    useState("");

  const [playerAge, setPlayerAge] =
    useState("");

  const [playerNationality, setPlayerNationality] =
    useState("");

  const [playerPosition, setPlayerPosition] =
    useState("");

  const [playerCategory, setPlayerCategory] =
    useState("");

  const [playerRating, setPlayerRating] =
    useState("");

  const [playerBasePrice, setPlayerBasePrice] =
    useState("");

  const [playerImageFile, setPlayerImageFile] =
    useState(null);

  const [playerImagePreview, setPlayerImagePreview] =
    useState("");

  /* =========================================================
     SELECTION
  ========================================================= */

  const [selectedPlayers, setSelectedPlayers] =
    useState([]);

  /* =========================================================
     CLUB IMPORT
  ========================================================= */

  const [clubImportFile, setClubImportFile] =
    useState(null);

  const [clubImageZip, setClubImageZip] =
    useState(null);

  const [clubImportPreview, setClubImportPreview] =
    useState(null);

  const [clubImportLoading, setClubImportLoading] =
    useState(false);

  /* =========================================================
     PLAYER IMPORT
  ========================================================= */

  const [playerImportFile, setPlayerImportFile] =
    useState(null);

  const [playerImageZip, setPlayerImageZip] =
    useState(null);

  const [playerImportPreview, setPlayerImportPreview] =
    useState(null);

  const [playerImportLoading, setPlayerImportLoading] =
    useState(false);

  /* =========================================================
     REFS
  ========================================================= */

  const clubFileRef =
    useRef(null);

  const clubZipRef =
    useRef(null);

  const playerFileRef =
    useRef(null);

  const playerZipRef =
    useRef(null);

  /* =========================================================
     HELPERS
  ========================================================= */

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const resetTeamForm = () => {
    setTeamClubId("");
    setTeamUsername("");
    setTeamPassword("");
  };

  const resetClubForm = () => {
    setClubName("");
    setClubCountry("");
    setClubLogo("");
  };

  const resetPlayerForm = () => {
    setPlayerName("");
    setPlayerAge("");
    setPlayerNationality("");
    setPlayerPosition("");
    setPlayerCategory("");
    setPlayerRating("");
    setPlayerBasePrice("");
    setPlayerImageFile(null);
    setPlayerImagePreview("");
  };

  /* =========================================================
     FETCH TEAMS
  ========================================================= */

  const fetchTeams = async () => {
    try {
      const response =
        await fetch(
          "http://localhost:5000/api/admin/teams"
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch teams."
        );
      }

      setTeams(
        Array.isArray(data)
          ? data
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
    } finally {
      setLoadingTeams(false);
    }
  };

  /* =========================================================
     FETCH PLAYERS
  ========================================================= */

  const fetchPlayers = async () => {
    try {
      const response =
        await fetch(
          "http://localhost:5000/api/players"
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch players."
        );
      }

      setPlayers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Fetch players error:",
        err
      );

      setError(
        "Unable to load players."
      );
    } finally {
      setLoadingPlayers(false);
    }
  };

  /* =========================================================
     FETCH CLUBS
  ========================================================= */

  const fetchClubs = async () => {
    try {
      const response =
        await fetch(
          "http://localhost:5000/api/clubs"
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch clubs."
        );
      }

      setClubs(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Fetch clubs error:",
        err
      );

      setError(
        "Unable to load clubs."
      );
    } finally {
      setLoadingClubs(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
    fetchClubs();
  }, []);

  /* =========================================================
     SOCKET UPDATES
  ========================================================= */

  useEffect(() => {
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
          setTeams(
            updatedTeams
          );
        }
      };

    const handlePlayersUpdate =
      (updatedPlayers) => {
        if (
          Array.isArray(
            updatedPlayers
          )
        ) {
          setPlayers(
            updatedPlayers
          );
        }
      };

    const handleAuctionUpdate =
      (updatedAuction) => {
        /*
          Refresh teams and players
          whenever auction changes.
          This also covers sale,
          unsold and next-player events.
        */

        if (
          Array.isArray(
            updatedAuction
          )
        ) {
          return;
        }

        fetchTeams();
        fetchPlayers();
      };

    socket.on(
      "teams:update",
      handleTeamsUpdate
    );

    socket.on(
      "players:update",
      handlePlayersUpdate
    );

    socket.on(
      "auction:update",
      handleAuctionUpdate
    );

    return () => {
      socket.off(
        "teams:update",
        handleTeamsUpdate
      );

      socket.off(
        "players:update",
        handlePlayersUpdate
      );

      socket.off(
        "auction:update",
        handleAuctionUpdate
      );
    };
  }, []);

  /* =========================================================
     ADD TEAM
  ========================================================= */

  const handleAddTeam =
    async (event) => {
      event.preventDefault();

      clearMessages();

      if (
        !teamClubId ||
        !teamUsername.trim() ||
        !teamPassword
      ) {
        setError(
          "Please select a club and enter username and password."
        );

        return;
      }

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/teams/add",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  clubId:
                    teamClubId,

                  username:
                    teamUsername.trim(),

                  password:
                    teamPassword
                })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to create team account"
          );

          return;
        }

        setMessage(
          "Team account created successfully."
        );

        resetTeamForm();

        setShowAddTeam(
          false
        );

        await fetchTeams();
        await fetchClubs();
      } catch (err) {
        console.error(
          "Add team error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     DELETE TEAM
  ========================================================= */

  const handleDeleteTeam =
    async (teamId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this team account?"
        );

      if (!confirmed) {
        return;
      }

      clearMessages();

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/admin/teams/${teamId}`,
            {
              method:
                "DELETE"
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to delete team."
          );

          return;
        }

        setMessage(
          "Team account deleted successfully."
        );

        await fetchTeams();
        await fetchClubs();
      } catch (err) {
        console.error(
          "Delete team error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     ADD CLUB
  ========================================================= */

  const handleAddClub =
    async (event) => {
      event.preventDefault();

      clearMessages();

      if (
        !clubName.trim()
      ) {
        setError(
          "Club name is required."
        );

        return;
      }

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/clubs/add",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  name:
                    clubName.trim(),

                  country:
                    clubCountry.trim(),

                  logo:
                    clubLogo.trim()
                })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to add club."
          );

          return;
        }

        setMessage(
          "Club added successfully."
        );

        resetClubForm();

        setShowAddClub(
          false
        );

        await fetchClubs();
      } catch (err) {
        console.error(
          "Add club error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     DELETE CLUB
  ========================================================= */

  const handleDeleteClub =
    async (clubId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this club?"
        );

      if (!confirmed) {
        return;
      }

      clearMessages();

      try {
        const response =
          await fetch(
            `http://localhost:5000/api/clubs/${clubId}`,
            {
              method:
                "DELETE"
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to delete club."
          );

          return;
        }

        setMessage(
          "Club deleted successfully."
        );

        await fetchClubs();
      } catch (err) {
        console.error(
          "Delete club error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     ADD PLAYER IMAGE
  ========================================================= */

  const handlePlayerImageChange =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        setPlayerImageFile(null);
        setPlayerImagePreview("");
        return;
      }

      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp"
      ];

      if (
        !validTypes.includes(
          file.type
        )
      ) {
        setError(
          "Only PNG, JPG, JPEG and WEBP images are allowed."
        );

        event.target.value = "";

        return;
      }

      setPlayerImageFile(
        file
      );

      setPlayerImagePreview(
        URL.createObjectURL(
          file
        )
      );
    };

  /* =========================================================
     ADD PLAYER
  ========================================================= */

  const handleAddPlayer =
    async (event) => {
      event.preventDefault();

      clearMessages();

      if (
        !playerName ||
        !playerAge ||
        !playerNationality ||
        !playerPosition ||
        !playerCategory ||
        !playerRating ||
        !playerBasePrice
      ) {
        setError(
          "Please fill in all player details."
        );

        return;
      }

      const formData =
        new FormData();

      formData.append(
        "name",
        playerName
      );

      formData.append(
        "age",
        playerAge
      );

      formData.append(
        "nationality",
        playerNationality
      );

      formData.append(
        "position",
        playerPosition
      );

      formData.append(
        "category",
        playerCategory
      );

      formData.append(
        "rating",
        playerRating
      );

      formData.append(
        "basePrice",
        playerBasePrice
      );

      if (
        playerImageFile
      ) {
        formData.append(
          "image",
          playerImageFile
        );
      }

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/players/add",
            {
              method:
                "POST",

              body:
                formData
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to add player."
          );

          return;
        }

        setMessage(
          "Player added successfully."
        );

        resetPlayerForm();

        setShowAddPlayer(
          false
        );

        await fetchPlayers();
      } catch (err) {
        console.error(
          "Add player error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     SELECT PLAYERS
  ========================================================= */

  const togglePlayerSelection =
    (playerId) => {
      setSelectedPlayers(
        (current) =>
          current.includes(
            playerId
          )
            ? current.filter(
                (id) =>
                  id !==
                  playerId
              )
            : [
                ...current,
                playerId
              ]
      );
    };

  const toggleSelectAll =
    () => {
      if (
        selectedPlayers.length ===
        players.length &&
        players.length >
          0
      ) {
        setSelectedPlayers(
          []
        );
      } else {
        setSelectedPlayers(
          players.map(
            (player) =>
              player._id
          )
        );
      }
    };

  /* =========================================================
     DELETE SELECTED PLAYERS
  ========================================================= */

  const handleDeleteSelected =
    async () => {
      if (
        selectedPlayers.length ===
        0
      ) {
        setError(
          "Please select at least one player."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Delete ${selectedPlayers.length} selected player(s)?`
        );

      if (!confirmed) {
        return;
      }

      clearMessages();

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/players/delete-selected",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  playerIds:
                    selectedPlayers
                })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to delete players."
          );

          return;
        }

        setSelectedPlayers(
          []
        );

        setMessage(
          `${data.deleted || selectedPlayers.length} player(s) deleted successfully.`
        );

        await fetchPlayers();
        await fetchTeams();
      } catch (err) {
        console.error(
          "Delete selected error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     DELETE ALL PLAYERS
  ========================================================= */

  const handleDeleteAll =
    async () => {
      setShowDeleteAll(
        false
      );

      clearMessages();

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/players/all/clear",
            {
              method:
                "DELETE"
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to delete all players."
          );

          return;
        }

        setSelectedPlayers(
          []
        );

        setMessage(
          "All players deleted successfully."
        );

        await fetchPlayers();
        await fetchTeams();
      } catch (err) {
        console.error(
          "Delete all error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     CLUB IMPORT FILE
  ========================================================= */

  const handleClubImportFile =
    (event) => {
      const file =
        event.target.files?.[0];

      clearMessages();
      setClubImportPreview(
        null
      );

      if (!file) {
        setClubImportFile(null);
        return;
      }

      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      if (
        ![
          "xlsx",
          "xls",
          "csv"
        ].includes(
          extension
        )
      ) {
        setError(
          "Please select an Excel or CSV file."
        );

        event.target.value = "";
        return;
      }

      setClubImportFile(
        file
      );
    };

  /* =========================================================
     CLUB ZIP
  ========================================================= */

  const handleClubImageZip =
    (event) => {
      const file =
        event.target.files?.[0];

      clearMessages();
      setClubImportPreview(
        null
      );

      if (!file) {
        setClubImageZip(null);
        return;
      }

      if (
        !file.name
          .toLowerCase()
          .endsWith(".zip")
      ) {
        setError(
          "Please select a ZIP file."
        );

        event.target.value = "";
        return;
      }

      setClubImageZip(
        file
      );
    };

  /* =========================================================
     CLUB IMPORT PREVIEW
  ========================================================= */

  const previewClubImport =
    async () => {
      clearMessages();

      if (!clubImportFile) {
        setError(
          "Please select the club Excel/CSV file."
        );

        return;
      }

      if (!clubImageZip) {
        setError(
          "Please select the club image ZIP."
        );

        return;
      }

      setClubImportLoading(
        true
      );

      try {
        const formData =
          new FormData();

        formData.append(
          "clubFile",
          clubImportFile
        );

        formData.append(
          "imageZip",
          clubImageZip
        );

        const response =
          await fetch(
            "http://localhost:5000/api/clubs/import/preview",
            {
              method:
                "POST",

              body:
                formData
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to preview club import."
          );

          return;
        }

        setClubImportPreview(
          data
        );
      } catch (err) {
        console.error(
          "Club preview error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setClubImportLoading(
          false
        );
      }
    };

  /* =========================================================
     IMPORT CLUBS
  ========================================================= */

  const importClubs =
    async () => {
      clearMessages();

      if (!clubImportFile) {
        setError(
          "Please select the club Excel/CSV file."
        );

        return;
      }

      if (!clubImageZip) {
        setError(
          "Please select the club image ZIP."
        );

        return;
      }

      if (!clubImportPreview) {
        setError(
          "Please preview the import first."
        );

        return;
      }

      setClubImportLoading(
        true
      );

      try {
        const formData =
          new FormData();

        formData.append(
          "clubFile",
          clubImportFile
        );

        formData.append(
          "imageZip",
          clubImageZip
        );

        const response =
          await fetch(
            "http://localhost:5000/api/clubs/import",
            {
              method:
                "POST",

              body:
                formData
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to import clubs."
          );

          return;
        }

        setMessage(
          `Club import completed. Created: ${
            data.created || 0
          }, Updated: ${
            data.updated || 0
          }, Skipped: ${
            data.skipped || 0
          }.`
        );

        setShowImportClubs(
          false
        );

        setClubImportFile(
          null
        );

        setClubImageZip(
          null
        );

        setClubImportPreview(
          null
        );

        if (
          clubFileRef.current
        ) {
          clubFileRef.current.value =
            "";
        }

        if (
          clubZipRef.current
        ) {
          clubZipRef.current.value =
            "";
        }

        await fetchClubs();
      } catch (err) {
        console.error(
          "Club import error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setClubImportLoading(
          false
        );
      }
    };

  /* =========================================================
     PLAYER IMPORT FILE
  ========================================================= */

  const handlePlayerImportFile =
    (event) => {
      const file =
        event.target.files?.[0];

      clearMessages();
      setPlayerImportPreview(
        null
      );

      if (!file) {
        setPlayerImportFile(null);
        return;
      }

      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      if (
        ![
          "xlsx",
          "xls",
          "csv"
        ].includes(
          extension
        )
      ) {
        setError(
          "Please select an Excel or CSV file."
        );

        event.target.value = "";
        return;
      }

      setPlayerImportFile(
        file
      );
    };

  /* =========================================================
     PLAYER ZIP
  ========================================================= */

  const handlePlayerImageZip =
    (event) => {
      const file =
        event.target.files?.[0];

      clearMessages();
      setPlayerImportPreview(
        null
      );

      if (!file) {
        setPlayerImageZip(null);
        return;
      }

      if (
        !file.name
          .toLowerCase()
          .endsWith(".zip")
      ) {
        setError(
          "Please select a ZIP file."
        );

        event.target.value = "";
        return;
      }

      setPlayerImageZip(
        file
      );
    };

  /* =========================================================
     PLAYER IMPORT PREVIEW
  ========================================================= */

  const previewPlayerImport =
    async () => {
      clearMessages();

      if (!playerImportFile) {
        setError(
          "Please select the player Excel/CSV file."
        );

        return;
      }

      if (!playerImageZip) {
        setError(
          "Please select the player image ZIP."
        );

        return;
      }

      setPlayerImportLoading(
        true
      );

      try {
        const formData =
          new FormData();

        formData.append(
          "playerFile",
          playerImportFile
        );

        formData.append(
          "imageZip",
          playerImageZip
        );

        const response =
          await fetch(
            "http://localhost:5000/api/players/import/preview",
            {
              method:
                "POST",

              body:
                formData
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to preview player import."
          );

          return;
        }

        setPlayerImportPreview(
          data
        );
      } catch (err) {
        console.error(
          "Player preview error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setPlayerImportLoading(
          false
        );
      }
    };

  /* =========================================================
     IMPORT PLAYERS
  ========================================================= */

  const importPlayers =
    async () => {
      clearMessages();

      if (!playerImportFile) {
        setError(
          "Please select the player Excel/CSV file."
        );

        return;
      }

      if (!playerImageZip) {
        setError(
          "Please select the player image ZIP."
        );

        return;
      }

      setPlayerImportLoading(
        true
      );

      try {
        const formData =
          new FormData();

        formData.append(
          "playerFile",
          playerImportFile
        );

        formData.append(
          "imageZip",
          playerImageZip
        );

        const response =
          await fetch(
            "http://localhost:5000/api/players/import",
            {
              method:
                "POST",

              body:
                formData
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Failed to import players."
          );

          return;
        }

        setMessage(
          data.message ||
            "Players imported successfully."
        );

        setShowImportPlayers(
          false
        );

        setPlayerImportFile(
          null
        );

        setPlayerImageZip(
          null
        );

        setPlayerImportPreview(
          null
        );

        if (
          playerFileRef.current
        ) {
          playerFileRef.current.value =
            "";
        }

        if (
          playerZipRef.current
        ) {
          playerZipRef.current.value =
            "";
        }

        await fetchPlayers();
      } catch (err) {
        console.error(
          "Player import error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setPlayerImportLoading(
          false
        );
      }
    };

  /* =========================================================
     RESET AUCTION
  ========================================================= */

  const resetAuction =
    async () => {
      const confirmed =
        window.confirm(
          "Reset the auction?\n\nTeams and clubs will remain. Team purses will return to €200,000,000 and purchased squads will be cleared."
        );

      if (!confirmed) {
        return;
      }

      clearMessages();

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/reset/auction",
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
              "Failed to reset auction."
          );

          return;
        }

        setMessage(
          "Auction reset successfully."
        );

        await fetchTeams();
        await fetchPlayers();
        await fetchClubs();
      } catch (err) {
        console.error(
          "Reset auction error:",
          err
        );

        setError(
          "Unable to connect to the server."
        );
      }
    };

  /* =========================================================
     DASHBOARD SECTION
  ========================================================= */

  const renderDashboard =
    () => (
      <>
        <header className="admin-header">

          <div>

            <p className="header-label">
              AUCTION CONTROL CENTER
            </p>

            <h1>
              Dashboard
            </h1>

          </div>

          <div className="admin-status">

            <span className="status-dot"></span>

            SYSTEM ONLINE

          </div>

        </header>

        <section className="stats-grid">

          <div className="stat-card">

            <span>
              TEAM ACCOUNTS
            </span>

            <strong>
              {teams.length}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              CLUBS
            </span>

            <strong>
              {clubs.length}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              TOTAL PLAYERS
            </span>

            <strong>
              {players.length}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              SOLD PLAYERS
            </span>

            <strong>
              {
                players.filter(
                  (player) =>
                    player.status ===
                    "Sold"
                ).length
              }
            </strong>

          </div>

        </section>

        <section className="overview-grid">

          <div className="overview-card">

            <p className="section-label">
              TEAM ACCOUNTS
            </p>

            <h3>
              {teams.length}
            </h3>

            <span>
              Participating clubs
            </span>

          </div>

          <div className="overview-card">

            <p className="section-label">
              CLUB POOL
            </p>

            <h3>
              {clubs.length}
            </h3>

            <span>
              Registered clubs
            </span>

          </div>

          <div className="overview-card">

            <p className="section-label">
              AUCTION POOL
            </p>

            <h3>
              {
                players.filter(
                  (player) =>
                    player.activeForAuction
                ).length
              }
            </h3>

            <span>
              Active auction players
            </span>

          </div>

          <div className="overview-card">

            <p className="section-label">
              SOLD
            </p>

            <h3>
              {
                players.filter(
                  (player) =>
                    player.status ===
                    "Sold"
                ).length
              }
            </h3>

            <span>
              Players sold so far
            </span>

          </div>

        </section>

        <section className="overview-summary">

          <div>

            <p className="section-label">
              AUCTION SUMMARY
            </p>

            <h2>
              Current Event
            </h2>

          </div>

          <div className="summary-grid">

            <div className="summary-item">

              <span>
                Available Players
              </span>

              <strong>
                {
                  players.filter(
                    (player) =>
                      player.status ===
                      "Available"
                  ).length
                }
              </strong>

            </div>

            <div className="summary-item">

              <span>
                Sold Players
              </span>

              <strong>
                {
                  players.filter(
                    (player) =>
                      player.status ===
                      "Sold"
                  ).length
                }
              </strong>

            </div>

            <div className="summary-item">

              <span>
                Unsold Players
              </span>

              <strong>
                {
                  players.filter(
                    (player) =>
                      player.status ===
                      "Unsold"
                  ).length
                }
              </strong>

            </div>

            <div className="summary-item">

              <span>
                Available Clubs
              </span>

              <strong>
                {
                  clubs.filter(
                    (club) =>
                      club.isAvailable &&
                      !club.assignedTo
                  ).length
                }
              </strong>

            </div>

          </div>

        </section>
      </>
    );

  /* =========================================================
     TEAMS SECTION
  ========================================================= */

  const renderTeams =
    () => (
      <>
        <header className="admin-header">

          <div>

            <p className="header-label">
              TEAM ACCOUNT MANAGEMENT
            </p>

            <h1>
              Teams
            </h1>

          </div>

          <button
            className="add-team-button"
            onClick={() => {
              clearMessages();
              resetTeamForm();
              setShowAddTeam(
                true
              );
            }}
          >
            + Add Team Account
          </button>

        </header>

        <section className="teams-section full-page-section">

          <div className="section-header">

            <div>

              <p className="section-label">
                PARTICIPATING CLUB ACCOUNTS
              </p>

              <h2>
                Teams
              </h2>

            </div>

            <div className="section-count">
              {teams.length} Teams
            </div>

          </div>

          {loadingTeams ? (
            <div className="empty-state">
              Loading teams...
            </div>
          ) : teams.length ===
            0 ? (
            <div className="empty-state">
              No team accounts created yet.
            </div>
          ) : (
            <div className="teams-table-wrapper">

              <table className="teams-table">

                <thead>

                  <tr>

                    <th>
                      CLUB
                    </th>

                    <th>
                      USERNAME
                    </th>

                    <th>
                      PASSWORD
                    </th>

                    <th>
                      PURSE
                    </th>

                    <th>
                      PLAYERS
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {teams.map(
                    (team) => (
                      <tr
                        key={
                          team._id
                        }
                      >

                        <td>
                          {
                            team.club?.name ||
                            "Unassigned"
                          }
                        </td>

                        <td>
                          {
                            team.username
                          }
                        </td>

                        <td>
                          <span className="admin-password">
                            {
                              team.adminPassword ||
                              "—"
                            }
                          </span>
                        </td>

                        <td>
                          €
                          {Number(
                            team.purse ||
                              0
                          ).toLocaleString(
                            "en-US"
                          )}
                        </td>

                        <td>
                          {
                            Array.isArray(
                              team.players
                            )
                              ? team.players.length
                              : 0
                          }
                          {" / 15"}
                        </td>

                        <td>

                          <span
                            className={
                              team.isActive
                                ? "status active"
                                : "status inactive"
                            }
                          >
                            {team.isActive
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>

                        </td>

                        <td>

                          <button
                            className="danger-outline-button"
                            onClick={() =>
                              handleDeleteTeam(
                                team._id
                              )
                            }
                          >
                            DELETE
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>
      </>
    );

  /* =========================================================
     CLUBS SECTION
  ========================================================= */

  const renderClubs =
    () => (
      <>
        <header className="admin-header">

          <div>

            <p className="header-label">
              CLUB MANAGEMENT
            </p>

            <h1>
              Clubs
            </h1>

          </div>

          <div className="club-actions">

            <button
              className="secondary-action-button"
              onClick={() => {
                clearMessages();

                setClubImportFile(null);
                setClubImageZip(null);
                setClubImportPreview(null);

                setShowImportClubs(
                  true
                );
              }}
            >
              Import Clubs
            </button>

            <button
              className="add-team-button"
              onClick={() => {
                clearMessages();
                resetClubForm();

                setShowAddClub(
                  true
                );
              }}
            >
              + Add Club
            </button>

          </div>

        </header>

        <section className="teams-section full-page-section">

          <div className="section-header">

            <div>

              <p className="section-label">
                CLUB POOL
              </p>

              <h2>
                Club List
              </h2>

            </div>

            <div className="section-count">
              {clubs.length} Clubs
            </div>

          </div>

          {loadingClubs ? (
            <div className="empty-state">
              Loading clubs...
            </div>
          ) : clubs.length ===
            0 ? (
            <div className="empty-state">
              No clubs added yet.
            </div>
          ) : (
            <div className="teams-table-wrapper">

              <table className="teams-table">

                <thead>

                  <tr>

                    <th>
                      CLUB
                    </th>

                    <th>
                      COUNTRY
                    </th>

                    <th>
                      ASSIGNED TO
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {clubs.map(
                    (club) => (
                      <tr
                        key={
                          club._id
                        }
                      >

                        <td>
                          {
                            club.name
                          }
                        </td>

                        <td>
                          {
                            club.country ||
                            "—"
                          }
                        </td>

                        <td>
                          {
                            club.assignedTo
                              ?.username ||
                            "—"
                          }
                        </td>

                        <td>

                          <span
                            className={
                              club.isAvailable &&
                              !club.assignedTo
                                ? "status active"
                                : "status inactive"
                            }
                          >
                            {club.isAvailable &&
                            !club.assignedTo
                              ? "AVAILABLE"
                              : "ASSIGNED"}
                          </span>

                        </td>

                        <td>

                          {!club.assignedTo ? (
                            <button
                              className="danger-outline-button"
                              onClick={() =>
                                handleDeleteClub(
                                  club._id
                                )
                              }
                            >
                              DELETE
                            </button>
                          ) : (
                            <span className="assigned-label">
                              LOCKED
                            </span>
                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>
      </>
    );

  /* =========================================================
     PLAYERS SECTION
  ========================================================= */

  const renderPlayers =
    () => (
      <>
        <header className="admin-header">

          <div>

            <p className="header-label">
              PLAYER MANAGEMENT
            </p>

            <h1>
              Players
            </h1>

          </div>

          <div className="player-actions">

            <button
              className="danger-outline-button"
              onClick={
                handleDeleteSelected
              }
              disabled={
                selectedPlayers.length ===
                0
              }
            >
              Delete Selected
            </button>

            <button
              className="danger-button"
              onClick={() =>
                setShowDeleteAll(
                  true
                )
              }
              disabled={
                players.length ===
                0
              }
            >
              Delete All
            </button>

            <button
              className="secondary-action-button"
              onClick={() => {
                clearMessages();

                setPlayerImportFile(
                  null
                );

                setPlayerImageZip(
                  null
                );

                setPlayerImportPreview(
                  null
                );

                setShowImportPlayers(
                  true
                );
              }}
            >
              Import Players
            </button>

            <button
              className="add-team-button"
              onClick={() => {
                clearMessages();
                resetPlayerForm();

                setShowAddPlayer(
                  true
                );
              }}
            >
              + Add Player
            </button>

          </div>

        </header>

        <section className="stats-grid player-stats">

          <div className="stat-card">

            <span>
              TOTAL PLAYERS
            </span>

            <strong>
              {players.length}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              AVAILABLE
            </span>

            <strong>
              {
                players.filter(
                  (player) =>
                    player.status ===
                    "Available"
                ).length
              }
            </strong>

          </div>

          <div className="stat-card">

            <span>
              SOLD
            </span>

            <strong>
              {
                players.filter(
                  (player) =>
                    player.status ===
                    "Sold"
                ).length
              }
            </strong>

          </div>

          <div className="stat-card">

            <span>
              UNSOLD
            </span>

            <strong>
              {
                players.filter(
                  (player) =>
                    player.status ===
                    "Unsold"
                ).length
              }
            </strong>

          </div>

        </section>

        <section className="teams-section full-page-section">

          <div className="section-header">

            <div>

              <p className="section-label">
                PLAYER POOL
              </p>

              <h2>
                Auction Players
              </h2>

            </div>

            <div className="section-count">
              {players.length} Players
            </div>

          </div>

          {loadingPlayers ? (
            <div className="empty-state">
              Loading players...
            </div>
          ) : players.length ===
            0 ? (
            <div className="empty-state">
              No players added yet.
            </div>
          ) : (
            <div className="teams-table-wrapper">

              <table className="teams-table">

                <thead>

                  <tr>

                    <th>

                      <input
                        type="checkbox"
                        checked={
                          players.length >
                            0 &&
                          selectedPlayers.length ===
                            players.length
                        }
                        onChange={
                          toggleSelectAll
                        }
                      />

                    </th>

                    <th>
                      PLAYER
                    </th>

                    <th>
                      POSITION
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      RATING
                    </th>

                    <th>
                      BASE PRICE
                    </th>

                    <th>
                      SOLD TO
                    </th>

                    <th>
                      SOLD PRICE
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {players.map(
                    (player) => {

                      const soldTeam =
                        teams.find(
                          (team) =>
                            String(
                              team._id
                            ) ===
                            String(
                              player.soldTo
                            )
                        );

                      return (
                        <tr
                          key={
                            player._id
                          }
                        >

                          <td>

                            <input
                              type="checkbox"
                              checked={
                                selectedPlayers.includes(
                                  player._id
                                )
                              }
                              onChange={() =>
                                togglePlayerSelection(
                                  player._id
                                )
                              }
                            />

                          </td>

                          <td>
                            {
                              player.name
                            }
                          </td>

                          <td>
                            {
                              player.position
                            }
                          </td>

                          <td>
                            {
                              player.category
                            }
                          </td>

                          <td>
                            {
                              player.rating
                            }
                          </td>

                          <td>
                            €
                            {Number(
                              player.basePrice ||
                                0
                            ).toLocaleString(
                              "en-US"
                            )}
                          </td>

                          <td>
                            {
                              soldTeam
                                ?.club?.name ||
                              player.soldTo &&
                              typeof player.soldTo ===
                                "object"
                                ? player.soldTo
                                    ?.club?.name ||
                                  "—"
                                : "—"
                            }
                          </td>

                          <td>
                            {player.status ===
                            "Sold"
                              ? `€${Number(
                                  player.soldPrice ||
                                    0
                                ).toLocaleString(
                                  "en-US"
                                )}`
                              : "—"}
                          </td>

                          <td>

                            <span
                              className={
                                player.status ===
                                "Sold"
                                  ? "status inactive"
                                  : player.status ===
                                    "Unsold"
                                  ? "status unsold"
                                  : "status active"
                              }
                            >
                              {String(
                                player.status
                              ).toUpperCase()}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>
      </>
    );

  /* =========================================================
     SQUADS SECTION
  ========================================================= */

  const renderSquads =
    () => (
      <>
        <header className="admin-header">

          <div>

            <p className="header-label">
              SQUAD MONITORING
            </p>

            <h1>
              Squads
            </h1>

          </div>

          <div className="section-count">
            {teams.length} Teams
          </div>

        </header>

        {loadingTeams ? (
          <div className="empty-state">
            Loading squads...
          </div>
        ) : teams.length ===
          0 ? (
          <div className="empty-state">
            No team accounts available.
          </div>
        ) : (
          <div className="squads-grid">

            {teams.map(
              (team) => {

                const squad =
                  Array.isArray(
                    team.players
                  )
                    ? team.players
                    : [];

                const goalkeeperCount =
                  squad.filter(
                    (player) =>
                      player.position ===
                      "Goalkeeper"
                  ).length;

                const defenderCount =
                  squad.filter(
                    (player) =>
                      player.position ===
                      "Defender"
                  ).length;

                const midfielderCount =
                  squad.filter(
                    (player) =>
                      player.position ===
                      "Midfielder"
                  ).length;

                const forwardCount =
                  squad.filter(
                    (player) =>
                      player.position ===
                      "Forward"
                  ).length;

                const totalSpent =
                  squad.reduce(
                    (
                      total,
                      player
                    ) =>
                      total +
                      Number(
                        player.soldPrice ||
                          0
                      ),
                    0
                  );

                return (
                  <div
                    className="squad-card"
                    key={
                      team._id
                    }
                  >

                    <div className="squad-card-header">

                      <div className="squad-club-info">

                        <div className="squad-club-logo">

                          {team.club?.logo ? (
                            <img
                              src={
                                team.club.logo.startsWith(
                                  "http"
                                )
                                  ? team.club.logo
                                  : `http://localhost:5000${team.club.logo}`
                              }
                              alt={
                                team.club.name
                              }
                            />
                          ) : (
                            <span>
                              {(
                                team.club?.name ||
                                "CL"
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

                          <h2>
                            {
                              team.club?.name ||
                              "Unassigned Club"
                            }
                          </h2>

                          <span>
                            @{team.username}
                          </span>

                        </div>

                      </div>

                      <div className="squad-count">

                        <strong>
                          {
                            squad.length
                          }
                        </strong>

                        <span>
                          / 15
                        </span>

                      </div>

                    </div>

                    <div className="squad-financials">

                      <div>

                        <span>
                          REMAINING PURSE
                        </span>

                        <strong>
                          €
                          {Number(
                            team.purse ||
                              0
                          ).toLocaleString(
                            "en-US"
                          )}
                        </strong>

                      </div>

                      <div>

                        <span>
                          TOTAL SPENT
                        </span>

                        <strong>
                          €
                          {totalSpent.toLocaleString(
                            "en-US"
                          )}
                        </strong>

                      </div>

                    </div>

                    <div className="squad-position-summary">

                      <div>

                        <span>
                          GK
                        </span>

                        <strong>
                          {
                            goalkeeperCount
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          DEF
                        </span>

                        <strong>
                          {
                            defenderCount
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          MID
                        </span>

                        <strong>
                          {
                            midfielderCount
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          FWD
                        </span>

                        <strong>
                          {
                            forwardCount
                          }
                        </strong>

                      </div>

                    </div>

                    <div className="squad-players">

                      {squad.length ===
                      0 ? (

                        <div className="empty-squad">
                          No players purchased yet.
                        </div>

                      ) : (

                        squad.map(
                          (player) => (
                            <div
                              className="squad-player-row"
                              key={
                                player._id
                              }
                            >

                              <div className="squad-player-image">

                                {player.image ? (
                                  <img
                                    src={
                                      player.image.startsWith(
                                        "http"
                                      )
                                        ? player.image
                                        : `http://localhost:5000${player.image}`
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

                              </div>

                              <div className="squad-player-details">

                                <strong>
                                  {
                                    player.name
                                  }
                                </strong>

                                <span>
                                  {
                                    player.position ||
                                    "—"
                                  }
                                  {" • "}
                                  {
                                    player.category ||
                                    "—"
                                  }
                                </span>

                              </div>

                              <div className="squad-player-price">

                                €
                                {Number(
                                  player.soldPrice ||
                                    0
                                ).toLocaleString(
                                  "en-US"
                                )}

                              </div>

                            </div>
                          )
                        )

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </>
    );

  /* =========================================================
     SETTINGS
  ========================================================= */

  const renderSettings =
    () => (
      <>
        <header className="admin-header">

          <div>

            <p className="header-label">
              EVENT SETTINGS
            </p>

            <h1>
              Settings
            </h1>

          </div>

        </header>

        <section className="settings-card">

          <div className="settings-card-header">

            <div>

              <p className="section-label">
                NEW AUCTION
              </p>

              <h2>
                Reset Auction
              </h2>

            </div>

            <span className="settings-warning-badge">
              ADMIN ONLY
            </span>

          </div>

          <p className="settings-description">
            Keep your clubs and team accounts,
            but clear the current auction squads
            and restore every team's purse.
          </p>

          <button
            className="danger-button reset-auction-button"
            onClick={
              resetAuction
            }
          >
            RESET AUCTION
          </button>

        </section>
      </>
    );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="admin-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <span>
            BEYOND
          </span>{" "}
          XI

          <small>
            ADMIN CONTROL
          </small>

        </div>

        <nav>

          <button
            className={`nav-item ${
              activeSection ===
              "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "dashboard"
              )
            }
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "teams"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "teams"
              )
            }
          >
            Teams
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "clubs"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "clubs"
              )
            }
          >
            Clubs
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "players"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "players"
              )
            }
          >
            Players
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "auction"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "auction"
              )
            }
          >
            Live Auction
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "squads"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "squads"
              )
            }
          >
            Squads
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "results"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "results"
              )
            }
          >
            Results
          </button>

          <button
            className={`nav-item ${
              activeSection ===
              "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveSection(
                "settings"
              )
            }
          >
            Settings
          </button>

        </nav>

        <button
          className="logout-button"
          onClick={
            onLogout
          }
        >
          Logout
        </button>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {activeSection ===
          "dashboard" &&
          renderDashboard()}

        {activeSection ===
          "teams" &&
          renderTeams()}

        {activeSection ===
          "clubs" &&
          renderClubs()}

        {activeSection ===
          "players" &&
          renderPlayers()}

        {activeSection ===
          "auction" && (
          <LiveAuction />
        )}

        {activeSection ===
          "squads" &&
          renderSquads()}

        {activeSection ===
          "results" && (
          <section className="placeholder-section">

            <p className="section-label">
              FINAL RESULTS
            </p>

            <h1>
              Results
            </h1>

            <p>
              Auction results will
              appear here.
            </p>

          </section>
        )}

        {activeSection ===
          "settings" &&
          renderSettings()}

      </main>

      {/* =====================================================
          ADD TEAM MODAL
      ===================================================== */}

      {showAddTeam && (
        <div className="modal-overlay">

          <div className="add-team-modal">

            <div className="modal-header">

              <div>

                <p className="section-label">
                  TEAM ACCOUNT
                </p>

                <h2>
                  Create Team Account
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAddTeam(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              className="add-team-form"
              onSubmit={
                handleAddTeam
              }
            >

              <label>
                Select Club

                <select
                  value={
                    teamClubId
                  }
                  onChange={(event) =>
                    setTeamClubId(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select an available club
                  </option>

                  {clubs
                    .filter(
                      (club) =>
                        club.isAvailable &&
                        !club.assignedTo
                    )
                    .map(
                      (club) => (
                        <option
                          key={
                            club._id
                          }
                          value={
                            club._id
                          }
                        >
                          {
                            club.name
                          }
                        </option>
                      )
                    )}

                </select>

              </label>

              <label>
                Username

                <input
                  type="text"
                  value={
                    teamUsername
                  }
                  onChange={(event) =>
                    setTeamUsername(
                      event.target.value
                    )
                  }
                  placeholder="Team username"
                />

              </label>

              <label>
                Password

                <input
                  type="password"
                  value={
                    teamPassword
                  }
                  onChange={(event) =>
                    setTeamPassword(
                      event.target.value
                    )
                  }
                  placeholder="Team password"
                />

              </label>

              <div className="purse-info">

                <span>
                  Starting Purse
                </span>

                <strong>
                  €200,000,000
                </strong>

              </div>

              <button
                type="submit"
                className="create-team-button"
              >
                CREATE TEAM ACCOUNT
              </button>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          ADD CLUB MODAL
      ===================================================== */}

      {showAddClub && (
        <div className="modal-overlay">

          <div className="add-team-modal">

            <div className="modal-header">

              <div>

                <p className="section-label">
                  CLUB MANAGEMENT
                </p>

                <h2>
                  Add Club
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAddClub(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              className="add-team-form"
              onSubmit={
                handleAddClub
              }
            >

              <label>
                Club Name

                <input
                  type="text"
                  value={
                    clubName
                  }
                  onChange={(event) =>
                    setClubName(
                      event.target.value
                    )
                  }
                  placeholder="Club name"
                />

              </label>

              <label>
                Country

                <input
                  type="text"
                  value={
                    clubCountry
                  }
                  onChange={(event) =>
                    setClubCountry(
                      event.target.value
                    )
                  }
                  placeholder="Country"
                />

              </label>

              <label>
                Club Logo URL

                <input
                  type="text"
                  value={
                    clubLogo
                  }
                  onChange={(event) =>
                    setClubLogo(
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />

              </label>

              <button
                type="submit"
                className="create-team-button"
              >
                ADD CLUB
              </button>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          ADD PLAYER MODAL
      ===================================================== */}

      {showAddPlayer && (
        <div className="modal-overlay">

          <div className="add-player-modal">

            <div className="modal-header">

              <div>

                <p className="section-label">
                  PLAYER MANAGEMENT
                </p>

                <h2>
                  Add Player
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAddPlayer(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              className="add-player-form"
              onSubmit={
                handleAddPlayer
              }
            >

              <div className="form-grid">

                <label>
                  Player Name

                  <input
                    type="text"
                    value={
                      playerName
                    }
                    onChange={(event) =>
                      setPlayerName(
                        event.target.value
                      )
                    }
                  />

                </label>

                <label>
                  Age

                  <input
                    type="number"
                    value={
                      playerAge
                    }
                    onChange={(event) =>
                      setPlayerAge(
                        event.target.value
                      )
                    }
                  />

                </label>

                <label>
                  Nationality

                  <input
                    type="text"
                    value={
                      playerNationality
                    }
                    onChange={(event) =>
                      setPlayerNationality(
                        event.target.value
                      )
                    }
                  />

                </label>

                <label>
                  Position

                  <select
                    value={
                      playerPosition
                    }
                    onChange={(event) =>
                      setPlayerPosition(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Position
                    </option>

                    <option value="Goalkeeper">
                      Goalkeeper
                    </option>

                    <option value="Defender">
                      Defender
                    </option>

                    <option value="Midfielder">
                      Midfielder
                    </option>

                    <option value="Forward">
                      Forward
                    </option>

                  </select>

                </label>

                <label>
                  Category

                  <select
                    value={
                      playerCategory
                    }
                    onChange={(event) =>
                      setPlayerCategory(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Category
                    </option>

                    <option value="Elite">
                      Elite
                    </option>

                    <option value="World Class">
                      World Class
                    </option>

                    <option value="High Quality">
                      High Quality
                    </option>

                    <option value="Rising/Value">
                      Rising/Value
                    </option>

                  </select>

                </label>

                <label>
                  Rating

                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={
                      playerRating
                    }
                    onChange={(event) =>
                      setPlayerRating(
                        event.target.value
                      )
                    }
                  />

                </label>

                <label>
                  Base Price

                  <input
                    type="number"
                    value={
                      playerBasePrice
                    }
                    onChange={(event) =>
                      setPlayerBasePrice(
                        event.target.value
                      )
                    }
                  />

                </label>

              </div>

              <label className="full-width-field">

                Player Image

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePlayerImageChange
                  }
                />

                {playerImagePreview && (
                  <div className="player-image-preview">

                    <img
                      src={
                        playerImagePreview
                      }
                      alt="Player preview"
                    />

                  </div>
                )}

              </label>

              <button
                type="submit"
                className="create-team-button"
              >
                ADD PLAYER
              </button>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          IMPORT CLUBS MODAL
      ===================================================== */}

      {showImportClubs && (
        <div className="modal-overlay">

          <div className="import-player-modal">

            <div className="modal-header">

              <div>

                <p className="section-label">
                  CLUB MANAGEMENT
                </p>

                <h2>
                  Import Clubs
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() => {
                  setShowImportClubs(
                    false
                  );

                  setClubImportPreview(
                    null
                  );
                }}
              >
                ×
              </button>

            </div>

            <div className="bulk-upload-section">

              <p className="bulk-upload-title">
                Club Excel / CSV
              </p>

              <input
                ref={
                  clubFileRef
                }
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={
                  handleClubImportFile
                }
              />

            </div>

            <div className="bulk-upload-section">

              <p className="bulk-upload-title">
                Club Image ZIP
              </p>

              <input
                ref={
                  clubZipRef
                }
                type="file"
                accept=".zip"
                onChange={
                  handleClubImageZip
                }
              />

            </div>

            {!clubImportPreview ? (

              <button
                type="button"
                className="create-team-button"
                onClick={
                  previewClubImport
                }
                disabled={
                  clubImportLoading
                }
              >
                {clubImportLoading
                  ? "CHECKING..."
                  : "PREVIEW CLUB IMPORT"}
              </button>

            ) : (

              <div className="import-preview">

                <div className="import-summary">

                  <div>
                    <span>
                      CLUBS
                    </span>

                    <strong>
                      {
                        clubImportPreview.totalRows
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      VALID
                    </span>

                    <strong className="valid-number">
                      {
                        clubImportPreview.validRows
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      INVALID
                    </span>

                    <strong className="invalid-number">
                      {
                        clubImportPreview.invalidRows
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      MISSING
                    </span>

                    <strong
                      className={
                        clubImportPreview.missingImages >
                        0
                          ? "invalid-number"
                          : "valid-number"
                      }
                    >
                      {
                        clubImportPreview.missingImages
                      }
                    </strong>
                  </div>

                </div>

                <div className="preview-table-wrapper">

                  <table className="preview-table">

                    <thead>

                      <tr>

                        <th>
                          CLUB
                        </th>

                        <th>
                          COUNTRY
                        </th>

                        <th>
                          IMAGE
                        </th>

                        <th>
                          STATUS
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {clubImportPreview.preview?.map(
                        (
                          club,
                          index
                        ) => (

                          <tr
                            key={
                              index
                            }
                          >

                            <td>
                              {
                                club.name
                              }
                            </td>

                            <td>
                              {
                                club.country ||
                                "—"
                              }
                            </td>

                            <td>
                              {
                                club.image ||
                                "—"
                              }
                            </td>

                            <td>

                              <span
                                className={
                                  club.valid
                                    ? "status active"
                                    : "status inactive"
                                }
                              >
                                {club.valid
                                  ? club.action ===
                                    "UPDATE"
                                    ? "UPDATE"
                                    : "MATCHED"
                                  : club.assigned
                                  ? "LOCKED"
                                  : "INVALID"}
                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                <div className="import-actions">

                  <button
                    type="button"
                    className="secondary-action-button"
                    onClick={() =>
                      setClubImportPreview(
                        null
                      )
                    }
                  >
                    BACK
                  </button>

                  <button
                    type="button"
                    className="create-team-button"
                    onClick={
                      importClubs
                    }
                    disabled={
                      clubImportLoading ||
                      clubImportPreview.validRows <=
                        0 ||
                      clubImportPreview.missingImages >
                        0
                    }
                  >
                    {clubImportLoading
                      ? "IMPORTING..."
                      : `IMPORT ${
                          clubImportPreview.validRows
                        } CLUBS`}
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>
      )}

      {/* =====================================================
          IMPORT PLAYERS MODAL
      ===================================================== */}

      {showImportPlayers && (
        <div className="modal-overlay">

          <div className="import-player-modal">

            <div className="modal-header">

              <div>

                <p className="section-label">
                  PLAYER MANAGEMENT
                </p>

                <h2>
                  Import Players
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowImportPlayers(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="bulk-upload-section">

              <p className="bulk-upload-title">
                Player Excel / CSV
              </p>

              <input
                ref={
                  playerFileRef
                }
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={
                  handlePlayerImportFile
                }
              />

            </div>

            <div className="bulk-upload-section">

              <p className="bulk-upload-title">
                Player Image ZIP
              </p>

              <input
                ref={
                  playerZipRef
                }
                type="file"
                accept=".zip"
                onChange={
                  handlePlayerImageZip
                }
              />

            </div>

            {!playerImportPreview ? (

              <button
                type="button"
                className="create-team-button"
                onClick={
                  previewPlayerImport
                }
                disabled={
                  playerImportLoading
                }
              >
                {playerImportLoading
                  ? "CHECKING..."
                  : "PREVIEW PLAYER IMPORT"}
              </button>

            ) : (

              <div className="import-preview">

                <div className="import-summary">

                  <div>
                    <span>
                      PLAYERS
                    </span>

                    <strong>
                      {
                        playerImportPreview.totalRows
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      VALID
                    </span>

                    <strong className="valid-number">
                      {
                        playerImportPreview.validRows
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      INVALID
                    </span>

                    <strong className="invalid-number">
                      {
                        playerImportPreview.invalidRows
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      MISSING
                    </span>

                    <strong
                      className={
                        playerImportPreview.missingImages >
                        0
                          ? "invalid-number"
                          : "valid-number"
                      }
                    >
                      {
                        playerImportPreview.missingImages
                      }
                    </strong>
                  </div>

                </div>

                <div className="preview-table-wrapper">

                  <table className="preview-table">

                    <thead>

                      <tr>

                        <th>
                          PLAYER
                        </th>

                        <th>
                          POSITION
                        </th>

                        <th>
                          CATEGORY
                        </th>

                        <th>
                          RATING
                        </th>

                        <th>
                          STATUS
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {playerImportPreview.preview?.map(
                        (
                          player,
                          index
                        ) => (

                          <tr
                            key={
                              index
                            }
                          >

                            <td>
                              {
                                player.name
                              }
                            </td>

                            <td>
                              {
                                player.position
                              }
                            </td>

                            <td>
                              {
                                player.category
                              }
                            </td>

                            <td>
                              {
                                player.rating
                              }
                            </td>

                            <td>

                              <span
                                className={
                                  player.valid
                                    ? "status active"
                                    : "status inactive"
                                }
                              >
                                {player.valid
                                  ? "MATCHED"
                                  : "INVALID"}
                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                <div className="import-actions">

                  <button
                    type="button"
                    className="secondary-action-button"
                    onClick={() =>
                      setPlayerImportPreview(
                        null
                      )
                    }
                  >
                    BACK
                  </button>

                  <button
                    type="button"
                    className="create-team-button"
                    onClick={
                      importPlayers
                    }
                    disabled={
                      playerImportLoading ||
                      playerImportPreview.validRows <=
                        0 ||
                      playerImportPreview.missingImages >
                        0
                    }
                  >
                    {playerImportLoading
                      ? "IMPORTING..."
                      : `IMPORT ${
                          playerImportPreview.validRows
                        } PLAYERS`}
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE ALL PLAYERS
      ===================================================== */}

      {showDeleteAll && (
        <div className="modal-overlay">

          <div className="delete-confirm-modal">

            <p className="section-label">
              DANGER ZONE
            </p>

            <h2>
              Delete All Players?
            </h2>

            <p>
              This will permanently remove
              all player records.
            </p>

            <div className="delete-confirm-actions">

              <button
                className="secondary-action-button"
                onClick={() =>
                  setShowDeleteAll(
                    false
                  )
                }
              >
                CANCEL
              </button>

              <button
                className="danger-button"
                onClick={
                  handleDeleteAll
                }
              >
                DELETE ALL
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminDashboard;