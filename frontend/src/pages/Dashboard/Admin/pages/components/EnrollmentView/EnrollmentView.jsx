import React from "react";

import Table from "components/Table/Table";
import { formatDate } from "utils/formatDate";

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
  console.log(data);
  

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
      isSingleObject={false}
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
      content={renderData}
      onExport={onExport}
      onDelete={onDelete}
      isSingleObject={false}
      popupContent={popupContent}
      isPopupVisible={isPopupVisible}
      setIsPopupVisible={setIsPopupVisible}
      ctaText="Enroll student"
      ctaAction={handleNextStep}
    />
  );
};
