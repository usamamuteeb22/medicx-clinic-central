
interface Medicine {
  id: string;
  name: string;
  category: string;
  serial_number: number;
  total_quantity: number;
  expiry_date: string;
  last_updated: string;
}

export const generateMedicineStockPDF = (medicines: Medicine[]) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medicine Stock Inventory Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .summary { margin-top: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Medicine Stock Inventory Report</h1>
        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        
        <table>
          <thead>
            <tr>
              <th>Serial No.</th>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Quantity in Stock</th>
              <th>Expiry Date</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            ${medicines.map((medicine) => `
              <tr>
                <td>${medicine.serial_number}</td>
                <td>${medicine.name}</td>
                <td>${medicine.category}</td>
                <td>${medicine.total_quantity}</td>
                <td>${medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : 'N/A'}</td>
                <td>${new Date(medicine.last_updated).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <p>Total Medicines: ${medicines.length}</p>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medicine-stock-report-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
