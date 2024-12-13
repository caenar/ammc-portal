import React, { useEffect, useMemo } from "react";
import styles from "./FormUser.module.scss";

import { FormSelect } from "components/ui/Form";

export const FormInstructor = ({
  userData,
  courseOptions,
  selectedCourses,
  setSelectedCourses,
  selectedDepartment,
  setSelectedDepartment,
}) => {
  const departmentOptions = useMemo(
    () => [
      { value: "Computer Science", label: "Computer Science" },
      { value: "Mathematics", label: "Mathematics" },
      { value: "Physics", label: "Physics" },
      { value: "Chemistry", label: "Chemistry" },
      { value: "Biology", label: "Biology" },
      { value: "Engineering", label: "Engineering" },
      { value: "Business", label: "Business" },
    ],
    []
  );

  // if you edit
  useEffect(() => {
    if (!selectedDepartment && userData.deparment) {
      const department = departmentOptions.find(
        (deparment) => deparment.value === userData.deparment
      );
      if (department) setSelectedDepartment(department);
    }
    if (!selectedCourses && userData.courses) {
      const courses = courseOptions.find((course) => course.value === userData.courses);
      if (courses) setSelectedCourses(courses);
    }
  }, [
    userData,
    courseOptions,
    selectedCourses,
    setSelectedCourses,
    selectedDepartment,
    setSelectedDepartment,
    departmentOptions,
  ]);

  return (
    <>
      <div className={styles.twoColumn}>
        <h4>Department</h4>
        <FormSelect
          name="department"
          searchBar={true}
          options={departmentOptions}
          setSelectedData={setSelectedDepartment}
          selectedData={selectedDepartment}
        />
      </div>
      <div className={styles.line}></div>
      <div className={styles.twoColumn}>
        <h4>Courses</h4>
        <FormSelect
          name="courses"
          searchBar={true}
          options={courseOptions}
          multipleChoices={true}
          height="25rem"
          setSelectedData={setSelectedCourses}
          selectedData={selectedCourses}
        />
      </div>
    </>
  );
};
