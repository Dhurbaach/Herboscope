import React from 'react'
import {FaRegEye,FaRegEyeSlash} from "react-icons/fa"

const Input = ({value,placeholder,label,type,name,onChange}) => {
    const[showPassword,setShowPassword]=React.useState(false);

    const toggleShowPassword=()=>{
        setShowPassword(prev=>!prev);
    }
  return (
    <div>
       <label className='text-[13px] text-slate-200/80'>{label}</label>
       <div className='input-box'>
        <input
        type={type==="password" ? showPassword ? "text" : "password" : type}
        placeholder={placeholder}
        className='w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-300/60'
        value={value}
        onChange={onChange} //Just pass the onChange prop
        />

        {type==="password" && (
            <>
            {showPassword ? (
              <FaRegEyeSlash size={22} className='text-cyan-200 cursor-pointer' onClick={toggleShowPassword} />
            ) : (
              <FaRegEye size={22} className='text-slate-300 cursor-pointer' onClick={toggleShowPassword} />
            )}
            
            </>)}
       </div>
    </div>
  )
}

export default Input
