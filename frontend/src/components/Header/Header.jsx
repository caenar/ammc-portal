import React, { useState } from "react";
import styles from "./Header.module.scss";
import { TbBell, TbLogout, TbSettings, TbUser } from "react-icons/tb";

import Popup from "components/Popup/Popup";
import { useAuth } from "hooks";
import useFetchData from "hooks/useFetchData";
import IconSizes from "constants/IconSizes";
import { useDataContext } from "hooks/contexts/DataContext";
import { findDataById } from "utils/findDataById";
import { getUserPhoto } from "utils/getUserPhoto";
import UserIcon from "components/ui/UserIcon/UserIcon";

export const Header = () => {
  const [isPopupVisibleUser, setPopupVisibleUser] = useState(false);
  const [popupUserPosition, setPopupUserPosition] = useState({
    top: 0,
    right: 0,
  });

  const [isPopupVisibleNotif, setPopupVisibleNotif] = useState(false);
  const [popupNotifPosition, setPopupNotifPosition] = useState({
    top: 0,
    right: 0,
  });

  const togglePopupUser = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupUserPosition({ top: rect.bottom + 10, left: rect.left - 200 });
    setPopupVisibleUser((prev) => !prev);
  };

  const togglePopupNotif = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupNotifPosition({ top: rect.bottom + 10, left: rect.left - 360 });
    setPopupVisibleNotif((prev) => !prev);
  };

  const closePopupUser = () => {
    setPopupVisibleUser(false);
  };

  const closePopupNotif = () => {
    setPopupVisibleNotif(false);
  };

  const { user: loggedInUser, logout } = useAuth();
  const { dataState: programs } = useDataContext("program");

  const { data: user } = useFetchData(
    `${loggedInUser.role === "student" ? "student" : "user"}/${loggedInUser.userId}`
  );

  const program = programs ? findDataById(programs, user.programId) : null;

  return (
    user && (
      <>
        <header className={styles.header}>
          <div className={styles.sideBar}>
            <button
              className={`${styles.circleBtn} ${styles.notifications}`}
              onClick={togglePopupNotif}
            >
              <TbBell size={23} strokeWidth={1.7} />
            </button>
            <div className={styles.userContainer} onClick={togglePopupUser}>
              <UserIcon image={getUserPhoto(user.userPhoto)} size={35} />
            </div>
          </div>
        </header>

        <Popup show={isPopupVisibleUser} close={closePopupUser} position={popupUserPosition}>
          <div className={styles.popupWrapperUser}>
            <div className={styles.userContainer}>
              <div className={styles.userIcon}>
                <img src={getUserPhoto(user.userPhoto)} alt="Your Profile Icon" />
              </div>
              <div className={styles.userName}>
                <h3 className={styles.name}>
                  {user.firstName} {user.lastName}
                </h3>
                {user.role === "student" ? (
                  <p className={styles.course}>
                    {program?.code} - {user.yearLevel}
                  </p>
                ) : (
                  <p className={styles.course}>Administrator</p>
                )}
              </div>
            </div>
            <div className={styles.popupContent}>
              <div className={styles.line}></div>
              <button type="button" className={styles.iconBtn}>
                <a href="a" className={styles.alignCenter}>
                  <TbUser size={IconSizes.LARGE} strokeWidth={1.8}/>
                  My Profile
                </a>
              </button>
              <button type="button" className={styles.iconBtn}>
                <a href="a" className={styles.alignCenter}>
                  <TbSettings size={IconSizes.LARGE} strokeWidth={1.8}/>
                  Account Settings
                </a>
              </button>
              <div className={styles.line}></div>
              <button onClick={logout} className={styles.iconBtn}>
                <TbLogout size={IconSizes.LARGE} strokeWidth={1.8}/>
                Sign out
              </button>
            </div>
          </div>
        </Popup>

        <Popup
          show={isPopupVisibleNotif}
          close={closePopupNotif}
          position={popupNotifPosition}
        >
          <div className={styles.popupWrapperNotif}>
            <div className={styles.titleContainer}>
              <h2>Notifications</h2>
              <button type="button" className={styles.ctaBtn}>
                Mark all as read
              </button>
            </div>
            <div className={styles.line}></div>
            <div className={styles.popupContent}>
              <div className={styles.notifItem}>
                <div className={styles.notifUser}>
                  <div className={styles.notifCircle}></div>
                  <p>IA</p>
                </div>
                <div className={styles.notifContent}>
                  <p>
                    <strong>Ivan Agripa</strong> wants to send you a <strong>reviewer</strong>{" "}
                    for you to pass the exam.
                  </p>
                  <p className={styles.status}>Just now</p>
                </div>
              </div>
              <div className={styles.notifItem}>
                <div className={styles.notifUser}>
                  <div className={styles.notifCircle}></div>

                  <p>SB</p>
                </div>
                <div className={styles.notifContent}>
                  <p>
                    <strong>Sean Bronosa</strong> wanted to message you.
                  </p>
                  <p className={styles.status}>5 mins ago</p>
                </div>
              </div>
              <div className={styles.notifItem}>
                <div className={styles.notifUser}>
                  <p>JS</p>
                </div>
                <div className={styles.notifContent}>
                  <p>
                    <strong>Jhobby Sorsogon</strong> created a <strong>group chat</strong> for
                    you to look at!
                  </p>
                  <p className={styles.status}>8 mins ago</p>
                </div>
              </div>
            </div>
          </div>
        </Popup>
      </>
    )
  );
};

export default Header;
