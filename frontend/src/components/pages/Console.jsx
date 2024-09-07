import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Helmet } from 'react-helmet';
import { projectName, projectAvatar, apiURL, apikey } from "../../config.json";
import { Sidebar } from '../utils/Sidebar';
import { WarningAlert } from '../utils/WarningAlert';
import axios from "axios";
import { SuccessAlert } from '../utils/SuccessAlert';

export const Console = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const code = localStorage.getItem('adminkey');

                if (!code) {
                    navigate('/auth/login?rp=/console');
                    return;
                }

                const response = await axios.post(`${apiURL}/check`, { code: code });

                if (!response.data.success) {
                    setShowWarning(true);

                    setTimeout(() => {
                        localStorage.removeItem('adminkey');
                        navigate('/auth/login?rp=/console');
                    }, 1000);
                } else {
                    setShowWarning(false);
                }
            } catch (error) {
                console.error('Yetkilendirme kontrolü sırasında bir hata oluştu:', error);
            }
        };

        checkAuth();

        const intervalId = setInterval(checkAuth, 1);

        return () => clearInterval(intervalId);
    }, [navigate]);

    const handleSendMessage = async () => {
        if (input.trim()) {
            try {
                const response = await axios.post(
                    `${apiURL}/console`,
                    { message: input },
                    {
                        headers: {
                            'x-api-key': apikey,
                            'Content-Type': 'application/json'
                        }
                    }
                );
    
                if (response.data.success) {
                    setMessages([
                        ...messages,
                        { sender: 'user', text: input },
                        { sender: 'server', text: response.data.message }
                    ]);
                    setInput('');
                    setSendSuccess('Mesaj başarıyla gönderildi!');
                    setSendError('');
    
                    setTimeout(() => {
                        setSendSuccess('');
                    }, 3000);
                } else {
                    setSendSuccess('');
                    setSendError('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
                }
            } catch (error) {
                setSendSuccess('');
                setSendError('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
                console.error('Mesaj gönderilirken bir hata oluştu:', error);
            }
        }
    };
    

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4"
        >
            <Sidebar />
            <Helmet>
                <title>{projectName} - Konsol</title>
                <link rel='icon' href={projectAvatar}></link>
            </Helmet>

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
                        <WarningAlert message="Geçersiz oturum. Lütfen tekrar giriş yapın." />
                    </motion.div>
                </motion.div>
            )}

            {sendError && (
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
                        <SuccessAlert message={sendError} />
                    </motion.div>
                </motion.div>
            )}

            {sendSuccess && (
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
                        <SuccessAlert message={sendSuccess} />
                    </motion.div>
                </motion.div>
            )}

            <motion.div
                className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="h-80 overflow-y-auto bg-gray-700 p-4 rounded-lg mb-4 text-white">
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            className={`p-3 mb-2 rounded-lg ${msg.sender === 'user'
                                ? 'bg-blue-600 text-right'
                                : 'bg-gray-600 text-left'
                                }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="font-bold text-sm mb-1">
                                {msg.sender === 'user' ? 'Sen' : 'Sunucu'}
                            </div>
                            <div>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="input input-bordered input-primary flex-1 mr-2 bg-gray-600 text-white placeholder-gray-400"
                        placeholder="Bir mesaj yaz..."
                    />
                    <motion.button
                        onClick={handleSendMessage}
                        className="btn btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        Gönder
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};
