-- MySQL Database Setup Script for Smart AI Exam Portal

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS exam_portal;
USE exam_portal;

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS performance_reports;
DROP TABLE IF EXISTS tab_switch_logs;
DROP TABLE IF EXISTS student_responses;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS users;

-- 1. Create Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Exams Table
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create Questions Table
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'multiple_choice',
    options JSON,
    correct_answer VARCHAR(255) NOT NULL,
    marks INT DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- 4. Create Student Responses Table
CREATE TABLE student_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    question_id INT NOT NULL,
    student_id INT NOT NULL,
    submitted_answer VARCHAR(255),
    is_correct BOOLEAN DEFAULT FALSE,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Create Tab Switch Logs Table
CREATE TABLE tab_switch_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    switch_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    details VARCHAR(255),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Create Performance Reports Table
CREATE TABLE performance_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    total_score INT NOT NULL,
    overall_accuracy FLOAT NOT NULL,
    weak_topics JSON,
    strong_topics JSON,
    suggestions JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- Insert Dummy Data for Frontend Testing
-- ==========================================

-- 1. Insert Users
-- Passwords are hashed versions of 'password123'
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin1', 'admin@example.com', 'scrypt:32768:8:1$TcNVKfwlNUTFwVRr$b2065d00c8f20031d98266474b82fc9eabcab1bf3717caf6ac1e3dd6a679bd245410819e3f5216d38ec10caa1c4b800e5da2219d8e0a17b3c3e981e79017a865', 'admin'),
('prof_smith', 'smith@university.edu', 'scrypt:32768:8:1$TcNVKfwlNUTFwVRr$b2065d00c8f20031d98266474b82fc9eabcab1bf3717caf6ac1e3dd6a679bd245410819e3f5216d38ec10caa1c4b800e5da2219d8e0a17b3c3e981e79017a865', 'teacher'),
('johndoe', 'johndoe@student.edu', 'scrypt:32768:8:1$TcNVKfwlNUTFwVRr$b2065d00c8f20031d98266474b82fc9eabcab1bf3717caf6ac1e3dd6a679bd245410819e3f5216d38ec10caa1c4b800e5da2219d8e0a17b3c3e981e79017a865', 'student'),
('janedoe', 'janedoe@student.edu', 'scrypt:32768:8:1$TcNVKfwlNUTFwVRr$b2065d00c8f20031d98266474b82fc9eabcab1bf3717caf6ac1e3dd6a679bd245410819e3f5216d38ec10caa1c4b800e5da2219d8e0a17b3c3e981e79017a865', 'student');

-- 2. Insert Exams
INSERT INTO exams (title, description, start_time, end_time, duration_minutes, created_by) VALUES
('Midterm CS101', 'Introductory Computer Science Midterm covering programming basics.', '2026-05-15 09:00:00', '2026-05-15 11:00:00', 120, 2),
('AI Fundamentals Quiz', 'Short quiz on basic AI concepts and history.', '2026-05-20 14:00:00', '2026-05-20 15:00:00', 30, 2);

-- 3. Insert Questions
INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, marks) VALUES
-- Questions for CS101 Midterm
(1, 'What does CPU stand for?', 'multiple_choice', '["Central Process Unit", "Computer Personal Unit", "Central Processing Unit", "Central Processor Unit"]', 'Central Processing Unit', 2),
(1, 'Is Python a compiled language or an interpreted language?', 'multiple_choice', '["Compiled", "Interpreted", "Both", "Neither"]', 'Interpreted', 2),
(1, 'HTML stands for HyperText Markup Language.', 'true_false', '["True", "False"]', 'True', 1),
-- Questions for AI Fundamentals Quiz
(2, 'What does AI stand for?', 'multiple_choice', '["Artificial Intelligence", "Automated Interface", "Active Intelligence", "Artistic Interface"]', 'Artificial Intelligence', 2),
(2, 'Who is considered the father of Artificial Intelligence?', 'multiple_choice', '["Alan Turing", "John McCarthy", "Elon Musk", "Bill Gates"]', 'John McCarthy', 2);

-- 4. Insert Student Responses
INSERT INTO student_responses (exam_id, question_id, student_id, submitted_answer, is_correct) VALUES
-- John Doe's responses for CS101
(1, 1, 3, 'Central Processing Unit', TRUE),
(1, 2, 3, 'Compiled', FALSE),
(1, 3, 3, 'True', TRUE),
-- Jane Doe's responses for AI Quiz
(2, 4, 4, 'Artificial Intelligence', TRUE),
(2, 5, 4, 'John McCarthy', TRUE);

-- 5. Insert Tab Switch Logs
INSERT INTO tab_switch_logs (exam_id, student_id, details) VALUES
(1, 3, 'Switched to a different browser tab for 5 seconds'),
(1, 3, 'Lost focus of the exam window'),
(2, 4, 'Switched to a different browser tab for 2 seconds');
