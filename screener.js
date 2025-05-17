// API Configuration
const GEMINI_API_KEY = "AIzaSyDWYrPnZ08EUW9QKggSrkprGhcX-LhX0Ag";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

document.addEventListener("DOMContentLoaded", function () {
  const { jsPDF } = window.jspdf;

  // DOM Elements
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileList = document.getElementById("file-list");
  const analyzeBtn = document.getElementById("analyze-btn");
  const clearBtn = document.getElementById("clear-btn");
  const promptTextarea = document.getElementById("prompt-textarea");
  const loading = document.getElementById("loading");
  const resultsSection = document.getElementById("results-section");
  const resultsBody = document.getElementById("results-body");
  const questionsList = document.getElementById("questions-list");
  const exportPdfBtn = document.getElementById("export-pdf");
  const exportExcelBtn = document.getElementById("export-excel");
  const headerExport = document.getElementById("header-export");

  // Metrics elements
  const totalCandidatesEl = document.getElementById("total-candidates");
  const topCandidatesEl = document.getElementById("top-candidates");
  const avgScoreEl = document.getElementById("avg-score");
  const avgScoreBarEl = document.getElementById("avg-score-bar");
  const skillsCoverageEl = document.getElementById("skills-coverage");
  const skillsBarEl = document.getElementById("skills-bar");
  const totalChangeEl = document.getElementById("total-change");

  let files = [];
  let candidates = [];
  let lastScreeningCount = 0;

  // Initialize from localStorage
  if (localStorage.getItem("lastScreeningCount")) {
    lastScreeningCount = parseInt(
      localStorage.getItem("lastScreeningCount")
    );
  }

  // Handle drag and drop
  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", handleFiles);

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
    handleFiles({ target: { files: droppedFiles } });
  }

  function handleFiles(e) {
    const newFiles = Array.from(e.target.files);
    files = [...files, ...newFiles];
    renderFileList();
  }

  function renderFileList() {
    fileList.innerHTML = "";

    if (files.length === 0) {
      return;
    }

    files.forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className = "file-item";

      const fileInfo = document.createElement("div");
      fileInfo.className = "file-info";

      const fileIcon = document.createElement("div");
      fileIcon.className = "file-icon";

      // Set icon based on file type
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
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
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
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
      fileName.textContent = file.name;

      const fileSize = document.createElement("div");
      fileSize.className = "file-size";
      fileSize.textContent = formatFileSize(file.size);

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
        files.splice(index, 1);
        renderFileList();
      });

      fileItem.appendChild(fileInfo);
      fileItem.appendChild(removeFile);
      fileList.appendChild(fileItem);
    });
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat(
      (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i]
    );
  }

  // Analyze resumes
  analyzeBtn.addEventListener("click", async () => {
    if (files.length === 0) {
      showAlert("Please upload at least one resume");
      return;
    }

    if (!promptTextarea.value.trim()) {
      showAlert("Please enter job requirements");
      return;
    }

    loading.style.display = "block";
    resultsSection.style.display = "none";

    try {
      const jobDescription = promptTextarea.value;
      candidates = [];

      // Process each file
      for (const file of files) {
        try {
          const fileContent = await extractTextFromFile(file);
          const candidateData = await analyzeResumeWithGemini(
            fileContent,
            file.name,
            jobDescription
          );
          candidates.push(candidateData);

          // Update loading message
          document.querySelector(
            ".loading-text"
          ).textContent = `Processed ${candidates.length} of ${files.length} resumes...`;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          // Skip this file but continue with others
          continue;
        }
      }

      if (candidates.length === 0) {
        throw new Error("No resumes could be processed successfully");
      }

      // Sort candidates by match score
      candidates.sort((a, b) => b.matchScore - a.matchScore);

      // Calculate metrics
      calculateMetrics();

      // Store for next time
      localStorage.setItem("lastScreeningCount", candidates.length);

      // Display results
      displayResults();

      // Generate interview questions
      await generateInterviewQuestions(
        jobDescription,
        candidates.slice(0, 3)
      );

      // Show export buttons in header
      headerExport.style.display = "flex";
    } catch (error) {
      console.error("Error analyzing resumes:", error);
      showAlert(
        "An error occurred while analyzing resumes. Please try again."
      );
    } finally {
      loading.style.display = "none";
    }
  });

  function calculateMetrics() {
    // Total candidates
    totalCandidatesEl.textContent = candidates.length;

    // Calculate change from last screening
    if (lastScreeningCount > 0) {
      const change = Math.round(
        ((candidates.length - lastScreeningCount) / lastScreeningCount) *
          100
      );
      totalChangeEl.textContent = `${Math.abs(change)}%`;
      totalChangeEl.parentElement.classList.toggle("up", change >= 0);
      totalChangeEl.parentElement.classList.toggle("down", change < 0);
    } else {
      totalChangeEl.parentElement.style.display = "none";
    }

    // Top candidates (score > 80)
    const topCandidates = candidates.filter((c) => c.matchScore >= 80);
    topCandidatesEl.textContent = topCandidates.length;

    // Average score
    const avgScore =
      candidates.reduce((sum, c) => sum + c.matchScore, 0) /
      candidates.length;
    avgScoreEl.textContent = `${Math.round(avgScore)}%`;
    avgScoreBarEl.style.width = `${avgScore}%`;

    // Skills coverage (simplified - in real app would analyze skills match)
    const skillsCoverage = Math.min(100, Math.round(avgScore + 20));
    skillsCoverageEl.textContent = `${skillsCoverage}%`;
    skillsBarEl.style.width = `${skillsCoverage}%`;
  }

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
      const pageText = textContent.items
        .map((item) => item.str)
        .join(" ");
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

  async function analyzeResumeWithGemini(
    resumeText,
    fileName,
    jobDescription
  ) {
    const prompt = `
          Analyze this resume for a job with these requirements: ${jobDescription}.
          
          Provide the following information in JSON format:
          - name: Extract the candidate's name from the resume (use "${fileName}" if not found)
          - matchScore: A score from 0-100 indicating how well the resume matches the job requirements
          - experience: Summary of relevant experience in years or description
          - skills: Key skills that match the job requirements (comma-separated)
          - education: Highest relevant education
          
          Resume content:
          ${resumeText.substring(0, 30000)}`; // Limit to 30k chars to avoid hitting API limits

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
      throw new Error(
        `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    // Extract the JSON response from Gemini's text
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonStart = responseText.indexOf("{");
    const jsonEnd = responseText.lastIndexOf("}") + 1;
    const jsonString = responseText.substring(jsonStart, jsonEnd);

    try {
      const result = JSON.parse(jsonString);

      // Ensure required fields exist
      return {
        name: result.name || fileName.replace(/\.[^/.]+$/, ""),
        matchScore: result.matchScore || 0,
        experience: result.experience || "Not specified",
        skills: result.skills || "Not specified",
        education: result.education || "Not specified",
        fileName: fileName,
      };
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      console.log("Full response:", responseText);
      throw new Error("Failed to parse AI response");
    }
  }

  function displayResults() {
    resultsBody.innerHTML = "";

    candidates.forEach((candidate, index) => {
      const row = document.createElement("tr");

      // Rank
      const rankCell = document.createElement("td");
      rankCell.textContent = index + 1;
      rankCell.style.fontWeight = "600";
      rankCell.style.color = "var(--gray-700)";

      // Name
      const nameCell = document.createElement("td");
      const nameDiv = document.createElement("div");
      nameDiv.className = "candidate-name";
      nameDiv.textContent = candidate.name;

      const fileDiv = document.createElement("div");
      fileDiv.className = "candidate-file";
      fileDiv.textContent = candidate.fileName;

      nameCell.appendChild(nameDiv);
      nameCell.appendChild(fileDiv);

      // Score
      const scoreCell = document.createElement("td");
      const scoreContainer = document.createElement("div");

      const scoreSpan = document.createElement("span");
      scoreSpan.className =
        "score " + getScoreClass(candidate.matchScore);
      scoreSpan.textContent = `${candidate.matchScore}%`;

      const scoreBar = document.createElement("div");
      scoreBar.className = "score-bar";

      const scoreBarFill = document.createElement("div");
      scoreBarFill.className = "score-bar-fill";
      scoreBarFill.style.width = `${candidate.matchScore}%`;
      scoreBarFill.style.backgroundColor = getScoreColor(
        candidate.matchScore
      );

      scoreBar.appendChild(scoreBarFill);
      scoreContainer.appendChild(scoreSpan);
      scoreContainer.appendChild(scoreBar);
      scoreCell.appendChild(scoreContainer);

      // Experience
      const expCell = document.createElement("td");
      expCell.textContent = candidate.experience;

      // Skills
      const skillsCell = document.createElement("td");
      skillsCell.textContent = candidate.skills;

      // Education
      const eduCell = document.createElement("td");
      eduCell.textContent = candidate.education;

      row.appendChild(rankCell);
      row.appendChild(nameCell);
      row.appendChild(scoreCell);
      row.appendChild(expCell);
      row.appendChild(skillsCell);
      row.appendChild(eduCell);

      resultsBody.appendChild(row);
    });

    resultsSection.style.display = "block";

    // Animate the appearance
    document.querySelectorAll(".fade-in").forEach((el) => {
      el.style.animation = "fadeIn 0.3s ease-out forwards";
    });
  }

  async function generateInterviewQuestions(
    jobDescription,
    topCandidates
  ) {
    const prompt = `
          Generate 5 specific interview questions for HR to ask candidates based on:
          1. These job requirements: ${jobDescription}
          2. These top candidates' profiles: ${JSON.stringify(
            topCandidates
          )}
          
          For each question, include a category tag like "Technical", "Behavioral", "Experience", etc.
          
          Return the questions as a JSON array of objects: 
          [{
              "question": "question text",
              "category": "category name"
          }, ...]`;

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

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Extract JSON array from response
      const jsonStart = responseText.indexOf("[");
      const jsonEnd = responseText.lastIndexOf("]") + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);

      const questions = JSON.parse(jsonString);

      questionsList.innerHTML = "";
      questions.forEach((q) => {
        const questionItem = document.createElement("div");
        questionItem.className = "question-item";

        const questionText = document.createElement("div");
        questionText.className = "question-text";
        questionText.textContent = q.question;

        const questionCategory = document.createElement("span");
        questionCategory.className = "question-category";
        questionCategory.textContent = q.category;

        questionItem.appendChild(questionText);
        questionItem.appendChild(questionCategory);
        questionsList.appendChild(questionItem);
      });
    } catch (error) {
      console.error("Error generating interview questions:", error);
      questionsList.innerHTML = `
                  <div class="question-item">
                      <div class="question-text">Could not generate questions. Please review candidates manually.</div>
                  </div>
              `;
    }
  }

  function getScoreClass(score) {
    if (score >= 80) return "score-high";
    if (score >= 60) return "score-medium";
    return "score-low";
  }

  function getScoreColor(score) {
    if (score >= 80) return "var(--secondary)";
    if (score >= 60) return "var(--warning)";
    return "var(--danger)";
  }

  // Clear all
  clearBtn.addEventListener("click", () => {
    files = [];
    candidates = [];
    fileList.innerHTML = "";
    promptTextarea.value = "";
    resultsSection.style.display = "none";
    headerExport.style.display = "none";
  });

  // Export functions
  exportPdfBtn.addEventListener("click", exportToPDF);
  document
    .getElementById("header-export")
    .querySelector("#export-pdf")
    .addEventListener("click", exportToPDF);

  exportExcelBtn.addEventListener("click", exportToExcel);
  document
    .getElementById("header-export")
    .querySelector("#export-excel")
    .addEventListener("click", exportToExcel);

  function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text("SELECTRA - Candidate Screening Report", 105, 20, {
      align: "center",
    });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 28, {
      align: "center",
    });

    // Metrics
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary Metrics", 14, 40);

    // Add metrics boxes
    // Set the colors first
    doc.setDrawColor(79, 70, 229); // Border color (RGB)
    doc.setFillColor(240, 240, 255); // Fill color (RGB)

    // First box
    doc.roundedRect(14, 45, 45, 25, 3, 3, "FD"); // 'FD' = Fill and Draw
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(12);
    doc.text("Total Candidates", 20, 53);
    doc.setFontSize(16);
    doc.text(totalCandidatesEl.textContent, 20, 63);

    // Second box - Reset colors to ensure consistency
    doc.setDrawColor(79, 70, 229);
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(64, 45, 45, 25, 3, 3, "FD");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Top Candidates", 70, 53);
    doc.setFontSize(16);
    doc.text(topCandidatesEl.textContent, 70, 63);

    // Third box
    doc.setDrawColor(79, 70, 229);
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(114, 45, 45, 25, 3, 3, "FD");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Avg. Score", 120, 53);
    doc.setFontSize(16);
    doc.text(avgScoreEl.textContent, 120, 63);

    // Fourth box
    doc.setDrawColor(79, 70, 229);
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(164, 45, 45, 25, 3, 3, "FD");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Skills Match", 170, 53);
    doc.setFontSize(16);
    doc.text(skillsCoverageEl.textContent, 170, 63);

    // Candidate table
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Candidate Ranking", 14, 80);

    // Table headers
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const headers = [
      "Rank",
      "Candidate",
      "Score",
      "Experience",
      "Skills",
      "Education",
    ];
    let x = 14;
    headers.forEach((header, i) => {
      if (i === 1) x += 10; // Extra space for name column
      if (i === 3) x += 5; // Adjust for experience column
      doc.text(header, x, 85);
      x +=
        i === 0
          ? 15
          : i === 1
          ? 40
          : i === 2
          ? 20
          : i === 3
          ? 30
          : i === 4
          ? 50
          : 30;
    });

    // Table rows
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let y = 90;

    candidates.slice(0, 20).forEach((candidate, index) => {
      // Limit to first 20 for PDF
      x = 14;

      // Rank
      doc.text((index + 1).toString(), x, y);
      x += 15;

      // Name
      doc.text(candidate.name.substring(0, 20), x, y); // Limit name length
      x += 40;

      // Score
      doc.text(`${candidate.matchScore}%`, x, y);
      x += 20;

      // Experience
      doc.text(candidate.experience.substring(0, 15), x, y); // Limit experience length
      x += 30;

      // Skills
      doc.text(candidate.skills.substring(0, 30), x, y); // Limit skills length
      x += 50;

      // Education
      doc.text(candidate.education.substring(0, 20), x, y); // Limit education length

      y += 5;
      if (y > 270) {
        // Check if we need a new page
        doc.addPage();
        y = 20;
      }
    });

    // Interview questions
    if (questionsList.children.length > 0) {
      doc.addPage();
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text("Suggested Interview Questions", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      y = 30;

      Array.from(questionsList.children)
        .slice(0, 10)
        .forEach((item) => {
          // Limit to 10 questions
          const question =
            item.querySelector(".question-text").textContent;
          const category =
            item.querySelector(".question-category")?.textContent || "";

          doc.setFontSize(10);
          doc.setTextColor(79, 70, 229);
          doc.text(category, 14, y);

          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(question, 20, y + 5, { maxWidth: 170 });

          y += 15;
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
        });
    }

    // Save the PDF
    doc.save(
      `SELECTRA_Report_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  }

  function exportToExcel() {
    // Prepare data
    const data = [
      [
        "Rank",
        "Candidate Name",
        "Match Score",
        "Experience",
        "Skills",
        "Education",
        "Source File",
      ],
      ...candidates.map((c, i) => [
        i + 1,
        c.name,
        `${c.matchScore}%`,
        c.experience,
        c.skills,
        c.education,
        c.fileName,
      ]),
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Candidate Screening");

    // Add interview questions sheet if available
    if (questionsList.children.length > 0) {
      const questionsData = [
        ["Category", "Question"],
        ...Array.from(questionsList.children).map((item) => [
          item.querySelector(".question-category")?.textContent || "",
          item.querySelector(".question-text").textContent,
        ]),
      ];

      const questionsWs = XLSX.utils.aoa_to_sheet(questionsData);
      XLSX.utils.book_append_sheet(
        wb,
        questionsWs,
        "Interview Questions"
      );
    }

    // Generate and download Excel file
    XLSX.writeFile(
      wb,
      `SELECTRA_Candidates_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  function showAlert(message) {
    alert(message); // In a real app, you'd use a more elegant notification system
  }
});