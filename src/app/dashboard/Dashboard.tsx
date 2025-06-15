"use client";

const Dashboard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex flex-col justify-start bg-white flex-grow items-center min-h-screen"
      style={{ minHeight: "calc(100vh - 8rem)" }}
    >
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-full md:max-w-4xl lg:max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-6 sm:mb-8">
          Tableau de bord
        </h1>

        {/* Border line */}
        <div className="border-t-2 sm:border-t-4 border-gray-300 my-3 sm:my-4"></div>

        {/* Children (contenu dynamique qui peut être injecté) */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default Dashboard;
