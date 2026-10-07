// Base URL for API (fallback to local storage if unavailable)
const API_URL = 'http://localhost:3000/api/students';
let useLocalStorage = false;
let localStudents = JSON.parse(localStorage.getItem('nexus_students')) || [];

// DOM Elements
const studentsList = document.getElementById('studentsList');
const emptyState = document.getElementById('emptyState');
const addStudentBtn = document.getElementById('addStudentBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const modal = document.getElementById('studentModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const courseFilter = document.getElementById('courseFilter');
const toastContainer = document.getElementById('toastContainer');

// Stats Elements
const totalStudentsStat = document.getElementById('totalStudentsStat');
const activeStudentsStat = document.getElementById('activeStudentsStat');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    addStudentBtn.addEventListener('click', openModal);
    emptyAddBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    studentForm.addEventListener('submit', handleFormSubmit);
    
    searchInput.addEventListener('input', debounce(() => {
        renderStudents(localStudents);
    }, 300));
    
    courseFilter.addEventListener('change', () => {
        renderStudents(localStudents);
    });
}

// Check Backend Connectivity
async function checkBackend() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            useLocalStorage = false;
            return true;
        }
    } catch (error) {
        console.log("Backend not available, falling back to LocalStorage.");
        useLocalStorage = true;
    }
    return false;
}

// Fetch Data
async function fetchStudents() {
    await checkBackend();
    
    if (useLocalStorage) {
        updateStats();
        renderStudents(localStudents);
    } else {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            localStudents = data;
            // Sync with local storage just in case
            localStorage.setItem('nexus_students', JSON.stringify(data));
            updateStats();
            renderStudents(data);
        } catch (error) {
            showToast('Failed to fetch students', 'error');
        }
    }
}

// Handle Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('studentId').value;
    const studentData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        course: document.getElementById('course').value,
        status: document.getElementById('status').value
    };
    
    if (id) {
        await updateStudent(id, studentData);
    } else {
        await addStudent(studentData);
    }
    
    closeModal();
}

// Add Student
async function addStudent(studentData) {
    if (useLocalStorage) {
        const newStudent = {
            id: Date.now().toString(),
            ...studentData,
            enrolledAt: new Date().toISOString()
        };
        localStudents.push(newStudent);
        localStorage.setItem('nexus_students', JSON.stringify(localStudents));
        
        showToast('Student added successfully', 'success');
        updateStats();
        renderStudents(localStudents);
    } else {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            
            if (response.ok) {
                const newStudent = await response.json();
                localStudents.push(newStudent);
                showToast('Student added successfully', 'success');
                updateStats();
                renderStudents(localStudents);
            }
        } catch (error) {
            showToast('Failed to add student', 'error');
        }
    }
}

// Update Student
async function updateStudent(id, studentData) {
    if (useLocalStorage) {
        const index = localStudents.findIndex(s => s.id === id);
        if (index !== -1) {
            localStudents[index] = { ...localStudents[index], ...studentData };
            localStorage.setItem('nexus_students', JSON.stringify(localStudents));
            
            showToast('Student updated successfully', 'success');
            updateStats();
            renderStudents(localStudents);
        }
    } else {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            
            if (response.ok) {
                const index = localStudents.findIndex(s => s.id === id);
                if (index !== -1) {
                    localStudents[index] = { ...localStudents[index], ...studentData };
                    updateStats();
                    renderStudents(localStudents);
                    showToast('Student updated successfully', 'success');
                }
            }
        } catch (error) {
            showToast('Failed to update student', 'error');
        }
    }
}

// Delete Student
async function deleteStudent(id) {
    if (confirm('Are you sure you want to remove this student?')) {
        if (useLocalStorage) {
            localStudents = localStudents.filter(s => s.id !== id);
            localStorage.setItem('nexus_students', JSON.stringify(localStudents));
            
            showToast('Student removed successfully', 'success');
            updateStats();
            renderStudents(localStudents);
        } else {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    localStudents = localStudents.filter(s => s.id !== id);
                    showToast('Student removed successfully', 'success');
                    updateStats();
                    renderStudents(localStudents);
                }
            } catch (error) {
                showToast('Failed to delete student', 'error');
            }
        }
    }
}

// Render Students Table
function renderStudents(students) {
    const searchTerm = searchInput.value.toLowerCase();
    const course = courseFilter.value;
    
    // Filter logic
    let filtered = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                              student.email.toLowerCase().includes(searchTerm);
        const matchesCourse = course === 'all' || student.course === course;
        
        return matchesSearch && matchesCourse;
    });
    
    // Toggle Empty State
    if (filtered.length === 0 && students.length === 0) {
        emptyState.classList.remove('hidden');
        studentsList.innerHTML = '';
        document.querySelector('table').style.display = 'none';
        return;
    } else {
        emptyState.classList.add('hidden');
        document.querySelector('table').style.display = 'table';
    }
    
    studentsList.innerHTML = filtered.map(student => {
        const initials = student.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        const date = new Date(student.enrolledAt || Date.now()).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        
        return `
            <tr>
                <td>
                    <div class="student-info">
                        <div class="student-avatar">${initials}</div>
                        <div class="student-details">
                            <h4>${student.name}</h4>
                            <p>${student.email}</p>
                        </div>
                    </div>
                </td>
                <td>#STU-${student.id.substring(student.id.length - 4)}</td>
                <td>${student.course}</td>
                <td>
                    <span class="status-badge ${student.status.toLowerCase()}">${student.status}</span>
                </td>
                <td>${date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="editStudent('${student.id}')" title="Edit">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteStudent('${student.id}')" title="Delete">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Edit Student
window.editStudent = (id) => {
    const student = localStudents.find(s => s.id === id);
    if (!student) return;
    
    document.getElementById('studentId').value = student.id;
    document.getElementById('name').value = student.name;
    document.getElementById('email').value = student.email;
    document.getElementById('course').value = student.course;
    document.getElementById('status').value = student.status;
    
    modalTitle.textContent = 'Edit Student';
    document.getElementById('studentModal').classList.add('active');
};

// Update Dashboard Stats
function updateStats() {
    totalStudentsStat.textContent = localStudents.length;
    const activeCount = localStudents.filter(s => s.status === 'Active').length;
    activeStudentsStat.textContent = activeCount;
}

// Modal Functions
function openModal() {
    studentForm.reset();
    document.getElementById('studentId').value = '';
    modalTitle.textContent = 'Add New Student';
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

// Toast Notification System
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'ph-check-circle' : 'ph-x-circle';
    
    toast.innerHTML = `
        <i class="ph ${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility: Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
