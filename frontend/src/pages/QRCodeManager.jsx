import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Link as LinkIcon, Copy, CheckCircle } from 'lucide-react';

export default function QRCodeManager() {
  const [menuUrl, setMenuUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Clever trick: Extract the user ID directly from the secure JWT token!
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        // Build the full URL dynamically based on where the app is hosted
        const url = `${window.location.origin}/menu/${userId}`;
        setMenuUrl(url);
      } catch (error) {
        console.error("Error decoding token");
      }
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas');
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'MenuHub-Table-QR.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (!menuUrl) return <div className="text-gray-500">Loading your unique QR code...</div>;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800">Your Menu QR Code</h2>
        <p className="mt-1 text-gray-500">Print this out and place it on your tables for customers to scan.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* QR Code Display Card */}
        <div className="flex flex-col items-center p-8 bg-white border border-gray-100 shadow-lg rounded-3xl w-full md:w-1/2 relative overflow-hidden">
          {/* Decorative background shape */}
          <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-3xl opacity-10"></div>

          <h3 className="text-xl font-bold text-gray-800 mb-6 z-10">Scan for Menu</h3>

          <div className="p-4 bg-white rounded-2xl shadow-sm border-2 border-orange-100 z-10 mb-6">
            <QRCodeCanvas
              id="qr-code-canvas"
              value={menuUrl}
              size={200}
              level={"H"}
              includeMargin={true}
              fgColor={"#000000"}
            />
          </div>

          <button
            onClick={downloadQR}
            className="flex items-center w-full justify-center px-5 py-3 text-white transition-all transform rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md font-bold text-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download QR PNG
          </button>
        </div>

        {/* Link Management */}
        <div className="flex flex-col w-full md:w-1/2 space-y-6">
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center mb-4">
              <LinkIcon className="w-6 h-6 text-orange-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Your Public Menu Link</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              You can also share this link on your Instagram bio, WhatsApp, or Google My Business profile.
            </p>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-2">
              <input
                type="text"
                readOnly
                value={menuUrl}
                className="bg-transparent text-gray-600 text-sm outline-none flex-1 px-2"
              />
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center p-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}