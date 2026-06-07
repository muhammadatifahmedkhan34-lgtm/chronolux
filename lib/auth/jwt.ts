import * as jwt from 'jsonwebtoken'

const JWT_SECRET: jwt.Secret = (process.env.JWT_SECRET || 'please_change_me') as jwt.Secret

export function signJwt(payload: string | object | Buffer, expiresIn = '7d'){
  // Use casts to satisfy overloaded type signatures in @types/jsonwebtoken
  return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn } as any)
}

export function verifyJwt<T = any>(token: string): T | null{
  try{
    return jwt.verify(token, JWT_SECRET) as T
  }catch(err){
    return null
  }
}
