import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from 'react-helmet';
import { projectName, projectAvatar, apiURL, apikey } from "../../config.json";
import { Sidebar } from '../utils/Sidebar';
import { WarningAlert } from '../utils/WarningAlert';
import axios from "axios";

export const Panel = () => {
    const [showWarning, setShowWarning] = useState(false);
    const [botData, setBotData] = useState({ ram: 0, servers: 0, users: 0, ping: 0 });
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const code = localStorage.getItem('adminkey');

                if (!code) {
                    navigate('/auth/login');
                    return;
                }

                const response = await axios.post(`${apiURL}/check`, { code: code });

                if (!response.data.success) {
                    setShowWarning(true);

                    setTimeout(() => {
                        localStorage.removeItem('adminkey');
                        navigate('/auth/login');
                    }, 5000);
                }
            } catch (error) {
                console.error('Auth kontrolü sırasında bir hata oluştu:', error);
            }
        };

        checkAuth();

        const intervalId = setInterval(checkAuth, 1000);

        return () => clearInterval(intervalId);
    }, [navigate]);

    useEffect(() => {
        const checkBotToken = async () => {
            try {
                const response = await axios.post(`${apiURL}/getBot`, {}, {
                    headers: {
                        'x-api-key': apikey,
                    },
                });

                if (!response.data.token) {
                    navigate('/panel/settings');
                }
            } catch (error) {
                console.error('Bot token kontrolü sırasında bir hata oluştu:', error);
                navigate('/panel/settings');3
            }
        };

        const intervalId = setInterval(checkBotToken, 1);

        return () => clearInterval(intervalId);
    }, [navigate]);

    useEffect(() => {
        const fetchBotData = async () => {
            try {
                const response = await axios.post(`${apiURL}/bot/data`, {}, {
                    headers: {
                        'x-api-key': apikey,
                    },
                });
                const { ram, servers, users, ping } = response.data;
                setBotData({ ram, servers, users, ping });
                console.log(response)
            } catch (error) {
                console.error('Bot verileri alınırken bir hata oluştu:', error);
            }
        };

        fetchBotData();

        const intervalId = setInterval(fetchBotData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const startBot = async () => {
        try {
            const response = await axios.post(`${apiURL}/bot/start`, {}, {
                headers: {
                    'x-api-key': apikey,
                },
            });

            if (response.data.success) {
                setAlertMessage('Bot başlatıldı');
                setAlertType('success');
            } else {
                setAlertMessage('Botu başlatırken bir hata oluştu');
                setAlertType('error');
            }
        } catch (error) {
            console.error('Bot başlatılırken bir hata oluştu:', error);
            setAlertMessage('Botu başlatırken bir hata oluştu');
            setAlertType('error');
        }
    };

    const stopBot = async () => {
        try {
            const response = await axios.post(`${apiURL}/bot/stop`, {}, {
                headers: {
                    'x-api-key': apikey,
                },
            });

            if (response.data.success) {
                setAlertMessage('Bot durduruldu');
                setAlertType('success');
            } else {
                setAlertMessage('Botu durdururken bir hata oluştu');
                setAlertType('error');
            }
        } catch (error) {
            console.error('Bot durdurulurken bir hata oluştu:', error);
            setAlertMessage('Botu durdururken bir hata oluştu');
            setAlertType('error');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#12131a] text-white font-poppins min-h-screen flex"
        >
            <Sidebar />
            <div className="flex-1 flex flex-col ml-16 mt-16">
                <Helmet>
                    <title>{projectName} - Panel</title>
                    <link rel='icon' href={projectAvatar}></link>
                </Helmet>

                <AnimatePresence>
                    {showWarning && (
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
                                <WarningAlert message="Oturumunuzun süresi doldu!" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {alertMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className={`fixed top-4 w-full flex justify-center z-50 ${alertType === 'success' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                className="w-90 p-4 text-white rounded-lg shadow-lg"
                            >
                                {alertMessage}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col items-end pr-40">
                    <div className="flex flex-wrap justify-end gap-5 mt-6">
                        <div className="w-80 p-4 bg-gray-800 text-gray-300 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold">Ram</h2>
                            <p className="text-lg">{botData.ram || "Bot kapalı durumda"}</p>
                        </div>
                        <div className="w-80 p-4 bg-gray-800 text-gray-300 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold">Sunucular</h2>
                            <p className="text-lg">{botData.servers || "Bot kapalı durumda"}</p>
                        </div>
                        <div className="w-80 p-4 bg-gray-800 text-gray-300 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold">Kullanıcılar</h2>
                            <p className="text-lg">{botData.users || "Bot kapalı durumda"}</p>
                        </div>
                        <div className="w-80 p-4 bg-gray-800 text-gray-300 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold">Ping</h2>
                            <p className="text-lg">{botData.ping || "Bot kapalı durumda"}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-5 mt-6">
                        <button
                            onClick={startBot}
                            className="w-40 p-2 bg-green-500 text-white rounded-lg shadow-lg"
                        >
                            Botu Başlat
                        </button>
                        <button
                            onClick={stopBot}
                            className="w-40 p-2 bg-red-500 text-white rounded-lg shadow-lg"
                        >
                            Botu Durdur
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};