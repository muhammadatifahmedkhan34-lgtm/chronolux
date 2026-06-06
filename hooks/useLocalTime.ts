import { useEffect, useState } from 'react'

export default function useLocalTime(){
  const [time, setTime] = useState(new Date())
  useEffect(()=>{
    const id = setInterval(()=>setTime(new Date()),1000)
    return ()=>clearInterval(id)
  },[])
  return time
}
