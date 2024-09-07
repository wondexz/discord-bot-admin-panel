import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { projectName, projectAvatar, apiURL } from "../../config.json";
import { SuccessAlert } from "../utils/SuccessAlert";
import { ErrorAlert } from "../utils/ErrorAlert";
import axios from 'axios';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const code = localStorage.getItem('adminkey');

        if (code) {
            const rpQuery = new URLSearchParams(location.search).get('rp');
            navigate(`/panel${rpQuery ? `/${rpQuery.replace(/^\//, '')}` : ''}`);
        }
    }, [navigate, location]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${apiURL}/login`, { username: username }, { headers: { "x-api-key": password } })
            const { success, message, code } = response.data;

            if (success) {
                localStorage.setItem('adminkey', code);
                setSuccess(message);
                setError('');
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);

                    const rpQuery = new URLSearchParams(location.search).get('rp');
                    navigate(`/panel${rpQuery ? `/${rpQuery.replace(/^\//, '')}` : ''}`);
                }, 2000);
            } else {
                setError(message);
                setSuccess('');
                setShowAlert(true);
                setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
            }
        } catch (err) {
            setError('Bir hata oluştu, lütfen tekrar deneyin.');
            setSuccess('');
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen"
        >
            <Helmet>
                <title>{projectName} - Giriş Yap</title>
                <link rel="icon" href={projectAvatar}></link>
            </Helmet>
            <AnimatePresence>
                {showAlert && error && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 w-full flex justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="w-90"
                        >
                            <ErrorAlert message={error} />
                        </motion.div>
                    </motion.div>
                )}
                {showAlert && success && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 w-full flex justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="w-80"
                        >
                            <SuccessAlert message={success} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="card w-96 bg-base-100 shadow-xl mt-10">
                <div className="card-body">
                    <img src={projectAvatar} alt="icon" height="100" width="100" />
                    <h1 className="card-title">{projectName} - Giriş Yap</h1>
                    <form onSubmit={handleLogin}>
                        <div className="form-control">
                            <label className="label" htmlFor="username">
                                <span className="label-text">Kullanıcı Adı:</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input input-bordered"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="password">
                                <span className="label-text">Şifre:</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input input-bordered"
                                required
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button type="submit" className="btn btn-primary">Giriş Yap</button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};
