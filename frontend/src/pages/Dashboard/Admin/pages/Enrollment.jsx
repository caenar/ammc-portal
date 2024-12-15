import React, { useEffect, useMemo, useState } from "react";
import styles from "./Enrollment.module.scss";
import { TbClock, TbMapPin, TbUser } from "react-icons/tb";

import IconSizes from "constants/IconSizes";
import Layout from "components/Layout/Layout";
import TabMenu from "components/TabMenu/TabMenu";
import UserIcon from "components/ui/UserIcon/UserIcon";
import Breadcrumb from "components/Navigation/Breadcrumb";
import Table from "components/Table/Table";
import Timeline from "components/Timeline/Timeline";
import PopupAlert from "components/Popup/PopupAlert";
import Popup from "components/Popup/Popup";
import Loading from "components/Loading/Loading";
import { UserContainer } from "components/ui/UserContainer/UserContainer";
import { EnrollmentView } from "./components/EnrollmentView/EnrollmentView";

import usePostData from "hooks/usePostData";
import useDeleteData from "hooks/useDeleteData";
import { usePopupAlert } from "hooks";
import { useDataContext } from "hooks/contexts/DataContext";
import { findDataById } from "utils/findDataById";
import { exportToCSV } from "utils/exportToCSV";
import { exportToJSON } from "utils/exportToJSON";
import { formatDate } from "utils/formatDate";

const Enrollment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentCourses, setStudentCourses] = useState({
    core: [],
    elective: [],
  });
  const [selectedCourses, setSelectedCourses] = useState({
    core: [],
    elective: [],
  });

  const [selectedSections, setSelectedSections] = useState({});
  const [currentTimelineStep, setCurrentTimelineStep] = useState(0);
  const [currentTimelineCourse, setCurrentTimelineCourse] = useState(null);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [selectFileType, setSelectFileType] = useState("csv");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { dataState: students } = useDataContext("student");
  const { dataState: instructors } = useDataContext("instructor");
  const { dataState: enrollments } = useDataContext("enrollment");
  const { dataState: programs } = useDataContext("program");
  const { dataState: courses } = useDataContext("course");
  const { dataState: curriculums } = useDataContext("curriculum");
  const { dataState: sections } = useDataContext("section");

  const { popupState, showPopup, showError, showSuccess } = usePopupAlert();
  const { postData, loading } = usePostData();

  const {
    popupState: deleteState,
    showPopup: showDeletePopup,
    deleteData,
  } = useDeleteData("student");

  const steps = [
    "Enrollment",
    "Choose a Student",
    "Select Courses",
    "Assign Section to Courses",
  ];

  const findCourse = (courseId) => {
    return courses.find((course) => course._id === courseId);
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
    if (selectedUser?.studentId) {
      await deleteData(selectedUser?.studentId, null);
    } else {
      await deleteData(selectedUser, null);
    }

    setShowDeleteConfirmation(false);
  };

  const handleExport = (user) => {
    const filename = user?.studentId
      ? `${user?.studentId}-data-export.${selectFileType}`
      : `data-export.${selectFileType}`;

    if (selectFileType === "csv") {
      exportToCSV(filename, !Array.isArray(selectedUser) ? [selectedUser] : selectedUser);
    } else if (selectFileType === "json") {
      exportToJSON(filename, selectedUser);
    }

    setSelectFileType(null);
  };

  const sectionMap = sections?.reduce((map, section) => {
    if (!map[section.courseId]) {
      map[section.courseId] = [];
    }
    map[section.courseId].push({
      instructorId: section.instructorId,
    });
    return map;
  }, {});

  const enrollmentMap = enrollments?.reduce((map, enrollment) => {
    if (!map[enrollment.studentId]) {
      map[enrollment.studentId] = [];
    }

    const instructors = sectionMap[enrollment.courseId] || [];

    map[enrollment.studentId].push({
      courseId: enrollment.courseId,
      type: enrollment.type,
      instructors,
    });

    return map;
  }, {});

  const groupedEnrollments = students
    .map((student) => {
      const {
        firstName,
        lastName,
        userPhoto,
        userId,
        enrollmentStatus,
        enrollmentDate,
        programId,
        yearLevel,
      } = student;

      const studentEnrollments = enrollmentMap[userId] || [];

      return studentEnrollments.length > 0
        ? {
            student: {
              firstName,
              lastName,
              userPhoto,
              userId,
              enrollmentStatus,
              enrollmentDate,
              programId,
              yearLevel,
            },
            enrollments: studentEnrollments,
          }
        : null;
    })
    .filter(Boolean);

  const courseMap = useMemo(() => {
    return courses.reduce((map, course) => {
      map[course._id] = course;
      return map;
    }, {});
  }, [courses]);

  const studentProgram = useMemo(
    () => programs.find((program) => program._id === selectedStudent?.programId),
    [selectedStudent, programs]
  );

  const studentCurriculum = useMemo(
    () =>
      curriculums.find((curriculum) => curriculum._id === selectedStudent?.curriculumId),
    [selectedStudent, curriculums]
  );

  const unenrolledStudents = students.filter((student) => !student.enrollmentStatus);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allSelectedCourses = [...selectedCourses.core, ...selectedCourses.elective];
  const allSectionsSelected = allSelectedCourses.every(
    (courseId) => selectedSections[courseId] !== undefined
  );

  const [timelineProgress, setTimelineProgress] = useState(
    allSelectedCourses.map(() => false)
  );

  useEffect(() => {
    if (studentCurriculum) {
      setStudentCourses({
        core: studentCurriculum.coreCourses,
        elective: studentCurriculum.electiveCourses,
      });
    }
  }, [studentCurriculum]);

  const courseSections = useMemo(() => {
    return currentTimelineCourse
      ? sections.filter((section) => section.courseId === currentTimelineCourse?._id)
      : [];
  }, [currentTimelineCourse, sections]);

  const handleNextStep = (student) => {
    if (currentStep === 2) {
      setSelectedStudent(student);
    }
    if (currentStep === 3) {
      setCurrentTimelineCourse(
        findCourse(selectedCourses.core[0] || selectedCourses.elective[0])
      );
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep === 3) {
      setSelectedStudent(null);
      setSelectedCourses({ core: [], elective: [] });
      setSelectedSections({});
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleTimelineNavigation = (direction) => {
    const previousStep = currentTimelineStep;
    const nextStep = currentTimelineStep + direction;

    if (nextStep < 0 || nextStep >= allSelectedCourses.length) return;
    if (selectedSections[currentTimelineCourse._id] === undefined && direction === 1) {
      return showError("No section selected", "Please choose a section for the course.");
    }

    setTimelineProgress((prev) => {
      const updatedProgress = [...prev];
      updatedProgress[previousStep] = true;
      return updatedProgress;
    });

    setCurrentTimelineStep(nextStep);
    setCurrentTimelineCourse(findCourse(allSelectedCourses[nextStep]));
  };

  const timelineItems = useMemo(
    () =>
      allSelectedCourses.map((courseId, index) => {
        const course = courseMap[courseId];
        return {
          label: course?.code || "Unknown Course",
          description: course?.description || "No description available",
          isActive: index === currentTimelineStep,
          isDone: timelineProgress[index],
        };
      }),
    [allSelectedCourses, currentTimelineStep, courseMap, timelineProgress]
  );

  const handleSelectCourse = (courseId, type) => {
    setSelectedCourses((prevState) => {
      const updatedCourses = prevState[type].includes(courseId)
        ? prevState[type].filter((id) => id !== courseId)
        : [...prevState[type], courseId];

      return {
        ...prevState,
        [type]: updatedCourses,
      };
    });
  };

  const handleSelectAllCourses = (courseIds, type) => {
    setSelectedCourses((prevState) => {
      const updatedCourses = prevState[type].length === courseIds.length ? [] : courseIds;

      return {
        ...prevState,
        [type]: updatedCourses,
      };
    });
  };

  const handleSelectSection = (sectionId) => {
    setSelectedSections((prev) => ({
      ...prev,
      [currentTimelineCourse._id]: sectionId,
    }));
  };

  const handleEnrollStudent = async () => {
    const courseIds = Object.keys(selectedSections);
    const sectionIds = Object.values(selectedSections);

    const courseTypes = courseIds.map((courseId) => {
      if (selectedCourses.core.includes(courseId)) {
        return "core";
      } else if (selectedCourses.elective.includes(courseId)) {
        return "elective";
      } else {
        return "unknown";
      }
    });

    const studentProgram = programs
      ? findDataById(programs, selectedStudent.programId)
      : null;

    const fee = studentProgram.fees.find(
      (item) => item.semester === studentCurriculum.semester
    );

    const tuitionFee = {
      amount: fee.tuitionFee,
      discounts: [],
      totalDue: 0,
    };

    const body = {
      courseIds,
      sectionIds,
      courseTypes,
      schoolYear: "2024-2025",
      studentId: selectedStudent.userId,
      semester: studentCurriculum.semester,
      tuitionFee,
    };

    await postData(body, "enrollment/batch-enroll");
    showSuccess(
      "Success!",
      `${selectedStudent.firstName} has been succesfully enrolled.`
    );
  };

  const renderStudentData = (data) => {
    const program = programs.find((program) => program._id === data.student?.programId);

    return (
      data && (
        <>
          <UserContainer user={data.student} size={48} />
          <p className={styles.role}>
            {program?.code} - {data.student.yearLevel}
          </p>
          <p className={styles.lastActive}>
            {data.enrollments.length > 0
              ? `${data.enrollments.length} courses enrolled`
              : "No courses enrolled"}
          </p>
          <p className={styles.createdAt}>{formatDate(data.student.enrollmentDate)}</p>
        </>
      )
    );
  };

  const renderCourseData = (data) => {
    const program = programs.find((program) => program._id === data.student?.programId);

    return (
      data && (
        <>
          <UserContainer user={data.student} size={48} />
          <p className={styles.role}>
            {program?.code} - {data.student.yearLevel}
          </p>
          <p className={styles.lastActive}>
            {data.enrollments.length > 0
              ? `${data.enrollments.length} courses enrolled`
              : "No courses enrolled"}
          </p>
          <p className={styles.createdAt}>{formatDate(data.student.enrollmentDate)}</p>
        </>
      )
    );
  };

  const renderStudentDataSearch = (data) => {
    const program = programs.find((program) => program._id === data?.programId);

    return (
      data && (
        <>
          <UserContainer user={data} size={48} />
          <p className={styles.role}>
            {program?.code} - {data.yearLevel}
          </p>
        </>
      )
    );
  };

  const renderPopupContent = (data) => (
    <div className={styles.popupWrapper}>
      <button className={styles.iconCta}>Edit details</button>
      <button className={styles.iconCta}>Export details</button>
      <button className={`${styles.deleteBtn} ${styles.iconCta}`}>Delete user</button>
    </div>
  );

  const CourseList = ({ data, type }) => {
    return (
      <div className={styles[`${type}Courses`]}>
        <div className={styles.spaceBetween}>
          <h3>{type === "core" ? "Core courses" : "Elective courses"}</h3>
          <button
            className={styles.primaryBtn}
            onClick={() => handleSelectAllCourses(data, type)}
          >
            {selectedCourses?.length === data?.length ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className={styles.courseContainer}>
          {data?.map((courseId) => {
            const course = courses.find((c) => c._id === courseId);

            return (
              <div
                key={course._id}
                className={`${styles.courseCard} ${
                  selectedCourses[type].includes(course._id) ? styles.selected : null
                }`}
                onClick={() => handleSelectCourse(course._id, type)}
              >
                <div className={styles.courseTitle}>
                  <h3 className={styles.title}>{course.description}</h3>
                  <p className={styles.badge}>{course.code}</p>
                </div>
                <div className={styles.courseInfo}>
                  <div className={styles.line}></div>
                  <div className={styles.courseDetails}>
                    <p>Lab hour: {course.labHour}</p>
                    <p>Lecture hour: {course.lecHour}</p>
                    <p>Total unit: {course.totalUnit}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const tabs = [
    {
      label: "Students",
      content: (
        <EnrollmentView
          type="student"
          data={groupedEnrollments}
          renderData={renderStudentData}
          onExport={handleShowExportPopup}
          onDelete={handleShowDeleteConfirmation}
          isPopupVisible={isPopupVisible}
          setIsPopupVisible={setIsPopupVisible}
          popupContent={renderPopupContent}
          handleNextStep={handleNextStep}
        />
      ),
    },
    {
      label: "Courses",
      content: (
        <EnrollmentView
          type="course"
          data={groupedEnrollments}
          renderData={renderCourseData}
          onExport={handleShowExportPopup}
          onDelete={handleShowDeleteConfirmation}
          isPopupVisible={isPopupVisible}
          setIsPopupVisible={setIsPopupVisible}
          popupContent={renderPopupContent}
          handleNextStep={handleNextStep}
        />
      ),
    },
  ];

  return (
    <Layout role="admin" pageName="Enrollment">
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <Breadcrumb
            base="dashboard"
            steps={steps}
            handlePreviousStep={handlePreviousStep}
            setCurrentStep={setCurrentStep}
            currentStep={currentStep}
          />
          <h1 className={styles.title}>{steps[currentStep - 1]}</h1>
        </div>
        <section className={styles.contentWrapper}>
          {currentStep === 1 && <TabMenu tabs={tabs} />}
          {currentStep === 2 && (
            <div className={styles.selectStudentWrapper}>
              <Table
                data={unenrolledStudents}
                headers={["Name", "Program & Year"]}
                gridTemplateColumns="1fr 1fr"
                isSingleObject={false}
                content={renderStudentDataSearch}
                clickable={true}
                clickableAction={handleNextStep}
                tools={false}
                actionBtn={false}
                checkbox={false}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className={styles.searchContent} key={selectedStudent._id}>
              <div className={styles.sideContent}>
                <div className={styles.userContainer}>
                  <UserIcon image={selectedStudent.userPhoto} size={110} />
                  <div>
                    <h2 className={styles.title}>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <p className={styles.desc}>{selectedStudent.email}</p>
                    <div className={styles.line}></div>
                    <div className={styles.userInfo}>
                      <div className={styles.twoColumn}>
                        <h3>Program</h3>
                        <p>{studentProgram?.code}</p>
                      </div>
                      <div className={styles.twoColumn}>
                        <h3>Year Level</h3>
                        <p>{selectedStudent.yearLevel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.curriculumContent}>
                <div className={styles.instructions}>
                  <h3 className={styles.title}>Instructions</h3>
                  <p className={styles.desc}>
                    Please select the courses you'd like to enroll in. Click on each
                    course to add it to your selection.
                  </p>
                </div>
                <CourseList data={studentCourses.core} type="core" />
                <CourseList data={studentCourses.elective} type="elective" />
                <div className={styles.buttonContainer}>
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.secondaryBtn}`}
                    onClick={() => handlePreviousStep()}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.primaryBtn}`}
                    onClick={() => handleNextStep()}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className={styles.selectSectionWrapper}>
              <div className={styles.sideContent}>
                <div className={styles.timelineContent}>
                  <h2>Selected Courses</h2>
                  <div className={styles.line}></div>
                  <Timeline items={timelineItems} currentStep={currentTimelineStep} />
                </div>
              </div>
              <div className={styles.sectionsContent}>
                <h1>Enroll in a Section for {currentTimelineCourse?.description}</h1>
                <div className={styles.sectionsContainer}>
                  {courseSections.map((section) => {
                    const instructor = instructors.find(
                      (instructor) => instructor.userId === section.instructorId
                    );
                    return (
                      section && (
                        <div
                          key={section._id}
                          className={`${styles.sectionCard} ${
                            selectedSections[currentTimelineCourse._id]?.includes(
                              section._id
                            )
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleSelectSection(section._id)}
                        >
                          <div className={styles.spaceBetween}>
                            <div>
                              <h3 className={styles.title}>{section.description}</h3>
                              <p className={styles.desc}>
                                {section?.capacity} out of {section?.availableSlots}{" "}
                                enrolled
                              </p>
                            </div>
                            <span
                              className={`${styles.badge} ${
                                section?.isActive === true
                                  ? styles.greenBadge
                                  : styles.redBadge
                              }`}
                            >
                              {section?.isActive === true ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className={styles.line}></div>
                          <div className={styles.sectionInfo}>
                            <p className={styles.iconLabel}>
                              <TbUser size={IconSizes.SMALL} />
                              {instructor?.firstName} {instructor?.lastName}
                            </p>
                            <p className={styles.iconLabel}>
                              <TbClock size={IconSizes.SMALL} />
                              {section?.startTime} - {section?.endTime}
                            </p>
                            <p className={styles.iconLabel}>
                              <TbMapPin size={IconSizes.SMALL} />
                              Room {section?.roomCode}
                            </p>
                          </div>
                          <ul>
                            {section?.days.map((day, index) => (
                              <li key={index} className={styles.badge}>
                                {day}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    );
                  })}
                </div>
                <div className={styles.buttonContainer}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => handlePreviousStep()}
                  >
                    Back
                  </button>
                  {currentTimelineStep > 0 && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => handleTimelineNavigation(-1)}
                    >
                      Previous course
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={
                      allSectionsSelected &&
                      currentTimelineStep === allSelectedCourses.length - 1
                        ? () => handleEnrollStudent()
                        : () => handleTimelineNavigation(1)
                    }
                    disabled={loading}
                  >
                    {allSectionsSelected &&
                    currentTimelineStep === allSelectedCourses.length - 1
                      ? "Enroll Student"
                      : "Next course"}
                    {loading && <Loading />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* popups needed */}
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
        icon={popupState.icon}
        border={popupState.border}
        color={popupState.color}
        title={popupState.title}
        message={popupState.message}
        show={showPopup}
      />
    </Layout>
  );
};

export default Enrollment;
