import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Teacher from './components/dashboardForTeacher/Teacher.jsx';
import Create_New_Class from "./components/dashboardForTeacher/Create_New_Class.jsx";
import AllReports from './components/StudentProgressForTeacher/AllReports.jsx';
import ClassManager from './components/manage_classesForTeacher/ClassManager.jsx';
import ClassCard from './components/manage_classesForTeacher/ClassCard.jsx';
import ViewClasses from './components/manage_classesForTeacher/ViewClasses.jsx';
import ClassDetails from './components/manage_classesForTeacher/ClassDetails.jsx'; 
import ClassStudentReports from './components/manage_classesForTeacher/ClassStudentReports.jsx'; 
import LoginPage from './components/teacherLoginRegister/LoginPage.jsx';
import RegisterPage from "./components/teacherLoginRegister/RegisterPage";
import ForgotPassword from "./components/teacherLoginRegister/ForgotPassword";
import StudentLoginPage from './studentPages/StudentLogin.jsx';
import ViewStudentSimulation from "./studentPages/StudentSimulation.jsx";
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './DarkLightMood/ThemeContext';
import { NotificationsProvider } from "./hooks/NotificationsContext";
import { StudentNotificationsProvider } from "./studentPages/StudentNotifications";
import StudentHome from './studentPages/StudentHome';
import StudentRecentActivites from './studentPages/StudentRecentActivities';
import MyReports from './studentPages/MyReports';
import ClassesDoneSimulation from './studentPages/ClassesDoneSimulation';
import SimulationResult from './studentPages/SimulationResult';
import MyProgress from './studentPages/MyProgress';

import VerifyCode from "./components/teacherLoginRegister/VerifyCode";
import ResetPassword from "./components/teacherLoginRegister/ResetPassword";

import Homepage from './layoutForEducatorsAndStudents/Homepage';
import ProgressOfChosenStudent from './components/StudentProgressForTeacher/ProgressOfChosenStudent.jsx';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationsProvider>
          <StudentNotificationsProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Homepage />} />

                <Route path="/teacher-login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} /> 
                <Route path="/teacher/Teacher" element={<Teacher />} />
                <Route path="/teacher/Create_New_Class" element={<Create_New_Class />} />
                <Route path="/all-reports" element={<AllReports />} />
                <Route path="/all-reports/:studentId" element={<AllReports />} />
                <Route path="/manage_classes" element={<ClassManager />} />
                <Route path="/class-card" element={<ClassCard />} />
                <Route path="/view-classes" element={<ViewClasses />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/progress-of-chosen-student/:studentId" element={<ProgressOfChosenStudent />} />
                {/* ✅ חדשים לכפתורים */}
                <Route path="/teacher/class/:classCode" element={<ClassDetails />} />
                <Route path="/teacher/class/:classCode/reports" element={<ClassStudentReports />} />
              
                {/* לסטודנט */}
                <Route path="/StudentHome" element={<StudentHome />} />
                <Route path="/student-login" element={<StudentLoginPage />} />
                <Route path="/student-simulation" element={<ViewStudentSimulation />} />
                <Route path="/studentRecentActivites" element={<StudentRecentActivites />} />
                <Route path="/classesDoneSimulation" element={<ClassesDoneSimulation />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/simulation_result" element={<SimulationResult />} />
                <Route path="/my_progress" element={<MyProgress />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </Router>
          </StudentNotificationsProvider>
        </NotificationsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
