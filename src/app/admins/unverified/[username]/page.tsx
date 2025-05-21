import Link from "next/link";


interface PageProps {
  params: {
    username: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async  function VerificationWaitingPage({ params }: PageProps) {
  const { username } = await params;

  // Note: No client-side validation here; handle in API or middleware if needed

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black">
      <div className="bg-stone-50 dark:bg-stone-800 rounded-xl shadow-lg p-8 max-w-lg w-full mx-4 transform transition-all hover:shadow-xl">
        <h1 className="text-3xl font-bold text-center text-stone-800 dark:text-orange-200 mb-4">
          Welcome, {username}!
        </h1>
        <p className="text-center text-stone-600 dark:text-stone-300 mb-6">
          Your account is awaiting verification. Please check back later or contact support if this takes too long.
        </p>
        <div className="flex justify-center mb-6">
          <svg
            className="w-16 h-16 text-orange-600 dark:text-orange-400 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="bg-orange-100 dark:bg-stone-700 border-l-4 border-orange-500 dark:border-orange-400 text-orange-700 dark:text-orange-300 p-4 rounded mb-6">
          <p className="font-semibold">Verification in Progress</p>
          <p className="text-sm">
            Our team is reviewing your account. This usually takes a few minutes.
          </p>
        </div>
        <div className="flex justify-center">
          <Link
            href="/admins/signup"
            className="bg-orange-500 dark:bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors duration-300"
          >
            Back to Signup
          </Link>
        </div>
        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
          "Patience is the key to great privileges!"
        </p>
      </div>
    </div>
  );
}