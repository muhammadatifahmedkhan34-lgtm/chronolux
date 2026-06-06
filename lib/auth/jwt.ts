import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_me'

export function signJwt(payload: object, expiresIn = '7d'){
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyJwt<T = any>(token: string): T | null{
  try{
    return jwt.verify(token, JWT_SECRET) as T
  }catch(err){
    return null
  }
}
