import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { apiURL } from "../../config.json";

export const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                const adminkey = localStorage.getItem('adminkey');

                if (adminkey) {
                    const response = await axios.post(`${apiURL}/logout`, { username: "developed by wondexz" }, { headers: { "x-api-key": adminkey } })

                    if (response.data.success) {
                        localStorage.removeItem('adminkey');
                        navigate('/auth/login');
                    } else {
                        console.error('Çıkış başarısız:', response.data.message);
                    }
                } else {
                    navigate('/auth/login');
                }
            } catch (error) {
                console.error('Logout isteği sırasında bir hata oluştu:', error);
            }
        };

        handleLogout();
    }, [navigate]);

    return null;
};
