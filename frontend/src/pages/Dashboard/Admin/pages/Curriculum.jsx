import React, { useState } from "react";
import styles from "./Curriculum.module.scss";
import { TbCircleCheckFilled, TbEdit, TbInfoCircle, TbPlus } from "react-icons/tb";

import Layout from "components/Layout/Layout";
import Loading from "components/Loading/Loading";
import CourseTable from "./components/CourseTable/CourseTable";
import ManageCurriculum from "./components/ManageCurriculum/ManageCurriculum";
import PopupAlert from "components/Popup/PopupAlert";
import Breadcrumb from "components/Navigation/Breadcrumb";
import { MessageWarning } from "components/ui/Message/MessageWarning";

import { usePopupAlert } from "hooks";
import useFetchData from "hooks/useFetchData";
import Table from "components/Table/Table";
import { formatCurrency } from "utils/formatCurrency";
import IconSizes from "constants/IconSizes";

const Curriculum = () => {
  const [state, setState] = useState({
    currentStep: 1,
    currentMode: "base",
    successType: null,
    selectedProgram: null,
    programData: null,
    curriculumData: [],
  });

  const updateState = (key, value) => setState((prev) => ({ ...prev, [key]: value }));

  const { data: programs } = useFetchData("program");
  const { data: curriculums } = useFetchData("curriculum");
  const { data: courses } = useFetchData("course");
  const { data: users } = useFetchData("user");

  const { popupState, showPopup, setShowPopup, showError } = usePopupAlert();

  const pageLabels = {
    create: "Create Curriculum",
    edit: "Edit Curriculum",
  };

  const steps = [
    "Select a Program",
    state.programData?.description || "",
    pageLabels[state.currentMode],
    "Success",
  ];

  const handleSelectProgram = (program) => {
    console.log(program);

    const programCurriculums = curriculums.filter(
      (curriculum) => curriculum.programId === program._id
    );

    updateState("selectedProgram", program);
    updateState("programData", program);
    updateState("curriculumData", programCurriculums);

    handleNextStep();
  };

  const handleNextStep = () => {
    updateState(
      "currentStep",
      state.currentStep === 1 && state.currentMode === "create"
        ? 3
        : state.currentStep + 1
    );
  };

  const handlePreviousStep = () => {
    if (state.curriculumData?.length !== 0) {
      updateState("currentMode", "base");
      updateState("currentStep", state.currentStep - 1);
    } else {
      updateState("currentStep", 1);
    }
  };

  const handleSuccess = (type) => {
    updateState("successType", type);
    handleNextStep();
  };

  const handleSuccessBack = () => {
    updateState("currentMode", "base");
    updateState("currentStep", 2);
  };

  const handleSetMode = (mode) => {
    updateState("currentMode", mode);
    handleNextStep();
  };

  const YearCard = ({ yearIndex, programDetails }) => {
    const yearData = [
      {
        title: "First Year",
        description: "Introduction to foundational subjects and core principles.",
        courses: 5,
        summerClass: false,
        semesterBreakdown: "2 semesters",
        programNotes: "General education courses.",
      },
      {
        title: "Second Year",
        description: "Building on fundamentals with intermediate coursework.",
        courses: 6,
        summerClass: true,
        semesterBreakdown: "2 semesters",
        programNotes: "Opportunity for summer classes in subjects.",
      },
      {
        title: "Third Year",
        description: "Advanced topics and specialized courses to enhance.",
        courses: 7,
        summerClass: false,
        semesterBreakdown: "2 semesters",
        programNotes: "Specialized coursework with internships.",
      },
      {
        title: "Fourth Year",
        description: "Practical experience, research, and capstone projects.",
        courses: 4,
        summerClass: false,
        semesterBreakdown: "2 semesters",
        programNotes: "Capstone project or internship required.",
      },
      {
        title: "Fifth Year",
        description: "Finalizing expertise and preparing for graduation.",
        courses: 3,
        summerClass: true,
        semesterBreakdown: "2 semesters",
        programNotes: "Final thesis or graduation project, plus career prep workshops.",
      },
    ];

    const { title, description, courses, summerClass, programNotes } =
      yearData[yearIndex];

    return (
      <div className={styles.curriculumCard}>
        <div className={styles.container}>
          <div className={styles.yearTitle}>
            <p className={styles.badge}>{title}</p>
            <p className={styles.yearDescription}>{description}</p>
          </div>
          <div className={styles.yearDetails}>
            <div className={styles.line}></div>
            <h4>{courses} courses</h4>
            <p>
              {summerClass ? "Summer classes available" : "No summer classes available"}
            </p>
            <div className={`${styles.iconLabel} ${styles.desc}`}>
              <TbInfoCircle size={IconSizes.SMALL} />
              <p>{programNotes}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const yearLabels = {
    1: "First year",
    2: "Second year",
    3: "Third year",
    4: "Fourth year",
    5: "Fifth year",
  };

  const CurriculumSection = ({ title, data, yearLevel, semester }) => (
    <div className={styles.curriculumInfo}>
      <h2>{title}</h2>
      <p className={styles.desc}>
        {yearLabels[yearLevel]} - Semester {semester}
      </p>
      <CourseTable curriculumData={data} courses={courses} users={users} />
    </div>
  );

  const renderData = (data) => {
    return (
      <>
        <p className={styles.badge}>{data.code}</p>
        <p>{data.description}</p>
        <p>{formatCurrency(data.fees[0].tuitionFee + data.fees[1].tuitionFee)}</p>
        <p>{data.duration} years</p>
      </>
    );
  };

  return (
    <Layout role="admin" pageName="Curriculum">
      <main className={styles.mainContent}>
        <Breadcrumb
          base="dashboard"
          steps={steps}
          handlePreviousStep={handlePreviousStep}
          setCurrentStep={(step) => updateState("currentStep", step)}
          currentStep={state.currentStep}
        />
        <h1>{steps[state.currentStep - 1]}</h1>
        <section className={styles.wrapper}>
          {state.currentStep === 1 && (
            <>
              {!state.curriculumData.length && state.selectedProgram && (
                <MessageWarning
                  title="This program does not have a curriculum!"
                  message="Create one by proceeding to the next step."
                />
              )}
              <div className={styles.selectProgram}>
                <Table
                  data={programs}
                  headers={["Code", "Name", "Tuition fee (per year)", "Duration"]}
                  gridTemplateColumns="150px 1fr 350px 350px"
                  isSingleObject={true}
                  content={renderData}
                  items={10}
                  clickable={true}
                  clickableAction={handleSelectProgram}
                  tools={false}
                  actionBtn={false}
                  checkbox={false}
                />
              </div>
            </>
          )}
          {state.currentStep === 2 && state.currentMode === "base" && (
            <div className={styles.editWrapper}>
              <div className={styles.spaceBetween}>
                <h2 className={styles.title}>Overview</h2>
                <div className={styles.buttonContainer}>
                  <button
                    onClick={() => handleSetMode("edit")}
                    className={`${styles.iconBtn} ${styles.primaryBtn}`}
                  >
                    <TbEdit size={20} /> Manage curriculum
                  </button>
                </div>
              </div>
              <div className={styles.summaryContainer}>
                {Array.from({ length: state.programData.duration }, (_, index) => (
                  <YearCard key={index} yearIndex={index} />
                ))}
              </div>
              <div className={styles.editContainer}>
                {state.curriculumData.map((curriculum) =>
                  [
                    {
                      title: "Core courses",
                      desc: "Mandatory courses essential to the field.",
                      yearLevel: curriculum.yearLevel,
                      semester: curriculum.semester,
                      data: curriculum.coreCourses,
                    },
                    {
                      title: "Elective courses",
                      desc: "Courses for exploring additional interests.",
                      yearLevel: curriculum.yearLevel,
                      semester: curriculum.semester,
                      data: curriculum.electiveCourses,
                    },
                  ].map((section, index) => (
                    <CurriculumSection key={index} {...section} />
                  ))
                )}
              </div>
            </div>
          )}
          {state.currentStep === 3 && (
            <ManageCurriculum
              courses={courses}
              programData={state.programData}
              curriculumData={state.curriculumData}
              selectedProgram={state.selectedProgram}
              handlePreviousStep={handlePreviousStep}
              handleSuccess={handleSuccess}
              currentMode={state.currentMode}
            />
          )}
          {state.currentStep === 4 && (
            <div className={styles.success}>
              <div className={styles.content}>
                <TbCircleCheckFilled color="green" size={100} />
                <h2 className={styles.title}>
                  {state.successType === "create"
                    ? "Curriculum created successfully!"
                    : "Curriculum edited successfully!"}
                </h2>
                <p className={styles.desc}>
                  {state.successType === "create"
                    ? "Head back to the initial page to create or edit another program’s curriculum."
                    : "Head back to the initial page to make further edits or create new curriculums."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSuccessBack()}
                className={styles.primaryBtn}
              >
                Back to Overview
              </button>
            </div>
          )}
        </section>
      </main>
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

export default Curriculum;
