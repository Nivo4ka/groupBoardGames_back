const Review = require("../../DB/models/reviews");
const jwt = require("jsonwebtoken");

const parseJwt = (token) => {
  return jwt.verify(token, process.env.key);
};

module.exports.postReview = async (req, res) => {
  const { autorID, rating, description, eventID } = req.body;
  const { headers } = req;
  const { _id } = parseJwt(headers.token);
  if (_id) {
    if (!autorID || !rating || !eventID) {
      res.status(409).send("One of the fields is not filled in");
    } else {
      const checkReview = await Review.findOne({
        $and: [{ eventID }, { userID: _id }],
      });
      if (!checkReview) {
        const review = new Review({
          userID: _id,
          autorID,
          eventID,
          rating,
          description: description || "",
        });
        review.save();
        res.send("OK");
      } else {
        res.status(414).send("Review is already wrote");
      }
    }
  } else {
    res.status(401).send("User is not logged in");
  }
};

module.exports.getReviews = async (req, res) => {
  const { body } = req;
  const { autorID } = body;
  if (autorID) {
    Review.find({ autorID })
      .then((result) => {
        res.send({ reviews: result });
      })
      .catch((err) => res.send(err));
  } else {
    res.status(401).send("User not selected");
  }
};

module.exports.delReview = async (req, res) => {
  const { headers, query } = req;
  const { _id } = query;
  const { role } = parseJwt(headers.token);

  if (_id && role === "admin") {
    Game.deleteOne({
      _id,
    }).then((result) => {
      res.send("OK");
    });
  } else {
    res.status(409).send("User is not admin");
  }
};
