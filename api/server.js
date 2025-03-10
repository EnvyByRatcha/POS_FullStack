const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const userController = require("./controller/UserController");
const foodTypeController = require("./controller/FoodTypeController");
const FoodSizeController = require("./controller/FoodSizeController");
const TasteController = require("./controller/TasteController");
const FoodController = require("./controller/FoodController");
const SaleTempController = require("./controller/SaleTempController");
const OrganizationController = require("./controller/OrganizationController");
const BillSaleController = require("./controller/BillSaleController");
const ReportController = require("./controller/ReportController");
const UserController = require("./controller/UserController");

app.use(cors());
app.use(fileUpload());
app.use("/uploads", express.static("./uploads"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*---Middleware--*/

/*---CheckToken?--*/
function isSignIn(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ error: "unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decode = jwt.verify(token, process.env.SECRET_KEY);

    if (!decode.level) {
      return res
        .status(401)
        .send({ error: "Forbidden: Insufficient privileges" });
    }

    req.user = decode.level;
    next();
  } catch (e) {
    return res.status(401).send({ error: "unauthorized" });
  }
}

function isAuthorized(requireLevel) {
  return (req, res, next) => {
    if (!req.user || req.user !== requireLevel) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }
    next();
  };
}

/*---UserController--*/
app.post("/api/user/signIn", (req, res) => userController.signIn(req, res));
app.get("/api/user/list", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  UserController.list(req, res)
);
app.post("/api/user/create", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  UserController.create(req, res)
);
app.put("/api/user/update/:id", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  UserController.update(req, res)
);
app.delete(
  "/api/user/remove/:id",
  isSignIn,
  isAuthorized("ADMIN"),
  (req, res) => UserController.remove(req, res)
);
app.get(
  "/api/user/getLevelFromToken",
  (req, res) => UserController.getLevelFromToken(req, res)
);

/*---foodTypeController--*/
app.post("/api/foodType", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  foodTypeController.create(req, res)
);
app.get("/api/foodType", (req, res) => foodTypeController.list(req, res));
app.delete("/api/foodType/:id", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  foodTypeController.remove(req, res)
);
app.put("/api/foodType", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  foodTypeController.update(req, res)
);

/*---foodSizeController--*/
app.get("/api/foodSize", (req, res) => FoodSizeController.list(req, res));
app.post("/api/foodSize", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  FoodSizeController.create(req, res)
);
app.put("/api/foodSize", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  FoodSizeController.update(req, res)
);
app.delete("/api/foodSize/:id", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  FoodSizeController.remove(req, res)
);
app.get("/api/foodSize/:foodTypeId", (req, res) =>
  FoodSizeController.filter(req, res)
);

/*---TasteController--*/
app.post("/api/taste", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  TasteController.create(req, res)
);
app.get("/api/taste", (req, res) => TasteController.list(req, res));
app.put("/api/taste", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  TasteController.update(req, res)
);
app.delete("/api/taste/:id", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  TasteController.remove(req, res)
);
app.get("/api/taste/:foodTypeId", (req, res) =>
  TasteController.listByFoodId(req, res)
);

/*---FoodController--*/
app.post("/api/food", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  FoodController.create(req, res)
);
app.put("/api/food", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  FoodController.update(req, res)
);
app.get("/api/food", (req, res) => FoodController.list(req, res));
app.post("/api/food/upload", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  FoodController.upload(req, res)
);
app.delete("/api/food/:id", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  FoodController.remove(req, res)
);
app.get("/api/food/:foodType", (req, res) => FoodController.filter(req, res));
app.post("/api/food/paginate", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  FoodController.listPaginate(req, res)
);

/*---SaleTempController--*/
app.post("/api/saleTemp", (req, res) => SaleTempController.create(req, res));
app.get("/api/saletemp/:userId", (req, res) =>
  SaleTempController.list(req, res)
);
app.delete("/api/saleTemp/:userId", (req, res) =>
  SaleTempController.clear(req, res)
);
app.delete("/api/saleTemp/:foodId/:userId", (req, res) =>
  SaleTempController.remove(req, res)
);
app.put("/api/saleTemp/changeQty", (req, res) =>
  SaleTempController.changeQty(req, res)
);
app.post("/api/saleTempDetail", (req, res) =>
  SaleTempController.createDetail(req, res)
);
app.get("/api/saleTempDetail/:saleTempId", (req, res) =>
  SaleTempController.listSaletempDetail(req, res)
);
app.put("/api/saleTempDetail/foodSize", (req, res) =>
  SaleTempController.updateFoodSize(req, res)
);
app.put("/api/saleTempDetail/taste", (req, res) =>
  SaleTempController.updateTaste(req, res)
);
app.post("/api/saleTempDetail/option", (req, res) =>
  SaleTempController.newSaleTempDetail(req, res)
);
app.post("/api/saleTemp/removeSaleTempDetail", (req, res) =>
  SaleTempController.removeSaleTempDetail(req, res)
);
app.post("/api/billSale", (req, res) => SaleTempController.endSale(req, res));
app.post("/api/saleTemp/printBillBeforePay", (req, res) =>
  SaleTempController.printBillBeforePay(req, res)
);
app.post("/api/saleTemp/printBillAfterPay", (req, res) =>
  SaleTempController.printBillAfterPay(req, res)
);
app.put("/api/saleTemp/updateQty", (req, res) =>
  SaleTempController.updateQty(req, res)
);

/*---OrganizationController--*/
app.post("/api/organization", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  OrganizationController.create(req, res)
);
app.get("/api/organization", (req, res) =>
  OrganizationController.info(req, res)
);
app.post(
  "/api/organization/upload",
  isSignIn,
  isAuthorized("ADMIN"),
  (req, res) => OrganizationController.upload(req, res)
);

/*---BillSaleController--*/
app.post("/api/billSale/list", (req, res) => BillSaleController.list(req, res));
app.delete("/api/billSale/:id", (req, res) =>
  BillSaleController.remove(req, res)
);

/*---ReportController--*/
app.post("/api/report/sumPerDay", isSignIn, isAuthorized("ADMIN"), (req, res) =>
  ReportController.sumPerDay(req, res)
);
app.post(
  "/api/report/sumPerMonth",
  isSignIn,
  isAuthorized("ADMIN"),
  (req, res) => ReportController.sumPerMonth(req, res)
);

app.listen(3000, () => {
  console.log("server start...");
});
