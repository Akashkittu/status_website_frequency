import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAdmin } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminRegister = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email domain
        if (!email.endsWith('@service.admin.com')) {
            toast.error('Email must end with @service.admin.com');
            return;
        }

        // Validate password
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await registerAdmin({ email, password });
            toast.success('Admin registered successfully!');
            navigate('/admin/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Admin Registration</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Admin Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="admin@service.admin.com"
                        required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Must end with @service.admin.com
                    </p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-green-500 text-white p-2 rounded
                        ${loading ? 'opacity-50' : 'hover:bg-green-600'}`}
                >
                    {loading ? 'Registering...' : 'Register as Admin'}
                </button>
            </form>
        </div>
    );
};

export default AdminRegister;