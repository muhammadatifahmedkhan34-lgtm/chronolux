import React from 'react'
import clsx from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost' | 'primary'
}

export default function Button({ className, variant='default', children, ...props }: Props){
  const base = 'px-4 py-2 rounded-md font-medium transition'
  const variants: Record<string,string> = {
    default: 'bg-white border border-slate-200 text-dark-brown hover:shadow',
    ghost: 'bg-transparent text-dark-brown',
    primary: 'bg-gold text-white'
  }
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>{children}</button>
  )
}
