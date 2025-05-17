// API Configuration
const GEMINI_API_KEY = "AIzaSyDWYrPnZ08EUW9QKggSrkprGhcX-LhX0Ag";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

document.addEventListener("DOMContentLoaded", function () {
  // Initialize jsPDF
  const { jsPDF } = window.jspdf;

  // DOM Elements
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileList = document.getElementById("file-list");
  const analyzeBtn = document.getElementById("analyze-btn");
  const loading = document.getElementById("loading");
  const analysisSection = document.getElementById("analysis-section");
  const atsFeedback = document.getElementById("ats-feedback");
  const improvementsList = document.getElementById("improvements-list");
  const feedbackForm = document.getElementById("feedback-form");
  const questionsContainer = document.getElementById("questions-container");
  const nextBtn = document.getElementById("next-btn");
  const backBtn = document.getElementById("back-btn");
  const enhancedResume = document.getElementById("enhanced-resume");
  const resumePreview = document.getElementById("resume-preview");
  const downloadDocx = document.getElementById("download-docx");
  const downloadPdf = document.getElementById("download-pdf");
  const startOver = document.getElementById("start-over");
  const progressPercent = document.getElementById("progress-percent");
  const progressFill = document.getElementById("progress-fill");
  const atsScore = document.getElementById("ats-score");
  const finalScore = document.getElementById("final-score");

  let currentFile = null;
  let resumeText = "";
  let currentQuestionIndex = 0;
  let questions = [];
  let userResponses = {};
  let enhancedResumeContent = "";

  // Handle drag and drop
  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", handleFile);

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropzone.classList.add("active");
  }

  function unhighlight() {
    dropzone.classList.remove("active");
  }

  dropzone.addEventListener("drop", handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const droppedFiles = dt.files;
    if (droppedFiles.length > 0) {
      fileInput.files = droppedFiles;
      handleFile({ target: { files: droppedFiles } });
    }
  }

  function handleFile(e) {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    // Only process one file
    currentFile = newFiles[0];
    renderFileList();
    analyzeBtn.style.display = "inline-flex";
  }

  function renderFileList() {
    fileList.innerHTML = "";

    const fileItem = document.createElement("div");
    fileItem.className = "file-item";

    const fileInfo = document.createElement("div");
    fileInfo.className = "file-info";

    const fileIcon = document.createElement("div");
    fileIcon.className = "file-icon";

    // Set icon based on file type
    if (
      currentFile.type === "application/pdf" ||
      currentFile.name.endsWith(".pdf")
    ) {
      fileIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M10 11v5"></path>
                    <path d="M14 11v3"></path>
                    <circle cx="16" cy="16" r="1"></circle>
                </svg>
            `;
    } else if (
      currentFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      currentFile.name.endsWith(".docx")
    ) {
      fileIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                    <path d="M10 9H8"></path>
                </svg>
            `;
    } else {
      fileIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            `;
    }

    const fileName = document.createElement("div");
    fileName.className = "file-name";
    fileName.textContent = currentFile.name;

    const fileSize = document.createElement("div");
    fileSize.className = "file-size";
    fileSize.textContent = formatFileSize(currentFile.size);

    const fileDetails = document.createElement("div");
    fileDetails.appendChild(fileName);
    fileDetails.appendChild(fileSize);

    fileInfo.appendChild(fileIcon);
    fileInfo.appendChild(fileDetails);

    const removeFile = document.createElement("button");
    removeFile.className = "remove-file";
    removeFile.innerHTML = "&times;";
    removeFile.addEventListener("click", (e) => {
      e.stopPropagation();
      currentFile = null;
      fileList.innerHTML = "";
      analyzeBtn.style.display = "none";
      fileInput.value = "";
    });

    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeFile);
    fileList.appendChild(fileItem);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  // Analyze resume
  analyzeBtn.addEventListener("click", async () => {
    if (!currentFile) {
      alert("Please upload a resume first");
      return;
    }

    loading.style.display = "block";
    analyzeBtn.disabled = true;

    try {
      // Extract text from file
      resumeText = await extractTextFromFile(currentFile);

      // Analyze resume with Gemini
      const analysis = await analyzeResume(resumeText);

      // Display analysis results
      displayAnalysisResults(analysis);

      // Show analysis section
      analysisSection.style.display = "block";

      // Hide loading
      loading.style.display = "none";

      // Scroll to analysis section
      analysisSection.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("An error occurred while analyzing your resume. Please try again.");
      loading.style.display = "none";
      analyzeBtn.disabled = false;
    }
  });

  async function extractTextFromFile(file) {
    // For PDF files
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      return extractTextFromPDF(file);
    }
    // For DOCX files
    else if (
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      return extractTextFromDOCX(file);
    }
    // For plain text files
    else {
      return readFileAsText(file);
    }
  }

  async function extractTextFromPDF(file) {
    // Load pdf.js library dynamically
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js"
    );

    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  }

  async function extractTextFromDOCX(file) {
    // Load mammoth.js library dynamically
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.0/mammoth.browser.min.js"
    );

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function analyzeResume(resumeText) {
    const prompt = `
        Analyze this resume for ATS (Applicant Tracking System) compatibility and overall quality. Provide:
        
        1. ATS Compatibility Score (0-100) and feedback
        2. List of improvements needed with severity (high, medium, low)
        3. Follow-up questions to gather missing information
        
        Format the response as JSON with these fields:
        - atsScore: number (0-100)
        - atsFeedback: string (detailed feedback on ATS compatibility)
        - improvements: array of {description: string, severity: string}
        - questions: array of {question: string, field: string}
        
        Resume content:
        ${resumeText.substring(0, 30000)}`; // Limit to 30k chars

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}") + 1;
    const jsonString = responseText.substring(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  }

  function displayAnalysisResults(analysis) {
    // Update progress bar and score
    progressPercent.textContent = `${analysis.atsScore}%`;
    progressFill.style.width = `${analysis.atsScore}%`;

    // Set ATS score and feedback
    atsScore.textContent = getAtsScoreLabel(analysis.atsScore);
    atsScore.className = "ats-score " + getAtsScoreClass(analysis.atsScore);

    atsFeedback.innerHTML = `<p>${analysis.atsFeedback}</p>`;

    // Display improvements
    improvementsList.innerHTML = "";
    analysis.improvements.forEach((imp, index) => {
      const item = document.createElement("div");
      item.className = "improvement-item";

      const badge = document.createElement("div");
      badge.className = "improvement-badge";
      badge.textContent = index + 1;

      const text = document.createElement("div");
      text.className = "improvement-text";
      text.innerHTML = `<p>${imp.description}</p>`;

      const severity = document.createElement("div");
      severity.className =
        "improvement-severity " + getSeverityClass(imp.severity);
      severity.textContent = imp.severity;

      text.appendChild(severity);
      item.appendChild(badge);
      item.appendChild(text);

      improvementsList.appendChild(item);
    });

    // Store questions for the feedback form
    questions = analysis.questions;
    currentQuestionIndex = 0;
    userResponses = {};

    // Show first question
    showQuestion(0);
  }

  function getAtsScoreLabel(score) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  }

  function getAtsScoreClass(score) {
    if (score >= 80) return "ats-score-high";
    if (score >= 60) return "ats-score-medium";
    return "ats-score-low";
  }

  function getSeverityClass(severity) {
    if (severity.toLowerCase() === "high") return "severity-high";
    if (severity.toLowerCase() === "medium") return "severity-medium";
    return "severity-low";
  }

  function showQuestion(index) {
    if (index >= questions.length) {
      // All questions answered, generate enhanced resume
      generateEnhancedResume();
      return;
    }

    currentQuestionIndex = index;
    const question = questions[index];

    // Update back button visibility
    backBtn.style.display = index > 0 ? "inline-flex" : "none";

    // Update next button text
    nextBtn.textContent = index === questions.length - 1 ? "Finish" : "Next";

    // Create question element
    questionsContainer.innerHTML = `
            <div class="form-group">
                <label class="form-label">${question.question}</label>
                <textarea class="form-input form-textarea" id="question-${index}" 
                    placeholder="Your answer...">${
                      userResponses[question.field] || ""
                    }</textarea>
            </div>
        `;

    // Focus and clear if needed
    const textarea = document.getElementById(`question-${index}`);
    if (textarea) {
      textarea.focus();
      if (!userResponses[question.field]) {
        textarea.value = "";
      }
    }
  }

  nextBtn.addEventListener("click", () => {
    // Save current response
    const currentQuestion = questions[currentQuestionIndex];
    const answer = document.getElementById(
      `question-${currentQuestionIndex}`
    ).value;
    userResponses[currentQuestion.field] = answer;

    // Show next question or generate resume
    showQuestion(currentQuestionIndex + 1);
  });

  backBtn.addEventListener("click", () => {
    // Save current response
    const currentQuestion = questions[currentQuestionIndex];
    const answer = document.getElementById(
      `question-${currentQuestionIndex}`
    ).value;
    userResponses[currentQuestion.field] = answer;

    // Show previous question
    showQuestion(currentQuestionIndex - 1);
  });

  async function generateEnhancedResume() {
    loading.style.display = "block";
    feedbackForm.style.display = "none";

    try {
      // Prepare prompt for Gemini to enhance the resume
      const prompt = `
            Create an enhanced, ATS-friendly resume based on the original resume and additional information provided.
            
            Original resume:
            ${resumeText.substring(0, 15000)}
            
            Additional information:
            ${JSON.stringify(userResponses)}
            
            Guidelines:
            1. Use modern, professional resume format
            2. Optimize for ATS with proper headings and keywords
            3. Include all relevant information from both sources
            4. Ensure proper section ordering (Contact, Summary, Experience, Education, Skills)
            5. Use bullet points (•) for achievements
            6. Remove any placeholders like "[Add by your own]"
            7. Keep it concise (1-2 pages)
            8. Use standard section headings in ALL CAPS
            9. Focus on quantifiable achievements
            10. Ensure consistent verb tenses
            
            Return the enhanced resume as plain text (no HTML or markdown formatting).
            `;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      enhancedResumeContent =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Clean up the response
      enhancedResumeContent = enhancedResumeContent
        .replace(/```/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/^\s+|\s+$/g, "")
        .replace(/\*\s+/g, "• ")
        .replace(/\[Add by your own\]/g, "")
        .replace(/\n{3,}/g, "\n\n");

      // Display enhanced resume
      displayEnhancedResume();
    } catch (error) {
      console.error("Error generating enhanced resume:", error);
      alert(
        "An error occurred while generating your enhanced resume. Please try again."
      );
    } finally {
      loading.style.display = "none";
    }
  }

  function displayEnhancedResume() {
    // Update final score
    finalScore.textContent = "100%";

    // Display resume content with proper formatting
    resumePreview.textContent = enhancedResumeContent;

    // Hide analysis section, show enhanced resume
    analysisSection.style.display = "none";
    enhancedResume.style.display = "block";

    // Scroll to enhanced resume
    enhancedResume.scrollIntoView({ behavior: "smooth" });
  }

  // Download handlers

  downloadPdf.addEventListener("click", () => {
    generatePdf();
  });

  async function generateDocx() {
    try {
      // Try loading the library with multiple fallback CDNs
      if (!window.docx || !window.docx.Document) {
        await loadDocxLibrary();
      }

      // Verify the library is properly loaded
      if (!window.docx || !window.docx.Document) {
        throw new Error("DOCX library failed to load");
      }

      const { Document, Paragraph, TextRun, Packer, HeadingLevel } =
        window.docx;

      // Enhanced content cleaning
      const cleanedContent = cleanResumeContent(enhancedResumeContent);

      // Create document with proper structure
      const doc = createDocumentStructure(cleanedContent);

      // Generate and download
      await downloadDocxFile(doc);
    } catch (error) {
      console.error("DOCX Generation Error:", error);
      alert("Error generating DOCX file. Please try again or use PDF export.");
      // Fallback to PDF if DOCX fails
      generatePdf();
    }
  }

  // Helper function to load docx library with multiple fallbacks
  async function loadDocxLibrary() {
    const cdnUrls = [
      "https://cdn.jsdelivr.net/npm/docx@7.1.0/build/index.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/docx/7.1.0/docx.min.js",
      "https://unpkg.com/docx@7.1.0/build/index.min.js",
    ];

    for (const url of cdnUrls) {
      try {
        await loadScript(url);
        if (window.docx) return;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(`Failed to load from ${url}`, e);
      }
    }
    throw new Error("All DOCX library CDN sources failed");
  }

  // Enhanced content cleaning
  function cleanResumeContent(content) {
    return content
      .replace(/\*/g, "•") // Convert asterisks to bullets
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/`/g, "") // Remove backticks
      .replace(/\[Add by your own\]/g, "") // Remove placeholders
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII chars
      .trim();
  }

  // Create proper document structure
  function createDocumentStructure(content) {
    const { Document, Paragraph, TextRun, HeadingLevel } = window.docx;

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            run: {
              size: 24, // 12pt
              font: "Inter",
            },
            paragraph: {
              spacing: {
                line: 276, // 1.15 line spacing
                after: 200,
              },
            },
          },
        ],
      },
    });

    // Split into sections
    const sections = content.split(/\n(?=[A-Z][A-Z ]+$)/gm);

    sections.forEach((section) => {
      const [heading, ...contentLines] = section.split("\n");
      if (!heading || !contentLines.length) return;

      const children = [
        new Paragraph({
          text: heading.trim(),
          heading: isMajorSection(heading)
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
      ];

      contentLines
        .filter((line) => line.trim())
        .forEach((line) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: line.trim(), break: 1 })],
              indent: { left: line.startsWith("•") ? 400 : 0 },
            })
          );
        });

      doc.addSection({ children });
    });

    return doc;
  }

  function isMajorSection(heading) {
    return /SUMMARY|EXPERIENCE|PROJECTS|SKILLS|EDUCATION/i.test(heading);
  }

  async function downloadDocxFile(doc) {
    const blob = await window.docx.Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enhanced_resume.docx";
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Generic script loader
  async function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function generatePdf() {
    try {
      // Clean content first
      const cleanedContent = enhancedResumeContent
        .replace(/\*\s+/g, "• ") // Replace * with bullets
        .replace(/\[Add by your own\]/g, "") // Remove placeholders
        .replace(/\n{3,}/g, "\n\n"); // Limit consecutive newlines

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
      });

      // Set font
      pdf.setFont("helvetica");
      pdf.setFontSize(11); // Standard resume font size

      // Margins
      const margin = 15;
      let y = margin;
      const lineHeight = 7;
      const pageHeight = pdf.internal.pageSize.height - margin;

      // Split into sections
      const sections = cleanedContent.split(/\n(?=[A-Z][A-Za-z ]+$)/gm);

      sections.forEach((section) => {
        const [heading, ...content] = section.split("\n");

        // Check if we need a new page
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = margin;
        }

        // Add heading
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(heading.trim(), margin, y);
        y += lineHeight;

        // Add content
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        content
          .filter((c) => c.trim())
          .forEach((text) => {
            // Check if we need a new page
            if (y > pageHeight - 10) {
              pdf.addPage();
              y = margin;
            }

            // Split long lines
            const lines = pdf.splitTextToSize(text.trim(), 180);
            lines.forEach((line) => {
              pdf.text(line, text.startsWith("•") ? margin + 5 : margin, y);
              y += lineHeight;
            });
          });

        // Add space between sections
        y += lineHeight;
      });

      pdf.save("enhanced_resume.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF file. Please try again.");
    }
  }

  startOver.addEventListener("click", () => {
    // Reset everything
    currentFile = null;
    fileInput.value = "";
    fileList.innerHTML = "";
    analyzeBtn.style.display = "none";
    analyzeBtn.disabled = false;
    analysisSection.style.display = "none";
    enhancedResume.style.display = "none";
    feedbackForm.style.display = "block";
    questionsContainer.innerHTML = "";
    currentQuestionIndex = 0;
    questions = [];
    userResponses = {};
    enhancedResumeContent = "";

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
