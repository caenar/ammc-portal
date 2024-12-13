import React from "react";
import styles from "./EnrollmentView.module.scss";

import Table from "components/Table/Table";

export const EnrollmentView = ({
  type,
  data,
  renderData,
  onExport,
  onDelete,
  isPopupVisible,
  setIsPopupVisible,
  popupContent,
  handleNextStep,
}) => {

  return type === "student" ? (
    <Table
      data={data}
      headers={[
        { label: "Name", attribute: "firstName" },
        { label: "Program & Year", attribute: "" },
        { label: "Courses", attribute: "lastActive" },
        { label: "Enrolled On", attribute: "createdAt" },
      ]}
      filters={[
        { label: "Name", attribute: "firstName" },
        { label: "Student ID", attribute: "studentId" },
      ]}
      content={renderData}
      onExport={onExport}
      onDelete={onDelete}
      isPopupVisible={isPopupVisible}
      setIsPopupVisible={setIsPopupVisible}
      popupContent={popupContent}
      ctaText="Enroll student"
      ctaAction={handleNextStep}
    />
  ) : (
    <Table
      data={data}
      headers={[
        { label: "Name", attribute: "firstName" },
        { label: "Program & Year", attribute: "role" },
        { label: "Instructor", attribute: "lastActive" },
        { label: "Enrolled On", attribute: "createdAt" },
      ]}
      filters={[
        { label: "User ID", attribute: "userId" },
        { label: "Role", attribute: "role" },
        { label: "Name", attribute: "firstName" },
        { label: "Username", attribute: "username" },
      ]}
      // content={(data) => (
      // <>
      //   <p>{data.name}</p>
      //   <p>{data.programId}</p>
      //   <p>{data.curriculumId}</p>
      //   <p>{formatDate(data.createdAt)}</p>
      // </>
      // )}
      onExport={onExport}
      onDelete={onDelete}
      popupContent={popupContent}
      isPopupVisible={isPopupVisible}
      setIsPopupVisible={setIsPopupVisible}
      ctaText="Enroll student"
      ctaAction={handleNextStep}
    />
  );
};
