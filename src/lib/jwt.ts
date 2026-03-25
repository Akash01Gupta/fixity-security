import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

export const signToken = (payload: object) => {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  try {
    console.log(token)
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};