import React from 'react'
import clsx from 'clsx'

type Props = React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'default' | 'ghost' | 'primary'
}

export default function Button({ className, variant='default', children, ...props }: Props){
  const classes = clsx('btn', variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'bg-white border border-slate-200 text-dark-brown', className)
  return (
    <button className={classes} {...props}>{children}</button>
  )
}
