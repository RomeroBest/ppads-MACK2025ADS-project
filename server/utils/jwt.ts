import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ujwMX6gyszNRav3rZJS8chVCkqFBHAp9";

// Define os campos esperados no payload do token
interface TokenPayload {
  id: number;
  email: string;
  role: "admin" | "user";
  username: string;
  name?: string | null; // <- ajuste aqui
}

// Gera um token com os campos obrigatórios e expiração de 1 dia
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

// Verifica e decodifica o token recebido
export function verifyTokenFromRequest(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
