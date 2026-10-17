/**
 * CleanInspect - PDF Preview & Export Module (Screen 14)
 * js/pdf.js
 */

const PDFExport = {
  /**
   * Generate and download professional A4 PDF for an inspection report
   */
  async generatePDF(inspectionId) {
    const insp = Storage.getInspectionById(inspectionId);
    if (!insp) {
      Utils.showToast('Inspection record not found.', 'danger');
      return;
    }

    Utils.showToast('Generating PDF document. Please wait...', 'info', 4000);

    // If report sheet is already in DOM, ensure it is fully expanded
    let reportElement = document.getElementById('printable-report-document');
    let temporaryElement = false;

    if (!reportElement || !window.location.hash.includes(`report-detail/${inspectionId}`)) {
      // Create temporary container offscreen to render the full report
      reportElement = document.createElement('div');
      reportElement.id = 'temp-pdf-render';
      reportElement.className = 'report-sheet';
      reportElement.style.position = 'fixed';
      reportElement.style.left = '-9999px';
      reportElement.style.top = '0';
      reportElement.style.width = '820px';
      reportElement.style.background = '#FFFFFF';
      reportElement.style.zIndex = '-1000';
      document.body.appendChild(reportElement);
      temporaryElement = true;

      // Render into temporary element
      Reports.renderDetail(reportElement, inspectionId);
      // Get inner report sheet if wrapped
      const innerSheet = reportElement.querySelector('.report-sheet');
      if (innerSheet) reportElement = innerSheet;
    }

    // Ensure all collapsible sections in the element are visible
    reportElement.querySelectorAll('.category-items-body').forEach(b => b.classList.remove('hidden'));

    try {
      // Check if html2pdf or jsPDF is loaded
      if (typeof html2pdf !== 'undefined') {
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `CleanInspect_${insp.reference}_Report.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(reportElement).save();
        Utils.showToast('PDF downloaded successfully!', 'success');
      } else if (typeof window.jspdf !== 'undefined' && typeof html2canvas !== 'undefined') {
        const { jsPDF } = window.jspdf;
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const totalPdfHeight = canvasHeight / ratio;

        let heightLeft = totalPdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - totalPdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save(`CleanInspect_${insp.reference}_Report.pdf`);
        Utils.showToast('PDF exported successfully!', 'success');
      } else {
        // Fallback: Use browser native print dialog with A4 print CSS
        Utils.showToast('Opening print dialog to save as PDF...', 'info');
        window.location.hash = `#report-detail/${inspectionId}`;
        setTimeout(() => {
          window.print();
        }, 500);
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      Utils.showToast('Error generating PDF bundle. Using Print dialog as fallback.', 'warning');
      window.location.hash = `#report-detail/${inspectionId}`;
      setTimeout(() => {
        window.print();
      }, 500);
    } finally {
      if (temporaryElement) {
        const temp = document.getElementById('temp-pdf-render');
        if (temp) temp.remove();
      }
    }
  }
};
