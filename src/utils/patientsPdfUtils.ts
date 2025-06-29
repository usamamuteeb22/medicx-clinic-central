
interface Patient {
  id: string;
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone_number: string;
  address: string;
  registration_date: string;
  description: string;
}

export const generatePatientsPDF = (patients: Patient[]) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Patients List Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }
          h1 { 
            color: #4f46e5; 
            text-align: center; 
            margin-bottom: 30px;
            font-size: 28px;
          }
          .info {
            text-align: center;
            margin-bottom: 30px;
            color: #6b7280;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            text-align: left; 
            font-size: 12px;
          }
          th { 
            background: linear-gradient(135deg, #667eea, #764ba2); 
            color: white;
            font-weight: bold; 
          }
          tr:nth-child(even) { 
            background-color: #f8fafc; 
          }
          tr:hover {
            background-color: #e0e7ff;
          }
          .summary { 
            margin-top: 30px; 
            padding: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border-radius: 8px;
            text-align: center;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Patients List Report</h1>
          <div class="info">
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Generated at:</strong> ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Registration Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${patients.map((patient) => `
                <tr>
                  <td>${patient.patient_id}</td>
                  <td>${patient.name}</td>
                  <td>${patient.age}</td>
                  <td>${patient.gender}</td>
                  <td>${patient.phone_number || 'N/A'}</td>
                  <td>${patient.address || 'N/A'}</td>
                  <td>${new Date(patient.registration_date).toLocaleDateString()}</td>
                  <td>${patient.description || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Patients:</strong> ${patients.length}</p>
            <p><strong>Male:</strong> ${patients.filter(p => p.gender === 'Male').length}</p>
            <p><strong>Female:</strong> ${patients.filter(p => p.gender === 'Female').length}</p>
          </div>
          
          <div class="footer">
            <p>This report was generated automatically by the Healthcare Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `patients-list-report-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
