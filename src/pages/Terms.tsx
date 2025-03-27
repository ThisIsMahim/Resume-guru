import React from "react";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" />
            <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              ResumeGuru
            </span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600">
                By accessing or using ResumeGuru, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily access and use ResumeGuru for personal, non-commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained in ResumeGuru</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Account Terms</h2>
              <p className="text-gray-600 mb-4">You are responsible for:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your account information is accurate and up-to-date</li>
                <li>Notifying us of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Service Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. User Content</h2>
              <p className="text-gray-600">
                You retain all rights to any content you submit, post or display on or through ResumeGuru. By posting content, you grant us a license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through ResumeGuru.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitations</h2>
              <p className="text-gray-600">
                In no event shall ResumeGuru or its suppliers be liable for any damages arising out of the use or inability to use the materials on ResumeGuru, even if ResumeGuru or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
              <p className="text-gray-600">
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <p className="text-gray-500 text-sm mt-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms; 