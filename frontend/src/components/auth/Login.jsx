import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        // if (email.endsWith('@gmail.com')) {
        //     toast.error('Please use admin login for admin accounts');
        //     return;
        // }

        setLoading(true);

        try {
            const response = await loginUser({ email, password });
            
            // Check if we have the necessary data
            if (!response.data || !response.data.token || !response.data.user) {
                throw new Error('Invalid response from server');
            }

            // Store auth data
            login(response.data.token, {
                ...response.data.user,
                role: 'user'
            });

            toast.success('Login successful!');
            navigate('/dashboard');
            
        } catch (error) {
            console.error('Login error:', error);
            toast.error(
                error.response?.data?.message || 
                'Invalid credentials or server error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">User Login </h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your@email.com"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-500 text-white p-2 rounded
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
                        transition duration-200`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <div className="mt-4 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            className="text-blue-500 hover:text-blue-600 hover:underline"
                        >
                            Register here
                        </Link>
                    </p>
                    <p className="mt-2 text-gray-600">
                        Are you an admin?{' '}
                        <Link 
                            to="/admin/login" 
                            className="text-green-500 hover:text-green-600 hover:underline"
                        >
                            Admin Login
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;