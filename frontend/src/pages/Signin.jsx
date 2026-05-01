import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../layouts/AuthLayout';
import Input from '../components/Input/Input';
import Toast from '../components/Toast';
import { UserContext } from '../components/context/userContext';


export default function Signin() {
    const navigate = useNavigate();
    const { updateUser } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!password) {
            setError('Please enter your password.');
            return;
        }
        setError(null);
        setLoading(true);

        try {
            const res = await api.post('/login', {
                email: email,
                password: password,
            });

            const { token, user } = res.data;

            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                updateUser(user); // Update context
                window.dispatchEvent(new Event('authChanged'));
                
                // Show success toast
                setShowSuccessToast(true);
                
                // Navigate after a short delay so user sees the toast
                setTimeout(() => {
                    if (user && user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                }, 2000);
            }
        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(err.response.data.message);
            }
            else {
                setError('An error occurred during login. Please try again.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (
        <Layout>
            <div className="w-full max-w-md mx-auto h-auto md:h-full mt-8 md:mt-0 flex flex-col justify-center items-center text-white text-center">
                <h3 className="text-xl font-semibold text-slate-50">Welcome Back</h3>
                <p className="text-xs text-slate-200/75 mt-[5px] mb-6 max-w-sm">
                    Please enter your details to login to your account.
                </p>
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
                    <Input
                        type="email"
                        name="email"
                        placeholder="abc@gmail.com"
                        value={email}
                        onChange={({ target }) => setEmail(target.value)}
                        label="Email Address"
                    />
                    <Input
                        type="password"
                        placeholder="Min 8 characters"
                        name="password"
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        label="Password"
                    />
                    {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
                    <button type='submit' className='btn-primary'>LOGIN</button>
                    <p className='text-[13px] text-slate-200/75 mt-3 text-center'>
                        Don't have an account? {" "}
                        <Link className='font-medium text-cyan-200 underline' to="/register">Register</Link>
                    </p>

                </form>
            </div>
            {showSuccessToast && (
                <Toast
                    message="Login successful! Redirecting..."
                    type="success"
                    onClose={() => setShowSuccessToast(false)}
                    duration={1500}
                />
            )}
        </Layout>
    );
}
