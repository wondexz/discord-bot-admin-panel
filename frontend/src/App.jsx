import { Route, Routes } from "react-router-dom";
import { HomePage } from "./components/pages/HomePage";
import { NotFound } from "./components/pages/NotFound";
import { Panel } from "./components/pages/Panel";
import { Login } from "./components/pages/Login";
import { Logout } from "./components/pages/Logout";
import { Console } from "./components/pages/Console"
import { Settings } from "./components/pages/Settings";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/logout" element={<Logout />} />
      <Route path="/panel/console" element={<Console />} />
      <Route path="/panel/settings" element={<Settings />} />
    </Routes>
  );
};