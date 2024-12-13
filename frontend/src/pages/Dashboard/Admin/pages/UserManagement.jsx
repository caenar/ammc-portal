import React, { useEffect, useState } from "react";
import styles from "./UserManagement.module.scss";

import Table from "components/Table/Table";
import Layout from "components/Layout/Layout";
import UserIcon from "components/ui/UserIcon/UserIcon";
import PopupAlert from "components/Popup/PopupAlert";
import Popup from "components/Popup/Popup";
import { FormUser } from "components/Forms/FormUser";

import useFetchData from "hooks/useFetchData";
import useDeleteData from "hooks/useDeleteData";
import { formatDistanceToNow } from "date-fns";
import { capitalize } from "lodash";
import usePostData from "hooks/usePostData";
import { getUserPhoto } from "utils/getUserPhoto";
import { formatDate } from "utils/formatDate";
import { findDataByUserId } from "utils/findDataByUserId";
import useUpdateData from "hooks/useUpdateData";
import { exportToCSV } from "utils/exportToCSV";
import { exportToJSON } from "utils/exportToJSON";

const UserManagement = () => {
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  const [showEditUserPopup, setShowEditUserPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showExportPopup, setShowExportPopup] = useState(false);

  const [selectFileType, setSelectFileType] = useState("csv");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users, fetchData: userFetchData } = useFetchData("user");
  const { data: instructors, fetchData: instructorFetchData } =
    useFetchData("instructor");
  const { data: students, fetchData: studentFetchData } = useFetchData("student");

  const {
    popupState: deleteState,
    showPopup: showDeletePopup,
    deleteData,
  } = useDeleteData("user");

  const {
    popupState: createState,
    showPopup: showCreatePopup,
    loading: createLoading,
    postData,
  } = usePostData();

  const {
    popupState: updateState,
    showPopup: showUpdatePopup,
    loading: updateLoading,
    updateData,
  } = useUpdateData();

  useEffect(() => {
    userFetchData();
    instructorFetchData();
    studentFetchData();
  }, [instructorFetchData, studentFetchData, userFetchData]);

  const handleShowCreatePopup = () => {
    setShowCreateUserPopup((prev) => !prev);
  };

  const handleShowEditPopup = (user) => {
    if (user && user.role === "student") {
      const student = students ? findDataByUserId(students, user.userId) : null;
      setSelectedUser(student);
    } else if (user && user.role === "instructor") {
      const instructor = instructors ? findDataByUserId(instructors, user.userId) : null;
      setSelectedUser(instructor);
    } else {
      setSelectedUser(user);
    }

    setShowEditUserPopup((prev) => !prev);
    setIsPopupVisible(false);
  };

  const handleShowExportPopup = (user) => {
    setSelectedUser(user);
    setIsPopupVisible(false);
    setShowExportPopup((prev) => !prev);
  };

  const handleShowDeleteConfirmation = (data) => {
    if (data) {
      setSelectedUser(data);
      setIsPopupVisible(false);
    }
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    if (selectedUser?.userId) {
      await deleteData(selectedUser?.userId, userFetchData);
    } else {
      await deleteData(selectedUser, userFetchData);
    }

    setShowDeleteConfirmation(false);
  };

  const handleExport = (user) => {
    const filename = user?.userId
      ? `${user?.userId}-data-export.${selectFileType}`
      : `data-export.${selectFileType}`;

    if (selectFileType === "csv") {
      exportToCSV(filename, !Array.isArray(selectedUser) ? [selectedUser] : selectedUser);
    } else if (selectFileType === "json") {
      exportToJSON(filename, selectedUser);
    }

    setSelectFileType(null);
  };

  const handleCreateUser = async (formData, role) => {
    await postData(formData, role.toString(), userFetchData, true);
    setShowCreateUserPopup((prev) => !prev);
  };

  const handleUpdateUser = async (formData) => {
    await updateData(formData, "user", selectedUser?.userId, userFetchData, true);
    instructorFetchData();
    studentFetchData();
    setShowEditUserPopup((prev) => !prev);
  };

  const renderData = (data) => {
    return (
      <>
        <div className={styles.userContainer}>
          <UserIcon image={getUserPhoto(data.userPhoto)} size={48} />
          <div className={styles.userInfo}>
            <h4 className={styles.title}>{`${data.firstName} ${data.lastName}`}</h4>
            <p className={styles.desc}>{data.email}</p>
          </div>
        </div>
        <p>{capitalize(data.role)}</p>
        <p className={styles.lastActive}>
          {formatDistanceToNow(data.lastActive, { addSuffix: true })}
        </p>
        <p className={styles.createdAt}>{formatDate(data.createdAt)}</p>
      </>
    );
  };

  return (
    <Layout role="admin" pageName="User Management">
      <main className={styles.mainContent}>
        <section className={styles.tableWrapper}>
          <div className={styles.tableContainer}>
            <h3 className={styles.label}>
              All users <span>{users?.length}</span>
            </h3>
            <Table
              data={users}
              headers={[
                { label: "Name", attribute: "firstName" },
                { label: "Role", attribute: "role" },
                { label: "Last Seen", attribute: "lastActive" },
                { label: "Created On", attribute: "createdAt" },
              ]}
              filters={[
                { label: "User ID", attribute: "userId" },
                { label: "Role", attribute: "role" },
                { label: "Name", attribute: "firstName" },
                { label: "Username", attribute: "username" },
              ]}
              content={renderData}
              onEdit={handleShowEditPopup}
              onExport={handleShowExportPopup}
              onDelete={handleShowDeleteConfirmation}
              isPopupVisible={isPopupVisible}
              setIsPopupVisible={setIsPopupVisible}
              ctaText="Create user"
              ctaAction={() => handleShowCreatePopup()}
            />
          </div>
        </section>
      </main>

      {/* All of these shit below are popups */}
      <Popup show={showCreateUserPopup} close={handleShowCreatePopup} position="center">
        <div className={styles.userPopup}>
          <h2>Create a user</h2>
          <FormUser
            type="register"
            role="student"
            loading={createLoading}
            createAccount={handleCreateUser}
            createdAction={handleShowCreatePopup}
          />
        </div>
      </Popup>

      <Popup
        show={showEditUserPopup}
        close={handleShowEditPopup}
        position="center"
        handleClickOutside={false}
      >
        <div className={styles.userPopup}>
          <FormUser
            type="edit"
            role={selectedUser?.role ? selectedUser.role : "user"}
            userData={selectedUser}
            loading={updateLoading}
            handleDelete={setShowDeleteConfirmation}
            createAccount={handleUpdateUser}
            createdAction={handleShowEditPopup}
          />
        </div>
      </Popup>

      <Popup
        show={showDeleteConfirmation}
        close={() => setShowDeleteConfirmation(false)}
        position={"center"}
      >
        <div className={styles.userPopup}>
          <p>
            <strong>
              Are you sure you want to delete {selectedUser?.firstName || "these users"}?
            </strong>
          </p>
          <div className={styles.buttonContainer}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancel
            </button>
            <button type="button" className={styles.redBtn} onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </Popup>

      <Popup
        show={showExportPopup}
        close={() => setShowExportPopup(false)}
        position="center"
      >
        <div className={styles.exportPopup}>
          <div>
            <h3 className={styles.title}>Export data</h3>
            <p className={styles.desc}>Select the file type you would like to download</p>
          </div>
          <div className={styles.container}>
            <div
              className={`${styles.fileType} ${
                selectFileType === "csv" ? styles.selected : ""
              }`}
              onClick={() => setSelectFileType("csv")}
            >
              <p>CSV</p>
            </div>
            <div className={styles.line}></div>
            <div
              className={`${styles.fileType} ${
                selectFileType === "json" ? styles.selected : ""
              }`}
              onClick={() => setSelectFileType("json")}
            >
              <p>JSON </p>
            </div>
          </div>
          <div className={styles.line}></div>
          <div className={styles.buttonContainer}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setShowExportPopup(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => handleExport()}
            >
              Export
            </button>
          </div>
        </div>
      </Popup>

      <PopupAlert
        icon={deleteState.icon}
        border={deleteState.border}
        color={deleteState.color}
        title={deleteState.title}
        message={deleteState.message}
        show={showDeletePopup}
      />

      <PopupAlert
        icon={createState.icon}
        border={createState.border}
        color={createState.color}
        title={createState.title}
        message={createState.message}
        show={showCreatePopup}
      />

      <PopupAlert
        icon={updateState.icon}
        border={updateState.border}
        color={updateState.color}
        title={updateState.title}
        message={updateState.message}
        show={showUpdatePopup}
      />
    </Layout>
  );
};

export default UserManagement;
