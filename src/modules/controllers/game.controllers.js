const Game = require("../../DB/models/games");
const jwt = require("jsonwebtoken");

const parseJwt = (token) => {
  return jwt.verify(token, process.env.key);
};

module.exports.postGame = async (req, res) => {
  const { name, link, image, minPersons, maxPersons } = req.body;
  const { headers } = req;
  const { role } = parseJwt(headers.token);
  if (role === "admin") {
    if (!name || !image || !minPersons || !maxPersons) {
      res.status(409).send("One of the fields is not filled in");
    } else {
      const checkGame = await Game.findOne({ name });
      if (checkGame) {
        res.status(421).send("Game with this name already exists");
      } else {
        const game = new Game({
          name,
          link: link || "",
          image,
          minPersons,
          maxPersons,
        });
        game.save().then(() => {
          Game.find({})
            .sort({ name: 1 })
            .then((result) => {
              res.send({ games: result });
            })
            .catch((err) => res.send(err));
        });
      }
    }
  } else {
    res.status(401).send("User is not admin");
  }
};

module.exports.getGames = async (req, res) => {
  Game.find({})
    .sort({ name: 1 })
    .then((result) => {
      res.send({ games: result });
    })
    .catch((err) => res.send(err));
};

module.exports.patchGame = async (req, res) => {
  const { headers, body } = req;
  const { _id, name, link, image, minPersons, maxPersons } = body;
  const { role } = parseJwt(headers.token);
  if (role === "admin") {
    if (_id && name && image && minPersons && maxPersons) {
      Game.updateOne({ _id }, body).then(() => {
        Game.find({})
          .sort({ name: 1 })
          .then((result) => {
            res.send({ games: result });
          })
          .catch((err) => res.send(err));
      });
    } else {
      res.status(409).send("One of the fields is not filled in");
    }
  } else {
    res.status(401).send("User is not admin");
  }
};

module.exports.delGame = async (req, res) => {
  const { headers, query } = req;
  const { _id } = query;
  const { role } = parseJwt(headers.token);
  if (role === "admin") {
    if (_id) {
      Game.deleteOne({ _id }).then(() => {
        Game.find({})
          .sort({ name: 1 })
          .then((resul) => {
            res.send({ games: resul });
          })
          .catch((err) => res.send(err));
      });
    } else {
      res
        .status(409)
        .send("Delete error, it is not known which record to delete");
    }
  } else {
    res.status(401).send("User is not admin");
  }
};
