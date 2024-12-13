import React from "react";
import { TbAlertTriangle } from "react-icons/tb";

const styles = {
   messageContainer: {
      display: "flex",
      border: "1px solid #ffb433",
      backgroundColor: "#fff0d6",
      borderRadius: "0.4rem",
      gap: "0.7rem",
      padding: "1rem",
      textWrap: "balance",
   },
   title: {
      fontSize: "1rem",
      fontWeight: "600",
      marginBottom: "3px",
   },
   message: {
      fontSize: "0.8rem",
      opacity: "0.5",
   },
};

export const MessageWarning = ({ title, message }) => {
   return (
      <div style={styles.messageContainer}>
         <TbAlertTriangle size={24} color="#ffb433" />
         <div>
            <h2 style={styles.title}>{title}</h2>
            <p style={styles.message}>{message}</p>
         </div>
      </div>
   );
};
