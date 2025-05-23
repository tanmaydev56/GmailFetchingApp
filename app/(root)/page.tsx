import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-800">
          Welcome to <span className="text-red-600">Email Manager</span>
        </h1>
        
        <p className="text-xl text-gray-600">
          Your complete solution for email management and processing
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/fetch-attachments-test"
            className="px-8 py-3 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
          >
            Test Attachments
          </Link>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Email Management</h3>
            <p className="text-gray-600">Organize and process your emails efficiently</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Attachment Handling</h3>
            <p className="text-gray-600">Test and manage your email attachments</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">Secure Access</h3>
            <p className="text-gray-600">Protected with modern authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}