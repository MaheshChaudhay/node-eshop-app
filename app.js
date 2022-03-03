const path = require("path");
// VK43PDU8piPR937b
const express = require("express");
const csrf = require("csurf");
const expressSession = require("express-session");

const createSessionConfig = require("./config/session-config");
const checkAuthStatusMiddleware = require("./middlrewares/check-auth");
const authRoutes = require("./routes/auth-routes");
const productsRoutes = require("./routes/products-routes");
const baseRoutes = require("./routes/base-routes");
const adminRoutes = require("./routes/admin-routes");
const cartRoutes = require("./routes/cart-routes");
const ordersRoutes = require("./routes/orders-routes");
const addCsrfTokenMiddleware = require("./middlrewares/csrf-token");
const errorHandlerMiddleware = require("./middlrewares/error-handler");
const protectRoutesMiddleware = require("./middlrewares/protect-routes");
const updateCartPricesMiddleware = require("./middlrewares/update-cartPrices");
const cartMiddleware = require("./middlrewares/cart");
const notFoundMiddleware = require("./middlrewares/not-found");

const db = require("./data/database");

const app = express();
const port = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use("/products/assets", express.static("product-data"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const sessionConfig = createSessionConfig();
app.use(expressSession(sessionConfig));
app.use(csrf());

app.use(cartMiddleware);
app.use(updateCartPricesMiddleware);
app.use(addCsrfTokenMiddleware);
app.use(checkAuthStatusMiddleware);

app.use(baseRoutes);
app.use(authRoutes);
app.use(productsRoutes);
app.use("/cart", cartRoutes);

app.use("/orders", protectRoutesMiddleware, ordersRoutes);
app.use("/admin", protectRoutesMiddleware, adminRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

db.connectToDatabase()
  .then(function () {
    app.listen(port);
  })
  .catch(function (error) {
    console.log("Failed to connect to the database");
    console.log(error);
  });
