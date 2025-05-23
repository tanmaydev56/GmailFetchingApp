import React from 'react'

const Authlayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="bg-[#f5f5f5] text-[#000] font-sans antialiased min-h-screen">
      {children}
    </div>
  )
}

export default Authlayout