import React from "react";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
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
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-gray-600">
                This Privacy Policy explains how ResumeGuru ("we," "us," or "our") collects, uses, and protects your personal information when you use our resume creation service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-gray-600 mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Name and contact information</li>
                <li>Account credentials</li>
                <li>Resume content and professional information</li>
                <li>Google account information when you sign in with Google</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use the collected information to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Create and manage your account</li>
                <li>Save and generate your resumes</li>
                <li>Improve our services</li>
                <li>Communicate with you about our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
              <p className="text-gray-600">
                We use Supabase for secure data storage and authentication. Your data is encrypted and protected according to industry standards. We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
              <p className="text-gray-600">
                We use Google Sign-In for authentication. When you choose to sign in with Google, you are subject to Google's privacy policy and terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at support@resumeguru.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Updates to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
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

export default Privacy; 