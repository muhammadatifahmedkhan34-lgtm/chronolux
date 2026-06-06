export const TOKEN_KEY = 'chrono_token'
export const PENDING_EMAIL_KEY = 'chrono_pending_email'

export function saveToken(token: string){
  if(typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(){
  if(typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken(){
  if(typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

export function savePendingEmail(email: string){
  if(typeof window === 'undefined') return
  localStorage.setItem(PENDING_EMAIL_KEY, email)
}

export function getPendingEmail(){
  if(typeof window === 'undefined') return null
  return localStorage.getItem(PENDING_EMAIL_KEY)
}

export function clearPendingEmail(){
  if(typeof window === 'undefined') return
  localStorage.removeItem(PENDING_EMAIL_KEY)
}

export async function fetchCurrentUser(){
  const token = getToken()
  if(!token) return null
  try{
    const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
    if(!res.ok) return null
    const data = await res.json()
    return data.user
  }catch(e){
    console.error('fetchCurrentUser error', e)
    return null
  }
}

export function logout(){
  removeToken()
}
