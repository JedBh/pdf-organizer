# 🗂️ PDF Organizer by Date

Welcome to the **PDF Organizer by Date**! This script helps you organize your PDF files by extracting dates from their content and renaming the files based on the extracted dates. If you encounter invalid dates, please open an issue to help us improve the tool! 🚀

---

## 🌟 Features

- Extracts dates from PDF content.
- Renames PDF files to the extracted date format.
- Organizes files efficiently into a directory.

---

## 📋 Instructions to Get Started

### 1️⃣ Clone the Repository

First, clone the repository to your local machine:

```
git clone <repository-url>
```

---

### 2️⃣ Install Dependencies

Navigate to the project directory and install the required dependencies:

```
cd <repository-folder>
npm install
```

cd <repository-folder>
npm install

---

### 3️⃣ Place Your PDF Files

Place all the PDF files you want to organize into the pdfs directory within the project folder:

```
project-folder/
├── pdfs/
│   ├── file1.pdf
│   ├── file2.pdf
│   └── ...
```

---

### 4️⃣ Run the Script

Run the script to process the files:

```
npx ts-node src/isValidDate.ts
```

### 🛠️ Troubleshooting

- Invalid Dates: If a PDF file produces an invalid date, please open an issue with the details. This will help us add more date formats for better compatibility.
- Dependencies: Ensure you have Node.js and npm installed on your system.

---

### 📝 Notes

- This tool works best with common date formats. If your PDFs contain uncommon date formats, they might not be processed correctly.
- The script writes the results to a results.txt file and renames your PDF files in the pdfs directory.

---

### 🤝 Contributions

Contributions are welcome! If you'd like to improve the script or add support for additional date formats, feel free to submit a pull request.

---

Happy organizing! 🎉
