import Image from 'next/image';
import React from 'react'
import "tailwindcss/tailwind.css";
import themeImage from '../../public/themeImage.png'
const Background = () => {
  return (
    <div className='w-screen h-screen flex items-center justify-center  bg-[#021B1F]'>
        <Image src={themeImage} alt='Theme Image' height={300} width={600} className='object-cover'/>
    </div>
  )
}

export default Background