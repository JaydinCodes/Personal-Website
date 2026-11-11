import clsx from 'clsx'

export default function Card({ as: Component = 'div', className = '', children, ...props }) {
  return (
    <Component
      className={clsx(
        'rounded-3xl border border-white/15 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
