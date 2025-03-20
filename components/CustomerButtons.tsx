"use client";

export default function CustomerButtons() {
  const customers = [
    "Customer A",
    "Customer B",
    "Customer C",
    "Customer D",
    "Customer E",
  ];

  return (
    <div className="flex justify-center items-center space-x-4 py-8">
      {customers.map((customer, index) => (
        <button
          key={index}
          className="px-6 py-3 bg-gray-200 rounded-md shadow-md transition-transform duration-200 ease-in-out hover:scale-105"
        >
          {customer}
        </button>
      ))}
    </div>
  );
}
