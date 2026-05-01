import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../layouts/AuthLayout';
import Input from '../components/Input/Input';
import Toast from '../components/Toast';
import { UserContext } from '../components/context/userContext';

const Register = () => {
  const { updateUser } = useContext(UserContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Basic client-side validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    //check if password is at least 8 characters long
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullName,
        email,
        password,
        role,
      };
      const res = await api.post('/register', payload);
      const { token, user, newUser } = res.data;
      const resolvedUser = user || newUser;
      if (token && resolvedUser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(resolvedUser));
        updateUser(resolvedUser); // Update context
        window.dispatchEvent(new Event('authChanged'));
        
        // Navigate immediately so header shows logged-in state
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className='lg:w-[100%] h-auto md:h-full mt-4 md:mt-9 flex flex-col justify-center text-white'>
        <h3 className='text-xl font-semibold text-slate-50'>Create an Account</h3>
        <p className='text-xs text-slate-200/75 mt-[5px] mb-5'>
          Join us today by entering your details below.
        </p>
        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-1'>
            <Input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
            />
            <Input
              type="text"
              name="email"
              placeholder="abc@gmail.com"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
            />
            <div>
              <label className='text-[13px] text-slate-200/80'>Role</label>
              <div className='input-box'>
                <select
                  className='w-full bg-transparent outline-none text-slate-100'
                  value={role}
                  onChange={({ target }) => setRole(target.value)}
                >
                  <option value="user" className='text-slate-100 bg-gray-600'>User</option>
                  <option value="admin" className='text-slate-100 bg-gray-600'>Admin</option>
                </select>
              </div>
            </div>
            <div className='col-span-2'>
              <Input
                type="password"
                placeholder="Min 8 characters"
                name="password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
              />
              <Input
                type="password"
                placeholder="Confirm your password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={({ target }) => setConfirmPassword(target.value)}
                label="Confirm Password"
              />
            </div>
          </div>
          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
          <button type='submit' className='btn-primary'>SIGN UP</button>
          <p className='text-[13px] text-slate-200/75 mt-3'>
            Already have an account? {" "}
            <Link className='font-medium text-cyan-200 underline' to="/login">Login</Link>
          </p>

        </form>
      </div>
      {showSuccessToast && (
        <Toast
          message="Registration successful! Redirecting..."
          type="success"
          onClose={() => setShowSuccessToast(false)}
          duration={1500}
        />
      )}
    </Layout>
  );
};

export default Register;
