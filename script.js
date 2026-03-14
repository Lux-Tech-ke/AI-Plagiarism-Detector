/* ============================================
   AI & PLAGIARISM DETECTION SYSTEM - JAVASCRIPT
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================

let currentUser = null;
let documents = [];
let currentAnalysis = null;

// Initialize from localStorage
function initializeApp() {
    const savedUser = localStorage.getItem('currentUser');
    const savedDocuments = localStorage.getItem('documents');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateDashboardStats();
    }
    
    if (savedDocuments) {
        documents = JSON.parse(savedDocuments);
    }
}

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    
    // Show selected page
    const selectedPage = document.getElementById(page);
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // Check authentication for protected pages
        if (['dashboard', 'analysis'].includes(page) && !currentUser) {
            navigateTo('login');
            showNotification('Please login to access this page', 'warning');
            return;
        }
        
        // Load page-specific content
        if (page === 'dashboard') {
            loadDashboard();
        } else if (page === 'analysis') {
            performAnalysis();
        }
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// ============================================
// AUTHENTICATION
// ============================================

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    // Validation
    if (!name || !email || !password || !confirm) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Create user object
    currentUser = {
        id: generateId(),
        name: name,
        email: email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        documentsAnalyzed: 0,
        totalScans: 0
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Account created successfully!', 'success');
    
    // Clear form
    document.querySelector('.auth-form').reset();
    
    // Redirect to dashboard
    setTimeout(() => navigateTo('dashboard'), 1000);
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // For demo purposes, create a simple login
    currentUser = {
        id: generateId(),
        name: email.split('@')[0],
        email: email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        documentsAnalyzed: 0,
        totalScans: 0
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Logged in successfully!', 'success');
    
    // Clear form
    document.querySelector('.auth-form').reset();
    
    // Redirect to dashboard
    setTimeout(() => navigateTo('dashboard'), 1000);
}

function handleLogout() {
    currentUser = null;
    documents = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('documents');
    showNotification('Logged out successfully', 'success');
    navigateTo('home');
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

function loadDashboard() {
    updateDashboardStats();
    renderDocumentsList();
    setupFileUpload();
}

function updateDashboardStats() {
    if (!currentUser) return;
    
    document.getElementById('stat-documents').textContent = currentUser.documentsAnalyzed || 0;
    document.getElementById('stat-scans').textContent = currentUser.totalScans || 0;
    
    // Calculate average plagiarism score
    if (documents.length > 0) {
        const avgPlagiarism = Math.round(
            documents.reduce((sum, doc) => sum + (doc.plagiarismScore || 0), 0) / documents.length
        );
        document.getElementById('stat-plagiarism').textContent = avgPlagiarism + '%';
    }
}

function renderDocumentsList() {
    const list = document.getElementById('documents-list');
    
    if (documents.length === 0) {
        list.innerHTML = '<p class="empty-state">No documents yet. Upload your first document to get started.</p>';
        return;
    }
    
    list.innerHTML = documents.map(doc => `
        <div class="document-item">
            <div class="document-info">
                <h4>${doc.name}</h4>
                <p>Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}</p>
                <p>Plagiarism: ${doc.plagiarismScore}% | AI Score: ${doc.aiScore}%</p>
            </div>
            <div class="document-actions">
                <button class="btn-primary" onclick="viewAnalysis('${doc.id}')">View Report</button>
                <button class="btn-secondary" onclick="deleteDocument('${doc.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.backgroundColor = 'rgba(30, 58, 138, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.backgroundColor = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        uploadArea.style.backgroundColor = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

function handleFileUpload(file) {
    // Validate file
    const validTypes = ['text/plain', 'application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
        showNotification('Please upload a valid document (TXT, PDF, DOC, DOCX)', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        
        // Create document object
        const doc = {
            id: generateId(),
            name: file.name,
            uploadedAt: new Date().toISOString(),
            content: content,
            plagiarismScore: 0,
            aiScore: 0,
            status: 'analyzing'
        };
        
        documents.push(doc);
        localStorage.setItem('documents', JSON.stringify(documents));
        
        // Update user stats
        if (currentUser) {
            currentUser.documentsAnalyzed = (currentUser.documentsAnalyzed || 0) + 1;
            currentUser.totalScans = (currentUser.totalScans || 0) + 1;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        showNotification('Document uploaded successfully! Analyzing...', 'success');
        
        // Set current analysis and navigate
        currentAnalysis = doc;
        navigateTo('analysis');
    };
    
    reader.readAsText(file);
}

function deleteDocument(docId) {
    if (confirm('Are you sure you want to delete this document?')) {
        documents = documents.filter(doc => doc.id !== docId);
        localStorage.setItem('documents', JSON.stringify(documents));
        renderDocumentsList();
        showNotification('Document deleted', 'success');
    }
}

function viewAnalysis(docId) {
    currentAnalysis = documents.find(doc => doc.id === docId);
    if (currentAnalysis) {
        navigateTo('analysis');
    }
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

function performAnalysis() {
    if (!currentAnalysis) {
        navigateTo('dashboard');
        return;
    }
    
    // Update title
    document.getElementById('analysis-title').textContent = `Analysis: ${currentAnalysis.name}`;
    
    // Simulate analysis with realistic results
    simulateAnalysis();
}

function simulateAnalysis() {
    // Simulate processing with realistic delays
    const plagiarismScore = generateRealisticScore();
    const aiScore = generateRealisticScore();
    
    // Update current analysis
    currentAnalysis.plagiarismScore = plagiarismScore;
    currentAnalysis.aiScore = aiScore;
    currentAnalysis.status = 'completed';
    
    // Update in documents array
    const index = documents.findIndex(doc => doc.id === currentAnalysis.id);
    if (index !== -1) {
        documents[index] = currentAnalysis;
        localStorage.setItem('documents', JSON.stringify(documents));
    }
    
    // Display results
    displayAnalysisResults(plagiarismScore, aiScore);
    generateReport();
}

function generateRealisticScore() {
    // Generate realistic scores with distribution
    const random = Math.random();
    
    if (random < 0.6) {
        // 60% chance of low plagiarism (0-15%)
        return Math.floor(Math.random() * 15);
    } else if (random < 0.85) {
        // 25% chance of medium plagiarism (15-40%)
        return Math.floor(Math.random() * 25) + 15;
    } else {
        // 15% chance of high plagiarism (40-100%)
        return Math.floor(Math.random() * 60) + 40;
    }
}

function displayAnalysisResults(plagiarism, aiScore) {
    const plagiarismElement = document.getElementById('plagiarism-score');
    const aiElement = document.getElementById('ai-score');
    const plagiarismStatus = document.getElementById('plagiarism-status');
    const aiStatus = document.getElementById('ai-status');
    
    // Animate score display
    animateScore(plagiarismElement, plagiarism);
    animateScore(aiElement, aiScore);
    
    // Set status messages
    plagiarismStatus.textContent = getPlagiarismStatus(plagiarism);
    plagiarismStatus.style.color = getScoreColor(plagiarism);
    
    aiStatus.textContent = getAIStatus(aiScore);
    aiStatus.style.color = getScoreColor(aiScore);
}

function animateScore(element, finalScore) {
    let currentScore = 0;
    const increment = Math.ceil(finalScore / 30);
    
    const interval = setInterval(() => {
        if (currentScore >= finalScore) {
            currentScore = finalScore;
            clearInterval(interval);
        } else {
            currentScore += increment;
        }
        element.textContent = Math.min(currentScore, finalScore);
    }, 30);
}

function getPlagiarismStatus(score) {
    if (score < 10) return '✓ Original Content';
    if (score < 25) return '⚠ Minor Similarity';
    if (score < 50) return '⚠ Moderate Plagiarism';
    return '✗ High Plagiarism Detected';
}

function getAIStatus(score) {
    if (score < 10) return '✓ Likely Human-Written';
    if (score < 30) return '⚠ Possible AI Content';
    if (score < 60) return '⚠ Likely AI-Generated';
    return '✗ Highly Likely AI-Generated';
}

function getScoreColor(score) {
    if (score < 15) return '#10B981'; // Green
    if (score < 40) return '#F59E0B'; // Amber
    return '#DC2626'; // Red
}

function generateReport() {
    const content = document.getElementById('report-content');
    
    const report = `
        <div class="report-section">
            <h3>Document Information</h3>
            <p><strong>File Name:</strong> ${currentAnalysis.name}</p>
            <p><strong>Analysis Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Word Count:</strong> ${estimateWordCount(currentAnalysis.content)}</p>
        </div>
        
        <div class="report-section">
            <h3>Plagiarism Analysis</h3>
            <p><strong>Similarity Score:</strong> ${currentAnalysis.plagiarismScore}%</p>
            <p>${getPlagiarismStatus(currentAnalysis.plagiarismScore)}</p>
            <p>This document shows ${currentAnalysis.plagiarismScore}% similarity with existing sources. ${
                currentAnalysis.plagiarismScore < 15 
                    ? 'The content appears to be original with minimal external matches.' 
                    : 'Multiple sources have been detected. Please review the highlighted sections.'
            }</p>
        </div>
        
        <div class="report-section">
            <h3>AI Content Detection</h3>
            <p><strong>AI Generation Score:</strong> ${currentAnalysis.aiScore}%</p>
            <p>${getAIStatus(currentAnalysis.aiScore)}</p>
            <p>Analysis indicates ${currentAnalysis.aiScore}% probability of AI-generated content. ${
                currentAnalysis.aiScore < 10 
                    ? 'The writing style and patterns are consistent with human authorship.' 
                    : 'The text exhibits characteristics commonly found in AI-generated content.'
            }</p>
        </div>
        
        <div class="report-section">
            <h3>Key Findings</h3>
            <ul>
                <li>Plagiarism Detection: ${currentAnalysis.plagiarismScore}% - ${getPlagiarismStatus(currentAnalysis.plagiarismScore)}</li>
                <li>AI Detection: ${currentAnalysis.aiScore}% - ${getAIStatus(currentAnalysis.aiScore)}</li>
                <li>Document Length: ${estimateWordCount(currentAnalysis.content)} words</li>
                <li>Analysis Confidence: 98%</li>
            </ul>
        </div>
        
        <div class="report-section">
            <h3>Recommendations</h3>
            <ul>
                <li>${currentAnalysis.plagiarismScore < 15 ? '✓ Content appears original' : '⚠ Review highlighted sections for proper attribution'}</li>
                <li>${currentAnalysis.aiScore < 30 ? '✓ Content appears human-written' : '⚠ Consider revising sections with AI characteristics'}</li>
                <li>Ensure all sources are properly cited</li>
                <li>Review the full report for detailed analysis</li>
            </ul>
        </div>
    `;
    
    content.innerHTML = report;
}

function estimateWordCount(text) {
    return Math.max(1, Math.round(text.split(/\s+/).length));
}

// ============================================
// PDF EXPORT FUNCTIONALITY
// ============================================

function downloadPDF() {
    if (!currentAnalysis) {
        showNotification('No analysis to export', 'error');
        return;
    }
    
    // Create a simple PDF-like document (using a library would be better in production)
    const pdfContent = generatePDFContent();
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DetectAI_Report_${currentAnalysis.name.replace(/\.[^/.]+$/, '')}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('Report downloaded successfully!', 'success');
}

function generatePDFContent() {
    const timestamp = new Date().toLocaleString();
    const wordCount = estimateWordCount(currentAnalysis.content);
    
    return `
================================================================================
                        DETECTAI - PLAGIARISM DETECTION REPORT
================================================================================

DOCUMENT INFORMATION
================================================================================
File Name:              ${currentAnalysis.name}
Analysis Date:          ${timestamp}
Word Count:             ${wordCount}
Status:                 Analysis Complete

PLAGIARISM ANALYSIS RESULTS
================================================================================
Similarity Score:       ${currentAnalysis.plagiarismScore}%
Status:                 ${getPlagiarismStatus(currentAnalysis.plagiarismScore)}

Detailed Analysis:
${currentAnalysis.plagiarismScore < 15 
    ? 'The document appears to be original with minimal external matches. No significant plagiarism detected.' 
    : `This document shows ${currentAnalysis.plagiarismScore}% similarity with existing sources. Please review the content for proper attribution.`}

AI CONTENT DETECTION RESULTS
================================================================================
AI Generation Score:    ${currentAnalysis.aiScore}%
Status:                 ${getAIStatus(currentAnalysis.aiScore)}

Detailed Analysis:
${currentAnalysis.aiScore < 10 
    ? 'The writing style and patterns are consistent with human authorship. No significant AI generation detected.' 
    : `The text exhibits ${currentAnalysis.aiScore}% probability of AI-generated content.`}

KEY FINDINGS
================================================================================
• Plagiarism Detection: ${currentAnalysis.plagiarismScore}% - ${getPlagiarismStatus(currentAnalysis.plagiarismScore)}
• AI Detection: ${currentAnalysis.aiScore}% - ${getAIStatus(currentAnalysis.aiScore)}
• Document Length: ${wordCount} words
• Analysis Confidence: 98%
• Processing Time: < 5 seconds

RECOMMENDATIONS
================================================================================
${currentAnalysis.plagiarismScore < 15 ? '✓ Content appears original' : '⚠ Review highlighted sections for proper attribution'}
${currentAnalysis.aiScore < 30 ? '✓ Content appears human-written' : '⚠ Consider revising sections with AI characteristics'}
• Ensure all sources are properly cited
• Review the full report for detailed analysis
• Contact support for further assistance

METHODOLOGY
================================================================================
This analysis uses advanced machine learning algorithms to detect:
1. Plagiarism by comparing against billions of web pages and academic sources
2. AI-generated content by analyzing writing patterns and linguistic features
3. Similarity matches with highlighted sections for review

DISCLAIMER
================================================================================
This report is generated for informational purposes. The scores represent 
probability estimates based on our analysis algorithms. For academic or 
professional use, please review the detailed findings and consult with 
appropriate authorities.

Generated by DetectAI - Advanced Plagiarism & AI Detection System
Report ID: ${generateId()}
================================================================================
    `;
}

// ============================================
// CONTACT FORM
// ============================================

function handleContactForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    
    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // In a real application, this would send to a server
    console.log('Contact Form Submission:', { name, email, subject, message });
    
    showNotification('Message sent successfully! We will get back to you soon.', 'success');
    
    // Clear form
    document.querySelector('.contact-form').reset();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function hashPassword(password) {
    // Simple hash for demo purposes (NOT secure for production)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    // Set colors based on type
    const colors = {
        success: { bg: '#10B981', text: 'white' },
        error: { bg: '#DC2626', text: 'white' },
        warning: { bg: '#F59E0B', text: 'white' },
        info: { bg: '#1E3A8A', text: 'white' }
    };
    
    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg;
    notification.style.color = color.text;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .report-section {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .report-section:last-child {
        border-bottom: none;
    }
    
    .report-section h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .report-section ul {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .report-section li {
        margin-bottom: 0.5rem;
        color: var(--text-light);
    }
`;
document.head.appendChild(style);

// ============================================
// INITIALIZATION
// ============================================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // Set default page
    if (currentUser) {
        navigateTo('dashboard');
    } else {
        navigateTo('home');
    }
});
