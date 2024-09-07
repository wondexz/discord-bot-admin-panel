import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from 'react-helmet';
import { projectName, projectAvatar, apiURL, apikey } from "../../config.json";
import { Sidebar } from '../utils/Sidebar';
import { SuccessAlert } from "../utils/SuccessAlert";
import axios from "axios";

export const Settings = () => {
    const [botData, setBotData] = useState({
        token: '',
        botstatus: '',
    });
    const [tokenMessage, setTokenMessage] = useState('');
    const [isTokenEditing, setIsTokenEditing] = useState(false);
    const [isWebhookEditing, setIsWebhookEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const code = localStorage.getItem('adminkey');

                if (!code) {
                    navigate('/auth/login?rp=/settings');
                    return;
                }

                const response = await axios.post(`${apiURL}/check`, { code: code });

                if (!response.data.success) {
                    setShowAlert(true);
                    setTokenMessage('Geçersiz oturum. Lütfen tekrar giriş yapın.');

                    setTimeout(() => {
                        localStorage.removeItem('adminkey');
                        navigate('/auth/login?rp=/settings');
                    }, 5000);
                }
            } catch (error) {
                console.error('Auth kontrolü sırasında bir hata oluştu:', error);
            }
        };

        const fetchBotData = async () => {
            try {
                const response = await axios.post(`${apiURL}/getBot`, { username: "developed by wondexz" }, { headers: { "x-api-key": apikey } })

                if (response.data.success) {
                    setBotData({
                        token: response.data.token,
                        botstatus: response.data.botstatus,
                        botactivies: response.data.botactivies,
                    });
                } else {
                    console.error('Bot verileri alınırken bir hata oluştu.');
                }
            } catch (error) {
                console.error('Bot verileri alınırken bir hata oluştu:', error);
            }
        };

        checkAuth();
        fetchBotData();

        const intervalId = setInterval(checkAuth, 10000);

        return () => clearInterval(intervalId);
    }, [navigate]);

    const handleTokenFocus = () => setIsTokenEditing(true);
    const handleTokenBlur = () => setIsTokenEditing(false);
    const handleWebhookFocus = () => setIsWebhookEditing(true);
    const handleWebhookBlur = () => setIsWebhookEditing(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBotData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${apiURL}/setBot`,
                { ...botData },
                {
                    headers: {
                        'x-api-key': apikey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setTokenMessage('Ayarlar başarıyla güncellendi.');
            } else {
                setTokenMessage('Ayarlar güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Ayarlar güncellenirken bir hata oluştu:', error);
            setTokenMessage('Ayarlar güncellenirken bir hata oluştu.');
        } finally {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-screen flex-col items-center"
        >
            <Sidebar />
            <Helmet>
                <title>{projectName} - Ayarlar</title>
                <link rel='icon' href={projectAvatar} />
            </Helmet>

            <AnimatePresence>
                {showAlert && (
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
                            <SuccessAlert message={tokenMessage} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="settings-content flex-1 p-8 mt-20 w-full">
                <h1 className="text-3xl font-bold mb-6">Ayarlar</h1>

                <form className="max-w-4xl mx-auto mb-8" onSubmit={handleSubmit}>
                    <div className="form-control mb-4">
                        <label htmlFor="token" className="label">
                            <span className="label-text">Bot Token:</span>
                        </label>
                        <input
                            type="text"
                            id="token"
                            name="token"
                            className={`input input-bordered ${isTokenEditing ? 'blur-none' : 'blur-sm'}`}
                            style={{ width: '100%', maxWidth: '100%' }}
                            value={botData.token}
                            onFocus={handleTokenFocus}
                            onBlur={handleTokenBlur}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-control mb-4">
                        <label htmlFor="botstatus" className="label">
                            <span className="label-text">Bot Status:</span>
                        </label>
                        <input
                            type="text"
                            id="botstatus"
                            name="botstatus"
                            className="input input-bordered"
                            style={{ width: '100%', maxWidth: '100%' }}
                            value={botData.botstatus}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-control mb-4">
                        <label htmlFor="botstatus" className="label">
                            <span className="label-text">Bot Durumu:</span>
                        </label>
                        <input
                            type="text"
                            id="botactivies"
                            name="botactivies"
                            className="input input-bordered"
                            style={{ width: '100%', maxWidth: '100%' }}
                            value={botData.botactivies}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary">Ayarları kaydet</button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};