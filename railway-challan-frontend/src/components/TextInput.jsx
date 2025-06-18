import React from 'react'

export default function TextInput ({ name, value, onChange, placeholder, type = 'text', maxLength }) {
  return (
    <>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1E40AF] focus:outline-none text-sm"
      />
    </>
  )
}