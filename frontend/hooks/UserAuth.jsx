import { useContext,useEffect, useState } from "react"
import { UserContext } from "../src/components/context/userContext"
import { useNavigate } from "react-router-dom";
import api from "../src/utils/api";

export const useUserAuth=()=>{
    const {user,updateUser,clearUser}=useContext(UserContext);
    const navigate=useNavigate();
    const [authMessage, setAuthMessage] = useState(null);

    useEffect(()=>{
        // Check for token first - if no token, redirect immediately
        const token = localStorage.getItem('token');
        if (!token && !user) {
            setAuthMessage("You need to be logged in to access this page. Redirecting to login...");
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
            return;
        }

        // If we already have user, no need to fetch
        if(user) return;
        
        let isMounted=true;

        const fetchUserInfo=async ()=>{
            try{
                const response=await api.get('/profile');
                if(isMounted && response.data){
                    updateUser(response.data);
                }
            } catch(error){
                console.error("Failed to fetch user info:",error);
                if(isMounted){
                    clearUser();
                    setAuthMessage("You need to be logged in to access this page. Redirecting to login...");
                    setTimeout(() => {
                        navigate("/login", { replace: true });
                    }, 2000);
                }
            }
        }
        fetchUserInfo();
        return()=>{
            isMounted=false;
        }
    },[user,updateUser,clearUser,navigate]);

    return { authMessage };
}