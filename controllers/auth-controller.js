const User = require("./../models/user-model");
const authUtil = require("./../util/authentication");
const validation = require("./../util/validation");
const sessionFlash = require("./../util/session-flash");

function getSignup(req, res) {
  let sessionData = sessionFlash.getSessionData(req);
  if (!sessionData) {
    sessionData = {
      email: "",
      confirmEmail: "",
      password: "",
      city: "",
      fullname: "",
      postal: "",
      state: "",
    };
  }
  res.render("customer/auth/signup", {
    inputData: sessionData,
  });
}

async function signup(req, res, next) {
  const enteredData = {
    email: req.body.email,
    confirmEmail: req.body["confirm-email"],
    password: req.body.password,
    fullname: req.body.fullname,
    city: req.body.city,
    postal: req.body.postal,
    state: req.body.state,
  };
  if (
    !validation.userDetailsAreValid(
      req.body.email,
      req.body.password,
      req.body.fullname,
      req.body.city,
      req.body.postal,
      req.body.state
    ) ||
    !validation.emailIsConfirmed(req.body.email, req.body["confirm-email"])
  ) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          "Please check your input. Password must be atleast 6 characters long and postal code must also be 5 characters long.",
        ...enteredData,
      },
      function () {
        res.redirect("/signup");
      }
    );
    return;
  }
  const user = new User(
    req.body.email,
    req.body.password,
    req.body.fullname,
    req.body.city,
    req.body.postal,
    req.body.state
  );

  try {
    const isExistsAlready = await user.existsAlready();

    if (isExistsAlready) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: "User already exists! Try logging in instead.",
          ...enteredData,
        },
        function () {
          res.redirect("/signup");
        }
      );
      return;
    }

    await user.signup();
  } catch (error) {
    next(error);
    return;
  }
  res.redirect("/login");
}

function getLogin(req, res) {
  let sessionData = sessionFlash.getSessionData(req);
  if (!sessionData) {
    sessionData = {
      email: "",
      password: "",
    };
  }
  res.render("customer/auth/login", {
    inputData: sessionData,
  });
}

async function login(req, res) {
  const user = new User(req.body.email, req.body.password);
  let existingUser;
  try {
    existingUser = await user.getUserWithSameEmail();
  } catch (error) {
    next(error);
    return;
  }
  if (!existingUser) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          "Invalid credentials - please double-check your email and password.",
        email: user.email,
        password: user.password,
      },
      function () {
        res.redirect("/login");
      }
    );
    return;
  }
  const passwordIsCorrect = await user.hasMatchingPassword(
    existingUser.password
  );

  if (!passwordIsCorrect) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          "Invalid credentials - please double-check your email and password.",
        email: user.email,
        password: user.password,
      },
      function () {
        res.redirect("/login");
      }
    );
    return;
  }
  authUtil.createUserSession(req, existingUser, function () {
    res.redirect("/");
  });
}

function logout(req, res) {
  authUtil.destroyUserAuthSession(req);
  res.redirect("/login");
}

module.exports = {
  getLogin: getLogin,
  getSignup: getSignup,
  signup: signup,
  login: login,
  logout: logout,
};
