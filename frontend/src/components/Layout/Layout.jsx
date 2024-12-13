import React from "react";
import { Helmet } from "react-helmet-async";
import { Sidebar } from "components/Navigation/Sidebar";
import { Header } from "components/Header/Header";

import styles from "./Layout.module.scss";

const Layout = ({ role, pageName, children }) => {
   return (
      <div className={styles.wrapper}>
         <Helmet>
            <title>{pageName} | Dr. AMMC</title>
         </Helmet>
         <div className={styles.gridContainer}>
            <Sidebar role={role} />
            <div className={styles.contentWrapper}>
               <Header />
               <div className={styles.dividerWrapper}>{children}</div>
            </div>
         </div>
      </div>
   );
};

export default Layout;
