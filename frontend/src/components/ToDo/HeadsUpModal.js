import React, { useEffect } from "react";
import { loginWithGoogle } from "../../auth"; 
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import "./HeadsUpModal.css";  // Import modal styling

const LoginModal = ({ setShowLoginModal, setModalDismissed }) => {  
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setShowLoginModal(false);  
            }
        });

        return () => unsubscribe(); 
    }, [setShowLoginModal]);
    
    const handleContinueLocally = () => {
        setShowLoginModal(false);  
        setModalDismissed(true);  
    };

    const handleGoogleSignIn = () => {
        loginWithGoogle();  
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>You're Not Logged In</h2>
                <p>Your task was saved locally. Log in to save tasks across sessions.</p>
                <div className="modal-buttons">
                    <button className="button buttonBlue" onClick={handleContinueLocally}>
                        Continue Locally
                    </button>
                    <button className="button buttonGreen" onClick={handleGoogleSignIn}>
                        Log In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
