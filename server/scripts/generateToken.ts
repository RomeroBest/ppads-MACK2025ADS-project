import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ujwMX6gyszNRav3rZJS8chVCkqFBHAp9";

const token = jwt.sign(
  {
    id: 1,
    email: "jorgeromeromg2@gmail.com",
    role: "admin",
    username: "Jorge Romero"
  },
  JWT_SECRET,
  { expiresIn: "1d" }
);

console.log("TOKEN JWT:", token);
