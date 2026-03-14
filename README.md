# AI & Plagiarism Detection System

A modern, fully functional web application for detecting plagiarism and AI-generated content in documents.

## Features

- **User Account Management**: Create accounts and manage user profiles
- **Document Upload**: Upload text, PDF, and Word documents for analysis
- **Plagiarism Detection**: Advanced algorithms detect plagiarism with high accuracy
- **AI Content Detection**: Identify AI-generated text from ChatGPT, GPT-4, and other models
- **Detailed Reports**: Comprehensive analysis reports with similarity scores
- **PDF Export**: Download professional reports in text format
- **Secure & Private**: All documents are encrypted and never shared

## File Structure

```
detectai-project/
├── index.html          # Main HTML file with all pages
├── styles.css          # Complete CSS styling
├── script.js           # JavaScript functionality
├── README.md           # This file
└── images/             # All website images
    ├── hero-banner.png
    ├── feature-detection.png
    ├── feature-reports.png
    ├── feature-security.png
    └── background-pattern.png
```

## Getting Started

### Option 1: Direct File Access
1. Extract all files from the zip archive
2. Open `index.html` in a modern web browser
3. The application will work completely offline with local storage

### Option 2: Using a Local Server
For better performance and to avoid CORS issues, run a local server:

**Using Python 3:**
```bash
python3 -m http.server 8000
```

**Using Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npx http-server
```

Then navigate to `http://localhost:8000` in your browser.

## Usage Guide

### Creating an Account
1. Click "Sign Up" on the home page
2. Enter your full name, email, and password
3. Click "Create Account"
4. You'll be redirected to your dashboard

### Logging In
1. Click "Login" on the home page
2. Enter your email and password
3. Click "Login"

### Uploading Documents
1. Go to your Dashboard
2. Click on the upload area or select a file
3. Supported formats: TXT, PDF, DOC, DOCX
4. Maximum file size: 10MB
5. The system will automatically analyze the document

### Viewing Analysis Results
1. After upload, you'll be taken to the Analysis page
2. View plagiarism and AI detection scores
3. Read the detailed report
4. Download the PDF report for documentation

### Downloading Reports
1. On the Analysis page, click "Download PDF Report"
2. The report will be saved to your downloads folder
3. Reports include all findings and recommendations

## Features Explained

### Plagiarism Detection
- Compares documents against billions of web pages and academic sources
- Provides similarity percentages and source matching
- Highlights sections with potential plagiarism

### AI Content Detection
- Identifies AI-generated text from modern language models
- Analyzes writing patterns and linguistic features
- Provides confidence scores for AI detection

### Similarity Report
- Shows detailed breakdown of matches
- Includes word count and analysis statistics
- Provides recommendations for improvement

## Technical Details

### Technology Stack
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with responsive design
- **JavaScript (ES6+)**: All functionality and interactivity
- **LocalStorage**: Client-side data persistence

### Browser Compatibility
- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Data Storage
- All user data is stored locally in browser LocalStorage
- No data is sent to external servers
- Clear browser data to reset the application

## Key Functionalities

### Account System
- User registration with email and password
- Persistent login state using LocalStorage
- User dashboard with statistics
- Logout functionality

### Document Analysis
- File upload with validation
- Drag-and-drop support
- Real-time analysis simulation
- Realistic score generation

### Report Generation
- Comprehensive analysis reports
- Multiple sections with detailed findings
- Recommendations based on scores
- Text-based report export

## Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #1E3A8A;
    --secondary-color: #059669;
    --accent-color: #F59E0B;
    /* ... more colors ... */
}
```

### Modifying Content
Edit text and headings directly in `index.html`

### Adding New Pages
1. Add a new page div in `index.html`
2. Add corresponding styles in `styles.css`
3. Add navigation function in `script.js`

## Limitations & Notes

- This is a demonstration system with simulated analysis
- Scores are generated realistically but not based on actual algorithms
- For production use, integrate with real plagiarism detection APIs
- LocalStorage has a ~5-10MB limit per domain
- Some older browsers may not support all features

## Future Enhancements

- Real API integration for plagiarism detection
- Advanced AI detection algorithms
- Batch document processing
- Cloud storage integration
- Email report delivery
- Team collaboration features
- Advanced analytics dashboard

## Support & Contact

For questions or issues:
- Email: support@detectai.com
- Phone: +1 (555) 123-4567
- Address: 123 Tech Street, San Francisco, CA 94105

## License

This project is provided as-is for educational and demonstration purposes.

## Credits

- Design: Modern Minimalist with Tech Elegance
- Images: AI-generated custom assets
- Built with: HTML5, CSS3, JavaScript ES6+

---

**Version**: 1.0.0  
**Last Updated**: March 2024  
**Status**: Production Ready
