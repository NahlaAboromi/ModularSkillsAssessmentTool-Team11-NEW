import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export a given DOM element as a full A4 PDF.
 * Automatically handles scaling and pagination.
 *
 * @param {HTMLElement} elementRef - The DOM node to capture.
 * @param {string} filename - The name of the output PDF file.
 */
export const exportElementAsPDF = async (elementRef, filename = 'report.pdf') => {
  try {
    // השהיה קצרה להשלמת רינדור
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(elementRef, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgProps = { width: canvas.width, height: canvas.height };

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let position = 0;

    // עמוד ראשון
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // עמודים נוספים
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('📄 PDF Export Error:', error);
  }
};
