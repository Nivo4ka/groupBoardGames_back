const express = require("express");
const router = express.Router();

const {
  postEvent,
  patchEvent,
  delEvent,
  getEvents,
  getMyEvents,
  getPlayersEvents,
  getEventsForReviews,
  getEvent,
} = require("../controllers/event.controllers.js");

router.post("/event/get", getEvents);
router.get("/event/getEvent", getEvent);
router.get("/event/getMyEvents", getMyEvents);
router.get("/event/getEventsForReviews", getEventsForReviews);
router.get("/event/getPlayersEvents", getPlayersEvents);
router.post("/event/post", postEvent);
router.patch("/event/patch", patchEvent);
router.delete("/event/del", delEvent);

const {
  postPlayer,
  delPlayer,
} = require("../controllers/player.controllers.js");

router.post("/player/post", postPlayer);
router.delete("/player/del", delPlayer);

const {
  getUser,
  postUser,
  patchUser,
  patchUserAvatar,
} = require("../controllers/user.controllers.js");

router.post("/user/get", getUser);
router.post("/user/post", postUser);
router.patch("/user/patch", patchUser);
router.patch("/user/patch/avatar", patchUserAvatar);

const {
  postGame,
  patchGame,
  delGame,
  getGames,
} = require("../controllers/game.controllers.js");

router.get("/game/get", getGames);
router.post("/game/post", postGame);
router.patch("/game/patch", patchGame);
router.delete("/game/del", delGame);

const {
  postComment,
  delComment,
} = require("../controllers/comment.controllers.js");

router.post("/comment/post", postComment);
router.delete("/comment/del", delComment);

const {
  postReview,
  delReview,
  getReviews,
} = require("../controllers/review.controllers.js");

router.post("/review/get", getReviews);
router.post("/review/post", postReview);
router.delete("/review/del", delReview);

module.exports = router;
