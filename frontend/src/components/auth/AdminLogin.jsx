import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email
        if (!email.endsWith('@service.admin.com')) {
            toast.error('Admin email must end with @service.admin.com');
            return;
        }

        setLoading(true);

        try {
            const response = await loginAdmin({ email, password });
            
            // Check if we have the necessary data
            if (!response.data || !response.data.token || !response.data.user) {
                throw new Error('Invalid response from server');
            }

            // Store auth data
            login(response.data.token, {
                ...response.data.user,
                role: 'admin'
            });

            toast.success('Admin login successful!');
            navigate('/admin/dashboard');
            
        } catch (error) {
            console.error('Admin login error:', error);
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
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Admin Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="admin@service.admin.com"
                        required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Must end with @service.admin.com
                    </p>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-green-500 text-white p-2 rounded
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}
                        transition duration-200`}
                >
                    {loading ? 'Logging in...' : 'Login as Admin'}
                </button>

                <div className="mt-4 text-center">
                    <p className="text-gray-600">
                        Need an admin account?{' '}
                        <Link 
                            to="/admin/register" 
                            className="text-green-500 hover:text-green-600 hover:underline"
                        >
                            Register here
                        </Link>
                    </p>
                    <p className="mt-2 text-gray-600">
                        Not an admin?{' '}
                        <Link 
                            to="/login" 
                            className="text-blue-500 hover:text-blue-600 hover:underline"
                        >
                            User Login here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default AdminLogin;