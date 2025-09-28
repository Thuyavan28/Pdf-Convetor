import { useState } from "react";
import { jsPDF } from "jspdf";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [files, setFiles] = useState([]);
  const [pdfgen, setPdfgen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
    setPdfgen(false);
    setPdfUrl("");
    toast.success(`${e.target.files.length} file(s) uploaded!`);
  };

  const generatePdf = async () => {
    if (files.length === 0) {
      toast.error("Please upload file before converting");
      return;
    }
    const pdf = new jsPDF();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.type.startsWith("image")) {
        const imgData = await toBase64(file);
        const img = new Image();
        img.src = imgData;

        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (img.height * imgWidth) / img.width;
            pdf.addImage(img, "JPEG", 0, 0, imgWidth, imgHeight);
            if (i < files.length - 1) pdf.addPage();
            resolve();
          };
        });
      } else if (file.type === "text/plain") {
        const text = await file.text();
        const lines = pdf.splitTextToSize(
          text,
          pdf.internal.pageSize.getWidth() - 20
        );
        pdf.text(lines, 10, 20);
        if (i < files.length - 1) pdf.addPage();
      } else {
        alert(`Unsupported file type: ${file.name}`);
        return;
      }
    }
    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    setPdfgen(true);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-500 to-pink-300 p-4">
      {/* Card Container */}
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-center text-purple-700">
          PDF Converter
        </h1>

        {/* File Input */}
        <label className="block w-full cursor-pointer">
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-full border-4 border-dashed border-purple-300 rounded-xl py-16 text-center text-gray-500 hover:border-pink-500 hover:text-gray-700 transition">
            Click or drag files here
          </div>
        </label>

        {/* Convert Button */}
        <button
          onClick={generatePdf}
          className={`w-full py-3 rounded-xl shadow-lg font-bold text-white transition ${
            files.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          Convert to PDF
        </button>

        {/* Download Button */}
        {pdfgen && (
          <a
            href={pdfUrl}
            download={`${files[0].name.replace(/\.[^/.]+$/, "")}.pdf`}
            className="block w-full text-center bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl shadow-md transition"
          >
            Download PDF
          </a>
        )}
        <Toaster position="top-center" />
      </div>
    </div>
  );
}

export default App;
