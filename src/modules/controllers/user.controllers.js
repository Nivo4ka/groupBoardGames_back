const User = require("../../DB/models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const path = require("path");

const generateJwt = (_id, login, role) => {
  return jwt.sign({ _id, login, role }, process.env.key, {
    expiresIn: "24h",
  });
};
const parseJwt = (token) => {
  return jwt.verify(token, process.env.key);
};

const mapAsync = (arr, func) => Promise.all(arr.map(func));

module.exports.postUser = async (req, res) => {
  const {
    login,
    password,
    firstName,
    secondName,
    lastName,
    email,
    region,
    locality,
  } = req.body;
  if (
    !login ||
    !password ||
    !firstName ||
    !secondName ||
    !email ||
    !region ||
    !locality
  ) {
    res.status(409).send("One of the fields is not filled in");
  } else {
    const checkUser = await User.findOne({
      $or: [{ login: login }, { email: email }],
    });
    if (checkUser) {
      res.status(421).send("User with this login or email already exists");
    } else {
      const hashPassword = await bcrypt.hash(password, 4);
      const avatar = "";
      const user = new User({
        firstName,
        secondName,
        lastName,
        login,
        email,
        password: hashPassword,
        region,
        locality,
        avatar,
        role: "user",
      });
      user.save().then(() => {
        const newUser = User.findOne({
          $or: [{ login: login }, { email: email }],
        }).then((result) => {
          const token = generateJwt(result._id, result.login, result.role);
          const {
            _id,
            firstName,
            secondName,
            lastName,
            email,
            region,
            locality,
            avatar,
            role,
          } = result;
          Review.find({ autorID: _id })
            .sort({ created_at: -1 })
            .then(async (resUsers) => {
              const rating = await mapAsync(resUsers, async (i) => {
                const user = await User.findOne(
                  { _id: i.userID },
                  "_id firstName secondName avatar"
                );
                return { ...i, user };
              });
              res.send({
                token,
                _id,
                firstName,
                secondName,
                lastName,
                email,
                region,
                locality,
                avatar,
                role,
                rating,
              });
            });
        });
      });
    }
  }
};

module.exports.getUser = async (req, res) => {
  const { login, password } = req.body;
  const checkUser = await User.findOne({ login });
  if (!checkUser) {
    res.status(401).send("This user does not exist");
  } else {
    const comparePassword = bcrypt.compareSync(password, checkUser.password);
    if (!comparePassword) {
      res.status(409).send("The entered password is incorrect");
    } else {
      const {
        _id,
        login,
        firstName,
        secondName,
        lastName,
        email,
        region,
        locality,
        avatar,
        role,
      } = checkUser;
      const token = generateJwt(_id, login, role);
      Review.find({ autorID: _id })
        .sort({ created_at: -1 })
        .then(async (resUsers) => {
          const rating = await mapAsync(resUsers, async (i) => {
            const user = await User.findOne(
              { _id: i.userID },
              "_id firstName secondName avatar"
            );
            return { ...i, user };
          });
          res.send({
            token,
            _id,
            firstName,
            secondName,
            lastName,
            email,
            region,
            locality,
            avatar,
            role,
            rating,
          });
        });
    }
  }
};

module.exports.patchUserAvatar = async (req, res) => {
  const { headers, files } = req;
  if (headers.token && files.img) {
    const { _id, login } = parseJwt(headers.token);
    const { img } = files;
    let end = img.name.split(".");
    end = end[end.length - 1];
    let fileName = uuid.v4() + "." + end;
    img.mv(path.resolve(__dirname, "../../source/images", fileName));
    fileName = "http://localhost:8080/" + fileName;
    User.updateOne({ _id }, { avatar: fileName }).then(() => {
      const perUser = User.findOne({ login }).then((user) => {
        const token = generateJwt(user._id, user.login, user.role);
        const {
          _id,
          firstName,
          secondName,
          lastName,
          email,
          region,
          locality,
          avatar,
          role,
        } = user;
        Review.find({ autorID: _id })
          .sort({ created_at: -1 })
          .then(async (resUsers) => {
            const rating = await mapAsync(resUsers, async (i) => {
              const user = await User.findOne(
                { _id: i.userID },
                "_id firstName secondName avatar"
              );
              return { ...i, user };
            });
            res.send({
              token,
              _id,
              firstName,
              secondName,
              lastName,
              email,
              region,
              locality,
              avatar,
              role,
              rating,
            });
          });
      });
    });
  } else {
    res.status(409).send("User not found or image not selected");
  }
};

module.exports.patchUser = async (req, res) => {
  const { headers, body } = req;
  const { firstName, secondName, lastName, region, locality } = body;
  if (headers.token && firstName && secondName && region && locality) {
    const { _id } = parseJwt(headers.token);
    User.updateOne(
      { _id },
      { firstName, secondName, lastName, region, locality }
    ).then(() => {
      const perUser = User.findOne({ _id }).then((user) => {
        const token = generateJwt(user._id, user.login, user.role);
        const {
          _id,
          firstName,
          secondName,
          lastName,
          email,
          region,
          locality,
          avatar,
          role,
        } = user;
        Review.find({ autorID: _id })
          .sort({ created_at: -1 })
          .then(async (resUsers) => {
            const rating = await mapAsync(resUsers, async (i) => {
              const user = await User.findOne(
                { _id: i.userID },
                "_id firstName secondName avatar"
              );
              return { ...i, user };
            });
            res.send({
              token,
              _id,
              firstName,
              secondName,
              lastName,
              email,
              region,
              locality,
              avatar,
              role,
              rating,
            });
          });
      });
    });
  } else {
    res.status(409).send("User not found or the data is not correct");
  }
};
