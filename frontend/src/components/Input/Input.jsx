import React from 'react'
import {FaRegEye,FaRegEyeSlash} from "react-icons/fa"

const Input = ({value,placeholder,label,type,name,onChange}) => {
    const[showPassword,setShowPassword]=React.useState(false);

    const toggleShowPassword=()=>{
        setShowPassword(prev=>!prev);
    }
  return (
    <div>
       <label className='text-[13px] text-slate-800'>{label}</label>
       <div className='input-box'>
        <input
        type={type==="password" ? showPassword ? "text" : "password" : type}
        placeholder={placeholder}
        className='w-full bg-transparent outline-none'
        value={value}
        onChange={onChange} //Just pass the onChange prop
        />

        {type==="password" && (
            <>
            {showPassword ? (
                <FaRegEyeSlash size={22} className='text-primary cursor-pointer' onClick={toggleShowPassword} />
            ) : (
                <FaRegEye size={22} className='text-gray-500 cursor-pointer' onClick={toggleShowPassword} />
            )}
            
            </>)}
       </div>
    </div>
  )
}

export default Input
