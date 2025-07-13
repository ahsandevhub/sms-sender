import { Eye, Lock, MailCheck, User } from "lucide-react";

export default function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md -mt-25">
        {/* Logo Header Skeleton */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center bg-gray-200 rounded-full p-3 shadow-lg mb-3 animate-pulse">
            <MailCheck className="h-8 w-8 text-gray-400" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
        </div>

        {/* Login Card Skeleton */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
          <div className="p-8">
            <div className="h-7 bg-gray-200 rounded w-32 mx-auto mb-6" />

            <div className="space-y-5">
              {/* Username Field */}
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <User className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className="pl-10 w-full px-4 py-3 bg-gray-100 rounded-lg h-12" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Lock className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className="pl-10 pr-10 w-full px-4 py-3 bg-gray-100 rounded-lg h-12" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Eye className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <div className="w-full py-3 px-4 rounded-lg bg-gray-300 h-12" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
